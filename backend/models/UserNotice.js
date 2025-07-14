const mongoose = require('mongoose');

const userNoticeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  noticeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notice',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a user can only have one record per notice
userNoticeSchema.index({ userId: 1, noticeId: 1 }, { unique: true });

const UserNotice = mongoose.model('UserNotice', userNoticeSchema);

module.exports = UserNotice; 