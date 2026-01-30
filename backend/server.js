const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Email Configuration with Gmail (using App Password)
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
};

// Alternative: For other SMTP services (SendGrid, Mailgun, custom SMTP)
// const emailConfig = {
//   host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
//   port: process.env.SMTP_PORT || 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD
//   }
// };

let transporter = nodemailer.createTransport(emailConfig);

// Function to send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  try {
    const { customer, items, total, subtotal, tax, shippingCost, id: orderId } = order;

    // Format items for email
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ${item.name || 'Product'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
          $${(item.price * (item.quantity || 1)).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@ecommerce.com',
      to: customer.email,
      subject: `Order Confirmation - Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #088178 0%, #066a63 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Order Confirmed!</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h3 style="color: #333;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            
            <h3 style="color: #333; margin-top: 20px;">Customer Information</h3>
            <p>
              <strong>${customer.firstName} ${customer.lastName}</strong><br>
              ${customer.email}<br>
              ${customer.phone}
            </p>
            
            <h3 style="color: #333; margin-top: 20px;">Shipping Address</h3>
            <p>
              ${customer.address}<br>
              ${customer.city}, ${customer.state} ${customer.zip}<br>
              ${customer.country}
            </p>
            
            <h3 style="color: #333; margin-top: 20px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #088178;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #088178;">Quantity</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #088178;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right; font-size: 14px;">
              <p><strong>Subtotal:</strong> $${subtotal?.toFixed(2) || '0.00'}</p>
              <p><strong>Tax:</strong> $${tax?.toFixed(2) || '0.00'}</p>
              <p><strong>Shipping:</strong> $${shippingCost?.toFixed(2) || '0.00'}</p>
              <p style="font-size: 16px; color: #088178;"><strong>Total: $${total?.toFixed(2) || '0.00'}</strong></p>
            </div>
            
            <div style="background: #e8f5f0; padding: 15px; margin-top: 20px; border-radius: 5px; text-align: center;">
              <p style="margin: 0; color: #066a63;">
                <strong>Your order is being processed</strong><br>
                You will receive a shipping notification soon!
              </p>
            </div>
          </div>
          
          <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 5px 5px;">
            <p style="margin: 0;">
              Questions? Contact us at support@ecommerce.com
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✉️ Confirmation email sent to:', customer.email);
    return true;
  } catch (error) {
    console.error('⚠️ Email send error:', error.message);
    return false;
  }
};

// Function to send shipping notification email
const sendShippingNotificationEmail = async (order, trackingNumber) => {
  try {
    const { customer, id: orderId } = order;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@ecommerce.com',
      to: customer.email,
      subject: `Your Order #${orderId} Has Shipped!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #088178 0%, #066a63 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">📦 Your Order is on the Way!</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Hi ${customer.firstName},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div style="background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #088178;">
              <p><strong>Order ID:</strong> #${orderId}</p>
              ${trackingNumber ? `<p><strong>Tracking Number:</strong> <a href="https://tracking.example.com/${trackingNumber}" style="color: #088178; text-decoration: none;">${trackingNumber}</a></p>` : ''}
              <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
            </div>
            
            <p>You can track your package using the tracking number above.</p>
            <p style="color: #666; font-size: 14px;">Thank you for your purchase!</p>
          </div>
          
          <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 5px 5px;">
            <p style="margin: 0;">
              Questions? Contact us at support@ecommerce.com
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✉️ Shipping notification sent to:', customer.email);
    return true;
  } catch (error) {
    console.error('⚠️ Shipping email error:', error.message);
    return false;
  }
};

// File-based storage for users, orders, and products (simpler than MongoDB)
const dataDir = path.join(__dirname, '../frontend/data');
const usersFile = path.join(dataDir, 'users.json');
const ordersFile = path.join(dataDir, 'orders.json');
const productsFile = path.join(dataDir, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
}

