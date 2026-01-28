<?php

namespace App\Http\Controllers\Api;

require_once __DIR__ . '/../../../Models/User.php';
require_once __DIR__ . '/../../../Utils/JWT.php';
require_once __DIR__ . '/../../Response.php';

use App\Http\Response;
use App\Utils\JWT;

class AuthController
{
    private \User $userModel;

    public function __construct()
    {
        $this->userModel = new \User();
    }

    /**
     * Registro de novo usuário
     * POST /api/register
     */
    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validação de campos obrigatórios
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            Response::error('Nome, email e senha são obrigatórios');
        }

        // Validação de email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido');
        }

        // Validação de senha
        if (strlen($data['password']) < 6) {
            Response::error('Senha deve ter no mínimo 6 caracteres');
        }

        try {
            $email = strtolower(trim($data['email']));
            
            // Define role baseado no email
            $role = str_ends_with($email, '@papelaria.com') ? 'admin' : 'customer';

            $userId = $this->userModel->create(
                trim($data['name']),
                $email,
                $data['password'],
                $role
            );

            $user = $this->userModel->getById($userId);

            $token = JWT::generate([
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role']
            ]);

            http_response_code(201);
            Response::json([
                'message' => 'Usuário criado com sucesso',
                'user_id' => $userId,
                'token'   => $token,
                'user'    => $user
            ]);

        } catch (\Exception $e) {
            Response::error($e->getMessage());
        }
    }

    /**
     * Login de usuário
     * POST /api/login
     */
    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validação de campos obrigatórios
        if (empty($data['email']) || empty($data['password'])) {
            Response::error('Email e senha são obrigatórios');
        }

        $user = $this->userModel->authenticate(
            strtolower(trim($data['email'])),
            $data['password']
        );

        if (!$user) {
            Response::unauthorized('Credenciais inválidas');
        }

        $token = JWT::generate([
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role']
        ]);

        Response::json([
            'message' => 'Login realizado com sucesso',
            'token'   => $token,
            'user'    => $user
        ]);
    }
}
