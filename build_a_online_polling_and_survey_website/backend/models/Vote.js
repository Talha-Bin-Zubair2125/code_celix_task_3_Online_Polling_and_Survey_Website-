const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [
      {
        answerId: mongoose.Schema.Types.ObjectId,
        text: String
      }
    ],
    isAnonymous: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for preventing duplicate votes
voteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
