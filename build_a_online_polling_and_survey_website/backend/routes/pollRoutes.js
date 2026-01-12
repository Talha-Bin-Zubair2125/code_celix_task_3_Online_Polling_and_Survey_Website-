const express = require('express');
const {
  createPoll,
  getAllPolls,
  getPoll,
  voteOnPoll,
  getUserPolls,
  deletePoll
} = require('../controllers/pollController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getAllPolls);
router.get('/:id', getPoll);

// Private routes
router.post('/', protect, createPoll);
router.post('/:id/vote', protect, voteOnPoll);
router.get('/user/created', protect, getUserPolls);
router.delete('/:id', protect, deletePoll);

module.exports = router;
