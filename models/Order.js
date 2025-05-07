const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['veg', 'nonveg'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  prepTime: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  items: {
    type: [orderItemSchema],
    required: true
  },
  tableNumber: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  chefType: {
    type: String,
    enum: ['veg', 'nonveg', 'both'],
    required: true
  },
  billSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);