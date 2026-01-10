<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Services/Response.php';

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            Response::json([
                'error' => 'Email e senha são obrigatórios'
            ], 400);
        }

        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || $user['password'] !== $data['password']) {
            Response::json([
                'error' => 'Credenciais inválidas'
            ], 401);
        }

        Response::json([
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role']
        ]);
    }
}
