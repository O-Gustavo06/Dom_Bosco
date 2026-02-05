<?php

require_once __DIR__ . '/../../config/database.php';

class Order
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    
    public function getAllWithFilters(string $filter = 'all', ?string $startDate = null, ?string $endDate = null): array
    {
        $query = "
            SELECT 
                o.id,
                o.user_id,
                o.total,
                o.status,
                o.delivery_tipo,
                o.delivery_entrega,
                o.delivery_Numero_casa,
                o.delivery_cidade,
                o.delivery_cep,
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

    
    public function getStatistics(string $filter = 'all', ?string $startDate = null, ?string $endDate = null): array
    {
        $whereConditions = [];
        $params = [];

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

    
    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                o.id,
                o.user_id,
                o.total,
                o.status,
                o.delivery_tipo,
                o.delivery_entrega,
                o.delivery_Numero_casa,
                o.delivery_cidade,
                o.delivery_cep,
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
        // Retry logic para lidar com database locks
        $maxRetries = 3;
        $retryDelay = 1; // segundos
        
        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                return $this->attemptCreate($data);
            } catch (PDOException $e) {
                // Se for erro de database locked e ainda temos tentativas
                if (strpos($e->getMessage(), 'database is locked') !== false && $attempt < $maxRetries) {
                    error_log("Tentativa $attempt de criar pedido falhou (database locked), tentando novamente...");
                    sleep($retryDelay);
                    $retryDelay *= 2; // Exponential backoff
                    continue;
                }
                // Se não for locked ou acabaram as tentativas, propagar erro
                throw $e;
            }
        }
        
        throw new Exception("Falha ao criar pedido após $maxRetries tentativas");
    }
    
    private function attemptCreate(array $data): int
    {
        $this->pdo->beginTransaction();

        try {

            $userId = $data['user_id'] ?? null;
            
            if (!$userId && !empty($data['customer']['email'])) {

                $stmt = $this->pdo->prepare("
                    SELECT id FROM users WHERE email = :email
                ");
                $stmt->execute([':email' => $data['customer']['email']]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user) {
                    $userId = $user['id'];
                } else {

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

            $deliveryType = $data['delivery_type'] ?? 'delivery';
            $deliveryAddress = null;
            $deliveryHouseNumber = null;
            $deliveryCity = null;
            $deliveryZipcode = null;
            
            if ($deliveryType === 'delivery' && isset($data['customer'])) {
                $deliveryAddress = $data['customer']['address'] ?? null;
                $deliveryHouseNumber = $data['customer']['houseNumber'] ?? null;
                $deliveryCity = $data['customer']['city'] ?? null;
                $deliveryZipcode = $data['customer']['zipCode'] ?? null;
            }

            $stmt = $this->pdo->prepare("
                INSERT INTO orders (user_id, total, status, delivery_tipo, delivery_entrega, delivery_Numero_casa, delivery_cidade, delivery_cep)
                VALUES (:user_id, :total, :status, :delivery_tipo, :delivery_entrega, :delivery_Numero_casa, :delivery_cidade, :delivery_cep)
            ");

            $stmt->execute([
                ':user_id' => $userId,
                ':total'   => $data['total'],
                ':status'  => 'pending',
                ':delivery_tipo' => $deliveryType,
                ':delivery_entrega' => $deliveryAddress,
                ':delivery_Numero_casa' => $deliveryHouseNumber,
                ':delivery_cidade' => $deliveryCity,
                ':delivery_cep' => $deliveryZipcode
            ]);

            $orderId = (int) $this->pdo->lastInsertId();

            // Inserir todos os itens do pedido em batch (muito mais rápido)
            $itemsValues = [];
            $itemsParams = [];
            $paramIndex = 0;
            
            foreach ($data['items'] as $item) {
                $itemsValues[] = "(?, ?, ?, ?)";
                $itemsParams[] = $orderId;
                $itemsParams[] = $item['id'];
                $itemsParams[] = $item['quantity'];
                $itemsParams[] = $item['price'];
            }
            
            if (!empty($itemsValues)) {
                $itemStmt = $this->pdo->prepare("
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES " . implode(', ', $itemsValues) . "
                ");
                $itemStmt->execute($itemsParams);
            }

            // Decrementar estoque de todos os produtos com prepared statement reutilizável
            require_once __DIR__ . '/Inventory.php';
            $inventoryModel = new Inventory();
            
            // Preparar o statement uma vez e reutilizar para todos os produtos (mais eficiente)
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $updateStmt = $this->pdo->prepare("
                UPDATE inventory
                SET quantity = quantity - :amount,
                    last_update = CURRENT_TIMESTAMP
                WHERE product_id = :product_id
                AND quantity >= :amount
            ");
            
            foreach ($data['items'] as $item) {
                $result = $updateStmt->execute([
                    ':amount' => $item['quantity'],
                    ':product_id' => $item['id']
                ]);
                
                if ($updateStmt->rowCount() === 0) {
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

    /**
     * Buscar pedidos de um usuário específico
     */
    public function getUserOrders(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                o.id,
                o.user_id,
                o.total,
                o.status,
                o.status_de_rastreamento,
                o.delivery_tipo,
                o.delivery_entrega,
                o.delivery_Numero_casa,
                o.delivery_cidade,
                o.delivery_cep,
                o.created_at,
                COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = :user_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ");
        
        $stmt->execute([':user_id' => $userId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Para cada pedido, buscar os itens
        foreach ($orders as &$order) {
            $itemsStmt = $this->pdo->prepare("
                SELECT 
                    oi.id,
                    oi.product_id,
                    oi.quantity,
                    oi.price,
                    p.name as product_name,
                    p.image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = :order_id
            ");
            
            $itemsStmt->execute([':order_id' => $order['id']]);
            $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $orders;
    }

    /**
     * Atualizar status de rastreamento
     */
    public function updateTrackingStatus(int $id, string $trackingStatus): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE orders 
            SET status_de_rastreamento = :status_de_rastreamento 
            WHERE id = :id
        ");

        return $stmt->execute([
            ':id' => $id,
            ':status_de_rastreamento' => $trackingStatus
        ]);
    }
}