// Initialize products file with sample products if it doesn't exist
if (!fs.existsSync(productsFile)) {
  const sampleProducts = [
    { id: 1, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'img/products/f1.jpg', description: 'Comfortable cotton t-shirt', category: 'apparel' },
    { id: 2, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'img/products/f2.jpg', description: 'Comfortable cotton t-shirt', category: 'apparel' },
    { id: 3, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'img/products/f3.jpg', description: 'Comfortable cotton t-shirt', category: 'apparel' },
    { id: 4, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'img/products/f4.jpg', description: 'Comfortable cotton t-shirt', category: 'apparel' },
    { id: 5, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'img/products/f5.jpg', description: 'Comfortable cotton t-shirt', category: 'apparel' },
    { id: 6, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'img/products/f6.jpg', description: 'Comfortable cotton t-shirt', category: 'apparel' }
  ];
  fs.writeFileSync(productsFile, JSON.stringify(sampleProducts, null, 2));
}

// Helper functions for file-based storage
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
  }
};

const findUserByEmail = (email) => {
  const users = loadUsers();
  return users.find(u => u.email === email);
};

const addUser = (user) => {
  const users = loadUsers();
  user.id = Date.now();
  users.push(user);
  saveUsers(users);
  return user;
};

// Order storage helper functions
const loadOrders = () => {
  try {
    const data = fs.readFileSync(ordersFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
};

const saveOrders = (orders) => {
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Error writing orders file:', err);
  }
};

const addOrder = (orderData) => {
  const orders = loadOrders();
  const order = {
    id: 'ORD-' + Date.now(),
    timestamp: new Date().toISOString(),
    status: 'confirmed',
    ...orderData
  };
  orders.push(order);
  saveOrders(orders);
  return order;
};

// Product storage helper functions
const loadProducts = () => {
  try {
    const data = fs.readFileSync(productsFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products file:', err);
    return [];
  }
};

const saveProducts = (products) => {
  try {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error writing products file:', err);
  }
};

const addProduct = (productData) => {
  const products = loadProducts();
  const product = {
    id: Math.max(...products.map(p => p.id), 0) + 1,
    createdAt: new Date().toISOString(),
    ...productData
  };
  products.push(product);
  saveProducts(products);
  return product;
};

const updateProduct = (productId, updateData) => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updateData, updatedAt: new Date().toISOString() };
    saveProducts(products);
    return products[index];
  }
  return null;
};

const deleteProduct = (productId) => {
  const products = loadProducts();
  const filteredProducts = products.filter(p => p.id !== productId);
  saveProducts(filteredProducts);
  return filteredProducts.length < products.length;
};

// Optional: MongoDB Connection (commented out, can be enabled later)
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).catch(err => console.log('MongoDB connection error:', err));

// Middleware for authentication
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for admin authentication
const verifyAdminToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No admin token provided' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid admin token' });
  }
};

// API Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, country } = req.body;

    console.log('📝 Registration request:', { name, email, phone, country });

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const user = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      country: country || '',
      createdAt: new Date().toISOString()
    };

    // Save user
    const savedUser = addUser(user);

    console.log('✅ User registered:', savedUser.email);

    res.json({
      message: 'User registered successfully',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Product Routes (Public - Read Only)
app.get('/api/products', (req, res) => {
  const products = loadProducts();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = loadProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Admin Product Management Routes (Protected with admin auth)
app.get('/api/admin/products', verifyAdminToken, (req, res) => {
  const products = loadProducts();
  res.json({
    success: true,
    products: products,
    total: products.length
  });
});

app.post('/api/admin/products', verifyAdminToken, (req, res) => {
  try {
    const { name, price, category, description, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = addProduct({
      name,
      price: parseFloat(price),
      category: category || 'uncategorized',
      description: description || '',
      image: image || 'img/placeholder.jpg'
    });

    console.log('✅ Product added:', product.id, product.name);

    res.json({
      success: true,
      message: 'Product added successfully',
      product: product
    });
  } catch (err) {
    console.error('❌ Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/admin/products/:id', verifyAdminToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, price, category, description, image } = req.body;

    const product = updateProduct(productId, {
      name: name || undefined,
      price: price ? parseFloat(price) : undefined,
      category: category || undefined,
      description: description || undefined,
      image: image || undefined
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('✏️ Product updated:', productId);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: product
    });
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', verifyAdminToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const success = deleteProduct(productId);

    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('🗑️ Product deleted:', productId);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      productId: productId
    });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Cart Routes (stored in session/localStorage on frontend)
app.get('/api/cart', verifyToken, (req, res) => {
  // Cart is typically managed on frontend; this endpoint can store persistent carts
  res.json({ message: 'Use localStorage for cart' });
});

// Order Routes
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, shipping, payment, items, total, subtotal, tax, shippingCost } = req.body;

    // Validation
    if (!customer || !customer.email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order data' });
    }

    console.log('📦 New order received from:', customer.email);

    // Create order
    const order = addOrder({
      customer,
      shipping,
      payment,
      items,
      total,
      subtotal,
      tax,
      shippingCost
    });

    console.log('✅ Order saved with ID:', order.id);

    // Send confirmation email (async, don't block response)
    sendOrderConfirmationEmail(order).catch(err => {
      console.error('Email sending failed, but order was created:', err);
    });

    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: order.id,
      order: order
    });
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order: ' + err.message });
  }
});

