const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    creatorName: {
      type: String,
      required: true
    },
    answers: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        text: {
          type: String,
          required: true
        },
        votes: {
          type: Number,
          default: 0
        },
        voters: [mongoose.Schema.Types.ObjectId]
      }
    ],
    totalVotes: {
      type: Number,
      default: 0
    },
    allowMultiple: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: [true, 'Please provide an expiration date']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
      enum: ['Sports', 'Politics', 'Technology', 'Entertainment', 'Other'],
      default: 'Other'
    }
  },
  { timestamps: true }
);

// Method to check if poll is expired
pollSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to get poll results with percentages
pollSchema.methods.getResults = function() {
  const results = this.answers.map(answer => ({
    id: answer._id,
    text: answer.text,
    votes: answer.votes,
    percentage: this.totalVotes > 0 ? ((answer.votes / this.totalVotes) * 100).toFixed(2) : 0
  }));
  return results;
};

// Pre-save hook to deactivate expired polls
pollSchema.pre('save', function(next) {
  if (this.isExpired()) {
    this.isActive = false;
  }
  next();
});

module.exports = mongoose.model('Poll', pollSchema);
