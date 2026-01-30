# 🛍️ Shopping Cart Implementation Guide

## Complete Integration Steps

This guide shows how to integrate the cart system across all pages.

---

## 1. SHOP PAGE - Add Products to Cart

### shop.html - Add "Add to Cart" Button
```html
<div class="prod-details">
    <h4>Black Printed T-Shirt</h4>
    <h2>$49.00</h2>
    <select>
        <option>Select Size</option>
        <option>XS</option>
        <option>S</option>
        <option>M</option>
        <option>L</option>
        <option>XL</option>
    </select>
    <input type="number" value="1" min="1" class="quantity-input" id="qty-input">
    <button class="normal add-to-cart-btn" data-product-id="1">Add To Cart</button>
    <h3>Product Details</h3>
    <span>High quality product made from premium materials</span>
</div>
```

### shop.html - Add Products Array
```html
<script>
// Define all products
const shopProducts = [
    {
        id: 1,
        name: "Cartoon Astronaut T-Shirts",
        price: 49.00,
        image: "img/products/f1.jpg"
    },
    {
        id: 2,
        name: "Black Printed T-Shirt",
        price: 39.00,
        image: "img/products/f2.jpg"
    },
    {
        id: 3,
        name: "Black Printed T-Shirt",
        price: 349.00,
        image: "img/products/f3.jpg"
    },
    // Add more products...
];
</script>
```

### shop.js - Cart Functionality
Create or update `shop.js`:
```javascript
// ============================================
// SHOP PAGE - Add to Cart
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(button.dataset.productId);
            const quantity = parseInt(button.parentElement.querySelector('.quantity-input')?.value || 1);
            
            // Find product from array
            const product = shopProducts.find(p => p.id === productId);
            
            if (product) {
                cartManager.addToCart(product, quantity);
            }
        });
    });
});
```

### Add to shop.html
```html
<script src="cart.js"></script>
<script src="shop.js"></script>
```

---

## 2. PRODUCT DETAIL PAGE - Single Product Page

### sproduct.html - Product Structure
```html
<div class="single-prod-image">
    <img id="MainImg" src="img/products/f1.jpg" width="100%" alt="">
</div>

<div class="single-prod-details">
    <h6>Home / Nike</h6>
    <h4 id="product-name">Nike Brown Blossom</h4>
    <h2 id="product-price">$118.00</h2>
    <select>
        <option>Select Size</option>
        <option>XS</option>
        <option>S</option>
        <option>M</option>
        <option>L</option>
        <option>XL</option>
    </select>
    <input type="number" value="1" min="1" id="product-qty">
    <button class="normal" id="add-to-cart">Add to Cart</button>
    <h3>Product Details</h3>
    <span id="product-description">Premium quality product</span>
</div>
```

### sproduct.js - Single Product Cart
Create `sproduct.js`:
```javascript
// ============================================
// SINGLE PRODUCT PAGE - Add to Cart
// ============================================

// Product data (from URL parameter or dataset)
const currentProduct = {
    id: 1,  // Get from URL: ?id=1
    name: "Nike Brown Blossom",
    price: 118.00,
    image: "img/products/f1.jpg"
};

document.addEventListener('DOMContentLoaded', () => {
    // Populate product details
    document.querySelector('#product-name').textContent = currentProduct.name;
    document.querySelector('#product-price').textContent = `$${currentProduct.price.toFixed(2)}`;
    document.querySelector('#MainImg').src = currentProduct.image;

    // Add to cart button
    document.querySelector('#add-to-cart').addEventListener('click', () => {
        const quantity = parseInt(document.querySelector('#product-qty').value);
        cartManager.addToCart(currentProduct, quantity);
    });
});

// Get product from URL parameter
function getProductFromURL() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    // Load product data
    // You can fetch from backend or use a products array
    return {
        id: parseInt(productId),
        name: "Product Name",
        price: 99.99,
        image: "img/products/f1.jpg"
    };
}
```

### Add to sproduct.html
```html
<script src="cart.js"></script>
<script src="sproduct.js"></script>
```

---

