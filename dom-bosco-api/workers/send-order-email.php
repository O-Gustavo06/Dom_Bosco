<?php


if ($argc < 4) {
    error_log("Uso: php send-order-email.php <order_id> <customer_email> <customer_name>");
    exit(1);
}

$orderId = $argv[1];
$customerEmail = $argv[2];
$customerName = $argv[3];

try {
    
    require_once __DIR__ . '/../app/Services/EmailService.php';
    require_once __DIR__ . '/../app/Models/Order.php';
    
    $orderModel = new Order();
    $emailService = new \App\Services\EmailService();
    
    
    $order = $orderModel->getById((int)$orderId);
    
    if (!$order) {
        throw new Exception("Pedido não encontrado: $orderId");
    }
    
    
    $result = $emailService->sendOrderConfirmation($order, $customerEmail, $customerName);
    
    if ($result) {
        error_log("Email de confirmação enviado com sucesso para: $customerEmail (Pedido #$orderId)");
    } else {
        error_log("Falha ao enviar email para: $customerEmail (Pedido #$orderId)");
    }
    
} catch (Exception $e) {
    error_log("Erro no worker de email: " . $e->getMessage());
    exit(1);
}
