<?php

require_once __DIR__ . '/../Models/User.php';

class UserController
{
    private User $user;

    public function __construct()
    {
        $this->user = new User();
    }

    public function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            empty($data['name']) ||
            empty($data['email']) ||
            empty($data['password'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados inválidos']);
            return;
        }

        $userId = $this->user->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'role'     => 'customer'
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Usuário criado com sucesso',
            'user_id' => $userId
        ]);
    }

    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            empty($data['email']) ||
            empty($data['password'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Credenciais inválidas']);
            return;
        }

        $user = $this->user->findByEmail($data['email']);

        if (!$user || $user['password'] !== $data['password']) {
            http_response_code(401);
            echo json_encode(['error' => 'Email ou senha inválidos']);
            return;
        }

        echo json_encode([
            'message' => 'Login realizado com sucesso',
            'user' => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role']
            ]
        ]);
    }
}
