<?php

require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::connect();
    
    echo "Executando migração da tabela inventory...\n\n";
    
    // Lê o arquivo SQL
    $sql = file_get_contents(__DIR__ . '/migrations/create_inventory_table.sql');
    
    // Divide em comandos individuais
    $commands = array_filter(
        array_map('trim', explode(';', $sql)),
        fn($cmd) => !empty($cmd) && !preg_match('/^--/', $cmd)
    );
    
    // Executa cada comando
    foreach ($commands as $command) {
        if (trim($command)) {
            echo "Executando: " . substr($command, 0, 50) . "...\n";
            $pdo->exec($command);
        }
    }
    
    echo "\n✓ Migração concluída com sucesso!\n";
    echo "\nVerificando produtos e estoques...\n";
    
    // Verifica quantos produtos têm estoque
    $stmt = $pdo->query("
        SELECT 
            COUNT(p.id) as total_products,
            COUNT(i.id) as products_with_inventory
        FROM products p
        LEFT JOIN inventory i ON i.product_id = p.id
    ");
    
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n📊 Estatísticas:\n";
    echo "   Total de produtos: {$stats['total_products']}\n";
    echo "   Produtos com estoque: {$stats['products_with_inventory']}\n";
    
    // Lista alguns produtos com estoque
    echo "\n📦 Produtos com estoque:\n";
    $stmt = $pdo->query("
        SELECT 
            p.id,
            p.name,
            i.quantity,
            i.min_quantity
        FROM products p
        INNER JOIN inventory i ON i.product_id = p.id
        ORDER BY i.quantity ASC
        LIMIT 10
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $status = $row['quantity'] < $row['min_quantity'] ? '⚠️  BAIXO' : '✓ OK';
        echo "   [{$status}] ID {$row['id']}: {$row['name']} - {$row['quantity']} unidades (mín: {$row['min_quantity']})\n";
    }
    
    echo "\n";
    
} catch (Exception $e) {
    echo "\n❌ Erro na migração: " . $e->getMessage() . "\n";
    exit(1);
}