// Get all orders (admin/testing only)
app.get('/api/orders', (req, res) => {
  try {
    const orders = loadOrders();
    res.json({
      count: orders.length,
      orders: orders
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order by ID
app.get('/api/orders/:orderId', (req, res) => {
  try {
    const orders = loadOrders();
    const order = orders.find(o => o.id === req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get orders by email
app.get('/api/orders/email/:email', (req, res) => {
  try {
    const orders = loadOrders();
    const userOrders = orders.filter(o => o.customer.email === req.params.email);

    res.json({
      email: req.params.email,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
      res.json({
        success: true,
        token: token,
        message: 'Admin login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid admin password'
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin authentication middleware

// Admin: Get all orders with stats
app.get('/api/admin/dashboard', verifyAdminToken, (req, res) => {
  try {
    const orders = loadOrders();
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalOrders = orders.length;
    const thisMonth = orders.filter(o => {
      const orderDate = new Date(o.timestamp);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }).length;

    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        thisMonth,
        averageOrderValue: averageOrderValue
      },
      orders: orders
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard: ' + err.message });
  }
});

// Admin: Delete order
app.delete('/api/admin/orders/:orderId', verifyAdminToken, (req, res) => {
  try {
    let orders = loadOrders();
    const initialLength = orders.length;
    orders = orders.filter(o => o.id !== req.params.orderId);

    if (orders.length === initialLength) {
      return res.status(404).json({ error: 'Order not found' });
    }

    saveOrders(orders);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Email Routes
app.post('/api/email/send-confirmation', async (req, res) => {
  try {
    const { orderId } = req.body;

    // Load the order
    const orders = loadOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send confirmation email
    const success = await sendOrderConfirmationEmail(order);

    res.json({
      success: success,
      message: success ? 'Confirmation email sent' : 'Failed to send email',
      orderId: orderId
    });
  } catch (err) {
    console.error('Email API error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

app.post('/api/email/send-shipping', async (req, res) => {
  try {
    const { orderId, trackingNumber } = req.body;

    // Load the order
    const orders = loadOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send shipping notification
    const success = await sendShippingNotificationEmail(order, trackingNumber || null);

    res.json({
      success: success,
      message: success ? 'Shipping email sent' : 'Failed to send email',
      orderId: orderId
    });
  } catch (err) {
    console.error('Email API error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

app.post('/api/email/test', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@ecommerce.com',
      to: email,
      subject: 'Test Email from E-Commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #088178 0%, #066a63 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">✅ Email Configuration Working!</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Hello,</p>
            <p>This is a test email to confirm that your email configuration is working correctly.</p>
            
            <div style="background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #088178; border-radius: 3px;">
              <p style="margin: 0;">
                <strong>✓ Email Service:</strong> Successfully configured<br>
                <strong>✓ Date:</strong> ${new Date().toLocaleString()}<br>
                <strong>✓ Recipient:</strong> ${email}
              </p>
            </div>
            
            <p>Your email system is ready to send order confirmations, shipping notifications, and customer support emails!</p>
          </div>
          
          <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 5px 5px;">
            <p style="margin: 0;">
              Sent from E-Commerce Backend
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Test email sent to:', email);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      email: email
    });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ error: 'Failed to send test email: ' + err.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    storage: 'File-based (no MongoDB)',
    email: process.env.EMAIL_USER ? 'Configured' : 'Not configured'
  });
});

// ============================================
// STRIPE PAYMENT ENDPOINTS
// ============================================

// Create Payment Intent for Checkout
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'NGN', customerEmail, customerName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        customerName: customerName || 'Guest',
        customerEmail: customerEmail || 'no-email@example.com'
      }
    });

    console.log('💳 Payment Intent created:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('❌ Payment Intent Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Process Payment and Create Order
app.post('/api/process-payment', async (req, res) => {
  try {
    const {
      paymentIntentId,
      orderData,
      items,
      total
    } = req.body;

    if (!paymentIntentId || !orderData || !items || total === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Retrieve payment intent to confirm payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed. Status: ' + paymentIntent.status
      });
    }

    // Create order object
    const order = {
      id: 'ORD-' + Date.now(),
      customer: orderData.customer,
      items: items,
      total: parseFloat(total),
      subtotal: orderData.subtotal || parseFloat(total),
      shipping: orderData.shipping || 0,
      tax: orderData.tax || 0,
      status: 'completed',
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntentId,
      timestamp: new Date().toISOString(),
      shipping: {
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        zipcode: orderData.zipcode,
        country: orderData.country || 'Nigeria'
      }
    };

    // Save order to file
    const orders = loadOrders();
    orders.push(order);
    saveOrders(orders);

    console.log('✅ Order created and saved:', order.id);

    // Send order confirmation email
    try {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #088178 0%, #066a63 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">✅ Order Confirmed!</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Hi ${orderData.customer.firstName},</p>
            <p>Your order has been successfully placed and payment received!</p>
            
            <h3 style="border-bottom: 2px solid #088178; padding-bottom: 10px;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
            
            <h3 style="border-bottom: 2px solid #088178; padding-bottom: 10px;">Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px;">${item.name}</td>
                  <td style="padding: 10px; text-align: right;">₦${item.price.toFixed(2)} x ${item.quantity}</td>
                  <td style="padding: 10px; text-align: right;">₦${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            
            <h3 style="border-bottom: 2px solid #088178; padding-bottom: 10px; margin-top: 20px;">Totals</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px;"><strong>Subtotal:</strong></td>
                <td style="padding: 5px; text-align: right;">₦${(order.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px;"><strong>Shipping:</strong></td>
                <td style="padding: 5px; text-align: right;">₦${(order.shipping).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px;"><strong>Tax:</strong></td>
                <td style="padding: 5px; text-align: right;">₦${(order.tax).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #088178; background: #f0f0f0;">
                <td style="padding: 10px;"><strong>Total:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>₦${(order.total).toFixed(2)}</strong></td>
              </tr>
            </table>
            
            <h3 style="border-bottom: 2px solid #088178; padding-bottom: 10px; margin-top: 20px;">Shipping Address</h3>
            <p>
              ${orderData.customer.firstName} ${orderData.customer.lastName}<br>
              ${orderData.address}<br>
              ${orderData.city}, ${orderData.state} ${orderData.zipcode}<br>
              ${orderData.country || 'Nigeria'}
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-left: 4px solid #088178; border-radius: 4px;">
              <p><strong>Thank you for your purchase!</strong></p>
              <p>Your order will be processed and shipped soon. You will receive a tracking number via email.</p>
            </div>
          </div>
          
          <div style="padding: 20px; background: #f0f0f0; text-align: center; border-radius: 0 0 5px 5px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              © 2024 Your E-Commerce Store. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@ecommerce.com',
        to: orderData.customer.email,
        subject: `Order Confirmation: ${order.id}`,
        html: emailContent
      });

      console.log('📧 Confirmation email sent to:', orderData.customer.email);
    } catch (emailError) {
      console.warn('⚠️ Email not sent (non-critical):', emailError.message);
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: order.id,
      orderData: order
    });

  } catch (error) {
    console.error('❌ Payment Processing Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Stripe Public Key
app.get('/api/stripe-public-key', (req, res) => {
  const publicKey = process.env.STRIPE_PUBLIC_KEY || 'pk_test_dummy';
  res.json({ publicKey });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Using file-based storage at ${dataDir}`);
  console.log(`🔐 Default admin password: admin123 (change via ADMIN_PASSWORD env var)`);
});