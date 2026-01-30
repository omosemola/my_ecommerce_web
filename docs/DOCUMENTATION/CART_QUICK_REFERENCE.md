# 🛒 Cart.js - Quick Reference & Examples

## Installation

### 1. Add to HTML
```html
<script src="cart.js"></script>
```

### 2. Start Using
```javascript
cartManager.addToCart(product, quantity);
```

---

## Quick Examples

### Example 1: Basic Add to Cart
```javascript
const product = {
    id: 1,
    name: "Shirt",
    price: 49.99,
    image: "img/products/f1.jpg"
};

// Add 2 items
cartManager.addToCart(product, 2);

// Shows notification automatically
// Saves to localStorage automatically
```

### Example 2: Remove from Cart
```javascript
cartManager.removeFromCart(1);  // Remove by product ID
```

### Example 3: Update Quantity
```javascript
cartManager.updateQuantity(1, 5);  // Update product 1 to quantity 5
```

### Example 4: Get Total Price
```javascript
const total = cartManager.getCartTotal();
console.log(`Total: $${total.toFixed(2)}`);
```

### Example 5: Get All Cart Items
```javascript
const items = cartManager.getCart();
items.forEach(item => {
    console.log(`${item.name}: $${item.price} x ${item.quantity}`);
});
```

### Example 6: Apply Coupon
```javascript
if (cartManager.applyCoupon('SAVE10')) {
    console.log('Coupon applied!');
}
```

### Example 7: Proceed to Checkout
```javascript
await cartManager.proceedToCheckout();
// Requires user to be logged in
// Calls backend API
// Clears cart on success
```

### Example 8: Display Notification
```javascript
cartManager.showNotification('Order placed!', 'success');
// Types: 'success', 'error', 'info'
```

---

## HTML Integration

### Basic Product Button
```html
<button class="add-to-cart-btn" data-product-id="1">
    Add to Cart
</button>

<script>
document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
    const product = {
        id: 1,
        name: "Product",
        price: 49.99,
        image: "img/products/f1.jpg"
    };
    cartManager.addToCart(product);
});
</script>
```

### Product with Quantity Input
```html
<input type="number" value="1" id="qty" min="1">
<button onclick="addProduct()">Add to Cart</button>

<script>
function addProduct() {
    const quantity = document.querySelector('#qty').value;
    const product = {
        id: 1,
        name: "Product",
        price: 49.99,
        image: "img/products/f1.jpg"
    };
    cartManager.addToCart(product, quantity);
}
</script>
```

### Cart Badge in Header
```html
<a href="cart.html">
    <i class="fas fa-shopping-bag"></i>
    <span class="cart-count" id="cart-count">0</span>
</a>
```

### Cart Summary Table
```html
<table>
    <thead>
        <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
        </tr>
    </thead>
    <tbody id="cart-body">
        <!-- Populated by cartManager.displayCartTable() -->
    </tbody>
</table>
```

---

## Common Use Cases

### Shop Page - Add Products
```html
<!-- products array -->
<script>
const products = [
    { id: 1, name: "Shirt", price: 49, image: "img/f1.jpg" },
    { id: 2, name: "Pants", price: 79, image: "img/f2.jpg" }
];

// Add listener to each "Add to Cart" button
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const id = this.dataset.productId;
        const product = products.find(p => p.id == id);
        cartManager.addToCart(product);
    });
});
</script>
```

### Cart Page - Display Items
```html
<script>
// Automatically called on page load
cartManager.updateCartUI();

// Manually refresh
function refreshCart() {
    cartManager.displayCartTable();
    cartManager.updateTotals();
}
</script>
```

### Show Cart Total in Header
```html
<span id="header-total">$0.00</span>

<script>
function updateHeader() {
    const total = cartManager.getCartTotal();
    document.querySelector('#header-total').textContent = 
        `$${total.toFixed(2)}`;
}

// Update whenever cart changes
const originalUpdate = cartManager.updateCartUI;
cartManager.updateCartUI = function() {
    originalUpdate.call(this);
    updateHeader();
};
</script>
```

### Apply Coupon Form
```html
<form id="coupon-form">
    <input type="text" id="coupon-code" placeholder="Enter coupon">
    <button type="submit">Apply</button>
</form>

<script>
document.querySelector('#coupon-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.querySelector('#coupon-code').value;
    cartManager.applyCoupon(code);
});
</script>
```

### Checkout Button
```html
<button id="checkout-btn" onclick="checkout()">Checkout</button>

<script>
function checkout() {
    if (cartManager.cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }
    
    cartManager.proceedToCheckout();
}
</script>
```

---

## Data Access

### Get Cart Items
```javascript
const items = cartManager.getCart();
// Returns: [{ id, name, price, image, quantity }, ...]
```

### Get Cart Count (Total Items)
```javascript
const count = cartManager.getCartCount();
// Returns: 5 (if 5 items total)
```

### Get Cart Total (Price)
```javascript
const total = cartManager.getCartTotal();
// Returns: 299.95
```

### Get Item Subtotal
```javascript
const item = cartManager.getCart()[0];
const subtotal = cartManager.getItemSubtotal(item);
// Returns: "99.98"
```

### Check if Cart is Empty
```javascript
if (cartManager.getCart().length === 0) {
    console.log('Cart is empty');
}
```

