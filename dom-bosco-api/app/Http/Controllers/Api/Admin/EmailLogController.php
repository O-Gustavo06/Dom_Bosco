<?php

namespace App\Http\Controllers\Api\Admin;

require_once __DIR__ . '/../../../../Models/EmailLog.php';
require_once __DIR__ . '/../../../../Services/Response.php';
require_once __DIR__ . '/../../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../../Middleware/CheckRole.php';

use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;

class EmailLogController
{
    private \EmailLog $emailLogModel;

    public function __construct()
    {
        $this->emailLogModel = new \EmailLog();
    }


    public function index(): void
    {
        $user = Authenticate::handle();
        CheckRole::handle($user, 'admin');

        $filters = [
            'status' => $_GET['status'] ?? null,
            'email_type' => $_GET['email_type'] ?? null,
            'start_date' => $_GET['start_date'] ?? null,
            'end_date' => $_GET['end_date'] ?? null,
            'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : 100
        ];

        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });

        $logs = $this->emailLogModel->getAll($filters);

        \Response::json([
            'logs' => $logs,
            'total' => count($logs)
        ], 200);
    }


    public function statistics(): void
    {
        $user = Authenticate::handle();
        CheckRole::handle($user, 'admin');

        $period = $_GET['period'] ?? 'today';

        $stats = $this->emailLogModel->getStatistics($period);

        \Response::json([
            'period' => $period,
            'statistics' => $stats
        ], 200);
    }


    public function getByOrder(int $orderId): void
    {
        $user = Authenticate::handle();
        CheckRole::handle($user, 'admin');

        $logs = $this->emailLogModel->getByOrder($orderId);

        \Response::json([
            'order_id' => $orderId,
            'logs' => $logs,
            'total' => count($logs)
        ], 200);
    }

    public function getByRecipient(): void
    {
        $user = Authenticate::handle();
        CheckRole::handle($user, 'admin');

        $email = $_GET['email'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

        if (!$email) {
            \Response::error('E-mail do destinatário é obrigatório', 400);
            return;
        }

        $logs = $this->emailLogModel->getByRecipient($email, $limit);

        \Response::json([
            'recipient_email' => $email,
            'logs' => $logs,
            'total' => count($logs)
        ], 200);
    }

    public function failed(): void
    {
        $user = Authenticate::handle();
        CheckRole::handle($user, 'admin');

        $maxAttempts = isset($_GET['max_attempts']) ? (int)$_GET['max_attempts'] : 3;

        $failedEmails = $this->emailLogModel->getFailedEmails($maxAttempts);

        \Response::json([
            'failed_emails' => $failedEmails,
            'total' => count($failedEmails)
        ], 200);
    }
}
