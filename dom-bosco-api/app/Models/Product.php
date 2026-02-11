<?php

require_once __DIR__ . '/../../config/database.php';

class Product
{
    protected $table = 'products';
    protected $fillable = ['name', 'description', 'price', 'category', 'image_url'];
    
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    

    
    public function getAll(): array
    {
        $sql = '
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
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

    

    
    public function create(array $data): int
    {
        $imageValue = $this->normalizeImageValue($data['image'] ?? null);

        $stmt = $this->pdo->prepare(
                'INSERT INTO products
                     (name, description, price, category_id, image, active, created_at)
                 VALUES
                     (:name, :description, :price, :category_id, :image, 1, datetime(\'now\'))'
        );

        $stmt->execute([
            ':name'        => $data['name'],
            ':description' => $data['description'],
            ':price'       => $data['price'],
            ':category_id' => $data['category_id'],
            ':image'       => $imageValue
        ]);

        $productId = (int) $this->pdo->lastInsertId();

        require_once __DIR__ . '/Inventory.php';
        $inventory = new Inventory();
        $quantity = isset($data['stock']) ? (int) $data['stock'] : 0;
        $inventory->ensureRecord($productId, $quantity, 5);

        return $productId;
    }

    
    public function update(int $id, array $data): bool
    {
        $imageValue = $this->normalizeImageValue($data['image'] ?? null);

        $stmt = $this->pdo->prepare(
            'UPDATE products SET
                name = :name,
                description = :description,
                price = :price,
                category_id = :category_id,
                image = :image,
                active = :active
             WHERE id = :id'
        );

        $result = $stmt->execute([
            ':id'          => $id,
            ':name'        => $data['name'],
            ':description' => $data['description'],
            ':price'       => $data['price'],
            ':category_id' => $data['category_id'],
            ':image'       => $imageValue,
            ':active'      => $data['active']
        ]);

        if ($result && array_key_exists('stock', $data)) {
            require_once __DIR__ . '/Inventory.php';
            $inventory = new Inventory();
            $inventory->updateQuantity((int) $id, (int) $data['stock'], 'Sync from product update', null);
        }

        return $result;
    }

    private function normalizeImageValue($image): ?string
    {
        $maxImages = 4;

        if ($image === null) {
            return null;
        }

        if (is_array($image)) {
            $images = array_values(array_filter(array_map('trim', $image)));
            $images = array_slice($images, 0, $maxImages);
            if (count($images) === 0) {
                return null;
            }

            return json_encode($images, JSON_UNESCAPED_UNICODE);
        }

        if (is_string($image)) {
            $trimmed = trim($image);
            if ($trimmed === '') {
                return null;
            }

            if (str_starts_with($trimmed, '[')) {
                $decoded = json_decode($trimmed, true);
                if (is_array($decoded)) {
                    $images = array_values(array_filter(array_map('trim', $decoded)));
                    $images = array_slice($images, 0, $maxImages);
                    return count($images) > 0
                        ? json_encode($images, JSON_UNESCAPED_UNICODE)
                        : null;
                }
            }

            return $trimmed;
        }

        return (string) $image;
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
                 , COALESCE(i.min_quantity, 5) as min_quantity
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
        $minQuantity = (int) $result['min_quantity'];
        $shouldBeActive = $quantity > $minQuantity ? 1 : 0;

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
                WHERE COALESCE(i.quantity, 0) <= COALESCE(i.min_quantity, 5)
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
                WHERE i.quantity > COALESCE(i.min_quantity, 5)
            )
        ');
        $activated = $stmt->rowCount();

        return $inactivated + $activated;
    }
}
