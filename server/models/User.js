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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