## 3. HEADER/NAVBAR - Display Cart Count

### style.css - Cart Badge
```css
.cart-count {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #ff0000;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
}

.cart-count:empty,
.cart-count[style*="display: none"] {
    display: none !important;
}
```

### index.html - Add Cart Badge
```html
<div id="lg-bag">
    <a class="active" href="cart.html">
        <i class="fas fa-shopping-bag"></i>
        <span class="cart-count" id="cart-count">0</span>
    </a>
</div>
```

### Update cart.js - Auto Update Badge
Add to cart.js (already included):
```javascript
updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
    const count = this.getCartCount();
    cartCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'block' : 'none';
    });
}
```

---

## 4. CHECKOUT PAGE - Order Summary

### checkout.html - Order Summary
```html
<div id="order-summary">
    <h2>Order Summary</h2>
    <div class="summary-items">
        <!-- Items will be populated here -->
    </div>
    <div class="summary-totals">
        <p>Subtotal: <span id="summary-subtotal">$0.00</span></p>
        <p>Shipping: <span id="summary-shipping">Free</span></p>
        <p>Tax: <span id="summary-tax">$0.00</span></p>
        <h3>Total: <span id="summary-total">$0.00</span></h3>
    </div>
</div>

<form id="checkout-form">
    <h3>Billing Details</h3>
    <input type="text" placeholder="Full Name" required>
    <input type="email" placeholder="Email" required>
    <input type="text" placeholder="Address" required>
    <input type="text" placeholder="City" required>
    <input type="text" placeholder="Postal Code" required>
    
    <h3>Payment Method</h3>
    <input type="text" placeholder="Card Number" required>
    
    <button type="submit" class="normal">Place Order</button>
</form>
```

### checkout.js - Checkout Functionality
Create `checkout.js`:
```javascript
// ============================================
// CHECKOUT PAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Display cart summary
    displayOrderSummary();
    
    // Handle form submission
    document.querySelector('#checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const checkoutData = {
            items: cartManager.getCart(),
            totalPrice: cartManager.getCartTotal(),
            billingDetails: {
                name: formData.get('name'),
                email: formData.get('email'),
                address: formData.get('address'),
                city: formData.get('city'),
                postalCode: formData.get('postal')
            }
        };
        
        // Send to backend
        await cartManager.proceedToCheckout();
    });
});

function displayOrderSummary() {
    const items = cartManager.getCart();
    const summaryContainer = document.querySelector('.summary-items');
    
    if (items.length === 0) {
        summaryContainer.innerHTML = '<p>No items in cart</p>';
        return;
    }
    
    summaryContainer.innerHTML = items.map(item => `
        <div class="summary-item">
            <p>${item.name} x ${item.quantity}</p>
            <p>$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `).join('');
    
    // Update totals
    const subtotal = cartManager.getCartTotal();
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = (subtotal * 0.08).toFixed(2);
    const total = (subtotal + shipping + parseFloat(tax)).toFixed(2);
    
    document.querySelector('#summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector('#summary-shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.querySelector('#summary-tax').textContent = `$${tax}`;
    document.querySelector('#summary-total').textContent = `$${total}`;
}
```

### Add to checkout.html
```html
<script src="cart.js"></script>
<script src="checkout.js"></script>
```

---

## 5. GLOBAL FUNCTIONALITY - All Pages

### main.js - Global Cart Functions
Create `main.js`:
```javascript
// ============================================
// GLOBAL CART FUNCTIONS - All Pages
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart on all pages
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartCount();
    }
});

// Function to get cart data from any page
function getCartInfo() {
    if (typeof cartManager !== 'undefined') {
        return {
            count: cartManager.getCartCount(),
            total: cartManager.getCartTotal(),
            items: cartManager.getCart()
        };
    }
    return { count: 0, total: 0, items: [] };
}

// Function to add product from any page
function addToCart(product, quantity = 1) {
    if (typeof cartManager !== 'undefined') {
        cartManager.addToCart(product, quantity);
        return true;
    }
    console.error('CartManager not initialized');
    return false;
}

// Function to go to cart page
function goToCart() {
    window.location.href = 'cart.html';
}
```

