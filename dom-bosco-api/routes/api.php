<?php

require_once __DIR__ . '/../app/Controllers/ProductController.php';
require_once __DIR__ . '/../app/Controllers/OrderController.php';
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Controllers/AdminProductController.php';
require_once __DIR__ . '/../app/Controllers/ImageController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

$productController = new ProductController();
$orderController   = new OrderController();
$userController    = new UserController();
$adminProductController = new AdminProductController();
$imageController = new ImageController();


if ($uri === '/api/products' && $method === 'GET') {
    $productController->index();
    exit;
}

if (preg_match('#^/api/products/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $productController->show((int)$matches[1]);
    exit;
}


if ($uri === '/api/orders' && $method === 'POST') {
    $orderController->store();
    exit;
}


if ($uri === '/api/register' && $method === 'POST') {
    $userController->register();
    exit;
}

if ($uri === '/api/login' && $method === 'POST') {
    $userController->login();
    exit;
}


if ($uri === '/api/admin/update-images' && $method === 'POST') {
    require_once __DIR__ . '/../config/database.php';
    
    $pdo = Database::connect();
    $updates = [
        27 => 'caderno-brochura.jpg',
        31 => 'lapis-preto.jpg',
        37 => 'mochila-escolar.jpg',
        51 => 'organizador-mesa.jpg',
    ];
    
    $results = [];
    foreach ($updates as $productId => $imageName) {
        $sql = "UPDATE products SET image = :image WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':image' => $imageName,
            ':id' => $productId
        ]);
        $results[] = "Produto ID $productId atualizado com: $imageName";
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Imagens atualizadas com sucesso!',
        'details' => $results
    ]);
    exit;
}

if ($uri === '/api/admin/products' && $method === 'GET') {
    $adminProductController->index();
    return;
}

if ($uri === '/api/admin/products' && $method === 'POST') {
    $adminProductController->store();
    return;
}

if (preg_match('#^/api/admin/products/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    $adminProductController->update((int) $matches[1]);
    return;
}

if (preg_match('#^/api/admin/products/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    $adminProductController->delete((int) $matches[1]);
    return;
}

// ==================== ADMIN - IMAGENS ====================

require_once __DIR__ . '/../app/Controllers/ImageController.php';
$imageController = new ImageController();

if ($uri === '/api/admin/images/upload' && $method === 'POST') {
    header('Content-Type: application/json');
    $imageController->upload();
    exit;
}

if (preg_match('#^/api/admin/products/(\d+)/images$#', $uri, $matches) && $method === 'GET') {
    $imageController->getByProductId((int)$matches[1]);
    exit;
}

if (preg_match('#^/api/admin/images/(\d+)/(.+)$#', $uri, $matches) && $method === 'DELETE') {
    $imageController->delete((int)$matches[1], urldecode($matches[2]));
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Rota não encontrada']);
