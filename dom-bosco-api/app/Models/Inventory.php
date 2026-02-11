<?php

require_once __DIR__ . '/../../config/database.php';

class Inventory
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
        $this->ensureMovementsTable();
    }

    public function seedMissingFromProducts(): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO inventory (product_id, quantity, min_quantity)
             SELECT p.id, 0, 5
             FROM products p
             LEFT JOIN inventory i ON i.product_id = p.id
             WHERE i.product_id IS NULL'
        );

        $stmt->execute();
        return $stmt->rowCount();
    }

    public function ensureRecord(int $productId, int $quantity = 0, int $minQuantity = 5): void
    {
        $existing = $this->getByProductId($productId);
        if ($existing) {
            return;
        }

        $this->create($productId, $quantity, $minQuantity);
        $this->logMovement($productId, $quantity, $quantity, 'seed', 'Auto seed from products', null);
    }

    
    public function getByProductId(int $productId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                id,
                product_id,
                quantity,
                min_quantity,
                last_update
            FROM inventory
            WHERE product_id = :product_id
        ");

        $stmt->execute([':product_id' => $productId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    
    public function getAll(): array
    {
        $sql = "
            SELECT 
                i.id,
                i.product_id,
                i.quantity,
                i.min_quantity,
                i.last_update,
                p.name as product_name,
                p.price,
                p.active
            FROM inventory i
            INNER JOIN products p ON p.id = i.product_id
            ORDER BY i.quantity ASC, p.name ASC
        ";

        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    
    public function create(int $productId, int $quantity = 0, int $minQuantity = 5): bool
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO inventory (product_id, quantity, min_quantity)
            VALUES (:product_id, :quantity, :min_quantity)
        ");

        return $stmt->execute([
            ':product_id' => $productId,
            ':quantity' => $quantity,
            ':min_quantity' => $minQuantity
        ]);
    }

    
    public function updateQuantity(int $productId, int $quantity, ?string $note = null, ?int $userId = null): bool
    {
        $current = $this->getByProductId($productId);
        if (!$current) {
            $this->create($productId, $quantity, 5);
            $this->logMovement($productId, $quantity, $quantity, 'set', $note, $userId);
            return true;
        }

        $stmt = $this->pdo->prepare("
            UPDATE inventory
            SET quantity = :quantity,
                last_update = CURRENT_TIMESTAMP
            WHERE product_id = :product_id
        ");

        $result = $stmt->execute([
            ':quantity' => $quantity,
            ':product_id' => $productId
        ]);

        if ($result) {
            $delta = $quantity - (int) $current['quantity'];
            if ($delta !== 0) {
                $this->logMovement($productId, $delta, $quantity, 'set', $note, $userId);
            }
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $productModel->updateActiveStatusByStock($productId);
        }

        return $result;
    }

    
    public function increment(int $productId, int $amount, ?string $note = null, ?int $userId = null): bool
    {
        $current = $this->getByProductId($productId);
        if (!$current) {
            $this->create($productId, $amount, 5);
            $this->logMovement($productId, $amount, $amount, 'increment', $note, $userId);
            return true;
        }

        $stmt = $this->pdo->prepare("
            UPDATE inventory
            SET quantity = quantity + :amount,
                last_update = CURRENT_TIMESTAMP
            WHERE product_id = :product_id
        ");

        $result = $stmt->execute([
            ':amount' => $amount,
            ':product_id' => $productId
        ]);

        if ($result) {
            $quantityAfter = (int) $current['quantity'] + $amount;
            $this->logMovement($productId, $amount, $quantityAfter, 'increment', $note, $userId);
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $productModel->updateActiveStatusByStock($productId);
        }

        return $result;
    }

    
    public function decrement(int $productId, int $amount, ?string $note = null, ?int $userId = null): bool
    {
        $current = $this->getByProductId($productId);
        if (!$current) {
            return false;
        }

        $stmt = $this->pdo->prepare("
            UPDATE inventory
            SET quantity = quantity - :amount,
                last_update = CURRENT_TIMESTAMP
            WHERE product_id = :product_id
            AND quantity >= :amount
        ");

        $stmt->execute([
            ':amount' => $amount,
            ':product_id' => $productId
        ]);
        
        
        $success = $stmt->rowCount() > 0;

        if ($success) {
            $quantityAfter = (int) $current['quantity'] - $amount;
            $this->logMovement($productId, -$amount, $quantityAfter, 'decrement', $note, $userId);
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $productModel->updateActiveStatusByStock($productId);
        }

        return $success;
    }

    
    public function checkStockBatch(array $productIds): array
    {
        if (empty($productIds)) {
            return [];
        }
        
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $stmt = $this->pdo->prepare("
            SELECT product_id, quantity
            FROM inventory
            WHERE product_id IN ($placeholders)
        ");
        
        $stmt->execute($productIds);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $stockMap = [];
        foreach ($results as $row) {
            $stockMap[$row['product_id']] = (int) $row['quantity'];
        }
        
        return $stockMap;
    }
    
    public function hasStock(int $productId, int $requestedQuantity = 1): bool
    {
        $inventory = $this->getByProductId($productId);
        
        if (!$inventory) {
            return false;
        }

        return $inventory['quantity'] >= $requestedQuantity;
    }

    
    public function isBelowMinimum(int $productId): bool
    {
        $inventory = $this->getByProductId($productId);
        
        if (!$inventory) {
            return true;
        }

        return $inventory['quantity'] < $inventory['min_quantity'];
    }

    
    public function getLowStock(): array
    {
        $sql = "
            SELECT 
                i.id,
                i.product_id,
                i.quantity,
                i.min_quantity,
                p.name as product_name,
                p.price
            FROM inventory i
            INNER JOIN products p ON p.id = i.product_id
            WHERE i.quantity < i.min_quantity
            ORDER BY i.quantity ASC
        ";

        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    
    public function delete(int $productId): bool
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM inventory WHERE product_id = :product_id
        ");

        return $stmt->execute([':product_id' => $productId]);
    }

    
    public function updateMinQuantity(int $productId, int $minQuantity): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE inventory
            SET min_quantity = :min_quantity
            WHERE product_id = :product_id
        ");

        return $stmt->execute([
            ':min_quantity' => $minQuantity,
            ':product_id' => $productId
        ]);
    }

    public function getMovements(?int $productId = null, int $limit = 50, int $offset = 0): array
    {
        $sql = '
            SELECT
                m.id,
                m.product_id,
                p.name as product_name,
                m.change_amount,
                m.quantity_after,
                m.type,
                m.note,
                m.user_id,
                m.created_at
            FROM inventory_movements m
            LEFT JOIN products p ON p.id = m.product_id
        ';

        $params = [];
        if ($productId !== null) {
            $sql .= ' WHERE m.product_id = :product_id';
            $params[':product_id'] = $productId;
        }

        $sql .= ' ORDER BY m.id DESC LIMIT :limit OFFSET :offset';

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function logMovement(
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

    private function ensureMovementsTable(): void
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
}
