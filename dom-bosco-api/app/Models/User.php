<?php

require_once __DIR__ . '/../../config/database.php';

class User
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connect();
    }

    /**
     * Busca usuário por email
     */
    public function getByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM users WHERE email = :email LIMIT 1
        ");

        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    /**
     * Busca usuário por ID
     */
    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, name, email, role FROM users WHERE id = :id LIMIT 1
        ");

        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    /**
     * Cria novo usuário
     * Roles válidos: 'admin' ou 'customer'
     */
    public function create(string $name, string $email, string $password, string $role = 'customer'): int
    {
        // Valida email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Email inválido');
        }

        // Verifica se email já existe
        if ($this->getByEmail($email)) {
            throw new Exception('Email já cadastrado');
        }

        // Valida senha
        if (strlen($password) < 6) {
            throw new Exception('Senha deve ter no mínimo 6 caracteres');
        }

        // Valida role
        if (!in_array($role, ['admin', 'customer'])) {
            throw new Exception('Role inválido. Use: admin ou customer');
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->pdo->prepare("
            INSERT INTO users (name, email, password, role, created_at)
            VALUES (:name, :email, :password, :role, datetime('now'))
        ");

        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':role' => $role
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Verifica credenciais do usuário
     * Compatível com senhas em texto plano e com bcrypt
     */
    public function authenticate(string $email, string $password): ?array
    {
        $user = $this->getByEmail($email);

        if (!$user) {
            return null;
        }

        // Tenta password_verify (para bcrypt)
        $isValid = password_verify($password, $user['password']);
        
        // Se falhar, tenta comparação direta (para senhas em texto plano no banco antigo)
        if (!$isValid && $user['password'] === $password) {
            $isValid = true;
        }

        if (!$isValid) {
            return null;
        }

        // Se a senha está em texto plano, fazer hash agora
        if ($user['password'] === $password && !password_needs_rehash($user['password'], PASSWORD_BCRYPT)) {
            // Atualiza com hash bcrypt
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $this->pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
            $stmt->execute([':password' => $hashedPassword, ':id' => $user['id']]);
        }

        // Retorna sem a senha
        unset($user['password']);
        return $user;
    }

    /**
     * Lista todos os usuários
     */
    public function getAll(): array
    {
        $stmt = $this->pdo->prepare("
            SELECT id, name, email, role, created_at FROM users ORDER BY id DESC
        ");

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Atualiza usuário
     */
    public function update(int $id, array $data): bool
    {
        $updates = [];
        $params = [':id' => $id];

        if (isset($data['name'])) {
            $updates[] = 'name = :name';
            $params[':name'] = $data['name'];
        }

        if (isset($data['email'])) {
            $updates[] = 'email = :email';
            $params[':email'] = $data['email'];
        }

        if (isset($data['role'])) {
            $updates[] = 'role = :role';
            $params[':role'] = $data['role'];
        }

        if (empty($updates)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        
        return $stmt->execute($params);
    }

    /**
     * Deleta usuário
     */
    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Mantém compatibilidade com código antigo
     */
    public function findByEmail(string $email)
    {
        return $this->getByEmail($email);
    }
}