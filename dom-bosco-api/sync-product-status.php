<?php

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Models/Product.php';

echo "🔄 Sincronizando status dos produtos baseado no estoque...\n\n";

try {
    $productModel = new Product();
    
    $affected = $productModel->updateAllActiveStatusByStock();
    
    echo "✅ Sincronização concluída!\n";
    echo "📊 Total de produtos atualizados: $affected\n\n";
    
    // Mostrar estatísticas
    $pdo = Database::connection();
    
    $active = $pdo->query("SELECT COUNT(*) FROM products WHERE active = 1")->fetchColumn();
    $inactive = $pdo->query("SELECT COUNT(*) FROM products WHERE active = 0")->fetchColumn();
    
    echo "📈 Estatísticas:\n";
    echo "  ✓ Produtos ativos: $active\n";
    echo "  ✗ Produtos inativos: $inactive\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n✨ Processo concluído!\n";
