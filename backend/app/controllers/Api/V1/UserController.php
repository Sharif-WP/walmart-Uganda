<?php
namespace App\Controllers\Api\V1;

class UserController {
    public function profile() { return json_encode(['message' => 'user profile']); }
}
