<?php

require_once __DIR__ . '/../../config/database.php';

class User
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
    }

    public function create(array $data)
    {
        $sql = "
            INSERT INTO users (name, email, password, role)
            VALUES (:name, :email, :password, :role)
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':name'     => $data['name'],
            ':email'    => $data['email'],
            ':password' => $data['password'], // depois colocamos hash
            ':role'     => $data['role']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function findByEmail(string $email)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM users WHERE email = :email LIMIT 1"
        );

        $stmt->execute([':email' => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}