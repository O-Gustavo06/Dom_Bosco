<?php

require_once __DIR__ . '/../../config/database.php';

class Inventory
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
    }

    /**
     * Obtém o estoque de um produto
     */
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

    /**
     * Obtém todos os estoques com informações dos produtos
     */
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

    /**
     * Cria um registro de estoque para um produto
     */
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

    /**
     * Atualiza a quantidade em estoque
     */
    public function updateQuantity(int $productId, int $quantity): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE inventory
            SET quantity = :quantity,
                last_update = CURRENT_TIMESTAMP
            WHERE product_id = :product_id
        ");

        return $stmt->execute([
            ':quantity' => $quantity,
            ':product_id' => $productId
        ]);
    }

    /**
     * Incrementa o estoque (entrada de mercadoria)
     */
    public function increment(int $productId, int $amount): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE inventory
            SET quantity = quantity + :amount,
                last_update = CURRENT_TIMESTAMP
            WHERE product_id = :product_id
        ");

        return $stmt->execute([
            ':amount' => $amount,
            ':product_id' => $productId
        ]);
    }

    /**
     * Decrementa o estoque (venda/saída)
     * Retorna false se não houver estoque suficiente
     */
    public function decrement(int $productId, int $amount): bool
    {
        // Verifica se há estoque suficiente
        $current = $this->getByProductId($productId);
        
        if (!$current || $current['quantity'] < $amount) {
            return false;
        }

        $stmt = $this->pdo->prepare("
            UPDATE inventory
            SET quantity = quantity - :amount,
                last_update = CURRENT_TIMESTAMP
            WHERE product_id = :product_id
            AND quantity >= :amount
        ");

        return $stmt->execute([
            ':amount' => $amount,
            ':product_id' => $productId
        ]);
    }

    /**
     * Verifica se um produto tem estoque suficiente
     */
    public function hasStock(int $productId, int $requestedQuantity = 1): bool
    {
        $inventory = $this->getByProductId($productId);
        
        if (!$inventory) {
            return false;
        }

        return $inventory['quantity'] >= $requestedQuantity;
    }

    /**
     * Verifica se o estoque está abaixo do mínimo
     */
    public function isBelowMinimum(int $productId): bool
    {
        $inventory = $this->getByProductId($productId);
        
        if (!$inventory) {
            return true;
        }

        return $inventory['quantity'] < $inventory['min_quantity'];
    }

    /**
     * Obtém produtos com estoque baixo
     */
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

    /**
     * Deleta o registro de estoque de um produto
     */
    public function delete(int $productId): bool
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM inventory WHERE product_id = :product_id
        ");

        return $stmt->execute([':product_id' => $productId]);
    }

    /**
     * Atualiza a quantidade mínima
     */
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
