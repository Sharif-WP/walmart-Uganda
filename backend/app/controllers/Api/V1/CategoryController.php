<?php
namespace App\Controllers\Api\V1;

class CategoryController {
    public function index() { return json_encode(['message' => 'categories']); }
}
