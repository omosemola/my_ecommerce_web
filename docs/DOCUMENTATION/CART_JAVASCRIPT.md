# 🛒 Cart JavaScript - Complete Documentation

## Overview

The cart system provides complete shopping cart functionality with:
- Add/remove/update products
- Cart persistence (localStorage)
- Dynamic price calculations
- Coupon system
- Checkout integration
- Notifications

---

## 📁 Files

- **cart.js** - Complete cart functionality (primary file)
- **cart.html** - Cart page structure
- **script-api.js** - API integration (optional)

---

## 🚀 Quick Start

### 1. Add Script to HTML
```html
<script src="cart.js"></script>
```

### 2. Use CartManager Class
```javascript
// Access globally
cartManager.addToCart(product, quantity);
cartManager.removeFromCart(productId);
cartManager.getCartTotal();
```

---

## 📚 API Reference

### CartManager Class

#### Constructor
```javascript
const cart = new CartManager();
```

#### Methods

##### `addToCart(product, quantity)`
Add a product to the cart
```javascript
const product = {
    id: 1,
    name: "Shirt",
    price: 49.99,
    image: "img/products/f1.jpg"
};
cartManager.addToCart(product, 2);
```

##### `removeFromCart(productId)`
Remove a product from cart
```javascript
cartManager.removeFromCart(1);
```

##### `updateQuantity(productId, quantity)`
Update product quantity
```javascript
cartManager.updateQuantity(1, 5);
```

##### `getCart()`
Get all cart items
```javascript
const items = cartManager.getCart();
console.log(items);
// Returns: [{ id, name, price, image, quantity }, ...]
```

##### `getCartCount()`
Get total number of items
```javascript
const count = cartManager.getCartCount();
console.log(count); // 3
```

##### `getCartTotal()`
Get total price
```javascript
const total = cartManager.getCartTotal();
console.log(total); // 149.97
```

##### `getItemSubtotal(item)`
Get subtotal for one item
```javascript
const subtotal = cartManager.getItemSubtotal(item);
console.log(subtotal); // "99.98"
```

##### `clearCart()`
Remove all items from cart
```javascript
cartManager.clearCart();
```

##### `updateCartUI()`
Refresh cart display
```javascript
cartManager.updateCartUI();
```

##### `applyCoupon(code)`
Apply discount coupon
```javascript
cartManager.applyCoupon('SAVE10'); // 10% off
// Valid codes: SAVE10, SAVE20, SAVE50, WELCOME
```

##### `removeCoupon()`
Remove applied coupon
```javascript
cartManager.removeCoupon();
```

##### `proceedToCheckout()`
Process checkout (requires login)
```javascript
cartManager.proceedToCheckout();
```

##### `showNotification(message, type)`
Display notification
```javascript
cartManager.showNotification('Added to cart!', 'success');
// Types: success, error, info
```

---

## 💾 Data Structure

### Cart Item Object
```javascript
{
    id: 1,                          // Product ID
    name: "Shirt",                  // Product name
    price: 49.99,                   // Unit price
    image: "img/products/f1.jpg",  // Product image
    quantity: 2                     // Quantity in cart
}
```

### Cart in LocalStorage
```javascript
// Stored as JSON string in localStorage['cart']
[
    { id: 1, name: "Shirt", price: 49.99, image: "...", quantity: 2 },
    { id: 2, name: "Pants", price: 79.99, image: "...", quantity: 1 }
]
```

---

## 🎯 Usage Examples

### Example 1: Add Product from Shop Page
```javascript
// In shop.html or product page
const product = {
    id: 1,
    name: "Cartoon Astronaut T-Shirt",
    price: 49.00,
    image: "img/products/f1.jpg"
};

document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
    const quantity = document.querySelector('.quantity-input').value;
    cartManager.addToCart(product, quantity);
});
```

### Example 2: Display Cart in Header
```javascript
// Update cart count in navbar
function updateHeader() {
    const summary = getCartSummary();
    document.querySelector('.cart-count').textContent = summary.count;
    document.querySelector('.cart-total').textContent = `$${summary.total.toFixed(2)}`;
}

// Call whenever cart changes
cartManager.updateCartUI = function() {
    this.updateCartCount();
    this.displayCartTable();
    this.updateTotals();
    updateHeader(); // Your custom function
};
```

### Example 3: Custom Checkout Process
```javascript
document.querySelector('#checkout-btn').addEventListener('click', async () => {
    if (cartManager.proceedToCheckout()) {
        // Success - user will be redirected
    }
});
```

### Example 4: Apply Coupon
```javascript
document.querySelector('#apply-coupon').addEventListener('click', () => {
    const code = document.querySelector('#coupon-input').value;
    if (cartManager.applyCoupon(code)) {
        cartManager.updateTotals();
    }
});
```

### Example 5: Get Cart Summary
```javascript
const summary = getCartSummary();
console.log(`Items: ${summary.count}`);
console.log(`Total: $${summary.total.toFixed(2)}`);
console.log(`Products: ${summary.items.map(i => i.name).join(', ')}`);
```

