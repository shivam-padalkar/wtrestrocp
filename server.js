// server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const methodOverride = require('method-override');

const Item = require('./models/Item');
const Order = require('./models/Order');
const User = require('./models/User');

const app = express();

// Connect to MongoDB with proper error handling
mongoose.connect('mongodb://localhost:27017/hotel')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// App configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(session({ 
  secret: 'hotel_secret', 
  resave: false, 
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Menu page
app.get('/', async (req, res) => {
  try {
    const items = await Item.find({});
    res.render('menu', { 
      items, 
      showLoginButtons: true // Adding flag to show login buttons on home screen
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).render('error', { 
      message: 'Error loading menu: ' + error.message,
      backLink: '/',
      backText: 'Try Again'
    });
  }
});

// Cart handling
app.post('/add-to-cart', (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push({
    id: req.body.id,
    name: req.body.name,
    type: req.body.type,
    price: parseFloat(req.body.price),
    prepTime: parseInt(req.body.prepTime)
  });
  res.redirect('/cart');
});

app.post('/remove-from-cart', (req, res) => {
  const itemIndex = parseInt(req.body.index);
  if (req.session.cart && req.session.cart[itemIndex]) {
    req.session.cart.splice(itemIndex, 1);
  }
  res.redirect('/cart');
});

app.get('/cart', (req, res) => {
  res.render('cart', { cart: req.session.cart || [] });
});

// Order placement
// Order placement
// Order placement (simplified version without schema changes)
// Order placement (simplified version without schema changes)
// Order placement
app.post('/place-order', async (req, res) => {
  try {
    const { tableNumber, email } = req.body;
    const cartItems = req.session.cart || [];
    
    // Make sure we have items in the cart
    if (cartItems.length === 0) {
      return res.status(400).render('error', {
        message: 'Your cart is empty. Please add items before placing an order.',
        backLink: '/',
        backText: 'Back to Menu'
      });
    }

    // Convert string values to numbers for price and prepTime if needed
    const processedItems = cartItems.map(item => ({
      name: item.name,
      type: item.type,
      price: parseFloat(item.price),
      prepTime: parseInt(item.prepTime)
    }));

    // Determine chef type based on item types
    const vegItems = processedItems.filter(i => i.type === 'veg');
    const nonvegItems = processedItems.filter(i => i.type === 'nonveg');
    let chefType = 'both';
    
    if (vegItems.length > 0 && nonvegItems.length === 0) {
      chefType = 'veg';
    } else if (nonvegItems.length > 0 && vegItems.length === 0) {
      chefType = 'nonveg';
    }

    // Create a new order
    const orderData = {
      items: processedItems,
      tableNumber: parseInt(tableNumber),
      email,
      chefType,
      status: 'Pending',
      billSent: false
    };

    const newOrder = await Order.create(orderData);

    // Send confirmation email
    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'qwertyisop91@gmail.com', // replace with your Gmail
          pass: 'ijsa exre kvfa oqjs' // use env vars or OAuth2 in real apps
        }
      });

      await transporter.sendMail({
        from: 'yourhotelapp@gmail.com',
        to: email,
        subject: 'Order Confirmation',
        text: `Thank you for your order! Your order #${newOrder._id} has been placed for table ${tableNumber}. You'll receive your bill once your order is complete.`
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue execution even if email fails
    }

    // Clear the cart
    req.session.cart = [];
    res.render('order-confirmation', { order: newOrder, showLoginButtons: false });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).render('error', {
      message: 'Error placing order: ' + error.message,
      backLink: '/cart',
      backText: 'Back to Cart'
    });
  }
});

// Chef login and dashboard
app.get('/chef-login/:type', (req, res) => {
  // Validate chef type
  const type = req.params.type;
  if (type !== 'veg' && type !== 'nonveg') {
    return res.status(400).render('error', {
      message: 'Invalid chef type. Must be "veg" or "nonveg".',
      backLink: '/',
      backText: 'Home'
    });
  }
  
  res.render('chef-login', { type });
});

