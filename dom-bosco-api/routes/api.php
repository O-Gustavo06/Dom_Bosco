<?php

require_once __DIR__ . '/../app/Controllers/ProductController.php';
require_once __DIR__ . '/../app/Controllers/OrderController.php';
require_once __DIR__ . '/../app/Controllers/UserController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

$productController = new ProductController();
$orderController   = new OrderController();
$userController    = new UserController();

/*
|--------------------------------------------------------------------------
| Produtos
|--------------------------------------------------------------------------
*/
if ($uri === '/api/products' && $method === 'GET') {
    $productController->index();
    exit;
}

if (preg_match('#^/api/products/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $productController->show((int)$matches[1]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Pedidos
|--------------------------------------------------------------------------
*/
if ($uri === '/api/orders' && $method === 'POST') {
    $orderController->store();
    exit;
}

/*
|--------------------------------------------------------------------------
| Usuários
|--------------------------------------------------------------------------
*/
if ($uri === '/api/register' && $method === 'POST') {
    $userController->register();
    exit;
}

if ($uri === '/api/login' && $method === 'POST') {
    $userController->login();
    exit;
}

/*
|--------------------------------------------------------------------------
| ADMIN - Atualizar Imagens (TEMPORÁRIO)
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| Rota não encontrada
|--------------------------------------------------------------------------
*/
http_response_code(404);
echo json_encode(['error' => 'Rota não encontrada']);
