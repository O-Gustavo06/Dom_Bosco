<?php

require_once __DIR__ . '/../../config/database.php';

class Image
{
    private PDO $pdo;
    private string $uploadsDir = __DIR__ . '/../../public/images/products/';

    public function __construct()
    {
        $this->pdo = Database::connect();
        
        if (!is_dir($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0755, true);
        }
    }

    public function getByProductId(int $productId): array
    {
        $stmt = $this->pdo->prepare("SELECT image FROM products WHERE id = ? LIMIT 1");
        $stmt->execute([$productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product || empty($product['image'])) {
            return [];
        }

        $imageData = $product['image'];

        if (substr($imageData, 0, 1) === '[') {
            $images = json_decode($imageData, true);
            if (is_array($images) && !empty($images)) {
                return array_map(fn($img) => [
                    'filename' => $img,
                    'url' => '/images/products/' . $img
                ], $images);
            }
        }

        if (is_string($imageData) && !empty($imageData)) {
            return [[
                'filename' => $imageData,
                'url' => '/images/products/' . $imageData
            ]];
        }

        return [];
    }

    public function upload(int $productId, array $file): ?array
    {
        if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
            return null;
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            return null;
        }

        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        // finfo_close() é deprecated no PHP 8.1+, PHP fecha automaticamente

        if (!in_array($mimeType, $allowedMimes)) {
            return null;
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('prod_') . '_' . time() . '.' . strtolower($extension);
        $filepath = $this->uploadsDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return null;
        }

        $currentImages = $this->getByProductId($productId);
        $filenames = array_map(fn($img) => $img['filename'], $currentImages);
        $filenames[] = $filename;

        $jsonData = json_encode($filenames, JSON_UNESCAPED_UNICODE);
        
        $stmt = $this->pdo->prepare("UPDATE products SET image = ? WHERE id = ?");
        $success = $stmt->execute([$jsonData, $productId]);

        if (!$success) {
            if (file_exists($filepath)) {
                unlink($filepath);
            }
            return null;
        }

        return [
            'filename' => $filename,
            'url'      => '/images/products/' . $filename
        ];
    }

    public function delete(int $productId, string $filename): bool
    {
        $currentImages = $this->getByProductId($productId);
        $filenames = array_map(fn($img) => $img['filename'], $currentImages);

        if (!in_array($filename, $filenames)) {
            return false;
        }

        $filepath = $this->uploadsDir . $filename;
        if (file_exists($filepath)) {
            unlink($filepath);
        }

        $filenames = array_filter($filenames, fn($f) => $f !== $filename);

        $stmt = $this->pdo->prepare("UPDATE products SET image = ? WHERE id = ?");
        $stmt->execute([
            json_encode(array_values($filenames), JSON_UNESCAPED_UNICODE),
            $productId
        ]);

        return true;
    }
}
