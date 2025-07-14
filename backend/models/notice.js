const mongoose = require('mongoose');

// Define the schema
const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categories: [{
    type: String,
    enum: ['User', 'garbageCollector', 'All'],
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model
let Notice;
try {
  Notice = mongoose.model('Notice');
} catch (error) {
  Notice = mongoose.model('Notice', noticeSchema);
}

module.exports = Notice; 