<?php

require_once __DIR__ . '/../Models/Product.php';
require_once __DIR__ . '/../Utils/JWT.php';


use JWT;

class AdminProductController
{
    private Product $product;

    public function __construct()
    {
        $this->product = new Product();
    }

    
    private function ensureAdmin(): array
    {
        $token = JWT::getTokenFromHeader();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Token não fornecido']);
            exit;
        }

        $payload = JWT::verify($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido ou expirado']);
            exit;
        }

        if (($payload['role'] ?? null) !== 'admin') {
            http_response_code(403);
            echo json_encode([
                'error' => 'Acesso permitido apenas para administradores'
            ]);
            exit;
        }

        return $payload;
    }

    
    private function validateProductData(array $data): array
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors[] = 'Nome é obrigatório';
        } elseif (strlen($data['name']) < 3 || strlen($data['name']) > 255) {
            $errors[] = 'Nome deve ter entre 3 e 255 caracteres';
        }

        if (!isset($data['price'])) {
            $errors[] = 'Preço é obrigatório';
        } elseif (!is_numeric($data['price'])) {
            $errors[] = 'Preço deve ser um número';
        } elseif ($data['price'] < 0) {
            $errors[] = 'Preço não pode ser negativo';
        }

        if (!isset($data['stock'])) {
            $errors[] = 'Stock é obrigatório';
        } elseif (
            (!is_int($data['stock']) && !ctype_digit((string)$data['stock'])) ||
            $data['stock'] < 0
        ) {
            $errors[] = 'Stock deve ser um número inteiro não negativo';
        }

        if (empty($data['category_id'])) {
            $errors[] = 'Category ID é obrigatório';
        } elseif (!ctype_digit((string)$data['category_id'])) {
            $errors[] = 'Category ID deve ser um número inteiro';
        }

        if (
            isset($data['description']) &&
            strlen($data['description']) > 1000
        ) {
            $errors[] = 'Descrição não pode ter mais de 1000 caracteres';
        }

        return $errors;
    }

    
    public function index(): void
    {
        $this->ensureAdmin();

        $products = $this->product->getAllAdmin();

        http_response_code(200);
        echo json_encode([
            'products' => $products
        ]);
    }

    
    public function store(): void
    {
        $this->ensureAdmin();

        $rawInput = file_get_contents('php://input');
        $data     = json_decode($rawInput, true);

        $errors = $this->validateProductData($data);

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode([
                'errors' => $errors
            ]);
            return;
        }

        try {
            $productId = $this->product->create([
                'name'        => $data['name'],
                'description' => $data['description'] ?? '',
                'price'       => (float) $data['price'],
                'stock'       => (int) $data['stock'],
                'category_id' => (int) $data['category_id'],
                'image'       => $data['image'] ?? 'default.png'
            ]);

            http_response_code(201);
            echo json_encode([
                'message'    => 'Produto criado com sucesso',
                'product_id' => $productId
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }

    
    public function update(int $id): void
    {
        $this->ensureAdmin();

        $rawInput = file_get_contents('php://input');
        $data     = json_decode($rawInput, true);

        $product = $this->product->getById($id);

        if (!$product) {
            http_response_code(404);
            echo json_encode([
                'error' => 'Produto não encontrado'
            ]);
            return;
        }

        $errors = [];

        if (isset($data['name']) && strlen($data['name']) < 3) {
            $errors[] = 'Nome deve ter no mínimo 3 caracteres';
        }

        if (isset($data['price']) && $data['price'] < 0) {
            $errors[] = 'Preço não pode ser negativo';
        }

        if (isset($data['stock']) && $data['stock'] < 0) {
            $errors[] = 'Stock não pode ser negativo';
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode([
                'errors' => $errors
            ]);
            return;
        }

        try {
            $this->product->update($id, [
                'name'        => $data['name']        ?? $product['name'],
                'description' => $data['description'] ?? $product['description'],
                'price'       => isset($data['price']) ? (float) $data['price'] : $product['price'],
                'stock'       => isset($data['stock']) ? (int) $data['stock'] : $product['stock'],
                'category_id' => $data['category_id'] ?? $product['category_id'],
                'image'       => $data['image']       ?? $product['image'],
                'active'      => isset($data['active']) ? (int) $data['active'] : $product['active']
            ]);

            echo json_encode([
                'message' => 'Produto atualizado com sucesso'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }

    
    public function delete(int $id): void
    {
        error_log("=== DELETAR PRODUTO ===");
        error_log("ID recebido: " . $id);

        $this->ensureAdmin();

        $product = $this->product->getById($id);

        if (!$product) {
            error_log("Produto não encontrado: " . $id);
            http_response_code(404);
            echo json_encode([
                'error' => 'Produto não encontrado'
            ]);
            return;
        }

        try {
            error_log("Tentando deletar produto: " . $product['name']);
            $result = $this->product->delete($id);
            error_log("Resultado da deleção: " . ($result ? 'sucesso' : 'falha'));

            http_response_code(200);
            echo json_encode([
                'message' => 'Produto deletado com sucesso'
            ]);
        } catch (Exception $e) {
            error_log("Erro ao deletar: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }
}
