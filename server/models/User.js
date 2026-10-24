const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  bloodGroup: {
    type: String,
    default: 'O+ Positive',
  },
  allergies: [{
    type: String,
  }],
  chronicConditions: [{
    type: String,
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  role: {
    type: String,
    enum: ['patient', 'admin'],
    default: 'patient',
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
  },
  googleId: {
    type: String,
  },
  authProvider: {
    type: String,
    default: 'local',
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
