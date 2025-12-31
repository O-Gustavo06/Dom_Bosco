<?php

require_once __DIR__ . '/../../config/database.php';

class Order
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
    }

    public function create(array $data): int
    {
        $this->pdo->beginTransaction();

        try {
            // Criar pedido
            $stmt = $this->pdo->prepare("
                INSERT INTO orders (user_id, total, status)
                VALUES (:user_id, :total, :status)
            ");

            $stmt->execute([
                ':user_id' => $data['user_id'],
                ':total'   => $data['total'],
                ':status'  => 'pending'
            ]);

            $orderId = (int) $this->pdo->lastInsertId();

            // Inserir itens
            $itemStmt = $this->pdo->prepare("
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (:order_id, :product_id, :quantity, :price)
            ");

            foreach ($data['items'] as $item) {
                $itemStmt->execute([
                    ':order_id'   => $orderId,
                    ':product_id' => $item['id'],
                    ':quantity'   => $item['quantity'],
                    ':price'      => $item['price']
                ]);
            }

            $this->pdo->commit();
            return $orderId;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
