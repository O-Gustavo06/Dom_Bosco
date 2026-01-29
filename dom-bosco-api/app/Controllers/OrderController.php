<?php

require_once __DIR__ . '/../Models/Order.php';
require_once __DIR__ . '/../Models/Inventory.php';
require_once __DIR__ . '/../Services/Response.php';

class OrderController
{
    private Order $order;
    private Inventory $inventory;

    public function __construct()
    {
        $this->order = new Order();
        $this->inventory = new Inventory();
    }

    public function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || empty($input['items']) || empty($input['total'])) {
            Response::error("Dados do pedido inválidos", 400);
        }

        foreach ($input['items'] as $item) {
            $productId = $item['id'];
            $requestedQty = $item['quantity'];

            if (!$this->inventory->hasStock($productId, $requestedQty)) {
                $currentInventory = $this->inventory->getByProductId($productId);
                $availableQty = $currentInventory ? $currentInventory['quantity'] : 0;
                
                Response::json([
                    'error' => 'Estoque insuficiente para o produto ID ' . $productId,
                    'product_id' => $productId,
                    'requested' => $requestedQty,
                    'available' => $availableQty
                ], 400);
                return;
            }
        }

        $orderData = [
            'user_id' => $input['user_id'] ?? 1, 
            'total'   => $input['total'],
            'items'   => $input['items']
        ];

        try {
            $orderId = $this->order->create($orderData);

            foreach ($input['items'] as $item) {
                $productId = $item['id'];
                $quantity = $item['quantity'];
                
                $decremented = $this->inventory->decrement($productId, $quantity);
                
                if (!$decremented) {
                    error_log("Erro ao decrementar estoque do produto {$productId} no pedido {$orderId}");
                }
            }

            Response::json([
                'success'  => true,
                'order_id' => $orderId,
                'message' => 'Pedido criado com sucesso'
            ], 201);

        } catch (Exception $e) {
            Response::json([
                'error' => 'Erro ao processar pedido: ' . $e->getMessage()
            ], 500);
        }
    }
}
