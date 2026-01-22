<?php

require_once __DIR__ . '/../app/Controllers/ProductController.php';
require_once __DIR__ . '/../app/Controllers/OrderController.php';
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Controllers/AdminProductController.php';
require_once __DIR__ . '/../app/Controllers/AdminUserController.php';
require_once __DIR__ . '/../app/Controllers/SettingsController.php';
require_once __DIR__ . '/../app/Controllers/ImageController.php';
require_once __DIR__ . '/../app/Controllers/InventoryController.php';
require_once __DIR__ . '/../config/database.php';

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');


$productController      = new ProductController();
$orderController        = new OrderController();
$userController         = new UserController();
$adminProductController = new AdminProductController();
$adminUserController    = new AdminUserController();
$settingsController     = new SettingsController();
$imageController        = new ImageController();
$inventoryController    = new InventoryController();

// Rotas de admin para usuários
if ($method === 'GET' && $uri === '/api/admin/users') {
    $adminUserController->index();
    exit;
}
if ($method === 'POST' && $uri === '/api/admin/users') {
    $adminUserController->store();
    exit;
}
if ($method === 'PUT' && preg_match('#^/api/admin/users/(\d+)$#', $uri, $m)) {
    $adminUserController->update((int) $m[1]);
    exit;
}
if ($method === 'DELETE' && preg_match('#^/api/admin/users/(\d+)$#', $uri, $m)) {
    $adminUserController->delete((int) $m[1]);
    exit;
}

// Rotas de admin para configurações
if ($method === 'GET' && $uri === '/api/settings') {
    $settingsController->index();
    exit;
}
if ($method === 'PUT' && $uri === '/api/settings') {
    $settingsController->update();
    exit;
}

if ($method === 'GET' && $uri === '/api/products') {
    $productController->index();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/products/(\d+)$#', $uri, $m)) {
    $productController->show((int) $m[1]);
    exit;
}

if ($method === 'POST' && $uri === '/api/orders') {
    $orderController->store();
    exit;
}

if ($method === 'POST' && $uri === '/api/register') {
    $userController->register();
    exit;
}

if ($method === 'POST' && $uri === '/api/login') {
    $userController->login();
    exit;
}


if ($method === 'GET' && $uri === '/api/admin/products') {
    $adminProductController->index();
    exit;
}

if ($method === 'POST' && $uri === '/api/admin/products') {
    $adminProductController->store();
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/admin/products/(\d+)$#', $uri, $m)) {
    $adminProductController->update((int) $m[1]);
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/admin/products/(\d+)$#', $uri, $m)) {
    $adminProductController->delete((int) $m[1]);
    exit;
}


if ($method === 'POST' && $uri === '/api/admin/images/upload') {
    $imageController->upload();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/admin/products/(\d+)/images$#', $uri, $m)) {
    $imageController->getByProductId((int) $m[1]);
    exit;
}

// Rota mais específica primeiro: /api/admin/products/{id}/images/{filename}
if ($method === 'DELETE' && preg_match('#^/api/admin/products/(\d+)/images/(.+)$#', $uri, $m)) {
    $imageController->delete(
        (int) $m[1],
        urldecode($m[2])
    );
    exit;
}

// Rota alternativa: /api/admin/images/{id}/{filename}
if ($method === 'DELETE' && preg_match('#^/api/admin/images/(\d+)/(.+)$#', $uri, $m)) {
    $imageController->delete(
        (int) $m[1],
        urldecode($m[2])
    );
    exit;
}


if ($method === 'POST' && $uri === '/api/admin/update-images') {
    $pdo = Database::connect();

    $updates = [
        27 => 'caderno-brochura.jpg',
        31 => 'lapis-preto.jpg',
        37 => 'mochila-escolar.jpg',
        51 => 'organizador-mesa.jpg',
    ];

    $results = [];

    foreach ($updates as $productId => $imageName) {
        $stmt = $pdo->prepare(
            'UPDATE products SET image = :image WHERE id = :id'
        );

        $stmt->execute([
            ':image' => $imageName,
            ':id'    => $productId
        ]);

        $results[] = "Produto ID {$productId} atualizado com: {$imageName}";
    }

    echo json_encode([
        'success' => true,
        'message' => 'Imagens atualizadas com sucesso!',
        'details' => $results
    ]);

    exit;
}

// ======================================
// ROTAS DE INVENTÁRIO (ADMIN)
// ======================================

// GET /api/admin/inventory - Lista todos os estoques
if ($method === 'GET' && $uri === '/api/admin/inventory') {
    $inventoryController->index();
    exit;
}

// GET /api/admin/inventory/low-stock - Produtos com estoque baixo
if ($method === 'GET' && $uri === '/api/admin/inventory/low-stock') {
    $inventoryController->lowStock();
    exit;
}

// GET /api/admin/inventory/{productId} - Estoque de um produto
if ($method === 'GET' && preg_match('#^/api/admin/inventory/(\d+)$#', $uri, $m)) {
    $inventoryController->show((int) $m[1]);
    exit;
}

// POST /api/admin/inventory - Criar registro de estoque
if ($method === 'POST' && $uri === '/api/admin/inventory') {
    $inventoryController->store();
    exit;
}

// PUT /api/admin/inventory/{productId} - Atualizar quantidade
if ($method === 'PUT' && preg_match('#^/api/admin/inventory/(\d+)$#', $uri, $m)) {
    $inventoryController->update((int) $m[1]);
    exit;
}

// POST /api/admin/inventory/{productId}/increment - Adicionar estoque
if ($method === 'POST' && preg_match('#^/api/admin/inventory/(\d+)/increment$#', $uri, $m)) {
    $inventoryController->increment((int) $m[1]);
    exit;
}

// POST /api/admin/inventory/{productId}/decrement - Remover estoque
if ($method === 'POST' && preg_match('#^/api/admin/inventory/(\d+)/decrement$#', $uri, $m)) {
    $inventoryController->decrement((int) $m[1]);
    exit;
}

// PATCH /api/admin/inventory/{productId}/min-quantity - Atualizar quantidade mínima
if ($method === 'PATCH' && preg_match('#^/api/admin/inventory/(\d+)/min-quantity$#', $uri, $m)) {
    $inventoryController->updateMinQuantity((int) $m[1]);
    exit;
}

// DELETE /api/admin/inventory/{productId} - Deletar estoque
if ($method === 'DELETE' && preg_match('#^/api/admin/inventory/(\d+)$#', $uri, $m)) {
    $inventoryController->delete((int) $m[1]);
    exit;
}


http_response_code(404);
echo json_encode([
    'error' => 'Rota não encontrada'
]);
