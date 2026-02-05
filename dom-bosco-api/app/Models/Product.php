<?php

require_once __DIR__ . '/../../config/database.php';

class Product
{
    protected $table = 'products';
    protected $fillable = ['name', 'description', 'price', 'stock', 'category', 'image_url'];
    
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /* ==========================
       CONSULTAS
       ========================== */

    
    public function getAll(): array
    {
        $sql = '
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.active,
                p.image,
                p.category_id,
                COALESCE(i.quantity, 0) AS inventory_quantity
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.active = 1
            ORDER BY p.id DESC
        ';

        return $this->pdo
            ->query($sql)
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    
    public function getAllAdmin(): array
    {
        $sql = '
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.active,
                p.image,
                p.category_id,
                COALESCE(i.quantity, 0) AS inventory_quantity,
                COALESCE(i.min_quantity, 5) AS min_quantity
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            ORDER BY p.id DESC
        ';

        return $this->pdo
            ->query($sql)
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    
    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.active,
                p.image,
                p.category_id,
                COALESCE(i.quantity, 0) AS inventory_quantity,
                COALESCE(i.min_quantity, 5) AS min_quantity
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.id = :id
            LIMIT 1
        ');

        $stmt->execute([':id' => $id]);

        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        return $product ?: null;
    }

    /* ==========================
       ESCRITA
       ========================== */

    
    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO products
                (name, description, price, stock, category_id, image, active, created_at)
             VALUES
                (:name, :description, :price, :stock, :category_id, :image, 1, datetime(\'now\'))'
        );

        $stmt->execute([
            ':name'        => $data['name'],
            ':description' => $data['description'],
            ':price'       => $data['price'],
            ':stock'       => $data['stock'],
            ':category_id' => $data['category_id'],
            ':image'       => $data['image']
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    
    public function update(int $id, array $data): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE products SET
                name = :name,
                description = :description,
                price = :price,
                stock = :stock,
                category_id = :category_id,
                image = :image,
                active = :active
             WHERE id = :id'
        );

        return $stmt->execute([
            ':id'          => $id,
            ':name'        => $data['name'],
            ':description' => $data['description'],
            ':price'       => $data['price'],
            ':stock'       => $data['stock'],
            ':category_id' => $data['category_id'],
            ':image'       => $data['image'],
            ':active'      => $data['active']
        ]);
    }

    
    public function delete(int $id): bool
    {
        $this->pdo->beginTransaction();

        try {

            $stmt = $this->pdo->prepare('DELETE FROM inventory WHERE product_id = :id');
            $stmt->execute([':id' => $id]);

            $stmt = $this->pdo->prepare('DELETE FROM order_items WHERE product_id = :id');
            $stmt->execute([':id' => $id]);

            $stmt = $this->pdo->prepare('DELETE FROM products WHERE id = :id');
            $stmt->execute([':id' => $id]);

            $this->pdo->commit();
            return true;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    
    public function updateActiveStatusByStock(int $productId): bool
    {

        $stmt = $this->pdo->prepare('
            SELECT COALESCE(i.quantity, 0) as quantity
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.id = :id
        ');
        $stmt->execute([':id' => $productId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            return false;
        }

        $quantity = (int) $result['quantity'];
        $shouldBeActive = $quantity > 5 ? 1 : 0;

        $stmt = $this->pdo->prepare('
            UPDATE products 
            SET active = :active 
            WHERE id = :id
        ');

        return $stmt->execute([
            ':active' => $shouldBeActive,
            ':id' => $productId
        ]);
    }

    
    public function updateAllActiveStatusByStock(): int
    {

        $stmt = $this->pdo->query('
            UPDATE products
            SET active = 0
            WHERE id IN (
                SELECT p.id
                FROM products p
                LEFT JOIN inventory i ON i.product_id = p.id
                WHERE COALESCE(i.quantity, 0) <= 5
            )
        ');
        $inactivated = $stmt->rowCount();

        $stmt = $this->pdo->query('
            UPDATE products
            SET active = 1
            WHERE id IN (
                SELECT p.id
                FROM products p
                INNER JOIN inventory i ON i.product_id = p.id
                WHERE i.quantity > 5
            )
        ');
        $activated = $stmt->rowCount();

        return $inactivated + $activated;
    }
}
