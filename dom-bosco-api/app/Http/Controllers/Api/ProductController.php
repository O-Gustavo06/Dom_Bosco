<?php

namespace App\Http\Controllers\Api;

require_once __DIR__ . '/../../../Models/Product.php';
require_once __DIR__ . '/../../Response.php';

use App\Http\Response;

class ProductController
{
    private \Product $productModel;

    public function __construct()
    {
        $this->productModel = new \Product();
    }

    
    public function index(): void
    {
        try {
            $products = $this->productModel->getAll();
            Response::json($products);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar produtos: ' . $e->getMessage(), 500);
        }
    }

    
    public function show(int $id): void
    {
        try {
            $product = $this->productModel->getById($id);

            if (!$product) {
                Response::notFound('Produto não encontrado');
            }

            Response::json($product);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar produto: ' . $e->getMessage(), 500);
        }
    }
}
