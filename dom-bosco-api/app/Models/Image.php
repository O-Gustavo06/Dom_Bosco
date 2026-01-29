<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/Logger.php';

class Image
{
    private PDO $pdo;
    private Logger $logger;
    private string $uploadsDir = __DIR__ . '/../../public/images/products/';

    private const MAX_FILE_SIZE = 5 * 1024 * 1024;
    private const ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    public function __construct()
    {
        $this->pdo = Database::connect();
        $this->logger = new Logger('images.log');

        if (!is_dir($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0755, true);
            $this->logger->info('Diretório de uploads criado', ['path' => $this->uploadsDir]);
        }
    }

    public function getByProductId(int $productId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT image FROM products WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$productId]);

        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (empty($product['image'])) {
            return [];
        }

        return $this->normalizeImageData($product['image']);
    }

    public function upload(int $productId, array $file, ?string $customName = null): ?array
    {
        if (empty($file['tmp_name'])) {
            $this->logger->error('Upload falhou: Arquivo temporário vazio', [
                'product_id' => $productId,
                'file_info' => $file
            ]);
            return null;
        }

        if ($file['size'] > self::MAX_FILE_SIZE) {
            $this->logger->warning('Upload rejeitado: Arquivo muito grande', [
                'product_id' => $productId,
                'file_size' => $file['size'],
                'max_size' => self::MAX_FILE_SIZE,
                'filename' => $file['name'] ?? 'unknown'
            ]);
            return null;
        }

        if (!$this->isAllowedMime($file['tmp_name'])) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $actualMime = finfo_file($finfo, $file['tmp_name']);
            
            $this->logger->warning('Upload rejeitado: Tipo de arquivo não permitido', [
                'product_id' => $productId,
                'filename' => $file['name'] ?? 'unknown',
                'detected_mime' => $actualMime,
                'allowed_mimes' => self::ALLOWED_MIMES
            ]);
            return null;
        }

        $filename = $this->generateFilename($file['name'], $customName);
        $filepath = $this->uploadsDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            $this->logger->error('Falha ao mover arquivo para destino', [
                'product_id' => $productId,
                'source' => $file['tmp_name'],
                'destination' => $filepath,
                'filename' => $filename
            ]);
            return null;
        }

        $images     = $this->getByProductId($productId);
        $filenames  = array_column($images, 'filename');
        $filenames[] = $filename;

        if (!$this->persistImages($productId, $filenames)) {
            $this->logger->error('Falha ao persistir imagens no banco', [
                'product_id' => $productId,
                'filename' => $filename
            ]);
            
            if (file_exists($filepath)) {
                unlink($filepath);
                $this->logger->info('Arquivo removido após falha na persistência', [
                    'filename' => $filename
                ]);
            }
            return null;
        }

        $this->logger->info('Arquivo salvo com sucesso', [
            'product_id' => $productId,
            'filename' => $filename,
            'size' => $file['size'],
            'path' => $filepath
        ]);

        return [
            'filename' => $filename,
            'url'      => '/images/products/' . $filename
        ];
    }

    public function delete(int $productId, string $filename): bool
    {
        $images    = $this->getByProductId($productId);
        $filenames = array_column($images, 'filename');

        if (!in_array($filename, $filenames, true)) {
            $this->logger->warning('Tentativa de deletar imagem não associada ao produto', [
                'product_id' => $productId,
                'filename' => $filename,
                'existing_images' => $filenames
            ]);
            return false;
        }

        $filepath = $this->uploadsDir . $filename;

        if (file_exists($filepath)) {
            if (unlink($filepath)) {
                $this->logger->info('Arquivo físico deletado', [
                    'product_id' => $productId,
                    'filename' => $filename,
                    'path' => $filepath
                ]);
            } else {
                $this->logger->error('Falha ao deletar arquivo físico', [
                    'product_id' => $productId,
                    'filename' => $filename,
                    'path' => $filepath
                ]);
            }
        } else {
            $this->logger->warning('Arquivo físico não encontrado para deleção', [
                'product_id' => $productId,
                'filename' => $filename,
                'path' => $filepath
            ]);
        }

        $filenames = array_values(
            array_filter($filenames, fn ($f) => $f !== $filename)
        );

        $result = $this->persistImages($productId, $filenames);
        
        if ($result) {
            $this->logger->info('Referência da imagem removida do banco', [
                'product_id' => $productId,
                'filename' => $filename
            ]);
        } else {
            $this->logger->error('Falha ao remover referência da imagem do banco', [
                'product_id' => $productId,
                'filename' => $filename
            ]);
        }

        return $result;
    }

    private function normalizeImageData(string $imageData): array
    {
        if (str_starts_with($imageData, '[')) {
            $images = json_decode($imageData, true);

            if (is_array($images)) {
                return array_map(
                    fn ($img) => [
                        'filename' => $img,
                        'url'      => '/images/products/' . $img
                    ],
                    $images
                );
            }
        }

        return [[
            'filename' => $imageData,
            'url'      => '/images/products/' . $imageData
        ]];
    }

    private function isAllowedMime(string $tmpFile): bool
    {
        $finfo    = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tmpFile);

        return in_array($mimeType, self::ALLOWED_MIMES, true);
    }

    private function generateFilename(string $originalName, ?string $customName = null): string
    {
        $extension = strtolower(
            pathinfo($originalName, PATHINFO_EXTENSION)
        );

        if ($customName) {

            $customNameWithoutExt = pathinfo($customName, PATHINFO_FILENAME);

            $safeName = preg_replace('/[^a-zA-Z0-9\-_]/', '-', $customNameWithoutExt);
            $safeName = preg_replace('/-+/', '-', $safeName); // Remove hífens duplicados
            $safeName = trim($safeName, '-'); // Remove hífens no início e fim
            
            if (!empty($safeName)) {
                return $safeName . '.' . $extension;
            }
        }

        return uniqid('prod_', true) . '.' . $extension;
    }

    private function persistImages(int $productId, array $filenames): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE products SET image = ? WHERE id = ?'
        );

        return $stmt->execute([
            json_encode($filenames, JSON_UNESCAPED_UNICODE),
            $productId
        ]);
    }
}
