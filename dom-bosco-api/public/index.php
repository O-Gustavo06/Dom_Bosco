<?php

// 🔹 Permitir que arquivos físicos (imagens, css, etc) sejam servidos
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicFile = __DIR__ . $uri;

// Gerar imagem padrão dinamicamente se não existir
if ($uri === '/images/products/default.png') {
    $defaultImagePath = __DIR__ . '/images/products/default.png';
    
    if (file_exists($defaultImagePath)) {
        header("Content-Type: image/png");
        header("Content-Length: " . filesize($defaultImagePath));
        readfile($defaultImagePath);
        exit;
    }
    
    // Gerar imagem placeholder se a extensão GD estiver disponível
    if (function_exists('imagecreatetruecolor')) {
        $width = 400;
        $height = 400;
        $image = imagecreatetruecolor($width, $height);
        
        // Cor de fundo (cinza claro)
        $bgColor = imagecolorallocate($image, 240, 240, 240);
        imagefill($image, 0, 0, $bgColor);
        
        // Cor do texto (cinza escuro)
        $textColor = imagecolorallocate($image, 150, 150, 150);
        
        // Texto "Sem Imagem"
        $text = 'Sem Imagem';
        $font = 5; // Fonte built-in do GD
        $textWidth = imagefontwidth($font) * strlen($text);
        $textHeight = imagefontheight($font);
        $x = ($width - $textWidth) / 2;
        $y = ($height - $textHeight) / 2;
        
        imagestring($image, $font, $x, $y, $text, $textColor);
        
        header("Content-Type: image/png");
        imagepng($image);
        imagedestroy($image);
        exit;
    }
    
    // Se GD não estiver disponível, retornar 404
    http_response_code(404);
    echo json_encode(['error' => 'Imagem padrão não encontrada e não foi possível gerar']);
    exit;
}

// Servir outros arquivos estáticos diretamente
if ($uri !== '/' && file_exists($publicFile) && is_file($publicFile)) {
    // Determinar tipo MIME baseado na extensão
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

// 🔹 CORS — essencial para React
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 🔹 Preflight (fetch / axios)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🔹 Rotas da API
require_once __DIR__ . '/../routes/api.php';
