<?php

require_once __DIR__ . '/../../config/database.php';

class Product
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
    }

    public function getAll(): array
    {
        $baseImageUrl = 'http://localhost:8000/images/products/';

        $sql = "
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.active,
                COALESCE(
                    CASE 
                        WHEN p.image IS NOT NULL AND p.image != '' 
                        THEN '{$baseImageUrl}' || p.image
                        ELSE '{$baseImageUrl}default.png'
                    END,
                '{$baseImageUrl}default.png') AS image,
                COALESCE(c.name, 'Sem categoria') AS category
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.active = 1
            ORDER BY p.id DESC
        ";

        return $this->pdo
            ->query($sql)
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array
    {
        $baseImageUrl = 'http://localhost:8000/images/products/';

        $sql = "
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.active,
                COALESCE(
                    CASE 
                        WHEN p.image IS NOT NULL AND p.image != '' 
                        THEN '{$baseImageUrl}' || p.image
                        ELSE '{$baseImageUrl}default.png'
                    END,
                '{$baseImageUrl}default.png') AS image,
                COALESCE(c.name, 'Sem categoria') AS category
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.id = :id
            LIMIT 1
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }
}
