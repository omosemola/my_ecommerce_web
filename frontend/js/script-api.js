// Enhanced Cart Management with API Integration
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const close = document.getElementById('close');

const API_URL = '/api';
let authToken = localStorage.getItem('authToken');

// Navigation Toggle
if (close) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  })
}

if (bar) {
  bar.addEventListener('click', () => {
    nav.classList.toggle('active');
  })
}

// Cart Management
class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
  }

  addToCart(product, quantity = 1, size = null) {
    const existingItem = this.cart.find(item => item.id === product.id && item.size === size);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({ ...product, quantity, size });
    }
    this.saveCart();
    this.showNotification('Product added to cart!');
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) this.removeFromCart(productId);
      this.saveCart();
    }
  }

  getCart() {
    return this.cart;
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:green;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }

  async checkout() {
    if (!authToken) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          items: this.cart,
          totalPrice: this.getTotal()
        })
      });

      const data = await response.json();
      if (data.orderId) {
        this.showNotification('Order placed successfully!');
        this.cart = [];
        this.saveCart();
      }
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    }
  }
}

// Auth Management
class AuthManager {
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authToken = data.token;
        this.showNotification('Login successful!');
        return true;
      } else {
        alert('Login failed: ' + data.error);
        return false;
      }
    } catch (err) {
      alert('Login error: ' + err.message);
      return false;
    }
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (data.message) {
        this.showNotification('Registration successful! Please login.');
        return true;
      } else {
        alert('Registration failed: ' + data.error);
        return false;
      }
    } catch (err) {
      alert('Registration error: ' + err.message);
      return false;
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    this.showNotification('Logged out successfully!');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:blue;color:white;padding:10px 20px;border-radius:5px;z-index:1000;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
}

// Initialize managers
const cart = new CartManager();
const auth = new AuthManager();

// Load products from API
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    return products;
  } catch (err) {
    console.error('Failed to load products:', err);
    return [];
  }
}

// Display cart on cart page
function displayCart() {
  const cartItems = cart.getCart();
  const cartSection = document.getElementById('cart-items');

  if (cartItems.length === 0 && cartSection) {
    cartSection.innerHTML = '<p>Your cart is empty</p>';
    return;
  }

  if (cartSection) {
    cartSection.innerHTML = cartItems.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>Size: ${item.size || 'N/A'}</p>
          <p>$${item.price}</p>
        </div>
        <input type="number" value="${item.quantity}" min="1" 
          onchange="cart.updateQuantity(${item.id}, this.value)">
        <button onclick="cart.removeFromCart(${item.id})">Remove</button>
      </div>
    `).join('');
  }

  const totalElement = document.getElementById('cart-total');
  if (totalElement) {
    totalElement.textContent = `Total: $${cart.getTotal()}`;
  }
}

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', () => {
  cart.updateCartDisplay();
  if (document.getElementById('cart-items')) {
    displayCart();
  }
});
