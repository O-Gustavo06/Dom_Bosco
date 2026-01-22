<?php

require_once __DIR__ . '/../Models/Image.php';
require_once __DIR__ . '/../Utils/JWT.php';
require_once __DIR__ . '/../Utils/Logger.php';

class ImageController
{
    private Image $image;
    private Logger $logger;

    public function __construct()
    {
        $this->image = new Image();
        $this->logger = new Logger('images.log');
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
            echo json_encode(['error' => 'Acesso permitido apenas para administradores']);
            exit;
        }

        return $payload;
    }

    public function upload(): void
    {
        $payload = $this->ensureAdmin();
        $userId = $payload['id'] ?? 'unknown';

        $this->logger->info('Tentativa de upload de imagem', [
            'user_id' => $userId,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);

        if (empty($_FILES['image'])) {
            $this->logger->warning('Upload falhou: Nenhum arquivo enviado', ['user_id' => $userId]);
            http_response_code(400);
            echo json_encode(['error' => 'Nenhum arquivo foi enviado']);
            exit;
        }

        $productId = $_POST['product_id'] ?? null;

        if (empty($productId) || !is_numeric($productId)) {
            $this->logger->warning('Upload falhou: Product ID inválido', [
                'user_id' => $userId,
                'product_id' => $productId
            ]);
            http_response_code(400);
            echo json_encode(['error' => 'Product ID é obrigatório e deve ser numérico']);
            exit;
        }

        // Verifica se o produto existe
        if (!$this->productExists((int) $productId)) {
            $this->logger->warning('Upload falhou: Produto não encontrado', [
                'user_id' => $userId,
                'product_id' => $productId
            ]);
            http_response_code(404);
            echo json_encode(['error' => 'Produto não encontrado']);
            exit;
        }

        // Detalhes do arquivo para log
        $fileDetails = [
            'name' => $_FILES['image']['name'] ?? 'unknown',
            'size' => $_FILES['image']['size'] ?? 0,
            'type' => $_FILES['image']['type'] ?? 'unknown'
        ];

        // Captura o nome customizado se fornecido
        $customName = $_POST['custom_name'] ?? null;

        try {
            $result = $this->image->upload((int) $productId, $_FILES['image'], $customName);

            if (!$result) {
                $this->logger->error('Upload falhou: Erro no processamento', [
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'file' => $fileDetails
                ]);
                http_response_code(400);
                echo json_encode([
                    'error' => 'Erro ao fazer upload da imagem. Verifique o tipo e tamanho do arquivo (máx 5MB, formatos: JPG, PNG, GIF, WebP)'
                ]);
                exit;
            }

            $this->logger->info('Upload realizado com sucesso', [
                'user_id' => $userId,
                'product_id' => $productId,
                'filename' => $result['filename'] ?? 'unknown',
                'file_size' => $fileDetails['size'],
                'custom_name' => $customName
            ]);

            http_response_code(201);
            echo json_encode([
                'message'    => 'Imagem enviada com sucesso',
                'image'      => $result,
                'product_id' => $productId
            ]);
        } catch (\Throwable $e) {
            $this->logger->exception($e, 'Exceção durante upload de imagem');
            http_response_code(500);
            echo json_encode(['error' => 'Erro interno do servidor']);
        }
    }

    public function getByProductId(int $productId): void
    {
        $payload = $this->ensureAdmin();
        $userId = $payload['id'] ?? 'unknown';

        // Verifica se o produto existe
        if (!$this->productExists($productId)) {
            $this->logger->warning('Listagem de imagens falhou: Produto não encontrado', [
                'user_id' => $userId,
                'product_id' => $productId
            ]);
            http_response_code(404);
            echo json_encode(['error' => 'Produto não encontrado']);
            exit;
        }

        try {
            $images = $this->image->getByProductId($productId);

            $this->logger->info('Imagens listadas com sucesso', [
                'user_id' => $userId,
                'product_id' => $productId,
                'count' => count($images)
            ]);

            http_response_code(200);
            echo json_encode([
                'images' => $images,
                'count' => count($images)
            ]);
        } catch (\Throwable $e) {
            $this->logger->exception($e, 'Exceção ao listar imagens');
            http_response_code(500);
            echo json_encode(['error' => 'Erro interno do servidor']);
        }
    }

    public function delete(int $productId, string $filename): void
    {
        $payload = $this->ensureAdmin();
        $userId = $payload['id'] ?? 'unknown';

        $this->logger->info('Tentativa de deletar imagem', [
            'user_id' => $userId,
            'product_id' => $productId,
            'filename' => $filename
        ]);

        // Validação adicional de segurança contra path traversal
        if (strpos($filename, '..') !== false || strpos($filename, '/') !== false || strpos($filename, '\\') !== false) {
            $this->logger->warning('Tentativa de path traversal detectada', [
                'user_id' => $userId,
                'filename' => $filename,
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ]);
            http_response_code(400);
            echo json_encode(['error' => 'Nome de arquivo inválido']);
            exit;
        }

        // Verifica se o produto existe
        if (!$this->productExists($productId)) {
            $this->logger->warning('Deleção falhou: Produto não encontrado', [
                'user_id' => $userId,
                'product_id' => $productId,
                'filename' => $filename
            ]);
            http_response_code(404);
            echo json_encode(['error' => 'Produto não encontrado']);
            exit;
        }

        try {
            $success = $this->image->delete($productId, $filename);

            if (!$success) {
                $this->logger->warning('Deleção falhou: Imagem não encontrada', [
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'filename' => $filename
                ]);
                http_response_code(404);
                echo json_encode([
                    'error' => 'Imagem não encontrada ou não pertence a este produto'
                ]);
                exit;
            }

            $this->logger->info('Imagem deletada com sucesso', [
                'user_id' => $userId,
                'product_id' => $productId,
                'filename' => $filename
            ]);

            http_response_code(200);
            echo json_encode([
                'message' => 'Imagem deletada com sucesso',
                'filename' => $filename
            ]);
        } catch (\Throwable $e) {
            $this->logger->exception($e, 'Exceção ao deletar imagem');
            http_response_code(500);
            echo json_encode(['error' => 'Erro interno do servidor']);
        }
    }

    /**
     * Verifica se um produto existe no banco de dados
     */
    private function productExists(int $productId): bool
    {
        try {
            require_once __DIR__ . '/../../config/database.php';
            $pdo = Database::connect();
            
            $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ? LIMIT 1');
            $stmt->execute([$productId]);
            
            return $stmt->fetch() !== false;
        } catch (\Throwable $e) {
            $this->logger->exception($e, 'Erro ao verificar existência do produto');
            return false;
        }
    }
}
