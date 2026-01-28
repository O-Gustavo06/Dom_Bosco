<?php

namespace App\Http\Controllers\Api\Admin;

require_once __DIR__ . '/../../../../Models/Order.php';
require_once __DIR__ . '/../../../Response.php';
require_once __DIR__ . '/../../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../../Middleware/CheckRole.php';

use App\Http\Response;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;

class OrderController
{
    private \Order $orderModel;

    public function __construct()
    {
        $this->orderModel = new \Order();
    }

    /**
     * Listar todos os pedidos com filtros
     * GET /api/admin/orders?filter=today|week|month|year&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     */
    public function index(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $filter = $_GET['filter'] ?? 'all';
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;

            $orders = $this->orderModel->getAllWithFilters($filter, $startDate, $endDate);
            $statistics = $this->orderModel->getStatistics($filter, $startDate, $endDate);

            Response::json([
                'orders' => $orders,
                'statistics' => $statistics
            ], 200);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Buscar detalhes de um pedido específico
     * GET /api/admin/orders/:id
     */
    public function show(int $id): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $order = $this->orderModel->getById($id);
            
            if (!$order) {
                Response::error('Pedido não encontrado', 404);
                return;
            }

            Response::json($order, 200);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Atualizar status de um pedido
     * PUT /api/admin/orders/:id/status
     */
    public function updateStatus(int $id): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['status'])) {
                Response::error('Status é obrigatório', 400);
                return;
            }

            $validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!in_array($data['status'], $validStatuses)) {
                Response::error('Status inválido', 400);
                return;
            }

            $success = $this->orderModel->updateStatus($id, $data['status']);
            
            if ($success) {
                Response::json(['message' => 'Status atualizado com sucesso'], 200);
            } else {
                Response::error('Erro ao atualizar status', 500);
            }
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
