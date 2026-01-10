<?php

require_once __DIR__ . '/../Models/Product.php';

class ProductController
{
 
    public function index(): void
    {
        $product = new Product();
        echo json_encode($product->getAll());
    }

 
    public function show(int $id): void
    {
        $product = new Product();
        $data = $product->getById($id);

        if (!$data) {
            http_response_code(404);
            echo json_encode(['error' => 'Produto não encontrado']);
            return;
        }

        echo json_encode($data);
    }
}
