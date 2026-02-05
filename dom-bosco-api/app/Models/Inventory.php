<?php

require_once __DIR__ . '/../../config/database.php';

class Inventory
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
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

    
    public function updateQuantity(int $productId, int $quantity): bool
    {
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
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $productModel->updateActiveStatusByStock($productId);
        }

        return $result;
    }

    
    public function increment(int $productId, int $amount): bool
    {
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
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $productModel->updateActiveStatusByStock($productId);
        }

        return $result;
    }

    
    public function decrement(int $productId, int $amount): bool
    {
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
        
        // Verificar se alguma linha foi afetada (se tinha estoque suficiente)
        $success = $stmt->rowCount() > 0;

        if ($success) {
            require_once __DIR__ . '/Product.php';
            $productModel = new Product();
            $productModel->updateActiveStatusByStock($productId);
        }

        return $success;
    }

    /**
     * Verificar estoque de múltiplos produtos em uma única query (batch)
     * @param array $productIds Array de IDs dos produtos
     * @return array Array associativo [product_id => quantity]
     */
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
}
