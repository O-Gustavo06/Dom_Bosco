<?php

namespace App\Http\Controllers\Api;

require_once __DIR__ . '/../../../Models/User.php';
require_once __DIR__ . '/../../../Utils/JWT.php';
require_once __DIR__ . '/../../Response.php';
require_once __DIR__ . '/../../../Utils/Logger.php';

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

        if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['birthdate'])) {
            Response::error('Nome, email, senha e data de aniversário são obrigatórios');
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

            $birthdate = $this->normalizeBirthdate($data['birthdate']);

            if (!$birthdate) {
                Response::error('Data de aniversário inválida');
            }

            $userId = $this->userModel->create(
                trim($data['name']),
                $email,
                $data['password'],
                $birthdate,
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
        $rawInput = file_get_contents('php://input');
        $logger = new \Logger('debug_sql.log');
        $logger->info('forgotPassword raw input', ['raw_prefix' => substr($rawInput, 0, 200)]);
        $data = json_decode($rawInput, true);

        if (empty($data['email']) || empty($data['birthdate']) || empty($data['new_password'])) {
            Response::error('Email, data de aniversário e nova senha são obrigatórios');
        }

        $email = strtolower(trim($data['email']));
        $birthdate = $this->normalizeBirthdate($data['birthdate']);

        if (!$birthdate) {
            Response::error('Data de aniversário inválida');
        }

        try {
            $user = $this->userModel->findByEmailAndBirthdate($email, $birthdate);

            if (!$user) {
                Response::error('Dados inválidos', 400);
            }

            try {
                $this->userModel->setPassword((int) $user['id'], $data['new_password']);
                Response::success(['updated' => true], 'Senha atualizada com sucesso');
            } catch (\PDOException $e) {
                // Fallback: open a fresh PDO connection directly to the SQLite file
                try {
                    $dbPath = realpath(__DIR__ . '/../../../../BANCO.db');
                    if ($dbPath && file_exists($dbPath)) {
                        $pdo2 = new \PDO('sqlite:' . $dbPath);
                        $pdo2->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                        $hash = password_hash($data['new_password'], PASSWORD_BCRYPT);
                        $stmt2 = $pdo2->prepare('UPDATE users SET password = ? WHERE id = ?');
                        $stmt2->bindValue(1, $hash, \PDO::PARAM_STR);
                        $stmt2->bindValue(2, (int)$user['id'], \PDO::PARAM_INT);
                        $ok = $stmt2->execute();
                        if ($ok) {
                            Response::success(['updated' => true], 'Senha atualizada com sucesso (fallback)');
                        }
                    }
                } catch (\Exception $ex) {
                    // ignore and fall through to error response below
                }

                // Rethrow original exception so caller sees failure if fallback didn't work
                throw $e;
            }
        } catch (\Exception $e) {
            Response::error('Erro ao atualizar senha: ' . $e->getMessage());
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

    private function normalizeBirthdate(string $birthdate): ?string
    {
        $birthdate = trim($birthdate);
        $dt = \DateTime::createFromFormat('d/m/Y', $birthdate);

        if (!$dt || $dt->format('d/m/Y') !== $birthdate) {
            return null;
        }

        return $dt->format('Y-m-d');
    }
}
