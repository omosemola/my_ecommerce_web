// ============================================
// SHOP PAGE 2 - New Arrivals Implementation
// Ready to use - Copy and paste
// ============================================

// Product Catalog - New Arrivals (IDs 9-16)
const shopProducts = [
    {
        id: 9,
        name: "Blue T-Shirt",
        price: 78.00,
        image: "img/products/n1.jpg",
        description: "adidas"
    },
    {
        id: 10,
        name: "Grey T-Shirt",
        price: 78.00,
        image: "img/products/n2.jpg",
        description: "adidas"
    },
    {
        id: 11,
        name: "White T-Shirt",
        price: 78.00,
        image: "img/products/n3.jpg",
        description: "adidas"
    },
    {
        id: 12,
        name: "Army Camo T-Shirt",
        price: 78.00,
        image: "img/products/n4.jpg",
        description: "adidas"
    },
    {
        id: 13,
        name: "Denim T-Shirts",
        price: 78.00,
        image: "img/products/n5.jpg",
        description: "adidas"
    },
    {
        id: 14,
        name: "Shorts with Belt",
        price: 78.00,
        image: "img/products/n6.jpg",
        description: "adidas"
    },
    {
        id: 15,
        name: "Codraw T-Shirt",
        price: 78.00,
        image: "img/products/n7.jpg",
        description: "adidas"
    },
    {
        id: 16,
        name: "Chocolate T-Shirt",
        price: 78.00,
        image: "img/products/n8.jpg",
        description: "adidas"
    }
];

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Shop2 page loaded');

    // Check if CartManager is loaded
    if (typeof cartManager === 'undefined') {
        console.error('Cart.js not loaded! Add <script src="cart.js"></script> before this script.');
        return;
    }

    // Display products on page
    displayProducts();

    // Attach cart event listeners
    attachCartEventListeners();

    // Setup search/filter functionality
    setupSearch();

    // Setup category filters
    setupFilters();

    console.log('Shop2 page initialized successfully');
});

// ============================================
// DISPLAY PRODUCTS
// ============================================

function displayProducts(productsToDisplay = shopProducts) {
    const productContainer = document.querySelector('.pro-container');

    if (!productContainer) {
        console.warn('Product container not found. Looking for .pro-container');
        return;
    }

    if (productsToDisplay.length === 0) {
        productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found</p>';
        return;
    }

    // Generate product HTML
    productContainer.innerHTML = productsToDisplay.map(product => `
        <div class="pro" data-product-id="${product.id}" data-price="${product.price}">
            <img src="${product.image}" alt="${product.name}" onclick="showQuickView(${product.id})" style="cursor: pointer">
            <div class="des">
                <span>${product.description}</span>
                <h5>${product.name}</h5>
                
                <!-- Star Rating -->
                <div class="star">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                    <span>(${Math.floor(Math.random() * 50) + 1})</span>
                </div>
                
                <!-- Price -->
                <h4>₦${product.price.toFixed(2)}</h4>
            </div>
            
            <!-- Add to Cart Button -->
            <a href="#" class="add-to-cart-btn" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart cart"></i>
            </a>
        </div>
    `).join('');
}

// ============================================
// CART EVENT LISTENERS
// ============================================

function attachCartEventListeners() {
    // Using event delegation (handled globally below)
}

// Global delegation for dynamic content on shop2
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (btn && window.location.pathname.includes('shop2.html')) {
        e.preventDefault();
        e.stopPropagation();

        const productId = parseInt(btn.dataset.productId);
        console.log('Shop2 - Delegated click for product:', productId);

        const product = shopProducts.find(p => p.id === productId);
        if (product) {
            cartManager.addToCart(product, 1);
        } else {
            console.error('Product not found:', productId);
        }
    }
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function setupSearch() {
    const searchInput = document.querySelector('#search-input');

    if (!searchInput) return; // Search not available

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        if (searchTerm === '') {
            displayProducts(shopProducts);
        } else {
            const filteredProducts = shopProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredProducts);
        }

        // Re-attach event listeners after display update
        attachCartEventListeners();
    });
}

// ============================================
// FILTER FUNCTIONALITY
// ============================================

