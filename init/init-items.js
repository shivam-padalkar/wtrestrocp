const mongoose = require('mongoose');
const Item = require('../models/Item');

mongoose.connect('mongodb://localhost:27017/hotel')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if items already exist
    const count = await Item.countDocuments();
    if (count === 0) {
      // Create initial items with proper number types
      await Item.create([
        { name: 'Paneer Butter Masala', type: 'veg', price: 180, prepTime: 12 },
        { name: 'Vegetable Biryani', type: 'veg', price: 150, prepTime: 10 },
        { name: 'Palak Paneer', type: 'veg', price: 160, prepTime: 15 },
        { name: 'Chicken Curry', type: 'nonveg', price: 220, prepTime: 14 },
        { name: 'Fish Fry', type: 'nonveg', price: 250, prepTime: 13 },
        { name: 'Mutton Biryani', type: 'nonveg', price: 280, prepTime: 15 }
      ]);
      console.log('Initial menu items created');
    } else {
      console.log('Menu items already exist, skipping initialization');
    }
    
    mongoose.disconnect();
  })
  .catch(err => console.error('MongoDB error:', err));