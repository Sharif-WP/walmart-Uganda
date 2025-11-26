<?php

namespace App\Models;

/**
 * Product Model
 * 
 * Represents a product in the e-commerce system
 */
class Product
{
    protected $table = 'products';
    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'price',
        'cost_price',
        'discount',
        'category_id',
        'brand_id',
        'status',
        'featured',
        'rating',
        'stock_quantity',
        'created_at',
        'updated_at',
    ];

    /**
     * Get the category associated with the product
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the product images
     */
    public function images()
    {
        return $this->hasMany(Image::class);
    }

    /**
     * Get the product reviews
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
