# Walmart Uganda E-Commerce Platform

A comprehensive e-commerce platform for Walmart Uganda with separate frontend and backend architectures.

## Project Structure

### Frontend (`/frontend`)
- **assets/css/** - Stylesheets organized by components, pages, and utilities
- **assets/js/** - JavaScript organized by feature modules and core utilities
- **assets/images/** - Image assets organized by type (icons, products, backgrounds, brands)
- **components/** - Reusable HTML components
- **pages/** - Page templates organized by feature
- **templates/** - Email templates

### Backend (`/backend`)
- **app/config/** - Application configuration files
- **app/controllers/** - API and Web controllers (versioned API endpoints)
- **app/models/** - Database models
- **app/services/** - Business logic layer
- **app/repositories/** - Data access layer
- **app/middleware/** - Request/response middleware
- **app/validators/** - Input validation logic
- **api/v1/** - Versioned API endpoints
- **admin/** - Admin panel pages
- **public/** - Web root directory
- **storage/** - Logs, cache, and backups
- **database/** - Migrations, seeds, and factories
- **tests/** - Unit, feature, and integration tests

## Getting Started

### Prerequisites
- PHP 8.0+
- MySQL 5.7+
- Composer
- Node.js (for frontend build tools)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/walmart-uganda.git
cd walmart-uganda
```

2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan seed
```

3. Frontend Setup
```bash
cd frontend
npm install
npm run build
```

## Features

- Product catalog with search and filtering
- Shopping cart management
- User authentication and profiles
- Order management
- Payment processing (Stripe/PayPal)
- Admin dashboard
- Inventory management
- Customer reviews and ratings
- Wishlist functionality
- Responsive design

## API Documentation

See `/backend/docs/api.md` for detailed API documentation.

## Testing

```bash
cd backend
php vendor/bin/phpunit
```

## Deployment

See `/backend/docs/deployment.md` for deployment instructions.

## License

All rights reserved © 2024 Walmart Uganda
