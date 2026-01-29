<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Utils/JWT.php';


use JWT;

class AdminUserController
{
    private User $user;

    public function __construct()
    {
        $this->user = new User();
    }

    
    private function ensureAdmin(): array
    {
        $token = JWT::getTokenFromHeader();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Token não fornecido']);
            exit;
        }

        $payload = JWT::verify($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido ou expirado']);
            exit;
        }

        if (($payload['role'] ?? null) !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso permitido apenas para administradores']);
            exit;
        }

        return $payload;
    }

    
    public function index(): void
    {
        $this->ensureAdmin();

        $users = $this->user->getAll();

        echo json_encode($users);
    }

    
    public function store(): void
    {
        $this->ensureAdmin();

        $rawInput = file_get_contents('php://input');
        $data     = json_decode($rawInput, true);

        if (
            empty($data['name']) ||
            empty($data['email']) ||
            empty($data['password'])
        ) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Nome, email e senha são obrigatórios'
            ]);
            return;
        }

        $role = $data['role'] ?? 'customer';

        if ($role === 'admin') {
            $this->ensureAdmin();
        }

        if (!in_array($role, ['customer', 'admin'], true)) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Role inválido. Use: customer ou admin'
            ]);
            return;
        }

        try {
            $userId = $this->user->create(
                $data['name'],
                $data['email'],
                $data['password'],
                $role
            );

            http_response_code(201);
            echo json_encode([
                'message' => 'Usuário criado com sucesso',
                'user_id' => $userId
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }

    
    public function update(int $id): void
    {
        $this->ensureAdmin();

        $rawInput = file_get_contents('php://input');
        $data     = json_decode($rawInput, true);

        $user = $this->user->getById($id);

        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'error' => 'Usuário não encontrado'
            ]);
            return;
        }

        try {
            $updateData = [];

            if (array_key_exists('name', $data)) {
                $updateData['name'] = $data['name'];
            }

            if (array_key_exists('email', $data)) {
                $updateData['email'] = $data['email'];
            }

            if (
                array_key_exists('role', $data) &&
                in_array($data['role'], ['customer', 'admin'], true)
            ) {
                $updateData['role'] = $data['role'];
            }

            if (empty($updateData)) {
                http_response_code(400);
                echo json_encode([
                    'error' => 'Nenhum campo para atualizar'
                ]);
                return;
            }

            $this->user->update($id, $updateData);

            echo json_encode([
                'message' => 'Usuário atualizado com sucesso'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }

    
    public function delete(int $id): void
    {
        $this->ensureAdmin();

        $user = $this->user->getById($id);

        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'error' => 'Usuário não encontrado'
            ]);
            return;
        }

        try {
            $this->user->delete($id);

            echo json_encode([
                'message' => 'Usuário deletado com sucesso'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }
}
