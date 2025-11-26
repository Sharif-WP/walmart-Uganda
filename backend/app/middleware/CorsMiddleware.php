<?php
namespace App\Middleware;

class CorsMiddleware {
    public static function handle() {
        header('Access-Control-Allow-Origin: *');
    }
}
