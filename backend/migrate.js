const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const dataDir = path.join(__dirname, '../frontend/data');
const usersFile = path.join(dataDir, 'users.json');
const productsFile = path.join(dataDir, 'products.json');
const ordersFile = path.join(dataDir, 'orders.json');

async function migrateData() {
    try {
        console.log('🚀 Starting MongoDB Migration...');

        // Check for password placeholder
        if (process.env.MONGODB_URI.includes('<db_password>')) {
            console.error('❌ ERROR: Please replace <db_password> in your .env file with your actual database password first!');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('📡 Connected to MongoDB Atlas');

        // 1. Migrate Products
        if (fs.existsSync(productsFile)) {
            const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
            console.log(`📦 Found ${products.length} products in JSON. Migrating...`);

            for (const p of products) {
                // Map fields if necessary
                const productData = {
                    name: p.name,
                    price: p.price,
                    category: p.category || 'uncategorized',
                    description: p.description || '',
                    image: p.image || 'img/placeholder.jpg'
                };
                await Product.findOneAndUpdate({ name: p.name }, productData, { upsert: true });
            }
            console.log('✅ Products migrated.');
        }

        // 2. Migrate Users
        if (fs.existsSync(usersFile)) {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            console.log(`👥 Found ${users.length} users in JSON. Migrating...`);

            for (const u of users) {
                const userData = {
                    name: u.name,
                    email: u.email,
                    password: u.password, // Already hashed in existing JSON
                    phone: u.phone || '',
                    country: u.country || ''
                };
                await User.findOneAndUpdate({ email: u.email }, userData, { upsert: true });
            }
            console.log('✅ Users migrated.');
        }

        // 3. Migrate Orders
        if (fs.existsSync(ordersFile)) {
            const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
            console.log(`🛒 Found ${orders.length} orders in JSON. Migrating...`);

            for (const o of orders) {
                const orderData = {
                    id: o.id,
                    customer: o.customer,
                    items: o.items,
                    total: o.total,
                    subtotal: o.subtotal,
                    tax: o.tax,
                    shippingCost: o.shippingCost,
                    status: o.status || 'confirmed',
                    timestamp: o.timestamp || o.createdAt
                };
                await Order.findOneAndUpdate({ id: o.id }, orderData, { upsert: true });
            }
            console.log('✅ Orders migrated.');
        }

        console.log('🎉 Migration completed successfully!');
        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrateData();
