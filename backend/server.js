const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('📡 Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️ Running without database connection. Some features will fail.');
  });

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

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      country: country || ''
    });

    await user.save();
    console.log('✅ User registered:', user.email);

    res.json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Product Routes (Public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Admin Product Management
app.get('/api/admin/products', verifyAdminToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products, total: products.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/admin/products', verifyAdminToken, async (req, res) => {
  try {
    const { name, price, category, description, image } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const product = new Product({
      name,
      price: parseFloat(price),
      category: category || 'uncategorized',
      description: description || '',
      image: image || 'img/placeholder.jpg'
    });

    await product.save();
    console.log('✅ Product added:', product._id);
    res.json({ success: true, message: 'Product added successfully', product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/admin/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully', productId: req.params.id });
  } catch (err) {
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
    if (!customer || !customer.email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order data' });
    }

    const order = new Order({
      id: 'ORD-' + Date.now(),
      customer,
      items,
      total,
      subtotal,
      tax,
      shippingCost,
      status: 'confirmed'
    });

    await order.save();
    console.log('✅ Order saved:', order.id);

    sendOrderConfirmationEmail(order).catch(err => console.error('Email failed:', err));

    res.json({ success: true, message: 'Order placed successfully', orderId: order.id, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order: ' + err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.get('/api/orders/email/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.params.email }).sort({ timestamp: -1 });
    res.json({ email: req.params.email, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/email/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.params.email }).sort({ timestamp: -1 });
    res.json({ email: req.params.email, count: orders.length, orders });
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
app.get('/api/admin/dashboard', verifyAdminToken, async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalOrders = orders.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = orders.filter(o => new Date(o.timestamp || o.createdAt) >= startOfMonth).length;

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
app.delete('/api/admin/orders/:orderId', verifyAdminToken, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Email Routes
app.post('/api/email/send-confirmation', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ id: orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const success = await sendOrderConfirmationEmail(order);
    res.json({ success, message: success ? 'Confirmation email sent' : 'Failed to send email', orderId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

app.post('/api/email/send-shipping', async (req, res) => {
  try {
    const { orderId, trackingNumber } = req.body;
    const order = await Order.findOne({ id: orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const success = await sendShippingNotificationEmail(order, trackingNumber || null);
    res.json({ success, message: success ? 'Shipping email sent' : 'Failed to send email', orderId });
  } catch (err) {
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
    storage: 'MongoDB Atlas',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
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
    const { paymentIntentId, orderData, items, total } = req.body;
    if (!paymentIntentId || !orderData || !items || total === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, error: 'Payment not completed. Status: ' + paymentIntent.status });
    }

    const order = new Order({
      id: 'ORD-' + Date.now(),
      customer: orderData.customer,
      items: items,
      total: parseFloat(total),
      subtotal: orderData.subtotal || parseFloat(total),
      shippingCost: orderData.shipping || 0,
      tax: orderData.tax || 0,
      status: 'completed',
      timestamp: new Date()
    });

    await order.save();
    console.log('✅ Order created and saved:', order.id);

    // Send confirmation email
    try {
      sendOrderConfirmationEmail(order).catch(err => console.warn('Email failed:', err.message));
    } catch (emailError) {
      console.warn('⚠️ Email error:', emailError.message);
    }

    res.json({ success: true, message: 'Order created successfully', orderId: order.id, orderData: order });
  } catch (error) {
    console.error('❌ Processing Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
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
  console.log('📡 Connected to MongoDB storage');
  console.log('🔐 Admin configuration active');
});