app.post('/chef/:type', async (req, res) => {
  try {
    const { username, password } = req.body;
    const type = req.params.type;
    
    // Validate chef type
    if (type !== 'veg' && type !== 'nonveg') {
      return res.status(400).render('error', {
        message: 'Invalid chef type. Must be "veg" or "nonveg".',
        backLink: '/',
        backText: 'Home'
      });
    }
    
    // Find chef with matching credentials
    const user = await User.findOne({ 
      username, 
      password, 
      role: `${type}-chef` 
    });
    
    if (!user) {
      return res.render('error', { 
        message: 'Invalid credentials.', 
        backLink: `/chef-login/${type}`,
        backText: 'Back to Login'
      });
    }

    // Store user session information
    req.session.user = {
      username: user.username,
      role: user.role,
      type: type
    };

    // Find relevant orders for this chef type
    let orders;
    
    if (type === 'veg') {
      // For veg chef, find orders with veg items only OR both
      orders = await Order.find({
        $or: [
          { chefType: 'veg' },
          { chefType: 'both' }
        ],
        status: 'Pending'
      }).sort({ createdAt: 1 }); // oldest first
    } else if (type === 'nonveg') {
      // For non-veg chef, find orders with non-veg items only OR both
      orders = await Order.find({
        $or: [
          { chefType: 'nonveg' },
          { chefType: 'both' }
        ],
        status: 'Pending'
      }).sort({ createdAt: 1 }); // oldest first
    }
    
    res.render('chef', { orders, type, showLoginButtons: false });
  } catch (error) {
    console.error('Chef login error:', error);
    res.status(500).render('error', { 
      message: `Error processing login: ${error.message}`,
      backLink: '/',
      backText: 'Home'
    });
  }
});

// Add GET routes for chef dashboards - FIX for the error when completing orders
app.get('/chef/veg', async (req, res) => {
  try {
    // Check if user is logged in as a veg chef
    if (!req.session.user || req.session.user.role !== 'veg-chef') {
      return res.redirect('/chef-login/veg');
    }

    // Find relevant orders for veg chef
    const orders = await Order.find({
      $or: [
        { chefType: 'veg' },
        { chefType: 'both' }
      ],
      status: 'Pending'
    }).sort({ createdAt: 1 }); // oldest first
    
    res.render('chef', { orders, type: 'veg', showLoginButtons: false });
  } catch (error) {
    console.error('Error loading veg chef dashboard:', error);
    res.status(500).render('error', { 
      message: `Error loading chef dashboard: ${error.message}`,
      backLink: '/',
      backText: 'Home'
    });
  }
});

app.get('/chef/nonveg', async (req, res) => {
  try {
    // Check if user is logged in as a nonveg chef
    if (!req.session.user || req.session.user.role !== 'nonveg-chef') {
      return res.redirect('/chef-login/nonveg');
    }

    // Find relevant orders for non-veg chef
    const orders = await Order.find({
      $or: [
        { chefType: 'nonveg' },
        { chefType: 'both' }
      ],
      status: 'Pending'
    }).sort({ createdAt: 1 }); // oldest first
    
    res.render('chef', { orders, type: 'nonveg', showLoginButtons: false });
  } catch (error) {
    console.error('Error loading nonveg chef dashboard:', error);
    res.status(500).render('error', { 
      message: `Error loading chef dashboard: ${error.message}`,
      backLink: '/',
      backText: 'Home'
    });
  }
});

app.post('/complete-order/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndUpdate(orderId, { status: 'Completed' });
    
    // Get the referer to determine where to redirect
    const referer = req.headers.referer || '';
    
    if (referer.includes('/chef/veg')) {
      res.redirect('/chef/veg');
    } else if (referer.includes('/chef/nonveg')) {
      res.redirect('/chef/nonveg');
    } else {
      res.redirect('/admin/orders');
    }
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).render('error', {
      message: 'Error completing order: ' + error.message,
      backLink: '/',
      backText: 'Home'
    });
  }
});

// Admin login and dashboard
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

app.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password, role: 'admin' });
    
    if (!user) {
      return res.render('error', {
        message: 'Invalid admin credentials.',
        backLink: '/admin-login',
        backText: 'Back to Login'
      });
    }
    
    // Store admin session information
    req.session.user = {
      username: user.username,
      role: user.role
    };
    
    res.render('admin', { showLoginButtons: false });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).render('error', {
      message: 'Error processing login: ' + error.message,
      backLink: '/admin-login',
      backText: 'Try Again'
    });
  }
});

// Admin dashboard GET route
app.get('/admin', (req, res) => {
  // Check if user is logged in as admin
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/admin-login');
  }
  res.render('admin', { showLoginButtons: false });
});

