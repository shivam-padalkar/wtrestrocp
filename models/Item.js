const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['veg', 'nonveg'], required: true },
  price: { type: Number, required: true },
  prepTime: { type: Number, required: true } // in minutes
});

module.exports = mongoose.model('Item', itemSchema);