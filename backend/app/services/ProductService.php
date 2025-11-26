<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;

/**
 * ProductService
 * 
 * Business logic layer for product operations
 */
class ProductService
{
    protected $productRepository;

    public function __construct()
    {
        $this->productRepository = new ProductRepository();
    }

    /**
     * Get products with filters
     */
    public function getProducts($filters = [])
    {
        return $this->productRepository->getFiltered($filters);
    }

    /**
     * Get a product by ID
     */
    public function getProductById($id)
    {
        return $this->productRepository->find($id);
    }

    /**
     * Create a new product
     */
    public function createProduct($data)
    {
        return $this->productRepository->create($data);
    }

    /**
     * Update a product
     */
    public function updateProduct($id, $data)
    {
        return $this->productRepository->update($id, $data);
    }

    /**
     * Delete a product
     */
    public function deleteProduct($id)
    {
        return $this->productRepository->delete($id);
    }
}
