<?php

namespace App\Http\Controllers\Api;

require_once __DIR__ . '/../../../Models/Order.php';
require_once __DIR__ . '/../../Response.php';

use App\Http\Response;

class OrderController
{
    private \Order $orderModel;

    public function __construct()
    {
        $this->orderModel = new \Order();
    }

    
    public function store(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['items']) || !is_array($data['items'])) {
            Response::error('Items do pedido são obrigatórios');
        }

        if (empty($data['total'])) {
            Response::error('Total do pedido é obrigatório');
        }

        try {
            $orderId = $this->orderModel->create($data);

            Response::created([
                'order_id' => $orderId
            ], 'Pedido criado com sucesso');

        } catch (\Exception $e) {
            Response::error('Erro ao criar pedido: ' . $e->getMessage());
        }
    }
}
