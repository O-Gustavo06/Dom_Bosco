<?php

namespace App\Http\Controllers\Api\Admin;

require_once __DIR__ . '/../../../../Models/Inventory.php';
require_once __DIR__ . '/../../../Response.php';
require_once __DIR__ . '/../../../Middleware/Authenticate.php';
require_once __DIR__ . '/../../../Middleware/CheckRole.php';

use App\Http\Response;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;

class InventoryController
{
    private \Inventory $inventory;

    public function __construct()
    {
        $this->inventory = new \Inventory();
    }

    public function index(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $this->inventory->seedMissingFromProducts();
            $items = $this->inventory->getAll();
            Response::json($items);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar estoque: ' . $e->getMessage(), 500);
        }
    }

    public function lowStock(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $this->inventory->seedMissingFromProducts();
            $items = $this->inventory->getLowStock();
            Response::json($items);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar estoque baixo: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $productId): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $item = $this->inventory->getByProductId($productId);
        if (!$item) {
            Response::notFound('Estoque nao encontrado');
        }

        Response::json($item);
    }

    public function store(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);
        $productId = isset($data['product_id']) ? (int) $data['product_id'] : 0;
        $quantity = isset($data['quantity']) ? (int) $data['quantity'] : 0;
        $minQuantity = isset($data['min_quantity']) ? (int) $data['min_quantity'] : 5;

        if ($productId <= 0) {
            Response::error('product_id e obrigatorio');
        }

        try {
            $existing = $this->inventory->getByProductId($productId);
            if ($existing) {
                $this->inventory->updateQuantity($productId, $quantity, 'Admin set quantity', (int) $user['id']);
                $this->inventory->updateMinQuantity($productId, $minQuantity);
                Response::success(['updated' => true], 'Estoque atualizado');
            }

            $ok = $this->inventory->create($productId, $quantity, $minQuantity);
            if (!$ok) {
                Response::error('Erro ao criar estoque');
            }

            $this->inventory->updateQuantity($productId, $quantity, 'Admin create inventory', (int) $user['id']);
            Response::created(['created' => true], 'Estoque criado');
        } catch (\Exception $e) {
            Response::error('Erro ao criar estoque: ' . $e->getMessage());
        }
    }

    public function update(int $productId): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);
        $hasQuantity = array_key_exists('quantity', $data);
        $hasMin = array_key_exists('min_quantity', $data);

        if (!$hasQuantity && !$hasMin) {
            Response::error('Informe quantity e/ou min_quantity');
        }

        try {
            $this->inventory->ensureRecord($productId, 0, 5);

            if ($hasQuantity) {
                $this->inventory->updateQuantity(
                    $productId,
                    (int) $data['quantity'],
                    'Admin set quantity',
                    (int) $user['id']
                );
            }

            if ($hasMin) {
                $this->inventory->updateMinQuantity($productId, (int) $data['min_quantity']);
            }

            Response::success(['updated' => true], 'Estoque atualizado');
        } catch (\Exception $e) {
            Response::error('Erro ao atualizar estoque: ' . $e->getMessage());
        }
    }

    public function increment(int $productId): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);
        $amount = isset($data['amount']) ? (int) $data['amount'] : 0;

        if ($amount <= 0) {
            Response::error('amount deve ser maior que zero');
        }

        try {
            $ok = $this->inventory->increment($productId, $amount, 'Admin increment', (int) $user['id']);
            if (!$ok) {
                Response::error('Erro ao incrementar estoque');
            }

            Response::success(['updated' => true], 'Estoque incrementado');
        } catch (\Exception $e) {
            Response::error('Erro ao incrementar estoque: ' . $e->getMessage());
        }
    }

    public function decrement(int $productId): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);
        $amount = isset($data['amount']) ? (int) $data['amount'] : 0;

        if ($amount <= 0) {
            Response::error('amount deve ser maior que zero');
        }

        try {
            $ok = $this->inventory->decrement($productId, $amount, 'Admin decrement', (int) $user['id']);
            if (!$ok) {
                Response::error('Estoque insuficiente', 400);
            }

            Response::success(['updated' => true], 'Estoque decrementado');
        } catch (\Exception $e) {
            Response::error('Erro ao decrementar estoque: ' . $e->getMessage());
        }
    }

    public function updateMinQuantity(int $productId): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $data = json_decode(file_get_contents('php://input'), true);
        $minQuantity = isset($data['min_quantity']) ? (int) $data['min_quantity'] : null;

        if ($minQuantity === null) {
            Response::error('min_quantity e obrigatorio');
        }

        try {
            $this->inventory->ensureRecord($productId, 0, 5);
            $ok = $this->inventory->updateMinQuantity($productId, $minQuantity);
            if (!$ok) {
                Response::error('Erro ao atualizar minimo');
            }

            Response::success(['updated' => true], 'Minimo atualizado');
        } catch (\Exception $e) {
            Response::error('Erro ao atualizar minimo: ' . $e->getMessage());
        }
    }

    public function delete(int $productId): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        try {
            $ok = $this->inventory->delete($productId);
            if (!$ok) {
                Response::error('Erro ao deletar estoque');
            }

            Response::success(['deleted' => true], 'Estoque deletado');
        } catch (\Exception $e) {
            Response::error('Erro ao deletar estoque: ' . $e->getMessage());
        }
    }

    public function movements(): void
    {
        $user = Authenticate::handle();
        CheckRole::admin($user);

        $productId = isset($_GET['product_id']) ? (int) $_GET['product_id'] : null;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

        try {
            $movements = $this->inventory->getMovements($productId, $limit, $offset);
            Response::json($movements);
        } catch (\Exception $e) {
            Response::error('Erro ao buscar historico: ' . $e->getMessage());
        }
    }
}
