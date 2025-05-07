const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['veg', 'nonveg'], required: true },
    price: { type: Number, required: true },
    prepTime: { type: Number, required: true }
  }],
  tableNumber: { type: Number, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  chefType: { type: String, enum: ['veg', 'nonveg', 'both'], required: true },
  createdAt: { type: Date, default: Date.now },
  billSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Order', orderSchema);