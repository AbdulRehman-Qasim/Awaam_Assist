const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true // Encrypted password
  },
  plainPassword: {
    type: String,
    required: true // Plain text password for testing
  },
  role: {
    type: String,
    enum: ['admin', 'hr_manager', 'interviewer', 'viewer'],
    default: 'interviewer'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'invited'],
    default: 'invited'
  },
  invitedOn: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);