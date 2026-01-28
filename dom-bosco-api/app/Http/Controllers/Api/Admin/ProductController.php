<?php

namespace App\Http\Controllers\Api\Admin;

require_once __DIR__ . '/../../../../Models/Product.php';
require_once __DIR__ . '/../../../Response.php';
require_once __DIR__ . '/../../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../../Middleware/CheckRole.php';

use App\Http\Response;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;

class ProductController
{
    private \Product $productModel;

    public function __construct()
    {
        $this->productModel = new \Product();
    }

    /**
     * Listar todos os produtos (admin)
     * GET /api/admin/products
     */
    public function index(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $products = $this->productModel->getAllAdmin();
            Response::json($products);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar produtos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Criar novo produto (admin)
     * POST /api/admin/products
     */
    public function store(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);

        // Validações
        if (empty($data['name'])) {
            Response::error('Nome do produto é obrigatório');
        }

        if (empty($data['price']) || $data['price'] <= 0) {
            Response::error('Preço deve ser maior que zero');
        }

        try {
            $productId = $this->productModel->create($data);

            Response::created([
                'product_id' => $productId
            ], 'Produto criado com sucesso');

        } catch (\Exception $e) {
            Response::error('Erro ao criar produto: ' . $e->getMessage());
        }
    }

    /**
     * Atualizar produto (admin)
     * PUT /api/admin/products/{id}
     */
    public function update(int $id): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);

        // Verifica se produto existe
        $product = $this->productModel->getById($id);
        if (!$product) {
            Response::notFound('Produto não encontrado');
        }

        try {
            $this->productModel->update($id, $data);

            Response::success(null, 'Produto atualizado com sucesso');

        } catch (\Exception $e) {
            Response::error('Erro ao atualizar produto: ' . $e->getMessage());
        }
    }

    /**
     * Deletar produto (admin)
     * DELETE /api/admin/products/{id}
     */
    public function destroy(int $id): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        // Verifica se produto existe
        $product = $this->productModel->getById($id);
        if (!$product) {
            Response::notFound('Produto não encontrado');
        }

        try {
            $this->productModel->delete($id);

            Response::success(null, 'Produto deletado com sucesso');

        } catch (\Exception $e) {
            Response::error('Erro ao deletar produto: ' . $e->getMessage());
        }
    }
}
