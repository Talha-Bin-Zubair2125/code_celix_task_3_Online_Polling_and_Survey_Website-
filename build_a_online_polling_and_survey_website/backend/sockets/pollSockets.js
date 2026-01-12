const Poll = require('../models/Poll');
const User = require('../models/User');
const Vote = require('../models/Vote');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

module.exports = function(io) {
  const userSockets = {}; // Track user socket connections

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected with socket ${socket.id}`);
    userSockets[socket.userId] = socket.id;

    // Join a specific poll room
    socket.on('join_poll', (pollId) => {
      socket.join(`poll_${pollId}`);
      console.log(`User ${socket.userId} joined poll ${pollId}`);
    });

    // Leave a specific poll room
    socket.on('leave_poll', (pollId) => {
      socket.leave(`poll_${pollId}`);
      console.log(`User ${socket.userId} left poll ${pollId}`);
    });

    // Handle real-time vote
    socket.on('vote_on_poll', async (data) => {
      try {
        const { pollId, answerIds, isAnonymous } = data;

        // Get poll
        const poll = await Poll.findById(pollId);
        if (!poll) {
          return socket.emit('vote_error', { message: 'Poll not found' });
        }

        if (poll.isExpired()) {
          return socket.emit('vote_error', { message: 'Poll has expired' });
        }

        if (!poll.allowMultiple && answerIds.length > 1) {
          return socket.emit('vote_error', { message: 'This poll allows only single choice' });
        }

        // Check if user already voted
        const existingVote = await Vote.findOne({ pollId, userId: socket.userId });
        if (existingVote) {
          return socket.emit('vote_error', { message: 'You have already voted on this poll' });
        }

        // Get user
        const user = await User.findById(socket.userId);

        // Create vote record
        const answers = answerIds.map(answerId => {
          const answer = poll.answers.find(a => a._id.toString() === answerId);
          return {
            answerId: new mongoose.Types.ObjectId(answerId),
            text: answer ? answer.text : ''
          };
        });

        const vote = await Vote.create({
          pollId,
          userId: socket.userId,
          answers,
          isAnonymous: isAnonymous || false
        });

        // Update poll
        let totalNewVotes = 0;
        for (let answerId of answerIds) {
          const answerIndex = poll.answers.findIndex(a => a._id.toString() === answerId);
          if (answerIndex !== -1) {
            poll.answers[answerIndex].votes += 1;
            poll.answers[answerIndex].voters.push(socket.userId);
            totalNewVotes += 1;
          }
        }

        poll.totalVotes += totalNewVotes;
        await poll.save();

        // Update user
        user.votedPolls.push({
          pollId,
          answers: answerIds
        });
        await user.save();

        // Broadcast updated results to all users in the poll room
        const results = poll.getResults();
        io.to(`poll_${pollId}`).emit('vote_update', {
          pollId,
          totalVotes: poll.totalVotes,
          results,
          newVoter: !isAnonymous ? user.username : 'Anonymous'
        });

        // Send success response to voting user
        socket.emit('vote_success', {
          message: 'Vote recorded successfully',
          results,
          totalVotes: poll.totalVotes
        });
      } catch (error) {
        console.error('Vote error:', error);
        socket.emit('vote_error', { message: error.message });
      }
    });

    // Handle request for live poll data
    socket.on('request_poll_data', async (pollId) => {
      try {
        const poll = await Poll.findById(pollId).populate('creator', 'username');
        if (!poll) {
          return socket.emit('poll_data_error', { message: 'Poll not found' });
        }

        const pollData = {
          ...poll.toObject(),
          isExpired: poll.isExpired(),
          results: poll.getResults()
        };

        socket.emit('poll_data_update', pollData);
      } catch (error) {
        socket.emit('poll_data_error', { message: error.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      delete userSockets[socket.userId];
    });
  });
};