---

## 🎨 Automatic HTML Injection

The cart system automatically injects CSS for animations:

```css
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

---

## 💳 Pricing Logic

### Calculation Example
```
Product 1: $49.99 × 2 = $99.98
Product 2: $79.99 × 1 = $79.99
Subtotal               = $179.97

Shipping:
- If Subtotal > $100: Free
- Else: $10.00

Tax: Subtotal × 8% = $14.40

Total = Subtotal + Shipping + Tax
```

---

## 🔐 Checkout Requirements

To proceed to checkout:
1. ✅ Cart must NOT be empty
2. ✅ User must be logged in (token in localStorage)
3. ✅ Backend must be running
4. ✅ Valid API endpoint at `http://localhost:3000/api/checkout`

---

## 🎟️ Coupon Codes

Pre-configured codes (in production, get from backend):

| Code | Discount | Example |
|------|----------|---------|
| SAVE10 | 10% off | $100 → $90 |
| SAVE20 | 20% off | $100 → $80 |
| SAVE50 | 50% off | $100 → $50 |
| WELCOME | 15% off | $100 → $85 |

### Add Custom Coupons
Edit the `applyCoupon` method:
```javascript
applyCoupon(code) {
    const coupons = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'YOUR_CODE': 0.30, // Add here
    };
    // ... rest of code
}
```

---

## 📱 Event System

### Auto-Attached Events

The system automatically attaches events to:
1. **Remove buttons** - `.remove-btn`
2. **Quantity inputs** - `.quantity-input`
3. **Coupon button** - `#coupon button`
4. **Checkout button** - `#subtotal button`

### Custom Events
```javascript
// Add custom event listener
document.addEventListener('cartUpdated', () => {
    console.log('Cart was updated');
});

// In your code, dispatch event
document.dispatchEvent(new Event('cartUpdated'));
```

---

## 🔌 Integration with Backend API

### Checkout Request
```javascript
POST /api/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
    "items": [
        { id: 1, name: "Shirt", price: 49.99, quantity: 2 }
    ],
    "totalPrice": 99.98
}
```

### Response
```javascript
{
    "orderId": "507f1f77bcf86cd799439012",
    "status": "completed"
}
```

---

## 🐛 Debugging

### Enable Debug Logs
```javascript
// Add to your page
cartManager.debugMode = true;

// Modify cart.js to add logging:
console.log('Cart items:', this.cart);
console.log('Total:', this.getCartTotal());
```

### Check Cart in Browser Console
```javascript
// Open DevTools (F12) and run:
cartManager.getCart()
cartManager.getCartTotal()
cartManager.getCartCount()
localStorage.getItem('cart')
```

### Common Issues

#### Cart Not Persisting
```javascript
// Check localStorage
console.log(localStorage.getItem('cart'));

// Force save
cartManager.saveCartToStorage();
```

#### Totals Not Updating
```javascript
// Refresh display
cartManager.updateCartUI();

// Or individual updates
cartManager.updateCartCount();
cartManager.updateTotals();
```

#### Notifications Not Showing
```javascript
// Check if notification div is created
cartManager.showNotification('Test', 'success');

// Verify CSS in DOM
console.log(document.querySelector('style'));
```

---

## 🎯 Implementation Checklist

- [x] cart.js included in cart.html
- [x] CartManager class defined
- [x] localStorage persistence
- [x] Cart display table
- [x] Totals calculation
- [x] Quantity updates
- [x] Remove items
- [x] Coupon system
- [x] Checkout integration
- [x] Notifications
- [ ] Backend integration (your server)
- [ ] Payment processing (Stripe)
- [ ] Order confirmation page

---

## 🚀 Advanced Features

### Custom Shipping Calculation
```javascript
// Override in cart.js
getShipping(subtotal) {
    if (subtotal > 100) return 0;
    if (subtotal > 50) return 5;
    return 10;
}
```

### Custom Tax Calculation
```javascript
// Override in cart.js
getTax(subtotal) {
    return subtotal * 0.08; // 8% tax
}
```

### Sync with Backend
```javascript
// Save cart to backend
async syncCartToServer() {
    const token = localStorage.getItem('authToken');
    await fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: this.cart })
    });
}
```

---

## 📊 Performance Tips

1. **Minimize DOM Updates** - Cache elements
2. **Debounce Input Events** - Avoid excessive calculations
3. **Lazy Load Images** - Use image lazy loading
4. **Compress Images** - Optimize product images
5. **Use CSS Classes** - Instead of inline styles when possible

---

## 🔄 Update History

- ✅ v1.0 - Initial cart system
- ✅ Added coupon support
- ✅ Added checkout integration
- ✅ Added notifications
- 🔄 Coming: Wishlist support
- 🔄 Coming: Save for later
- 🔄 Coming: Payment integration

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Verify cart.js is loaded
3. Check localStorage: `localStorage.getItem('cart')`
4. Review integration examples above
5. Ensure backend server is running

---

**Last Updated**: January 21, 2026
**Version**: 1.0
**Status**: Production Ready ✅
