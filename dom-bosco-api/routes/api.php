<?php

/**
 * API Routes - Dom Bosco API
 * Versão Laravel-style com namespaces e middleware
 */

// Desabilitar display de erros HTML
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/../app/Http/Controllers/Api/AuthController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/ProductController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/OrderController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/SettingsController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/Admin/ProductController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/Admin/UserController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/Admin/OrderController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/Admin/EmailLogController.php';
require_once __DIR__ . '/../app/Http/Controllers/Api/ImageController.php';
require_once __DIR__ . '/../app/Http/Middleware/Cors.php';
require_once __DIR__ . '/../config/database.php';

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\EmailLogController as AdminEmailLogController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Middleware\Cors;

try {

// Aplicar CORS em todas as requisições
Cors::handle();

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

$authController         = new AuthController();
$productController      = new ProductController();
$orderController        = new OrderController();
$settingsController     = new SettingsController();
$adminProductController = new AdminProductController();
$adminUserController    = new AdminUserController();
$adminEmailLogController = new AdminEmailLogController();
$adminOrderController   = new AdminOrderController();
$imageController        = new ImageController();


if ($method === 'POST' && $uri === '/api/register') {
    $authController->register();
    exit;
}

if ($method === 'POST' && $uri === '/api/login') {
    $authController->login();
    exit;
}

if ($method === 'POST' && $uri === '/api/forgot-password') {
    $authController->forgotPassword();
    exit;
}

if ($method === 'POST' && $uri === '/api/reset-password') {
    $authController->resetPassword();
    exit;
}

if ($method === 'PUT' && $uri === '/api/change-password') {
    $authController->changePassword();
    exit;
}

if ($method === 'GET' && $uri === '/api/products') {
    $productController->index();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/products/(\d+)$#', $uri, $matches)) {
    $productController->show((int) $matches[1]);
    exit;
}

if ($method === 'POST' && $uri === '/api/orders') {
    $orderController->store();
    exit;
}

if ($method === 'GET' && $uri === '/api/my-orders') {
    require __DIR__ . '/api/my-orders.php';
    exit;
}

if ($method === 'GET' && $uri === '/api/settings') {
    $settingsController->index();
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

if ($method === 'PUT' && preg_match('#^/api/admin/products/(\d+)$#', $uri, $matches)) {
    $adminProductController->update((int) $matches[1]);
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/admin/products/(\d+)$#', $uri, $matches)) {
    $adminProductController->destroy((int) $matches[1]);
    exit;
}


if ($method === 'GET' && $uri === '/api/admin/users') {
    $adminUserController->index();
    exit;
}

if ($method === 'POST' && $uri === '/api/admin/users') {
    $adminUserController->store();
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/admin/users/(\d+)$#', $uri, $matches)) {
    $adminUserController->update((int) $matches[1]);
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/admin/users/(\d+)$#', $uri, $matches)) {
    $adminUserController->destroy((int) $matches[1]);
    exit;
}


if ($method === 'GET' && $uri === '/api/admin/orders') {
    $adminOrderController->index();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/admin/orders/(\d+)$#', $uri, $matches)) {
    $adminOrderController->show((int) $matches[1]);
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/admin/orders/(\d+)/status$#', $uri, $matches)) {
    $adminOrderController->updateStatus((int) $matches[1]);
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/admin/orders/(\d+)/tracking-status$#', $uri, $matches)) {
    $adminOrderController->updateTrackingStatus((int) $matches[1]);
    exit;
}


if ($method === 'GET' && $uri === '/api/admin/email-logs') {
    $adminEmailLogController->index();
    exit;
}

if ($method === 'GET' && $uri === '/api/admin/email-logs/statistics') {
    $adminEmailLogController->statistics();
    exit;
}

if ($method === 'GET' && $uri === '/api/admin/email-logs/failed') {
    $adminEmailLogController->failed();
    exit;
}

if ($method === 'GET' && $uri === '/api/admin/email-logs/by-recipient') {
    $adminEmailLogController->getByRecipient();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/admin/email-logs/order/(\d+)$#', $uri, $matches)) {
    $adminEmailLogController->getByOrder((int) $matches[1]);
    exit;
}


if ($method === 'PUT' && $uri === '/api/settings') {
    $settingsController->update();
    exit;
}

if ($method === 'PUT' && $uri === '/api/admin/settings') {
    $settingsController->update();
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

if ($method === 'DELETE' && preg_match('#^/api/admin/products/(\d+)/images/(.+)$#', $uri, $m)) {
    $imageController->delete(
        (int) $m[1],
        urldecode($m[2])
    );
    exit;
}

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

if ($method === 'GET' && $uri === '/api/admin/inventory') {
    $inventoryController->index();
    exit;
}

if ($method === 'GET' && $uri === '/api/admin/inventory/low-stock') {
    $inventoryController->lowStock();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/admin/inventory/(\d+)$#', $uri, $m)) {
    $inventoryController->show((int) $m[1]);
    exit;
}

if ($method === 'POST' && $uri === '/api/admin/inventory') {
    $inventoryController->store();
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/admin/inventory/(\d+)$#', $uri, $m)) {
    $inventoryController->update((int) $m[1]);
    exit;
}

if ($method === 'POST' && preg_match('#^/api/admin/inventory/(\d+)/increment$#', $uri, $m)) {
    $inventoryController->increment((int) $m[1]);
    exit;
}

if ($method === 'POST' && preg_match('#^/api/admin/inventory/(\d+)/decrement$#', $uri, $m)) {
    $inventoryController->decrement((int) $m[1]);
    exit;
}

if ($method === 'PATCH' && preg_match('#^/api/admin/inventory/(\d+)/min-quantity$#', $uri, $m)) {
    $inventoryController->updateMinQuantity((int) $m[1]);
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/admin/inventory/(\d+)$#', $uri, $m)) {
    $inventoryController->delete((int) $m[1]);
    exit;
}

http_response_code(404);
echo json_encode([
    'error' => 'Rota não encontrada'
]);

} catch (Throwable $e) {
    error_log("Erro fatal na API: " . $e->getMessage() . " em " . $e->getFile() . ":" . $e->getLine());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}
