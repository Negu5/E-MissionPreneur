const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fname:     { type: String, required: true },
  lname:     { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  company:   { type: String, required: true },
  tier: {
    type: String,
    enum: ['forum', 'premium', 'partner', 'exploring'],
    default: 'exploring'
  },
  password:  { type: String, required: true },
  isActive:  { type: Boolean, default: true },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);