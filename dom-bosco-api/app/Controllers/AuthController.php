<?php

require_once __DIR__ . '/../Models/User.php';

class AuthController
{
    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'E-mail e senha são obrigatórios']);
            return;
        }

        $userModel = new User();
        $user = $userModel->findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Credenciais inválidas']);
            return;
        }

        unset($user['password']);

        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    }
}
