<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Utils/JWT.php';

class AuthController
{
    private User $user;

    public function __construct()
    {
        $this->user = new User();
    }

    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

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

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email inválido']);
            return;
        }

        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Senha deve ter no mínimo 6 caracteres'
            ]);
            return;
        }

        try {
            $userId = $this->user->create(
                trim($data['name']),
                strtolower(trim($data['email'])),
                $data['password'],
                'user'
            );

            $user = $this->user->getById($userId);

            $token = JWT::generate([
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role']
            ]);

            http_response_code(201);
            echo json_encode([
                'message' => 'Usuário criado com sucesso',
                'user_id' => $userId,
                'token'   => $token,
                'user'    => $user
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            empty($data['email']) ||
            empty($data['password'])
        ) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Email e senha são obrigatórios'
            ]);
            return;
        }

        $user = $this->user->authenticate(
            strtolower(trim($data['email'])),
            $data['password']
        );

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'error' => 'Credenciais inválidas'
            ]);
            return;
        }

        $token = JWT::generate([
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role']
        ]);

        echo json_encode([
            'message' => 'Login realizado com sucesso',
            'token'   => $token,
            'user'    => $user
        ]);
    }
}
