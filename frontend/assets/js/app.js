/**
 * Main Application Entry Point
 * Walmart Uganda E-Commerce Platform
 */

const API_BASE_URL = 'http://localhost/walmart-uganda/backend/public';

document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');

    // Load header
    loadHeader();

    // Load main content
    loadHomePage();

    // Load footer
    loadFooter();
});

/**
 * Load Header Component
 */
function loadHeader() {
    const headerHTML = `
        <header class="header">
            <div class="container">
                <div class="header-top">
                    <div class="logo">
                        <h1>Walmart Uganda</h1>
                    </div>
                    <div class="search-bar">
                        <input type="text" id="search-input" placeholder="Search products...">
                        <button onclick="searchProducts()">Search</button>
                    </div>
                    <div class="user-menu">
                        <button onclick="viewCart()">🛒 Cart</button>
                        <button onclick="loginUser()">👤 Account</button>
                    </div>
                </div>
                <nav class="nav-menu">
                    <a href="#" onclick="loadCategory('all')">All Products</a>
                    <a href="#" onclick="loadCategory('electronics')">Electronics</a>
                    <a href="#" onclick="loadCategory('accessories')">Accessories</a>
                </nav>
            </div>
        </header>
    `;
    document.getElementById('header').innerHTML = headerHTML;
}

/**
 * Load Home Page with Products
 */
function loadHomePage() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Loading products...</p>';

    fetch(`${API_BASE_URL}/api/v1/products`)
        .then(response => response.json())
        .then(data => {
            console.log('Products loaded:', data);

            if (data.success && data.data && data.data.length > 0) {
                let productsHTML = '<div class="products-grid">';

                data.data.forEach(product => {
                    productsHTML += `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="assets/images/products/thumbnails/product-${product.id || '1'}.jpg"
                                     onerror="this.src='assets/images/products/thumbnails/default.jpg'"
                                     alt="${product.name}">
                            </div>
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p class="description">${product.short_description || product.description || ''}</p>
                                <div class="product-footer">
                                    <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
                                    <button class="btn-add-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                productsHTML += '</div>';
                contentDiv.innerHTML = productsHTML;
            } else {
                contentDiv.innerHTML = '<p>No products found. Please check your database.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            contentDiv.innerHTML = `<p style="color: red;">Error loading products: ${error.message}</p>`;
        });
}

/**
 * Search Products
 */
function searchProducts() {
    const searchQuery = document.getElementById('search-input').value;

    if (!searchQuery.trim()) {
        loadHomePage();
        return;
    }

    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Searching...</p>';

    fetch(`${API_BASE_URL}/api/v1/products?search=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data && data.data.length > 0) {
                let productsHTML = `<h2>Search results for: "${searchQuery}"</h2><div class="products-grid">`;

                data.data.forEach(product => {
                    productsHTML += `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="assets/images/products/thumbnails/product-${product.id || '1'}.jpg"
                                     onerror="this.src='assets/images/products/thumbnails/default.jpg'"
                                     alt="${product.name}">
                            </div>
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p class="description">${product.short_description || product.description || ''}</p>
                                <div class="product-footer">
                                    <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
                                    <button class="btn-add-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                productsHTML += '</div>';
                contentDiv.innerHTML = productsHTML;
            } else {
                contentDiv.innerHTML = `<p>No products found matching "${searchQuery}"</p>`;
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            contentDiv.innerHTML = `<p style="color: red;">Search error: ${error.message}</p>`;
        });
}

/**
 * Load Products by Category
 */
function loadCategory(category) {
    const contentDiv = document.getElementById('content');

    if (category === 'all') {
        loadHomePage();
        return;
    }

    contentDiv.innerHTML = '<p>Loading category...</p>';

    fetch(`${API_BASE_URL}/api/v1/products?category=${category}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data && data.data.length > 0) {
                let productsHTML = `<h2>Category: ${category}</h2><div class="products-grid">`;

                data.data.forEach(product => {
                    productsHTML += `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="assets/images/products/thumbnails/product-${product.id || '1'}.jpg"
                                     onerror="this.src='assets/images/products/thumbnails/default.jpg'"
                                     alt="${product.name}">
                            </div>
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p class="description">${product.short_description || product.description || ''}</p>
                                <div class="product-footer">
                                    <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
                                    <button class="btn-add-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                productsHTML += '</div>';
                contentDiv.innerHTML = productsHTML;
            } else {
                contentDiv.innerHTML = `<p>No products in this category</p>`;
            }
        })
        .catch(error => {
            console.error('Category error:', error);
            contentDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        });
}

/**
 * Add to Cart
 */
function addToCart(productId, productName, price) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${productName} added to cart!`);
}

/**
 * View Cart
 */
function viewCart() {
    alert('Cart feature coming soon!');
}

/**
 * Login User
 */
function loginUser() {
    alert('Login feature coming soon!');
}

/**
 * Load Footer Component
 */
function loadFooter() {
    const footerHTML = `
        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 Walmart Uganda. All rights reserved.</p>
                <p>Contact us: info@walmart.ug | Phone: +256 751077107</p>
                <p>Designed by Sharif Designs</p>
            </div>
        </footer>
    `;
    document.getElementById('footer').innerHTML = footerHTML;
}
