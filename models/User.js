const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // in production, use bcrypt to hash passwords
  role: { 
    type: String, 
    enum: ['veg-chef', 'nonveg-chef', 'admin'], 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);