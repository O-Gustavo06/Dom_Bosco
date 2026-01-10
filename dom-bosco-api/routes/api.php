<?php

require_once __DIR__ . '/../app/Controllers/ProductController.php';
require_once __DIR__ . '/../app/Controllers/OrderController.php';
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Controllers/AdminProductController.php';
require_once __DIR__ . '/../app/Controllers/AdminUserController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

// CORS - Permite requisições de qualquer origem (ajuste conforme necessário)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$productController = new ProductController();
$orderController   = new OrderController();
$userController    = new UserController();
$adminProductController = new AdminProductController();
$adminUserController = new AdminUserController();

// ==================== PRODUTOS PÚBLICOS ====================

if ($uri === '/api/products' && $method === 'GET') {
    $productController->index();
    exit;
}

if (preg_match('#^/api/products/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $productController->show((int)$matches[1]);
    exit;
}

// ==================== PEDIDOS ====================

if ($uri === '/api/orders' && $method === 'POST') {
    $orderController->store();
    exit;
}

// ==================== AUTENTICAÇÃO ====================

if ($uri === '/api/register' && $method === 'POST') {
    $userController->register();
    exit;
}

if ($uri === '/api/login' && $method === 'POST') {
    $userController->login();
    exit;
}

// ==================== ADMIN - PRODUTOS ====================

if ($uri === '/api/admin/products' && $method === 'GET') {
    $adminProductController->index();
    exit;
}

if ($uri === '/api/admin/products' && $method === 'POST') {
    $adminProductController->store();
    exit;
}

if (preg_match('#^/api/admin/products/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    $adminProductController->update((int)$matches[1]);
    exit;
}

if (preg_match('#^/api/admin/products/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    $adminProductController->delete((int)$matches[1]);
    exit;
}

// ==================== ADMIN - USUÁRIOS ====================

if ($uri === '/api/admin/users' && $method === 'GET') {
    $adminUserController->index();
    exit;
}

if ($uri === '/api/admin/users' && $method === 'POST') {
    $adminUserController->store();
    exit;
}

if (preg_match('#^/api/admin/users/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    $adminUserController->update((int)$matches[1]);
    exit;
}

if (preg_match('#^/api/admin/users/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    $adminUserController->delete((int)$matches[1]);
    exit;
}

// ==================== ROTA NÃO ENCONTRADA ====================

http_response_code(404);
echo json_encode(['error' => 'Rota não encontrada']);

