<?php

namespace App\Http\Controllers\Api\Admin;

require_once __DIR__ . '/../../../../Models/User.php';
require_once __DIR__ . '/../../../Response.php';
require_once __DIR__ . '/../../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../../Middleware/CheckRole.php';

use App\Http\Response;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;

class UserController
{
    private \User $userModel;

    public function __construct()
    {
        $this->userModel = new \User();
    }

    
    public function index(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $users = $this->userModel->getAll();
            Response::json($users);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar usuários: ' . $e->getMessage(), 500);
        }
    }

    
    public function store(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            Response::error('Nome, email e senha são obrigatórios');
        }

        $role = $data['role'] ?? 'customer';

        if (!in_array($role, ['customer', 'admin'], true)) {
            Response::error('Role inválido. Use: customer ou admin');
        }

        try {
            $userId = $this->userModel->create(
                $data['name'],
                $data['email'],
                $data['password'],
                $role
            );

            Response::created([
                'user_id' => $userId
            ], 'Usuário criado com sucesso');

        } catch (\Exception $e) {
            Response::error($e->getMessage());
        }
    }

    
    public function update(int $id): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);

        $existingUser = $this->userModel->getById($id);
        if (!$existingUser) {
            Response::notFound('Usuário não encontrado');
        }

        try {
            $updateData = [];

            if (array_key_exists('name', $data)) {
                $updateData['name'] = $data['name'];
            }

            if (array_key_exists('email', $data)) {
                $updateData['email'] = $data['email'];
            }

            if (array_key_exists('role', $data) && in_array($data['role'], ['customer', 'admin'], true)) {
                $updateData['role'] = $data['role'];
            }

            if (empty($updateData)) {
                Response::error('Nenhum campo para atualizar');
            }

            $this->userModel->update($id, $updateData);

            Response::success(null, 'Usuário atualizado com sucesso');

        } catch (\Exception $e) {
            Response::error($e->getMessage());
        }
    }

    
    public function destroy(int $id): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $existingUser = $this->userModel->getById($id);
        if (!$existingUser) {
            Response::notFound('Usuário não encontrado');
        }

        try {
            $this->userModel->delete($id);

            Response::success(null, 'Usuário deletado com sucesso');

        } catch (\Exception $e) {
            Response::error($e->getMessage());
        }
    }
}
