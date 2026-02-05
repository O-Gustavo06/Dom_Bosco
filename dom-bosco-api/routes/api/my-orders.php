<?php

require_once __DIR__ . '/../../app/Models/Order.php';
require_once __DIR__ . '/../../app/Utils/JWT.php';
require_once __DIR__ . '/../../app/Services/Response.php';

header('Content-Type: application/json');

try {
    $authHeader = '';
    
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
    }
    
    if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Token não fornecido']);
        exit;
    }

    $token = $matches[1];
    $payload = \App\Utils\JWT::verify($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido ou expirado']);
        exit;
    }
    
    $userId = $payload['user_id'] ?? $payload['id'] ?? null;
    
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'ID de usuário não encontrado no token']);
        exit;
    }
    
    $orderModel = new Order();
    
    $orders = $orderModel->getUserOrders($userId);
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    
} catch (Exception $e) {
    error_log("Erro em my-orders.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro ao buscar pedidos',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