function setupFilters() {
    // Price range filter
    const priceFilter = document.querySelector('#price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            const maxPrice = parseFloat(e.target.value);
            const filtered = shopProducts.filter(p => p.price <= maxPrice);
            displayProducts(filtered);
            attachCartEventListeners();
        });
    }

    // Category filter
    const categoryFilter = document.querySelector('#category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;

            const categoryMap = {
                'all': shopProducts,
                'tshirts': shopProducts.filter(p => p.name.includes('Shirt')),
                'electronics': shopProducts.filter(p =>
                    p.name.includes('Headphones') ||
                    p.name.includes('Cable') ||
                    p.name.includes('Stand')
                ),
                'accessories': shopProducts.filter(p =>
                    p.name.includes('Screen') ||
                    p.name.includes('Stand')
                )
            };

            displayProducts(categoryMap[category] || shopProducts);
            attachCartEventListeners();
        });
    }
}

// ============================================
// SORT FUNCTIONALITY
// ============================================

function setupSort() {
    const sortSelect = document.querySelector('#sort-select');

    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
        const sortValue = e.target.value;
        let sorted = [...shopProducts];

        switch (sortValue) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                // Assuming ID represents order
                sorted.sort((a, b) => b.id - a.id);
                break;
        }

        displayProducts(sorted);
        attachCartEventListeners();
    });
}

// Call sort setup on load
document.addEventListener('DOMContentLoaded', setupSort);

// ============================================
// PAGINATION
// ============================================

const PRODUCTS_PER_PAGE = 6;
let currentPage = 1;

function setupPagination() {
    const totalPages = Math.ceil(shopProducts.length / PRODUCTS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination');

    if (!paginationContainer) return;

    // Generate pagination buttons
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<a href="#" class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
    }
    paginationContainer.innerHTML = html;

    // Add event listeners
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = parseInt(btn.dataset.page);

            // Calculate start and end index
            const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
            const endIdx = startIdx + PRODUCTS_PER_PAGE;

            // Display products for current page
            displayProducts(shopProducts.slice(startIdx, endIdx));
            attachCartEventListeners();

            // Update active button
            document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Scroll to top
            window.scrollTo(0, 0);
        });
    });
}

// Call pagination setup on load
document.addEventListener('DOMContentLoaded', setupPagination);

// ============================================
// WISHLIST FUNCTIONALITY (Optional)
// ============================================

function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        cartManager.showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        cartManager.showNotification('Added to wishlist', 'success');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// ============================================
// PRODUCT QUICK VIEW (Updated)
// ============================================

function showQuickView(productId) {
    const product = shopProducts.find(p => p.id === productId);
    if (!product) return;

    // Remove existing modal if any
    const existingModal = document.querySelector('.qv-modal-overlay');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div class="qv-modal-overlay">
            <div class="qv-modal-content">
                <div class="qv-close-btn">&times;</div>
                <div class="qv-image-col">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="qv-details-col">
                    <h6>Home / T-shirt</h6>
                    <h2>${product.name}</h2>
                    <h3>₦${product.price.toFixed(2)}</h3>
                    <select id="qv-size">
                        <option value="">Select Size</option>
                        <option>XL</option>
                        <option>XXL</option>
                        <option>Small</option>
                        <option>Large</option>
                    </select>
                    <div style="display: flex; align-items: center;">
                        <input type="number" value="1" min="1" id="qv-qty">
                        <button id="qv-add-btn">Add To Cart</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Trigger animation
    setTimeout(() => {
        document.querySelector('.qv-modal-overlay').classList.add('active');
    }, 10);

    // Close Event
    document.querySelector('.qv-close-btn').addEventListener('click', closeQuickView);
    document.querySelector('.qv-modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('qv-modal-overlay')) closeQuickView();
    });

    // Add to Cart Event
    document.getElementById('qv-add-btn').addEventListener('click', () => {
        const size = document.getElementById('qv-size').value;
        const qty = parseInt(document.getElementById('qv-qty').value);

        if (size === '') {
            alert('Please select a size');
            return;
        }

        if (window.cartManager) {
            cartManager.addToCart(product, qty, size);
            closeQuickView();
        }
    });
}

function closeQuickView() {
    const modal = document.querySelector('.qv-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.shopProducts = shopProducts;
window.displayProducts = displayProducts;
window.toggleWishlist = toggleWishlist;
window.showQuickView = showQuickView;
