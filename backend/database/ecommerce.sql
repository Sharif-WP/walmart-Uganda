-- Walmart Uganda E-Commerce Database Schema

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    discount DECIMAL(5, 2) DEFAULT 0,
    category_id INT,
    brand_id INT,
    status VARCHAR(50) DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_name (name)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Computers, phones, and accessories'),
('Fashion', 'fashion', 'Clothing and apparel'),
('Home & Kitchen', 'home-kitchen', 'Household items and kitchen appliances'),
('Sports', 'sports', 'Sports and outdoor equipment'),
('Books', 'books', 'Books and educational materials');

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, sku, price, cost_price, discount, category_id, stock_quantity, status, featured) VALUES
('Laptop Pro 15', 'laptop-pro-15', 'High-performance laptop with Intel i7, 16GB RAM, 512GB SSD. Perfect for professionals and gamers.', 'Powerful laptop for professionals', 'LAPTOP-001', 1299.99, 800.00, 10, 1, 50, 'active', TRUE),
('Wireless Mouse', 'wireless-mouse', 'Ergonomic wireless mouse with USB receiver. 2.4GHz connection, up to 18 months battery life.', 'Comfortable mouse for work', 'MOUSE-001', 29.99, 10.00, 15, 1, 200, 'active', TRUE),
('USB-C Cable', 'usb-c-cable', 'High-speed USB-C charging and data transfer cable. 3.1 Gen 1, supports fast charging.', 'Fast charging cable', 'CABLE-001', 12.99, 3.00, 20, 1, 500, 'active', FALSE),
('Monitor 27 inch', 'monitor-27', '4K Ultra HD Monitor with 3840x2160 resolution. 60Hz refresh rate, IPS panel.', 'Crystal clear display', 'MON-001', 399.99, 250.00, 5, 1, 30, 'active', TRUE),
('Mechanical Keyboard', 'keyboard-mech', 'RGB Mechanical Gaming Keyboard with Cherry MX switches. Programmable keys and aluminum frame.', 'Professional gaming keyboard', 'KEY-001', 159.99, 90.00, 8, 1, 75, 'active', TRUE),
('HD Webcam', 'webcam-hd', '1080p Full HD Web Camera with auto-focus and built-in microphone. USB plug and play.', 'Perfect for streaming', 'WEB-001', 89.99, 50.00, 12, 1, 100, 'active', FALSE),
('Phone Stand', 'phone-stand', 'Adjustable Phone Stand with foldable design. Compatible with all smartphones and tablets.', 'Universal mobile stand', 'STAND-001', 19.99, 5.00, 25, 1, 300, 'active', FALSE),
('Headphones Pro', 'headphones-pro', 'Noise Cancelling Headphones with 30-hour battery life. Bluetooth 5.0 and premium sound quality.', 'Premium audio quality', 'HEAD-001', 249.99, 150.00, 10, 1, 80, 'active', TRUE),
('Desk Lamp LED', 'desk-lamp-led', 'LED Desk Lamp with adjustable brightness. Touch control and USB charging port.', 'Bright desk lighting', 'LAMP-001', 45.99, 25.00, 10, 3, 120, 'active', FALSE),
('Portable SSD 1TB', 'ssd-1tb', 'Portable SSD 1TB storage with USB 3.1. Fast transfer speeds up to 550MB/s.', 'Fast external storage', 'SSD-001', 129.99, 80.00, 15, 1, 60, 'active', TRUE),
('T-Shirt Classic', 'tshirt-classic', 'Classic cotton t-shirt available in multiple colors. Comfortable fit for everyday wear.', 'Comfortable casual wear', 'TSHIRT-001', 24.99, 8.00, 30, 2, 250, 'active', FALSE),
('Running Shoes', 'running-shoes', 'Professional running shoes with cushioned sole and breathable material. Lightweight design.', 'Comfortable athletic shoes', 'SHOE-001', 89.99, 50.00, 20, 4, 100, 'active', TRUE),
('Coffee Maker', 'coffee-maker', 'Automatic coffee maker with 12-cup capacity. Programmable timer and keep-warm function.', 'Brew fresh coffee', 'COFFEE-001', 79.99, 40.00, 12, 3, 45, 'active', FALSE),
('Blender Pro', 'blender-pro', 'Professional blender with 1000W motor. Multiple speed settings and smoothie bottle included.', 'Powerful kitchen appliance', 'BLEND-001', 119.99, 70.00, 10, 3, 55, 'active', TRUE),
('The Clean Coder', 'clean-coder-book', 'A Handbook of Agile Software Craftsmanship by Robert C. Martin. Essential reading for developers.', 'Programming best practices', 'BOOK-001', 34.99, 15.00, 15, 5, 80, 'active', FALSE);

-- Insert sample users
INSERT INTO users (name, email, phone, status) VALUES
('John Doe', 'john@example.com', '+256701234567', 'active'),
('Jane Smith', 'jane@example.com', '+256702345678', 'active'),
('Admin User', 'admin@walmart.ug', '+256703456789', 'active');
