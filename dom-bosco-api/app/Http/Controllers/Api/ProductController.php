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

    /**
     * Listar todos os produtos (público)
     * GET /api/products
     */
    public function index(): void
    {
        try {
            $products = $this->productModel->getAll();
            Response::json($products);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar produtos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ver detalhes de um produto (público)
     * GET /api/products/{id}
     */
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