---

## LocalStorage Data

### View Cart in Console
```javascript
// Open DevTools (F12) → Console, then type:
JSON.parse(localStorage.getItem('cart'))

// Shows:
[
    { id: 1, name: "Shirt", price: 49, image: "...", quantity: 2 },
    { id: 2, name: "Pants", price: 79, image: "...", quantity: 1 }
]
```

### View Auth Token
```javascript
localStorage.getItem('authToken')
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Clear Cart Manually
```javascript
localStorage.removeItem('cart');
cartManager.cart = [];
cartManager.updateCartUI();
```

### Clear All Data
```javascript
localStorage.clear();
```

---

## Events & Listeners

### Manual Update
```javascript
// Update display after changes
cartManager.updateCartUI();

// Update just the count badge
cartManager.updateCartCount();

// Update just the totals
cartManager.updateTotals();

// Display just the table
cartManager.displayCartTable();
```

### Listen for Changes
```javascript
// Create a custom event
const cartChanged = new Event('cartUpdated');

// Dispatch when needed
document.dispatchEvent(cartChanged);

// Listen for it
document.addEventListener('cartUpdated', () => {
    console.log('Cart was updated');
    // Your code here
});
```

### Quantity Input Listener
```html
<input type="number" value="1" class="quantity-input" data-id="1">

<script>
document.querySelector('.quantity-input').addEventListener('change', (e) => {
    const id = e.target.dataset.id;
    const qty = e.target.value;
    cartManager.updateQuantity(id, qty);
});
</script>
```

---

## Styling

### Style Cart Count Badge
```css
.cart-count {
    background: red;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
}
```

### Style Quantity Input
```css
.quantity-input {
    width: 60px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
    text-align: center;
}

.quantity-input:focus {
    outline: none;
    border-color: #007bff;
}
```

### Style Remove Button
```css
.remove-btn {
    color: #dc3545;
    text-decoration: none;
    cursor: pointer;
    font-size: 1.2em;
}

.remove-btn:hover {
    color: #c82333;
}
```

### Style Notification
```css
.notification {
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.3s;
}

.notification-success {
    background: #4CAF50;
}

.notification-error {
    background: #f44336;
}

.notification-info {
    background: #2196F3;
}
```

---

## Troubleshooting

### Cart Not Saving
```javascript
// Check localStorage
console.log(localStorage.getItem('cart'));

// Force save
cartManager.saveCartToStorage();

// Clear and restart
localStorage.removeItem('cart');
cartManager.cart = [];
```

### Total Not Updating
```javascript
// Refresh manually
cartManager.updateTotals();

// Or full refresh
cartManager.updateCartUI();
```

### Notifications Not Appearing
```javascript
// Test notification
cartManager.showNotification('Test', 'success');

// Check CSS is loaded
console.log(document.head.innerHTML);
```

### Checkout Not Working
```javascript
// Check token exists
console.log(localStorage.getItem('authToken'));

// Check cart not empty
console.log(cartManager.getCart());

// Check backend URL
console.log('API URL: http://localhost:3000/api/checkout');
```

---

## API Calls

### Checkout Request
```javascript
const response = await fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        items: cartManager.getCart(),
        totalPrice: cartManager.getCartTotal()
    })
});

const data = await response.json();
console.log(data); // { orderId: "...", status: "completed" }
```

---

## Advanced

### Custom Shipping Rules
```javascript
// Override the method
cartManager.getShipping = function(subtotal) {
    if (subtotal > 200) return 0;      // Free shipping over $200
    if (subtotal > 100) return 5;      // $5 shipping $100-200
    return 10;                          // $10 shipping default
};
```

### Custom Tax Calculation
```javascript
// Override the method
cartManager.getTax = function(subtotal) {
    return subtotal * 0.10;  // 10% tax instead of 8%
};
```

### Custom Coupon Codes
```javascript
// Edit applyCoupon method
applyCoupon(code) {
    const coupons = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'WELCOME': 0.15,
        'YOUR_CODE': 0.30  // Add custom code
    };
    // ... rest of method
}
```

---

## Performance Tips

1. **Cache DOM elements**
   ```javascript
   const tbody = document.querySelector('#cart table tbody');
   // Use tbody instead of querying each time
   ```

2. **Debounce quantity changes**
   ```javascript
   let debounce;
   input.addEventListener('input', () => {
       clearTimeout(debounce);
       debounce = setTimeout(() => {
           cartManager.updateQuantity(id, input.value);
       }, 500);
   });
   ```

3. **Lazy load images**
   ```html
   <img src="..." loading="lazy">
   ```

4. **Use event delegation**
   ```javascript
   tbody.addEventListener('click', (e) => {
       if (e.target.matches('.remove-btn')) {
           // handle remove
       }
   });
   ```

---

## Browser Support

- ✅ Chrome (all versions)
- ✅ Firefox (all versions)
- ✅ Safari 11+
- ✅ Edge (all versions)
- ✅ Mobile browsers
- ⚠️ IE 11 (needs polyfills)

---

## Version & Updates

**Current Version:** 1.0  
**Last Updated:** January 21, 2026  
**Status:** ✅ Production Ready

---

**Need Help?** Check `CART_JAVASCRIPT.md` for full documentation
