<?php
/**
 * Script de teste para verificar se o ImageController carrega corretamente
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "=== TESTE DE IMAGECONTROLLER ===\n\n";

echo "1. Carregando ImageController...\n";
try {
    require_once __DIR__ . '/app/Controllers/ImageController.php';
    echo "   ✅ ImageController carregado com sucesso\n";
} catch (Throwable $e) {
    echo "   ❌ Erro ao carregar ImageController: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n2. Verificando classe ImageController...\n";
if (class_exists('ImageController')) {
    echo "   ✅ Classe ImageController existe\n";
} else {
    echo "   ❌ Classe ImageController não encontrada\n";
    exit(1);
}

echo "\n3. Tentando instanciar ImageController...\n";
try {
    $controller = new ImageController();
    echo "   ✅ ImageController instanciado com sucesso\n";
} catch (Throwable $e) {
    echo "   ❌ Erro ao instanciar: " . $e->getMessage() . "\n";
    echo "   Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n4. Verificando métodos disponíveis...\n";
$methods = get_class_methods($controller);
echo "   Métodos encontrados: " . implode(', ', $methods) . "\n";

echo "\n5. Verificando diretório de upload...\n";
$uploadDir = __DIR__ . '/public/images/products/';
if (is_dir($uploadDir)) {
    echo "   ✅ Diretório existe: $uploadDir\n";
    if (is_writable($uploadDir)) {
        echo "   ✅ Diretório tem permissão de escrita\n";
    } else {
        echo "   ⚠️  Diretório NÃO tem permissão de escrita\n";
    }
} else {
    echo "   ❌ Diretório não existe: $uploadDir\n";
}

echo "\n=== TESTE CONCLUÍDO COM SUCESSO ===\n";
