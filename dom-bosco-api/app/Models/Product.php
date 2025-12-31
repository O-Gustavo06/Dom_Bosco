<?php

require_once __DIR__ . '/../../config/database.php';

class Product
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
    }

    /**
     * Retorna todos os produtos ativos
     */
    public function getAll(): array
    {
        $sql = "
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.active,
                c.name AS category
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE p.active = 1
            ORDER BY p.name
        ";

        return $this->pdo
            ->query($sql)
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Retorna um produto pelo ID
     */
    public function getById(int $id): ?array
    {
        $sql = "
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.active,
                c.name AS category
            FROM products p
            JOIN categories c ON c.id = p.category_id
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
