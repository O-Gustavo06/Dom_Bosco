<?php

require_once __DIR__ . '/../../config/database.php';

class Category
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    public function getAll(): array
    {
        $stmt = $this->pdo->query('SELECT id, name FROM categories ORDER BY name ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
