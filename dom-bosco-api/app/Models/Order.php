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
        $this->pdo->beginTransaction();

        try {
            $currentStmt = $this->pdo->prepare('SELECT status FROM orders WHERE id = :id');
            $currentStmt->execute([':id' => $id]);
            $current = $currentStmt->fetch(PDO::FETCH_ASSOC);
            if (!$current) {
                $this->pdo->rollBack();
                return false;
            }

            $oldStatus = $current['status'];

            $stmt = $this->pdo->prepare("
                UPDATE orders
                SET status = :status
                WHERE id = :id
            ");

            $ok = $stmt->execute([
                ':id' => $id,
                ':status' => $status
            ]);

            if (!$ok) {
                $this->pdo->rollBack();
                return false;
            }

            if ($status === 'cancelled' && $oldStatus !== 'cancelled') {
                $itemsStmt = $this->pdo->prepare('
                    SELECT product_id, quantity
                    FROM order_items
                    WHERE order_id = :order_id
                ');
                $itemsStmt->execute([':order_id' => $id]);
                $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

                $this->ensureInventoryMovementsTable();
                $updateStmt = $this->pdo->prepare('
                    UPDATE inventory
                    SET quantity = quantity + :amount,
                        last_update = CURRENT_TIMESTAMP
                    WHERE product_id = :product_id
                ');

                foreach ($items as $item) {
                    $updateStmt->execute([
                        ':amount' => (int) $item['quantity'],
                        ':product_id' => (int) $item['product_id']
                    ]);

                    $qtyStmt = $this->pdo->prepare('SELECT quantity FROM inventory WHERE product_id = :product_id');
                    $qtyStmt->execute([':product_id' => (int) $item['product_id']]);
                    $row = $qtyStmt->fetch(PDO::FETCH_ASSOC);
                    $afterQty = (int) ($row['quantity'] ?? 0);

                    $this->logInventoryMovement(
                        (int) $item['product_id'],
                        (int) $item['quantity'],
                        $afterQty,
                        'cancel',
                        'order_id=' . $id,
                        null
                    );
                }
            }

            $this->pdo->commit();

            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $itemsStmt = $this->pdo->prepare('SELECT DISTINCT product_id FROM order_items WHERE order_id = :order_id');
            $itemsStmt->execute([':order_id' => $id]);
            $productIds = $itemsStmt->fetchAll(PDO::FETCH_COLUMN);
            foreach ($productIds as $productId) {
                $productModel->updateActiveStatusByStock((int) $productId);
            }

            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function create(array $data): int
    {
        
        $maxRetries = 3;
        $retryDelay = 1; 
        
        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                return $this->attemptCreate($data);
            } catch (PDOException $e) {
                
                if (strpos($e->getMessage(), 'database is locked') !== false && $attempt < $maxRetries) {
                    error_log("Tentativa $attempt de criar pedido falhou (database locked), tentando novamente...");
                    sleep($retryDelay);
                    $retryDelay *= 2; 
                    continue;
                }
                
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
                        ':password' => password_hash(uniqid(), PASSWORD_DEFAULT) 
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

            $seedStmt = $this->pdo->prepare(
                'INSERT INTO inventory (product_id, quantity, min_quantity)
                 SELECT p.id, 0, 5
                 FROM products p
                 LEFT JOIN inventory i ON i.product_id = p.id
                 WHERE i.product_id IS NULL'
            );
            $seedStmt->execute();

            $requested = [];
            foreach ($data['items'] as $item) {
                $productId = (int) ($item['id'] ?? 0);
                $qty = (int) ($item['quantity'] ?? 0);
                if ($productId <= 0 || $qty <= 0) {
                    throw new Exception('Item invalido no pedido');
                }
                $requested[$productId] = ($requested[$productId] ?? 0) + $qty;
            }

            $productIds = array_keys($requested);
            $placeholders = implode(',', array_fill(0, count($productIds), '?'));
            $stockStmt = $this->pdo->prepare(
                "SELECT product_id, quantity FROM inventory WHERE product_id IN ($placeholders)"
            );
            $stockStmt->execute($productIds);
            $stockRows = $stockStmt->fetchAll(PDO::FETCH_ASSOC);
            $stockMap = [];
            foreach ($stockRows as $row) {
                $stockMap[(int) $row['product_id']] = (int) $row['quantity'];
            }

            foreach ($requested as $productId => $qty) {
                $available = $stockMap[$productId] ?? 0;
                if ($available < $qty) {
                    throw new Exception("Estoque insuficiente para o produto ID: {$productId}");
                }
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

            
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $this->ensureInventoryMovementsTable();
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

                $productId = (int) $item['id'];
                $qty = (int) $item['quantity'];
                $stockMap[$productId] = ($stockMap[$productId] ?? 0) - $qty;
                $this->logInventoryMovement(
                    $productId,
                    -$qty,
                    $stockMap[$productId],
                    'order',
                    'order_id=' . $orderId,
                    $userId
                );
            }

            $this->pdo->commit();

            foreach (array_keys($requested) as $productId) {
                $productModel->updateActiveStatusByStock((int) $productId);
            }
            return $orderId;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    private function ensureInventoryMovementsTable(): void
    {
        $this->pdo->exec(
            'CREATE TABLE IF NOT EXISTS inventory_movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                change_amount INTEGER NOT NULL,
                quantity_after INTEGER NOT NULL,
                type VARCHAR(30) NOT NULL,
                note TEXT,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )'
        );
    }

    private function logInventoryMovement(
        int $productId,
        int $delta,
        int $quantityAfter,
        string $type,
        ?string $note,
        ?int $userId
    ): void {
        $stmt = $this->pdo->prepare(
            'INSERT INTO inventory_movements
                (product_id, change_amount, quantity_after, type, note, user_id, created_at)
             VALUES
                (:product_id, :change_amount, :quantity_after, :type, :note, :user_id, datetime(\'now\'))'
        );

        $stmt->execute([
            ':product_id' => $productId,
            ':change_amount' => $delta,
            ':quantity_after' => $quantityAfter,
            ':type' => $type,
            ':note' => $note,
            ':user_id' => $userId
        ]);
    }

    
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
