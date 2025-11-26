<?php
namespace App\Controllers\Api\V1;

class CartController {
    public function add() { return json_encode(['message' => 'cart add']); }
    public function update() { return json_encode(['message' => 'cart update']); }
    public function remove() { return json_encode(['message' => 'cart remove']); }
}
