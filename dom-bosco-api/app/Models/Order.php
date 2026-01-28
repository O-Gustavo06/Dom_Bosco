<?php

require_once __DIR__ . '/../../config/database.php';

class Order
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /**
     * Buscar todos os pedidos com filtros
     */
    public function getAllWithFilters(string $filter = 'all', ?string $startDate = null, ?string $endDate = null): array
    {
        $query = "
            SELECT 
                o.id,
                o.user_id,
                o.total,
                o.status,
                o.created_at,
                u.name as user_name,
                u.email as user_email,
                COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
        ";

        $whereConditions = [];
        $params = [];

        // Aplicar filtros de período
        if ($filter !== 'all') {
            switch ($filter) {
                case 'today':
                    $whereConditions[] = "DATE(o.created_at) = DATE('now')";
                    break;
                case 'week':
                    $whereConditions[] = "DATE(o.created_at) >= DATE('now', '-7 days')";
                    break;
                case 'month':
                    $whereConditions[] = "DATE(o.created_at) >= DATE('now', '-30 days')";
                    break;
                case 'year':
                    $whereConditions[] = "DATE(o.created_at) >= DATE('now', '-365 days')";
                    break;
            }
        }

        // Filtro personalizado por data
        if ($startDate) {
            $whereConditions[] = "DATE(o.created_at) >= :start_date";
            $params[':start_date'] = $startDate;
        }
        if ($endDate) {
            $whereConditions[] = "DATE(o.created_at) <= :end_date";
            $params[':end_date'] = $endDate;
        }

        if (!empty($whereConditions)) {
            $query .= " WHERE " . implode(' AND ', $whereConditions);
        }

        $query .= " GROUP BY o.id ORDER BY o.created_at DESC";

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Buscar estatísticas dos pedidos
     */
    public function getStatistics(string $filter = 'all', ?string $startDate = null, ?string $endDate = null): array
    {
        $whereConditions = [];
        $params = [];

        // Aplicar filtros de período
        if ($filter !== 'all') {
            switch ($filter) {
                case 'today':
                    $whereConditions[] = "DATE(created_at) = DATE('now')";
                    break;
                case 'week':
                    $whereConditions[] = "DATE(created_at) >= DATE('now', '-7 days')";
                    break;
                case 'month':
                    $whereConditions[] = "DATE(created_at) >= DATE('now', '-30 days')";
                    break;
                case 'year':
                    $whereConditions[] = "DATE(created_at) >= DATE('now', '-365 days')";
                    break;
            }
        }

        // Filtro personalizado por data
        if ($startDate) {
            $whereConditions[] = "DATE(created_at) >= :start_date";
            $params[':start_date'] = $startDate;
        }
        if ($endDate) {
            $whereConditions[] = "DATE(created_at) <= :end_date";
            $params[':end_date'] = $endDate;
        }

        $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";

        $query = "
            SELECT 
                COUNT(*) as total_orders,
                SUM(total) as total_revenue,
                AVG(total) as average_order,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
            FROM orders
            {$whereClause}
        ";

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Buscar pedido por ID com itens
     */
    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                o.id,
                o.user_id,
                o.total,
                o.status,
                o.created_at,
                u.name as user_name,
                u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = :id
        ");
        
        $stmt->execute([':id' => $id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        // Buscar itens do pedido
        $itemsStmt = $this->pdo->prepare("
            SELECT 
                oi.id,
                oi.product_id,
                oi.quantity,
                oi.price,
                p.name as product_name,
                p.image as product_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = :order_id
        ");
        
        $itemsStmt->execute([':order_id' => $id]);
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

        return $order;
    }

    /**
     * Atualizar status do pedido
     */
    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE orders 
            SET status = :status 
            WHERE id = :id
        ");

        return $stmt->execute([
            ':id' => $id,
            ':status' => $status
        ]);
    }

    public function create(array $data): int
    {
        $this->pdo->beginTransaction();

        try {
            // Se não houver user_id, criar ou buscar usuário guest baseado no email
            $userId = $data['user_id'] ?? null;
            
            if (!$userId && !empty($data['customer']['email'])) {
                // Buscar ou criar usuário guest
                $stmt = $this->pdo->prepare("
                    SELECT id FROM users WHERE email = :email
                ");
                $stmt->execute([':email' => $data['customer']['email']]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user) {
                    $userId = $user['id'];
                } else {
                    // Criar novo usuário guest
                    $insertUser = $this->pdo->prepare("
                        INSERT INTO users (name, email, password, role)
                        VALUES (:name, :email, :password, 'customer')
                    ");
                    $insertUser->execute([
                        ':name' => $data['customer']['name'] ?? 'Cliente',
                        ':email' => $data['customer']['email'],
                        ':password' => password_hash(uniqid(), PASSWORD_DEFAULT) // senha aleatória
                    ]);
                    $userId = (int) $this->pdo->lastInsertId();
                }
            }

            $stmt = $this->pdo->prepare("
                INSERT INTO orders (user_id, total, status)
                VALUES (:user_id, :total, :status)
            ");

            $stmt->execute([
                ':user_id' => $userId,
                ':total'   => $data['total'],
                ':status'  => 'pending'
            ]);

            $orderId = (int) $this->pdo->lastInsertId();

            $itemStmt = $this->pdo->prepare("
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (:order_id, :product_id, :quantity, :price)
            ");

            // Carregar o modelo de Inventory para decrementar o estoque
            require_once __DIR__ . '/Inventory.php';
            $inventoryModel = new Inventory();

            foreach ($data['items'] as $item) {
                // Inserir item do pedido
                $itemStmt->execute([
                    ':order_id'   => $orderId,
                    ':product_id' => $item['id'],
                    ':quantity'   => $item['quantity'],
                    ':price'      => $item['price']
                ]);

                // Decrementar o estoque
                $decremented = $inventoryModel->decrement($item['id'], $item['quantity']);
                
                if (!$decremented) {
                    throw new Exception("Estoque insuficiente para o produto ID: {$item['id']}");
                }
            }

            $this->pdo->commit();
            return $orderId;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
