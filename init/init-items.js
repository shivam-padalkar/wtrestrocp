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
        // Original Vegetarian Items
        { name: 'Paneer Butter Masala', type: 'veg', price: 180, prepTime: 12 },
        { name: 'Vegetable Biryani', type: 'veg', price: 150, prepTime: 10 },
        { name: 'Palak Paneer', type: 'veg', price: 160, prepTime: 15 },
        
        // Original Non-Vegetarian Items
        { name: 'Chicken Curry', type: 'nonveg', price: 220, prepTime: 14 },
        { name: 'Fish Fry', type: 'nonveg', price: 250, prepTime: 13 },
        { name: 'Mutton Biryani', type: 'nonveg', price: 280, prepTime: 15 },
        
        // Additional Vegetarian Main Courses
        { name: 'Malai Kofta', type: 'veg', price: 190, prepTime: 18 },
        { name: 'Paneer Tikka Masala', type: 'veg', price: 195, prepTime: 14 },
        { name: 'Chana Masala', type: 'veg', price: 160, prepTime: 12 },
        { name: 'Dal Makhani', type: 'veg', price: 140, prepTime: 20 },
        { name: 'Mushroom Masala', type: 'veg', price: 170, prepTime: 13 },
        { name: 'Kadai Paneer', type: 'veg', price: 190, prepTime: 15 },
        { name: 'Veg Kolhapuri', type: 'veg', price: 165, prepTime: 14 },
        { name: 'Navratan Korma', type: 'veg', price: 185, prepTime: 16 },
        { name: 'Baingan Bharta', type: 'veg', price: 150, prepTime: 14 },
        { name: 'Aloo Gobi', type: 'veg', price: 140, prepTime: 12 },
        
        // Vegetarian Rice Dishes
        { name: 'Jeera Rice', type: 'veg', price: 120, prepTime: 8 },
        { name: 'Kashmiri Pulao', type: 'veg', price: 160, prepTime: 15 },
        { name: 'Veg Fried Rice', type: 'veg', price: 140, prepTime: 12 },
        { name: 'Lemon Rice', type: 'veg', price: 130, prepTime: 10 },
        { name: 'Tomato Rice', type: 'veg', price: 135, prepTime: 12 },
        
        // Vegetarian Bread/Roti
        { name: 'Butter Naan', type: 'veg', price: 40, prepTime: 6 },
        { name: 'Garlic Naan', type: 'veg', price: 50, prepTime: 7 },
        { name: 'Cheese Naan', type: 'veg', price: 70, prepTime: 8 },
        { name: 'Tandoori Roti', type: 'veg', price: 30, prepTime: 5 },
        { name: 'Missi Roti', type: 'veg', price: 45, prepTime: 7 },
        { name: 'Laccha Paratha', type: 'veg', price: 60, prepTime: 8 },
        
        // Vegetarian Starters
        { name: 'Paneer Tikka', type: 'veg', price: 220, prepTime: 15 },
        { name: 'Veg Manchurian', type: 'veg', price: 160, prepTime: 12 },
        { name: 'Gobi 65', type: 'veg', price: 150, prepTime: 14 },
        { name: 'Crispy Corn', type: 'veg', price: 140, prepTime: 10 },
        { name: 'Hara Bhara Kebab', type: 'veg', price: 170, prepTime: 16 },
        { name: 'Paneer Pakora', type: 'veg', price: 160, prepTime: 10 },
        { name: 'Aloo Tikki', type: 'veg', price: 120, prepTime: 12 },
        
        // Vegetarian Soups and Salads
        { name: 'Tomato Soup', type: 'veg', price: 90, prepTime: 8 },
        { name: 'Sweet Corn Soup', type: 'veg', price: 100, prepTime: 10 },
        { name: 'Manchow Soup', type: 'veg', price: 110, prepTime: 12 },
        { name: 'Garden Fresh Salad', type: 'veg', price: 120, prepTime: 7 },
        { name: 'Russian Salad', type: 'veg', price: 140, prepTime: 10 },
        
        // Vegetarian South Indian
        { name: 'Masala Dosa', type: 'veg', price: 130, prepTime: 12 },
        { name: 'Plain Dosa', type: 'veg', price: 110, prepTime: 10 },
        { name: 'Idli Sambar', type: 'veg', price: 100, prepTime: 8 },
        { name: 'Vada Sambar', type: 'veg', price: 110, prepTime: 12 },
        { name: 'Uttapam', type: 'veg', price: 140, prepTime: 14 },
        
        // Vegetarian Desserts
        { name: 'Gulab Jamun', type: 'veg', price: 90, prepTime: 8 },
        { name: 'Rasgulla', type: 'veg', price: 100, prepTime: 6 },
        { name: 'Kheer', type: 'veg', price: 120, prepTime: 10 },
        { name: 'Gajar Ka Halwa', type: 'veg', price: 130, prepTime: 18 },
        { name: 'Kulfi', type: 'veg', price: 110, prepTime: 6 },
        
        // Non-Vegetarian Main Courses
        { name: 'Butter Chicken', type: 'nonveg', price: 240, prepTime: 18 },
        { name: 'Chicken Tikka Masala', type: 'nonveg', price: 260, prepTime: 16 },
        { name: 'Mutton Rogan Josh', type: 'nonveg', price: 290, prepTime: 22 },
        { name: 'Fish Curry', type: 'nonveg', price: 270, prepTime: 15 },
        { name: 'Prawn Masala', type: 'nonveg', price: 300, prepTime: 16 },
        { name: 'Chicken Chettinad', type: 'nonveg', price: 260, prepTime: 18 },
        { name: 'Kadai Chicken', type: 'nonveg', price: 250, prepTime: 17 },
        { name: 'Keema Matar', type: 'nonveg', price: 240, prepTime: 15 },
        { name: 'Chicken Korma', type: 'nonveg', price: 260, prepTime: 17 },
        { name: 'Goan Fish Curry', type: 'nonveg', price: 280, prepTime: 16 },
        
        // Non-Vegetarian Rice Dishes
        { name: 'Chicken Biryani', type: 'nonveg', price: 220, prepTime: 20 },
        { name: 'Egg Biryani', type: 'nonveg', price: 180, prepTime: 15 },
        { name: 'Prawn Biryani', type: 'nonveg', price: 290, prepTime: 22 },
        { name: 'Fish Biryani', type: 'nonveg', price: 260, prepTime: 20 },
        { name: 'Keema Pulao', type: 'nonveg', price: 240, prepTime: 18 },
        
        // Non-Vegetarian Starters
        { name: 'Chicken Tikka', type: 'nonveg', price: 240, prepTime: 18 },
        { name: 'Tangdi Kebab', type: 'nonveg', price: 260, prepTime: 20 },
        { name: 'Fish Amritsari', type: 'nonveg', price: 280, prepTime: 15 },
        { name: 'Chicken 65', type: 'nonveg', price: 230, prepTime: 16 },
        { name: 'Mutton Seekh Kebab', type: 'nonveg', price: 290, prepTime: 20 },
        { name: 'Chicken Lollipop', type: 'nonveg', price: 240, prepTime: 17 },
        { name: 'Prawn Koliwada', type: 'nonveg', price: 310, prepTime: 15 },
        
        // Non-Vegetarian Soups
        { name: 'Chicken Sweet Corn Soup', type: 'nonveg', price: 130, prepTime: 12 },
        { name: 'Hot and Sour Chicken Soup', type: 'nonveg', price: 140, prepTime: 14 },
        { name: 'Chicken Manchow Soup', type: 'nonveg', price: 150, prepTime: 15 },
        
        // Chinese Non-Vegetarian
        { name: 'Chilli Chicken', type: 'nonveg', price: 220, prepTime: 16 },
        { name: 'Chicken Manchurian', type: 'nonveg', price: 230, prepTime: 18 },
        { name: 'Szechuan Chicken', type: 'nonveg', price: 240, prepTime: 17 },
        { name: 'Pepper Chicken', type: 'nonveg', price: 230, prepTime: 16 },
        { name: 'Garlic Prawns', type: 'nonveg', price: 290, prepTime: 15 }
      ]);
      console.log('Extended menu items created');
    } else {
      console.log('Menu items already exist, skipping initialization');
    }
    
    mongoose.disconnect();
  })
  .catch(err => console.error('MongoDB error:', err));