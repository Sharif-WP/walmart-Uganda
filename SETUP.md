# Setup Guide - Walmart Uganda E-Commerce Platform

## Quick Start in Browser

### Step 1: Start XAMPP

1. Open XAMPP Control Panel
2. Click **Start** next to Apache
3. Click **Start** next to MySQL

Wait for both to show as running (green).

### Step 2: Create Database

1. Open browser and go to `http://localhost/phpmyadmin`
2. Click **New** (or **Databases** tab)
3. Create database named: `walmart_uganda`
4. Click **Create**

### Step 3: Import Sample Data

1. In phpMyAdmin, select the `walmart_uganda` database
2. Click **Import** tab
3. Click **Browse** and select: `backend/database/ecommerce.sql`
4. Click **Import**

> **If you don't have the SQL file yet**, run this in phpMyAdmin SQL tab:

```sql
-- Create products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100),
    price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    discount DECIMAL(5, 2),
    category_id INT,
    brand_id INT,
    status VARCHAR(50),
    featured BOOLEAN,
    rating DECIMAL(3, 2),
    stock_quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, sku, price, cost_price, discount, stock_quantity, status) VALUES
('Laptop Pro 15', 'laptop-pro-15', 'High-performance laptop with 16GB RAM', 'Powerful laptop for professionals', 'LAPTOP-001', 1299.99, 800.00, 10, 50, 'active'),
('Wireless Mouse', 'wireless-mouse', 'Ergonomic wireless mouse with USB receiver', 'Comfortable mouse for work', 'MOUSE-001', 29.99, 10.00, 15, 200, 'active'),
('USB-C Cable', 'usb-c-cable', 'High-speed USB-C charging cable', 'Fast charging cable', 'CABLE-001', 12.99, 3.00, 20, 500, 'active'),
('Monitor 27 inch', 'monitor-27', '4K Ultra HD Monitor', 'Crystal clear display', 'MON-001', 399.99, 250.00, 5, 30, 'active'),
('Keyboard Mechanical', 'keyboard-mech', 'RGB Mechanical Gaming Keyboard', 'Professional gaming keyboard', 'KEY-001', 159.99, 90.00, 8, 75, 'active'),
('Webcam HD', 'webcam-hd', '1080p Full HD Web Camera', 'Perfect for streaming', 'WEB-001', 89.99, 50.00, 12, 100, 'active'),
('Phone Stand', 'phone-stand', 'Adjustable Phone Stand', 'Universal mobile stand', 'STAND-001', 19.99, 5.00, 25, 300, 'active'),
('Headphones Pro', 'headphones-pro', 'Noise Cancelling Headphones', 'Premium audio quality', 'HEAD-001', 249.99, 150.00, 10, 80, 'active');
```

### Step 4: Open in Browser

**Option A - Direct Frontend:**

```
http://localhost/walmart-uganda/frontend/index.html
```

**Option B - Via Backend API:**

```
http://localhost/walmart-uganda/backend/public/api/v1/products
```

## Folder Structure Access

| Location        | URL                                               |
| --------------- | ------------------------------------------------- |
| Frontend        | `http://localhost/walmart-uganda/frontend/`       |
| Backend API     | `http://localhost/walmart-uganda/backend/public/` |
| phpMyAdmin      | `http://localhost/phpmyadmin/`                    |
| XAMPP Dashboard | `http://localhost/`                               |

## Testing the Application

### 1. View Products

Open: `http://localhost/walmart-uganda/frontend/index.html`

You should see:

- ✓ Walmart Uganda header
- ✓ Search bar
- ✓ Product cards with images
- ✓ "Add to Cart" buttons
- ✓ API connection status

### 2. Search Products

1. Type "laptop" in search box
2. Click "Search"
3. See filtered results

### 3. Test API Directly

Open in browser:

```
http://localhost/walmart-uganda/backend/public/api/v1/products
```

Should return JSON:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop Pro 15",
      "price": 1299.99,
      ...
    }
  ]
}
```

### 4. API with Pagination

```
http://localhost/walmart-uganda/backend/public/api/v1/products?page=1&per_page=5
```

### 5. Search via API

```
http://localhost/walmart-uganda/backend/public/api/v1/products?search=laptop
```

### 6. Filter by Category

```
http://localhost/walmart-uganda/backend/public/api/v1/products?category=1
```

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**

1. Make sure MySQL is running in XAMPP
2. Verify database name is `walmart_uganda`
3. Check `.env` file has correct credentials

### Issue: "404 Not Found"

**Solution:**

1. Verify XAMPP is running
2. Check the folder path is correct
3. Make sure Apache is enabled

### Issue: "API returns empty data"

**Solution:**

1. Verify sample data was imported
2. Go to phpMyAdmin
3. Check `products` table has data
4. Run the SQL insert statements above

### Issue: "CORS error in console"

**Solution:**
This is normal for local development. The `.htaccess` file handles it, but might need Apache rewrite module enabled:

1. In XAMPP, go to Apache → Config
2. Edit `httpd.conf`
3. Find: `#LoadModule rewrite_module modules/mod_rewrite.so`
4. Remove the `#` at the start
5. Save and restart Apache

## File Locations

```
wallmartUganda/
├── frontend/
│   └── index.html          ← Open this in browser
├── backend/
│   ├── public/
│   │   └── index.php       ← API entry point
│   ├── .env                ← Database config
│   └── database/
│       └── ecommerce.sql   ← Sample data
└── SETUP.md               ← This file
```

## Next Steps

1. **Customize the Frontend:**

   - Edit `frontend/index.html` to change styling
   - Add more features to `frontend/assets/js/app/`

2. **Expand the Backend:**

   - Add more API endpoints in `backend/api/v1/`
   - Create more models in `backend/app/models/`

3. **Set Up Admin Panel:**

   - Navigate to `backend/admin/dashboard.php`
   - Implement admin functionality

4. **Deploy:**
   - See `backend/docs/deployment.md` for production setup

## Quick Commands

```bash
# View logs
tail -f backend/storage/logs/app.log

# Check file permissions
ls -la backend/storage/

# Clear cache
rm -rf backend/storage/cache/*
```

## Support Files

- API Documentation: `backend/docs/api.md`
- Database Schema: `backend/database/ecommerce.sql`
- Configuration: `backend/.env.example`

---

**Enjoy building with Walmart Uganda! 🚀**