// Admin orders view
app.get('/admin/orders', async (req, res) => {
  try {
    // Check if user is logged in as admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin-login');
    }
    
    // Get all orders sorted by most recent first
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('admin-orders', { orders, showLoginButtons: false });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).render('error', {
      message: 'Error loading orders: ' + error.message,
      backLink: '/admin',
      backText: 'Back to Admin Dashboard'
    });
  }
});

// Bill sending - UPDATED to only include orders that haven't been billed yet
// Bill sending - UPDATED to only include orders that haven't been billed yet
app.post('/send-bill', async (req, res) => {
  try {
    const { tableNumber, customerName, email } = req.body;
    
    // Find completed orders for this table that haven't been billed yet
    const orders = await Order.find({ 
      tableNumber: parseInt(tableNumber), 
      status: 'Completed',
      email: email // Match the email to ensure we're only getting orders for the right customer
    });
    
    if (!orders || orders.length === 0) {
      return res.render('error', {
        message: 'No completed orders found for this table and email.',
        backLink: '/admin',
        backText: 'Back to Admin Dashboard'
      });
    }
    
    // Calculate total bill amount
    let totalAmount = 0;
    let itemList = [];
    let billableOrders = [];
    
    // Process each order
    orders.forEach(order => {
      // Check if order has items array and it's not empty
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        // Only include orders that haven't been billed yet
        if (order.billSent !== true) {
          billableOrders.push(order);
          order.items.forEach(item => {
            totalAmount += parseFloat(item.price || 0);
            itemList.push(`${item.name || 'Unknown Item'} - ₹${(item.price || 0).toFixed(2)}`);
          });
        }
      }
    });
    
    // If no billable orders found
    if (billableOrders.length === 0) {
      return res.render('error', {
        message: 'All completed orders for this table and email have already been billed.',
        backLink: '/admin',
        backText: 'Back to Admin Dashboard'
      });
    }
    
    // Create bill HTML
    const billHtml = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .bill-header { text-align: center; margin-bottom: 20px; }
          .bill-table { width: 100%; border-collapse: collapse; }
          .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .bill-total { margin-top: 20px; text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="bill-header">
          <h1>Hotel Invoice</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Table Number:</strong> ${tableNumber}</p>
        
        <table class="bill-table">
          <tr>
            <th>Item</th>
            <th>Price</th>
          </tr>
          ${itemList.map(item => {
            const parts = item.split(' - ');
            const name = parts[0] || 'Unknown Item';
            const price = parts[1] || '₹0.00';
            return `<tr><td>${name}</td><td>${price}</td></tr>`;
          }).join('')}
        </table>
        
        <div class="bill-total">
          <p>Total Amount: ₹${totalAmount.toFixed(2)}</p>
        </div>
        
        <p>Thank you for dining with us!</p>
      </body>
      </html>
    `;
    
    try {
      // Send email with bill
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'qwertyisop91@gmail.com', // replace with your Gmail
          pass: 'ijsa exre kvfa oqjs' // use env vars or OAuth2 in real apps
        }
      });
      
      await transporter.sendMail({
        from: 'yourhotelapp@gmail.com',
        to: email,
        subject: `Your Bill for Table ${tableNumber}`,
        html: billHtml
      });
      
      // Mark orders as billed
      for (const order of billableOrders) {
        await Order.findByIdAndUpdate(order._id, { billSent: true });
      }
      
      res.render('bill-sent', { 
        customerName, 
        email, 
        tableNumber, 
        totalAmount,
        showLoginButtons: false
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.render('error', {
        message: 'Bill generated but email could not be sent. Please try again or contact support.',
        backLink: '/admin',
        backText: 'Back to Admin Dashboard'
      });
    }
  } catch (error) {
    console.error('Error sending bill:', error);
    res.status(500).render('error', {
      message: 'Error generating bill: ' + error.message,
      backLink: '/admin',
      backText: 'Back to Admin Dashboard'
    });
  }
});

// Add order-confirmation view route (in case it's needed separately)
app.get('/order-confirmation/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).render('error', {
        message: 'Order not found',
        backLink: '/',
        backText: 'Home'
      });
    }
    res.render('order-confirmation', { order, showLoginButtons: false });
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).render('error', {
      message: 'Error retrieving order: ' + error.message,
      backLink: '/',
      backText: 'Home'
    });
  }
});

// Add a 404 handler for any undefined routes
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    backLink: '/',
    backText: 'Go to Home'
  });
});

// Add an error handler for any server errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', {
    message: 'Server error: ' + (err.message || 'Unknown error'),
    backLink: '/',
    backText: 'Go to Home'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));