<?php

require_once __DIR__ . '/../../config/database.php';

class User
{
    protected $table = 'users';
    protected $fillable = ['name', 'email', 'password', 'role'];
    protected $hidden = ['password'];
    
    private PDO $pdo;
    private const ROLES = ['admin', 'customer'];

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /* ==========================
       CONSULTAS
       ========================== */

    /**
     * Busca usuário por email
     */
    public function getByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM users WHERE email = :email LIMIT 1'
        );

        $stmt->execute([':email' => $email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    /**
     * Busca usuário por ID
     */
    public function getById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, name, email, role FROM users WHERE id = :id LIMIT 1'
        );

        $stmt->execute([':id' => $id]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    /**
     * Lista todos os usuários
     */
    public function getAll(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
        );

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* ==========================
       ESCRITA
       ========================== */

    /**
     * Cria novo usuário
     */
    public function create(
        string $name,
        string $email,
        string $password,
        string $role = 'customer'
    ): int {
        $this->validateUserData($email, $password, $role);

        if ($this->getByEmail($email)) {
            throw new Exception('Email já cadastrado');
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->pdo->prepare(
            'INSERT INTO users (name, email, password, role, created_at)
             VALUES (:name, :email, :password, :role, datetime(\'now\'))'
        );

        $stmt->execute([
            ':name'     => $name,
            ':email'    => $email,
            ':password' => $hashedPassword,
            ':role'     => $role
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Atualiza usuário
     */
    public function update(int $id, array $data): bool
    {
        $updates = [];
        $params  = [':id' => $id];

        if (array_key_exists('name', $data)) {
            $updates[] = 'name = :name';
            $params[':name'] = $data['name'];
        }

        if (array_key_exists('email', $data)) {
            $updates[] = 'email = :email';
            $params[':email'] = $data['email'];
        }

        if (array_key_exists('role', $data)) {
            $updates[] = 'role = :role';
            $params[':role'] = $data['role'];
        }

        if (empty($updates)) {
            return false;
        }

        $stmt = $this->pdo->prepare(
            'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = :id'
        );

        return $stmt->execute($params);
    }

    /**
     * Deleta usuário
     */
    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare(
            'DELETE FROM users WHERE id = :id'
        );

        return $stmt->execute([':id' => $id]);
    }

    /* ==========================
       AUTENTICAÇÃO
       ========================== */

    /**
     * Verifica credenciais do usuário
     * Compatível com senha em texto plano e bcrypt
     */
    public function authenticate(string $email, string $password): ?array
    {
        $user = $this->getByEmail($email);

        if (!$user) {
            return null;
        }

        if (!$this->verifyPassword($password, $user)) {
            return null;
        }

        $this->rehashPasswordIfNeeded($user, $password);

        unset($user['password']);

        return $user;
    }

    /**
     * Mantém compatibilidade com código antigo
     */
    public function findByEmail(string $email)
    {
        return $this->getByEmail($email);
    }

    /* ==========================
       Métodos auxiliares
       ========================== */

    private function validateUserData(string $email, string $password, string $role): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Email inválido');
        }

        if (strlen($password) < 6) {
            throw new Exception('Senha deve ter no mínimo 6 caracteres');
        }

        if (!in_array($role, self::ROLES, true)) {
            throw new Exception('Role inválido. Use: admin ou customer');
        }
    }

    private function verifyPassword(string $password, array $user): bool
    {
        if (password_verify($password, $user['password'])) {
            return true;
        }

        return $user['password'] === $password;
    }

    private function rehashPasswordIfNeeded(array $user, string $password): void
    {
        if (
            $user['password'] === $password &&
            !password_needs_rehash($user['password'], PASSWORD_BCRYPT)
        ) {
            $hashed = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $this->pdo->prepare(
                'UPDATE users SET password = :password WHERE id = :id'
            );

            $stmt->execute([
                ':password' => $hashed,
                ':id'       => $user['id']
            ]);
        }
    }
}
