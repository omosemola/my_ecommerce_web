// ============================================
// CART PAGE - Complete JavaScript Functionality
// ============================================

// ============================================
// 1. NAVIGATION & INITIALIZATION
// ============================================

// Navigation is handled by script.js, skip duplicate initialization

// ============================================
// 2. CART MANAGEMENT CLASS
// ============================================

class CartManager {
    constructor() {
        this.cart = this.loadCartFromStorage();
        this.API_URL = '/api';
    }

    // Load cart from localStorage
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Add product to cart
    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: parseInt(quantity)
            });
        }

        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    // Remove product from cart
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id == productId);
        if (itemIndex > -1) {
            const itemName = this.cart[itemIndex].name;
            this.cart.splice(itemIndex, 1);
            this.saveCartToStorage();
            this.updateCartUI();
            this.showNotification(`${itemName} removed from cart`, 'info');
        }
    }

    // Update product quantity
    updateQuantity(productId, quantity) {
        quantity = parseInt(quantity);

        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id == productId);
        if (item) {
            item.quantity = quantity;
            this.saveCartToStorage();
            this.updateCartUI();
        }
    }

    // Get all cart items
    getCart() {
        return this.cart;
    }

    // Get total number of items
    getCartCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Get total price
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Get subtotal for a single item
    getItemSubtotal(item) {
        return (item.price * item.quantity).toFixed(2);
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification('Cart cleared', 'info');
    }

    // Update cart display on all pages
    updateCartUI() {
        this.updateCartCount();
        this.displayCartTable();
        this.updateTotals();
    }

    // Update cart count badge
    updateCartCount() {
        const count = this.getCartCount();
        // Update desktop badge
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline-flex' : 'none';
        });
        // Update mobile badge
        const mobileCartCountElements = document.querySelectorAll('#cart-count-mobile');
        mobileCartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline-flex' : 'none';
        });
    }

    // Display cart in table format
    displayCartTable() {
        const tbody = document.querySelector('#cart table tbody');
        if (!tbody) return;

        if (this.cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px;">Your cart is empty</td></tr>';
            document.getElementById('cart').style.minHeight = '300px';
            return;
        }

        tbody.innerHTML = this.cart.map(item => `
            <tr>
                <td>
                    <a href="#" class="remove-btn" data-id="${item.id}" title="Remove">
                        <i class="fas fa-times-circle"></i>
                    </a>
                </td>
                <td>
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${item.name}</td>
                <td>₦${item.price.toFixed(2)}</td>
                <td>
                    <input 
                        type="number" 
                        class="quantity-input" 
                        value="${item.quantity}" 
                        min="1" 
                        data-id="${item.id}"
                    >
                </td>
                <td class="subtotal-${item.id}">₦${this.getItemSubtotal(item)}</td>
            </tr>
        `).join('');

        this.attachEventListeners();
    }

    // Attach event listeners to cart items
    attachEventListeners() {
        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                this.removeFromCart(id);
            });
        });

        // Quantity inputs
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = input.dataset.id;
                const quantity = input.value;
                this.updateQuantity(id, quantity);
            });

            // Update subtotal as user types
            input.addEventListener('input', (e) => {
                const id = input.dataset.id;
                const item = this.cart.find(i => i.id == id);
                if (item) {
                    const subtotalElement = document.querySelector(`.subtotal-${id}`);
                    const newSubtotal = (item.price * parseInt(input.value || 1)).toFixed(2);
                    if (subtotalElement) {
                        subtotalElement.textContent = `₦${newSubtotal}`;
                    }
                }
            });
        });
    }

    // Update totals section
    updateTotals() {
        const subtotal = this.getCartTotal();
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over ₦100
        const tax = (subtotal * 0.08).toFixed(2); // 8% tax
        const total = (subtotal + shipping + parseFloat(tax)).toFixed(2);

        // Update subtotal
        const subtotalElement = document.querySelector('#subtotal table tr:nth-child(1) td:nth-child(2)');
        if (subtotalElement) {
            subtotalElement.textContent = `₦${subtotal.toFixed(2)}`;
        }

        // Update shipping
        const shippingElement = document.querySelector('#subtotal table tr:nth-child(2) td:nth-child(2)');
        if (shippingElement) {
            shippingElement.textContent = shipping === 0 ? 'Free' : `₦${shipping.toFixed(2)}`;
        }

        // Update tax (if exists)
        const taxRow = document.querySelector('#subtotal table tr:nth-child(3) td:nth-child(2)');
        if (taxRow) {
            taxRow.textContent = `₦${tax}`;
        }

        // Update total
        const totalElement = document.querySelector('#subtotal table tr:last-child td:last-child');
        if (totalElement) {
            totalElement.textContent = `₦${total}`;
        }
    }

    // Show notification messages
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-in-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return false;
        }

        // Redirect to checkout page for simplified frontend checkout
        window.location.href = 'checkout.html';
        return true;
    }

    // Apply coupon code
    applyCoupon(code) {
        const coupons = {
            'SAVE10': 0.10,
            'SAVE20': 0.20,
            'SAVE50': 0.50,
            'WELCOME': 0.15
        };

        if (coupons[code.toUpperCase()]) {
            const discount = coupons[code.toUpperCase()];
            const originalTotal = this.getCartTotal();
            const discountAmount = (originalTotal * discount).toFixed(2);
            const finalTotal = (originalTotal - discountAmount).toFixed(2);

            localStorage.setItem('appliedCoupon', JSON.stringify({
                code: code.toUpperCase(),
                discount: discount,
                amount: discountAmount
            }));

            this.showNotification(`Coupon applied! Save $${discountAmount}`, 'success');
            this.updateTotals();
            return true;
        } else {
            this.showNotification('Invalid coupon code', 'error');
            return false;
        }
    }

    // Remove applied coupon
    removeCoupon() {
        localStorage.removeItem('appliedCoupon');
        this.showNotification('Coupon removed', 'info');
        this.updateTotals();
    }
}

