<?php

require_once __DIR__ . '/../Models/Image.php';
require_once __DIR__ . '/../Utils/JWT.php';

class ImageController
{
    private Image $image;

    public function __construct()
    {
        $this->image = new Image();
    }

    private function ensureAdmin(): ?array
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

        if ($payload['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso permitido apenas para administradores']);
            exit;
        }

        return $payload;
    }

    public function upload(): void
    {
        $this->ensureAdmin();

        if (!isset($_FILES['image'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nenhum arquivo foi enviado']);
            exit;
        }

        $productId = $_POST['product_id'] ?? null;

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID é obrigatório']);
            exit;
        }

        $result = $this->image->upload($productId, $_FILES['image']);

        if (!$result) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Erro ao fazer upload da imagem. Verifique o tipo e tamanho do arquivo'
            ]);
            exit;
        }

        http_response_code(201);
        echo json_encode([
            'message' => 'Imagem enviada com sucesso',
            'image' => $result,
            'product_id' => $productId
        ]);
    }

    public function getByProductId(int $productId): void
    {
        $this->ensureAdmin();

        $images = $this->image->getByProductId($productId);

        echo json_encode([
            'images' => $images
        ]);
    }

    public function delete(int $productId, string $filename): void
    {
        $this->ensureAdmin();

        $success = $this->image->delete($productId, $filename);

        if (!$success) {
            http_response_code(404);
            echo json_encode(['error' => 'Imagem não encontrada ou não pertence a este produto']);
            exit;
        }

        http_response_code(200);
        echo json_encode(['message' => 'Imagem deletada com sucesso']);
    }
}
