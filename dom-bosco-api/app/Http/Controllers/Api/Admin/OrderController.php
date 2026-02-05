<?php

namespace App\Http\Controllers\Api\Admin;

require_once __DIR__ . '/../../../../Models/Order.php';
require_once __DIR__ . '/../../../Response.php';
require_once __DIR__ . '/../../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../../Middleware/CheckRole.php';
require_once __DIR__ . '/../../../../Services/EmailService.php';

use App\Http\Response;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;
use App\Services\EmailService;

class OrderController
{
    private \Order $orderModel;

    public function __construct()
    {
        $this->orderModel = new \Order();
    }

    
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

    
    public function updateTrackingStatus(int $id): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['tracking_status'])) {
                Response::error('Status de rastreamento é obrigatório', 400);
                return;
            }

            $validStatuses = ['analise_pendente', 'separando', 'pronto_envio', 'a_caminho', 'entregue', 'cancelado'];
            if (!in_array($data['tracking_status'], $validStatuses)) {
                Response::error('Status de rastreamento inválido', 400);
                return;
            }

            $success = $this->orderModel->updateTrackingStatus($id, $data['tracking_status']);
            
            if ($success) {
                try {
                    $order = $this->orderModel->getById($id);
                    
                    if ($order && !empty($order['user_email'])) {
                        $emailService = new EmailService();
                        $emailService->sendStatusUpdate(
                            $order,
                            $order['user_email'],
                            $order['user_name'] ?? 'Cliente',
                            $data['tracking_status']
                        );
                    }
                } catch (\Exception $emailError) {
                    error_log("Aviso: Falha ao enviar e-mail de atualização: " . $emailError->getMessage());
                }
                
                Response::json(['message' => 'Status de rastreamento atualizado com sucesso'], 200);
            } else {
                Response::error('Erro ao atualizar status de rastreamento', 500);
            }
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
