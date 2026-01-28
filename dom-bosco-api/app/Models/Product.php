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
                COALESCE(c.name, \'Sem categoria\') AS category,
                COALESCE(i.quantity, 0) AS inventory_quantity,
                COALESCE(i.min_quantity, 5) AS min_quantity
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
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
     * Remove todas as dependências antes de deletar o produto
     */
    public function delete(int $id): bool
    {
        $this->pdo->beginTransaction();

        try {
            // 1. Deletar inventário do produto
            $stmt = $this->pdo->prepare('DELETE FROM inventory WHERE product_id = :id');
            $stmt->execute([':id' => $id]);

            // 2. Deletar itens de pedidos do produto
            $stmt = $this->pdo->prepare('DELETE FROM order_items WHERE product_id = :id');
            $stmt->execute([':id' => $id]);

            // 3. Finalmente deletar o produto
            $stmt = $this->pdo->prepare('DELETE FROM products WHERE id = :id');
            $stmt->execute([':id' => $id]);

            $this->pdo->commit();
            return true;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * AUTO-INATIVAR PRODUTO BASEADO NO ESTOQUE
     * Inativa automaticamente o produto se o estoque for <= 5
     * Reativa automaticamente se o estoque voltar a ficar > 5
     */
    public function updateActiveStatusByStock(int $productId): bool
    {
        // Busca a quantidade em estoque
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

        // Atualiza o status do produto
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

    /**
     * ATUALIZAR STATUS DE TODOS OS PRODUTOS BASEADO NO ESTOQUE
     * Útil para sincronizar todos os produtos de uma vez
     */
    public function updateAllActiveStatusByStock(): int
    {
        // Inativa produtos com estoque <= 5
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

        // Reativa produtos com estoque > 5
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
