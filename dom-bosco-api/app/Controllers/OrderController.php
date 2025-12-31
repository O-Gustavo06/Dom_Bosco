<?php

require_once __DIR__ . '/../Models/Order.php';
require_once __DIR__ . '/../Services/Response.php';

class OrderController
{
    private Order $order;

    public function __construct()
    {
        $this->order = new Order();
    }

    public function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || empty($input['items']) || empty($input['total'])) {
            Response::error("Dados do pedido inválidos", 400);
        }

        $orderData = [
            'user_id' => $input['user_id'] ?? 1, // provisório
            'total'   => $input['total'],
            'items'   => $input['items']
        ];

        $orderId = $this->order->create($orderData);

        Response::json([
            'success'  => true,
            'order_id' => $orderId
        ], 201);
    }
}
