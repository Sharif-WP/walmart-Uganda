<?php
namespace App\Controllers\Api\V1;

class AuthController {
    public function login() { return json_encode(['message' => 'login']); }
    public function register() { return json_encode(['message' => 'register']); }
}
