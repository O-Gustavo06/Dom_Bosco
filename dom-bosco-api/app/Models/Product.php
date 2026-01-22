<?php

require_once __DIR__ . '/../../config/database.php';

class Product
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
    }

    /* ==========================
       CONSULTAS
       ========================== */

    /**
     * PRODUTOS PÚBLICOS
     * Retorna apenas produtos ativos com estoque >= 5
     */
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
                COALESCE(c.name, \'Sem categoria\') AS category,
                COALESCE(i.quantity, 0) AS inventory_quantity
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.active = 1
            AND (i.quantity IS NULL OR i.quantity >= 5)
            ORDER BY p.id DESC
        ';

        return $this->pdo
            ->query($sql)
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * PRODUTOS (ADMIN – SEM FILTRO)
     */
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
                c.name AS category,
                COALESCE(i.quantity, 0) AS inventory_quantity,
                COALESCE(i.min_quantity, 5) AS min_quantity
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN inventory i ON i.product_id = p.id
            ORDER BY p.id DESC
        ';

        return $this->pdo
            ->query($sql)
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * BUSCAR PRODUTO POR ID
     */
    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM products WHERE id = :id LIMIT 1'
        );

        $stmt->execute([':id' => $id]);

        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        return $product ?: null;
    }

    /* ==========================
       ESCRITA
       ========================== */

    /**
     * CRIAR PRODUTO
     */
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

    /**
     * ATUALIZAR PRODUTO
     */
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

    /**
     * DELETAR PRODUTO
     */
    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare(
            'DELETE FROM products WHERE id = :id'
        );

        return $stmt->execute([':id' => $id]);
    }
}
