<?php

namespace App\Controllers\Api\V1;

use App\Models\Product;
use App\Services\ProductService;
use App\Validators\ProductValidator;

/**
 * ProductController
 * 
 * Handles product-related API endpoints
 */
class ProductController
{
    protected $productService;
    protected $productValidator;

    public function __construct()
    {
        $this->productService = new ProductService();
        $this->productValidator = new ProductValidator();
    }

    /**
     * Get all products
     * GET /api/v1/products
     */
    public function index()
    {
        try {
            $filters = [
                'category' => $_GET['category'] ?? null,
                'search' => $_GET['search'] ?? null,
                'sort' => $_GET['sort'] ?? 'newest',
                'page' => $_GET['page'] ?? 1,
                'per_page' => $_GET['per_page'] ?? 20,
            ];

            $products = $this->productService->getProducts($filters);
            
            return $this->success($products);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    /**
     * Get a single product
     * GET /api/v1/products/:id
     */
    public function show($id)
    {
        try {
            $product = $this->productService->getProductById($id);
            
            if (!$product) {
                return $this->error('Product not found', 404);
            }
            
            return $this->success($product);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
