<?php
namespace App\Controllers\Api\V1;

class PaymentController {
    public function webhook() { return json_encode(['message' => 'payment webhook']); }
}
