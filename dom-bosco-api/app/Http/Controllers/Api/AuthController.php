<?php

namespace App\Http\Controllers\Api;

require_once __DIR__ . '/../../../Models/User.php';
require_once __DIR__ . '/../../../Utils/JWT.php';
require_once __DIR__ . '/../../Response.php';
require_once __DIR__ . '/../../../Services/EmailService.php';

use App\Http\Response;
use App\Utils\JWT;

class AuthController
{
    private \User $userModel;

    public function __construct()
    {
        $this->userModel = new \User();
    }

    
    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            Response::error('Nome, email e senha são obrigatórios');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Email inválido');
        }

        if (strlen($data['password']) < 6) {
            Response::error('Senha deve ter no mínimo 6 caracteres');
        }

        try {
            $email = strtolower(trim($data['email']));

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

    
    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

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


    public function forgotPassword(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email'])) {
            Response::error('Email é obrigatório');
        }

        $email = strtolower(trim($data['email']));

        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            Response::success(['sent' => true], 'Se o email existir, um link foi enviado');
        }

        $token = bin2hex(random_bytes(32));
        $expires = time() + 3600; 

        try {
            $pdo = \Database::connection();
            $stmt = $pdo->prepare('INSERT INTO password_resets (email, token, expires_at, created_at) VALUES (:email, :token, :expires_at, datetime(\'now\'))');
            $stmt->execute([
                ':email' => $email,
                ':token' => $token,
                ':expires_at' => $expires
            ]);

            $emailService = new \App\Services\EmailService();
            $name = $user['name'] ?? 'Cliente';
            $emailService->sendPasswordReset($email, $name, $token);

            Response::success(['sent' => true], 'Se o email existir, um link foi enviado');
        } catch (\Exception $e) {
            Response::error('Erro ao processar solicitação');
        }
    }

 
    public function resetPassword(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['token']) || empty($data['password'])) {
            Response::error('Token e nova senha são obrigatórios');
        }

        $token = $data['token'];
        $newPassword = $data['password'];

        try {
            $pdo = \Database::connection();
            $stmt = $pdo->prepare('SELECT email, expires_at FROM password_resets WHERE token = :token LIMIT 1');
            $stmt->execute([':token' => $token]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$row) {
                Response::error('Token inválido ou expirado', 400);
            }

            if ((int)$row['expires_at'] < time()) {
                Response::error('Token expirado', 400);
            }

            $email = $row['email'];
            $user = $this->userModel->findByEmail($email);

            if (!$user) {
                Response::error('Usuário não encontrado', 404);
            }

            $this->userModel->setPassword((int)$user['id'], $newPassword);

            $del = $pdo->prepare('DELETE FROM password_resets WHERE token = :token');
            $del->execute([':token' => $token]);

            Response::success(['updated' => true], 'Senha atualizada com sucesso');
        } catch (\Exception $e) {
            Response::error('Erro ao resetar senha');
        }
    }


    public function changePassword(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['current_password']) || empty($data['new_password'])) {
            Response::error('Senha atual e nova senha são obrigatórias');
        }

        $token = \App\Utils\JWT::getTokenFromHeader();

        if (!$token) {
            Response::unauthorized('Token não fornecido');
        }

        $payload = \App\Utils\JWT::verify($token);

        if (!$payload || empty($payload['email'])) {
            Response::unauthorized('Token inválido');
        }

        $email = $payload['email'];
        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            Response::unauthorized('Usuário não encontrado');
        }

        $current = $data['current_password'];
        $new = $data['new_password'];

        $isValid = password_verify($current, $user['password']) || $user['password'] === $current;

        if (!$isValid) {
            Response::error('Senha atual inválida', 400);
        }

        try {
            $this->userModel->setPassword((int)$user['id'], $new);
            Response::success(['changed' => true], 'Senha alterada com sucesso');
        } catch (\Exception $e) {
            Response::error('Erro ao alterar senha');
        }
    }
}
