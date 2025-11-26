<?php
namespace App\Controllers\Api\V1;

class OrderController {
    public function create() { return json_encode(['message' => 'order create']); }
    public function list() { return json_encode(['message' => 'order list']); }
}