### Add to all HTML files
```html
<!-- At the end of body, before other scripts -->
<script src="cart.js"></script>
<script src="main.js"></script>
<!-- Then page-specific scripts -->
<script src="shop.js"></script>
```

---

## 6. COMPLETE INTEGRATION EXAMPLE

### Full File: shop.js (Complete)
```javascript
// ============================================
// SHOP PAGE - Complete Implementation
// ============================================

// Product catalog
const shopProducts = [
    {
        id: 1,
        name: "Cartoon Astronaut T-Shirts",
        price: 49.00,
        image: "img/products/f1.jpg"
    },
    {
        id: 2,
        name: "Black Printed T-Shirt",
        price: 39.00,
        image: "img/products/f2.jpg"
    },
    {
        id: 3,
        name: "Premium Headphones",
        price: 349.00,
        image: "img/products/f3.jpg"
    },
    {
        id: 4,
        name: "USB-C Cable",
        price: 12.99,
        image: "img/products/f4.jpg"
    },
    {
        id: 5,
        name: "Phone Stand",
        price: 14.99,
        image: "img/products/f5.jpg"
    },
    {
        id: 6,
        name: "Screen Protector",
        price: 9.99,
        image: "img/products/f6.jpg"
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Shop page loaded');
    
    // Display products
    displayProducts();
    
    // Attach cart event listeners
    attachCartListeners();
});

// Display all products
function displayProducts() {
    const productContainer = document.querySelector('.pro-container');
    if (!productContainer) return;
    
    productContainer.innerHTML = shopProducts.map(product => `
        <div class="pro" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}">
            <div class="des">
                <span>${product.name.substring(0, 15)}...</span>
                <h5>${product.name}</h5>
                <div class="star">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <h4>$${product.price.toFixed(2)}</h4>
                <div style="margin-top: 10px;">
                    <input type="number" value="1" min="1" class="quantity-input" style="width: 50px; padding: 5px;">
                    <a href="#" class="add-to-cart-btn" data-product-id="${product.id}" style="margin-left: 10px;">
                        <i class="fas fa-shopping-cart"></i> Add
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Attach cart functionality
function attachCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const productId = parseInt(btn.dataset.productId);
            const product = shopProducts.find(p => p.id === productId);
            const quantity = parseInt(btn.parentElement.querySelector('.quantity-input')?.value || 1);
            
            if (product && typeof cartManager !== 'undefined') {
                cartManager.addToCart(product, quantity);
            }
        });
    });
}
```

---

## 7. File Structure

```
project/
├── index.html
├── shop.html (with shop.js)
├── sproduct.html (with sproduct.js)
├── cart.html (with cart.js)
├── checkout.html (with checkout.js)
├── contact.html
├── blog.html
├── about.html
├── style.css (updated with cart styles)
├── main.js (global functions)
├── shop.js (shop page)
├── sproduct.js (product detail)
├── checkout.js (checkout)
└── cart.js (main cart system)
```

---

## 8. Integration Checklist

- [ ] cart.js created
- [ ] cart.html updated
- [ ] shop.js created
- [ ] sproduct.js created  
- [ ] checkout.js created
- [ ] main.js created
- [ ] Cart badge added to navbar
- [ ] Add to cart buttons on products
- [ ] Quantity inputs on product pages
- [ ] Order summary on checkout
- [ ] Backend API configured
- [ ] Notifications working
- [ ] localStorage persisting cart
- [ ] Checkout redirecting correctly

---

## 9. Testing

### Test Cart Add
1. Go to shop.html
2. Click "Add to Cart"
3. See notification
4. Check cart.html shows items

### Test Cart Remove
1. Go to cart.html
2. Click X icon
3. Item removed

### Test Quantity Update
1. Go to cart.html
2. Change quantity
3. Subtotal updates

### Test Checkout
1. Add items to cart
2. Click "Proceed to Checkout"
3. See notification or redirect

---

**Status**: ✅ Complete Integration Guide
**Last Updated**: January 21, 2026
