const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Custom ID like ORD-123
    customer: {
        firstName: String,
        lastName: String,
        email: { type: String, required: true },
        phone: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number
    }],
    total: Number,
    subtotal: Number,
    tax: Number,
    shippingCost: Number,
    status: { type: String, default: 'confirmed' },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
