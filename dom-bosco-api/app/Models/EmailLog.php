<?php

require_once __DIR__ . '/../../config/database.php';

class EmailLog
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }


    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO email_logs (
                recipient_email,
                recipient_name,
                subject,
                email_type,
                order_id,
                status,
                attempts,
                error_message,
                sent_at
            ) VALUES (
                :recipient_email,
                :recipient_name,
                :subject,
                :email_type,
                :order_id,
                :status,
                :attempts,
                :error_message,
                :sent_at
            )
        ");

        $stmt->execute([
            ':recipient_email' => $data['recipient_email'],
            ':recipient_name' => $data['recipient_name'] ?? null,
            ':subject' => $data['subject'],
            ':email_type' => $data['email_type'],
            ':order_id' => $data['order_id'] ?? null,
            ':status' => $data['status'],
            ':attempts' => $data['attempts'] ?? 1,
            ':error_message' => $data['error_message'] ?? null,
            ':sent_at' => $data['sent_at'] ?? date('Y-m-d H:i:s')
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        if (isset($data['status'])) {
            $fields[] = "status = :status";
            $params[':status'] = $data['status'];
        }

        if (isset($data['attempts'])) {
            $fields[] = "attempts = :attempts";
            $params[':attempts'] = $data['attempts'];
        }

        if (isset($data['error_message'])) {
            $fields[] = "error_message = :error_message";
            $params[':error_message'] = $data['error_message'];
        }

        if (isset($data['sent_at'])) {
            $fields[] = "sent_at = :sent_at";
            $params[':sent_at'] = $data['sent_at'];
        }

        if (empty($fields)) {
            return false;
        }

        $stmt = $this->pdo->prepare("
            UPDATE email_logs 
            SET " . implode(', ', $fields) . "
            WHERE id = :id
        ");

        return $stmt->execute($params);
    }


    public function getByRecipient(string $email, int $limit = 50): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                id,
                recipient_email,
                recipient_name,
                subject,
                email_type,
                order_id,
                status,
                attempts,
                error_message,
                sent_at,
                created_at
            FROM email_logs
            WHERE recipient_email = :email
            ORDER BY created_at DESC
            LIMIT :limit
        ");

        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByOrder(int $orderId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                id,
                recipient_email,
                recipient_name,
                subject,
                email_type,
                order_id,
                status,
                attempts,
                error_message,
                sent_at,
                created_at
            FROM email_logs
            WHERE order_id = :order_id
            ORDER BY created_at ASC
        ");

        $stmt->execute([':order_id' => $orderId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAll(array $filters = []): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = "status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['email_type'])) {
            $where[] = "email_type = :email_type";
            $params[':email_type'] = $filters['email_type'];
        }

        if (!empty($filters['start_date'])) {
            $where[] = "DATE(created_at) >= :start_date";
            $params[':start_date'] = $filters['start_date'];
        }

        if (!empty($filters['end_date'])) {
            $where[] = "DATE(created_at) <= :end_date";
            $params[':end_date'] = $filters['end_date'];
        }

        $whereClause = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";
        $limit = $filters['limit'] ?? 100;

        $stmt = $this->pdo->prepare("
            SELECT 
                id,
                recipient_email,
                recipient_name,
                subject,
                email_type,
                order_id,
                status,
                attempts,
                error_message,
                sent_at,
                created_at
            FROM email_logs
            $whereClause
            ORDER BY created_at DESC
            LIMIT :limit
        ");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStatistics(string $period = 'today'): array
    {
        $whereClause = "";
        
        switch ($period) {
            case 'today':
                $whereClause = "WHERE DATE(created_at) = DATE('now')";
                break;
            case 'week':
                $whereClause = "WHERE DATE(created_at) >= DATE('now', '-7 days')";
                break;
            case 'month':
                $whereClause = "WHERE DATE(created_at) >= DATE('now', '-30 days')";
                break;
            case 'year':
                $whereClause = "WHERE DATE(created_at) >= DATE('now', '-365 days')";
                break;
        }

        $stmt = $this->pdo->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                AVG(attempts) as avg_attempts,
                COUNT(DISTINCT recipient_email) as unique_recipients
            FROM email_logs
            $whereClause
        ");

        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $total = $result['total'] ?? 0;
        $sent = $result['sent'] ?? 0;
        $result['success_rate'] = $total > 0 ? round(($sent / $total) * 100, 2) : 0;

        return $result;
    }


    public function getFailedEmails(int $maxAttempts = 3): array
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                id,
                recipient_email,
                recipient_name,
                subject,
                email_type,
                order_id,
                attempts,
                error_message,
                created_at
            FROM email_logs
            WHERE status = 'failed'
            AND attempts < :max_attempts
            ORDER BY created_at ASC
        ");

        $stmt->execute([':max_attempts' => $maxAttempts]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
