<?php

require_once __DIR__ . '/../Models/Inventory.php';
require_once __DIR__ . '/../Models/Product.php';
require_once __DIR__ . '/../Services/Response.php';

class InventoryController
{
    private Inventory $inventory;
    private Product $product;

    public function __construct()
    {
        $this->inventory = new Inventory();
        $this->product = new Product();
    }

    /**
     * Lista todos os estoques
     * GET /api/admin/inventory
     */
    public function index(): void
    {
        $data = $this->inventory->getAll();
        Response::json($data);
    }

    /**
     * Obtém estoque de um produto específico
     * GET /api/admin/inventory/:productId
     */
    public function show(int $productId): void
    {
        $data = $this->inventory->getByProductId($productId);

        if (!$data) {
            Response::json(['error' => 'Estoque não encontrado para este produto'], 404);
            return;
        }

        Response::json($data);
    }

    /**
     * Cria um registro de estoque para um produto
     * POST /api/admin/inventory
     * Body: { product_id, quantity, min_quantity }
     */
    public function store(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['product_id'])) {
            Response::json(['error' => 'product_id é obrigatório'], 400);
            return;
        }

        $productId = (int) $data['product_id'];
        $quantity = isset($data['quantity']) ? (int) $data['quantity'] : 0;
        $minQuantity = isset($data['min_quantity']) ? (int) $data['min_quantity'] : 5;

        // Verifica se o produto existe
        $productExists = $this->product->getById($productId);
        if (!$productExists) {
            Response::json(['error' => 'Produto não encontrado'], 404);
            return;
        }

        // Verifica se já existe estoque para este produto
        $existing = $this->inventory->getByProductId($productId);
        if ($existing) {
            Response::json(['error' => 'Já existe um registro de estoque para este produto'], 409);
            return;
        }

        $success = $this->inventory->create($productId, $quantity, $minQuantity);

        if ($success) {
            $newInventory = $this->inventory->getByProductId($productId);
            Response::json([
                'message' => 'Estoque criado com sucesso',
                'inventory' => $newInventory
            ], 201);
        } else {
            Response::json(['error' => 'Erro ao criar estoque'], 500);
        }
    }

    /**
     * Atualiza a quantidade em estoque
     * PUT /api/admin/inventory/:productId
     * Body: { quantity }
     */
    public function update(int $productId): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['quantity'])) {
            Response::json(['error' => 'quantity é obrigatório'], 400);
            return;
        }

        $quantity = (int) $data['quantity'];

        if ($quantity < 0) {
            Response::json(['error' => 'A quantidade não pode ser negativa'], 400);
            return;
        }

        $existing = $this->inventory->getByProductId($productId);
        if (!$existing) {
            Response::json(['error' => 'Estoque não encontrado'], 404);
            return;
        }

        $success = $this->inventory->updateQuantity($productId, $quantity);

        if ($success) {
            $updated = $this->inventory->getByProductId($productId);
            Response::json([
                'message' => 'Estoque atualizado com sucesso',
                'inventory' => $updated
            ]);
        } else {
            Response::json(['error' => 'Erro ao atualizar estoque'], 500);
        }
    }

    /**
     * Adiciona quantidade ao estoque (entrada)
     * POST /api/admin/inventory/:productId/increment
     * Body: { amount }
     */
    public function increment(int $productId): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['amount'])) {
            Response::json(['error' => 'amount é obrigatório'], 400);
            return;
        }

        $amount = (int) $data['amount'];

        if ($amount <= 0) {
            Response::json(['error' => 'A quantidade deve ser maior que zero'], 400);
            return;
        }

        $existing = $this->inventory->getByProductId($productId);
        if (!$existing) {
            Response::json(['error' => 'Estoque não encontrado'], 404);
            return;
        }

        $success = $this->inventory->increment($productId, $amount);

        if ($success) {
            $updated = $this->inventory->getByProductId($productId);
            Response::json([
                'message' => 'Estoque incrementado com sucesso',
                'inventory' => $updated
            ]);
        } else {
            Response::json(['error' => 'Erro ao incrementar estoque'], 500);
        }
    }

    /**
     * Remove quantidade do estoque (saída manual)
     * POST /api/admin/inventory/:productId/decrement
     * Body: { amount }
     */
    public function decrement(int $productId): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['amount'])) {
            Response::json(['error' => 'amount é obrigatório'], 400);
            return;
        }

        $amount = (int) $data['amount'];

        if ($amount <= 0) {
            Response::json(['error' => 'A quantidade deve ser maior que zero'], 400);
            return;
        }

        $existing = $this->inventory->getByProductId($productId);
        if (!$existing) {
            Response::json(['error' => 'Estoque não encontrado'], 404);
            return;
        }

        if ($existing['quantity'] < $amount) {
            Response::json([
                'error' => 'Estoque insuficiente',
                'available' => $existing['quantity'],
                'requested' => $amount
            ], 400);
            return;
        }

        $success = $this->inventory->decrement($productId, $amount);

        if ($success) {
            $updated = $this->inventory->getByProductId($productId);
            Response::json([
                'message' => 'Estoque decrementado com sucesso',
                'inventory' => $updated
            ]);
        } else {
            Response::json(['error' => 'Erro ao decrementar estoque'], 500);
        }
    }

    /**
     * Obtém produtos com estoque baixo
     * GET /api/admin/inventory/low-stock
     */
    public function lowStock(): void
    {
        $data = $this->inventory->getLowStock();
        Response::json($data);
    }

    /**
     * Deleta o registro de estoque
     * DELETE /api/admin/inventory/:productId
     */
    public function delete(int $productId): void
    {
        $existing = $this->inventory->getByProductId($productId);
        if (!$existing) {
            Response::json(['error' => 'Estoque não encontrado'], 404);
            return;
        }

        $success = $this->inventory->delete($productId);

        if ($success) {
            Response::json(['message' => 'Estoque deletado com sucesso']);
        } else {
            Response::json(['error' => 'Erro ao deletar estoque'], 500);
        }
    }

    /**
     * Atualiza a quantidade mínima
     * PATCH /api/admin/inventory/:productId/min-quantity
     * Body: { min_quantity }
     */
    public function updateMinQuantity(int $productId): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['min_quantity'])) {
            Response::json(['error' => 'min_quantity é obrigatório'], 400);
            return;
        }

        $minQuantity = (int) $data['min_quantity'];

        if ($minQuantity < 0) {
            Response::json(['error' => 'A quantidade mínima não pode ser negativa'], 400);
            return;
        }

        $existing = $this->inventory->getByProductId($productId);
        if (!$existing) {
            Response::json(['error' => 'Estoque não encontrado'], 404);
            return;
        }

        $success = $this->inventory->updateMinQuantity($productId, $minQuantity);

        if ($success) {
            $updated = $this->inventory->getByProductId($productId);
            Response::json([
                'message' => 'Quantidade mínima atualizada com sucesso',
                'inventory' => $updated
            ]);
        } else {
            Response::json(['error' => 'Erro ao atualizar quantidade mínima'], 500);
        }
    }
}