// ============================================
// 3. INITIALIZE CART MANAGER & EVENT LISTENERS
// ============================================

const cartManager = new CartManager();

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    // Cart page initialization

    // Display cart
    cartManager.updateCartUI();

    // Coupon button listener
    const couponBtn = document.querySelector('#coupon button');
    if (couponBtn) {
        couponBtn.addEventListener('click', () => {
            const couponInput = document.querySelector('#coupon input');
            if (couponInput && couponInput.value.trim()) {
                cartManager.applyCoupon(couponInput.value.trim());
                couponInput.value = '';
            } else {
                cartManager.showNotification('Please enter a coupon code', 'error');
            }
        });

        // Allow Enter key to apply coupon
        document.querySelector('#coupon input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                couponBtn.click();
            }
        });
    }

    // Checkout button listener
    const checkoutBtn = document.querySelector('#subtotal button');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            cartManager.proceedToCheckout();
        });
    }

    // Add animation for page load (only on cart page, not checkout)
    const cartSection = document.getElementById('cart');
    if (cartSection) {
        cartSection.style.animation = 'fadeIn 0.5s ease-in-out';
    }
});

// ============================================
// 4. UTILITY FUNCTIONS FOR OTHER PAGES
// ============================================

// Function to add product to cart from shop pages
function addProductToCart(product) {
    const quantity = document.querySelector('.quantity-selector input')?.value || 1;
    cartManager.addToCart(product, quantity);
}

// Function to get cart for display in header/navbar
function getCartSummary() {
    return {
        count: cartManager.getCartCount(),
        total: cartManager.getCartTotal(),
        items: cartManager.getCart()
    };
}

// ============================================
// 5. CSS ANIMATIONS (auto-injected)
// ============================================

const style = document.createElement('style');
style.textContent = `
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
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .quantity-input {
        width: 50px;
        padding: 5px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 3px;
    }

    .quantity-input:focus {
        outline: none;
        border-color: #007bff;
    }

    .remove-btn {
        color: #dc3545;
        text-decoration: none;
        font-size: 1.2em;
        cursor: pointer;
    }

    .remove-btn:hover {
        color: #c82333;
    }

    #cart-items {
        animation: fadeIn 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// ============================================
// 6. EXPORT FOR USE IN OTHER MODULES
// ============================================

// Make available globally
window.cartManager = cartManager;
window.getCartSummary = getCartSummary;
window.addProductToCart = addProductToCart;
window.proceedCheckout = () => cartManager.proceedToCheckout();

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    cartManager.updateCartCount();
});

