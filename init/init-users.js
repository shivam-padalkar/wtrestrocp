const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/hotel')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if users already exist
    const count = await User.countDocuments();
    if (count === 0) {
      // Create initial users
      await User.create([
        { username: 'vegchef', password: 'password123', role: 'veg-chef' },
        { username: 'nonvegchef', password: 'password123', role: 'nonveg-chef' },
        { username: 'admin', password: 'admin123', role: 'admin' }
      ]);
      console.log('Initial users created');
    } else {
      console.log('Users already exist, skipping initialization');
    }
    
    mongoose.disconnect();
  })
  .catch(err => console.error('MongoDB error:', err));