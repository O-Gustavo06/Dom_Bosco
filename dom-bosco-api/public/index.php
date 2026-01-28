<?php

/**
 * Dom Bosco API - Entry Point
 */

// Carregar variáveis de ambiente de forma simples
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            if (!empty($name)) {
                $_ENV[$name] = $value;
                putenv("$name=$value");
            }
        }
    }
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicFile = __DIR__ . $uri;

if ($uri === '/images/products/default.png') {
    $defaultImagePath = __DIR__ . '/images/products/default.png';
    
    if (file_exists($defaultImagePath)) {
        header("Content-Type: image/png");
        header("Content-Length: " . filesize($defaultImagePath));
        readfile($defaultImagePath);
        exit;
    }
    
    if (function_exists('imagecreatetruecolor')) {
        $width = 400;
        $height = 400;
        $image = imagecreatetruecolor($width, $height);
        
        $bgColor = imagecolorallocate($image, 240, 240, 240);
        imagefill($image, 0, 0, $bgColor);
        
        $textColor = imagecolorallocate($image, 150, 150, 150);
        
        $text = 'Sem Imagem';
        $font = 5; 
        $textWidth = imagefontwidth($font) * strlen($text);
        $textHeight = imagefontheight($font);
        $x = ($width - $textWidth) / 2;
        $y = ($height - $textHeight) / 2;
        
        imagestring($image, $font, $x, $y, $text, $textColor);
        
        header("Content-Type: image/png");
        imagepng($image);
        exit;
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Imagem padrão não encontrada e não foi possível gerar']);
    exit;
}

if ($uri !== '/' && file_exists($publicFile) && is_file($publicFile)) {
    $mimeTypes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'pdf' => 'application/pdf',
    ];
    
    $extension = strtolower(pathinfo($publicFile, PATHINFO_EXTENSION));
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
    
    header("Content-Type: $mimeType");
    header("Content-Length: " . filesize($publicFile));
    readfile($publicFile);
    exit;
}

// Rotas da API
require_once __DIR__ . '/../routes/api.php';
