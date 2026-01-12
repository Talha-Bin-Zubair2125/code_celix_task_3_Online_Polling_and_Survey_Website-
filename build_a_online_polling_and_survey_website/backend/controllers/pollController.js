const Poll = require('../models/Poll');
const User = require('../models/User');
const Vote = require('../models/Vote');
const mongoose = require('mongoose');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private
exports.createPoll = async (req, res) => {
  try {
    const { question, description, answers, expiresAt, allowMultiple, category } = req.body;

    // Validation
    if (!question || !answers || answers.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question and at least 2 answers are required' 
      });
    }

    if (!expiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Expiration date is required' 
      });
    }

    const expireDate = new Date(expiresAt);
    if (expireDate <= new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Expiration date must be in the future' 
      });
    }

    // Get user
    const user = await User.findById(req.user.id);

    // Create poll with answers
    const pollAnswers = answers.map(answer => ({
      _id: new mongoose.Types.ObjectId(),
      text: answer,
      votes: 0,
      voters: []
    }));

    const poll = await Poll.create({
      question,
      description,
      creator: req.user.id,
      creatorName: user.username,
      answers: pollAnswers,
      expiresAt: expireDate,
      allowMultiple: allowMultiple || false,
      category: category || 'Other'
    });

    // Update user's created polls count
    user.createdPollsCount += 1;
    await user.save();

    res.status(201).json({
      success: true,
      poll
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all polls
// @route   GET /api/polls
// @access  Public
exports.getAllPolls = async (req, res) => {
  try {
    const { category, status, search } = req.query;

    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status (active, closed, upcoming)
    if (status === 'active') {
      query.isActive = true;
      query.expiresAt = { $gt: new Date() };
    } else if (status === 'closed') {
      query.isActive = false;
    } else if (status === 'upcoming') {
      query.expiresAt = { $gt: new Date() };
    }

    // Search by question
    if (search) {
      query.question = { $regex: search, $options: 'i' };
    }

    const polls = await Poll.find(query)
      .populate('creator', 'username')
      .sort({ createdAt: -1 });

    // Add isExpired flag to each poll
    const pollsWithStatus = polls.map(poll => ({
      ...poll.toObject(),
      isExpired: poll.isExpired(),
      results: poll.getResults()
    }));

    res.status(200).json({
      success: true,
      count: pollsWithStatus.length,
      polls: pollsWithStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single poll
// @route   GET /api/polls/:id
// @access  Public
exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('creator', 'username');

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    const pollData = {
      ...poll.toObject(),
      isExpired: poll.isExpired(),
      results: poll.getResults()
    };

    res.status(200).json({
      success: true,
      poll: pollData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Private
exports.voteOnPoll = async (req, res) => {
  try {
    const { answerIds, isAnonymous } = req.body;
    const pollId = req.params.id;

    if (!answerIds || answerIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one answer' });
    }

    // Get poll
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (poll.isExpired()) {
      return res.status(400).json({ success: false, message: 'This poll has expired' });
    }

    if (!poll.allowMultiple && answerIds.length > 1) {
      return res.status(400).json({ success: false, message: 'This poll allows only single choice' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ pollId, userId: req.user.id });
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted on this poll' });
    }

    // Get user
    const user = await User.findById(req.user.id);

    // Record vote
    const answers = answerIds.map(answerId => {
      const answer = poll.answers.find(a => a._id.toString() === answerId);
      return {
        answerId: new mongoose.Types.ObjectId(answerId),
        text: answer ? answer.text : ''
      };
    });

    const vote = await Vote.create({
      pollId,
      userId: req.user.id,
      answers,
      isAnonymous: isAnonymous || false
    });

    // Update poll answers
    let totalNewVotes = 0;
    for (let answerId of answerIds) {
      const answerIndex = poll.answers.findIndex(a => a._id.toString() === answerId);
      if (answerIndex !== -1) {
        poll.answers[answerIndex].votes += 1;
        poll.answers[answerIndex].voters.push(req.user.id);
        totalNewVotes += 1;
      }
    }

    poll.totalVotes += totalNewVotes;
    await poll.save();

    // Update user's voted polls
    user.votedPolls.push({
      pollId,
      answers: answerIds
    });
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      vote,
      pollResults: poll.getResults()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's created polls
// @route   GET /api/polls/user/created
// @access  Private
exports.getUserPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user.id }).sort({ createdAt: -1 });

    const pollsWithStatus = polls.map(poll => ({
      ...poll.toObject(),
      isExpired: poll.isExpired(),
      results: poll.getResults()
    }));

    res.status(200).json({
      success: true,
      count: pollsWithStatus.length,
      polls: pollsWithStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a poll
// @route   DELETE /api/polls/:id
// @access  Private
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Check if user is poll creator
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this poll' });
    }

    await Poll.findByIdAndDelete(req.params.id);
    await Vote.deleteMany({ pollId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
