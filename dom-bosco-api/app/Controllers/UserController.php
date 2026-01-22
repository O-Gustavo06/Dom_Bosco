<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Utils/JWT.php';

class UserController
{
    private User $user;

    public function __construct()
    {
        $this->user = new User();
    }

    /**
     * Cadastro de usuário
     * - Emails @papelaria.com => admin
     * - Demais emails => customer
     */
    public function register(): void
    {
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

        $email = strtolower(trim($data['email']));
        $role  = str_ends_with($email, '@papelaria.com') ? 'admin' : 'customer';

        try {
            $userId = $this->user->create(
                $data['name'],
                $email,
                $data['password'],
                $role
            );

            http_response_code(201);
            echo json_encode([
                'message' => 'Usuário criado com sucesso',
                'user'    => [
                    'id'    => $userId,
                    'name'  => $data['name'],
                    'email' => $email,
                    'role'  => $role
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Login - Retorna JWT
     */
    public function login(): void
    {
        $rawInput = file_get_contents('php://input');
        $data     = json_decode($rawInput, true);

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

        $email = strtolower(trim($data['email']));

        try {
            $user = $this->user->authenticate($email, $data['password']);

            if (!$user) {
                http_response_code(401);
                echo json_encode([
                    'error' => 'Email ou senha inválidos'
                ]);
                return;
            }

            $token = JWT::generate([
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role']
            ]);

            http_response_code(200);
            echo json_encode([
                'message' => 'Login realizado com sucesso',
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
}
