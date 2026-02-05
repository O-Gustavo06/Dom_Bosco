<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TESTE DE CRIAÇÃO DE PEDIDO ===\n\n";

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Models/Order.php';

try {
    $pdo = Database::connection();
    
    echo "1. Verificando modo journal...\n";
    $stmt = $pdo->query('PRAGMA journal_mode');
    $mode = $stmt->fetchColumn();
    echo "   Modo journal: $mode\n";
    
    $stmt = $pdo->query('PRAGMA busy_timeout');
    $timeout = $stmt->fetchColumn();
    echo "   Busy timeout: $timeout ms\n\n";
    
    echo "2. Verificando se há journal file...\n";
    $journalPath = 'C:/xampp/htdocs/Dom_Bosco/BANCO.db-journal';
    if (file_exists($journalPath)) {
        echo "   ✗ Journal file EXISTE (problema!)\n\n";
    } else {
        echo "   ✓ Journal file não existe (bom!)\n\n";
    }
    
    echo "3. Testando criação de pedido...\n";
    
    $orderModel = new Order();
    
    // Dados de teste
    $testData = [
        'user_id' => 1,
        'total' => 99.90,
        'items' => [
            [
                'id' => 27,
                'quantity' => 1,
                'price' => 12.90
            ]
        ],
        'customer' => [
            'name' => 'Teste Copilot',
            'email' => 'teste@teste.com',
            'address' => 'Rua Teste',
            'houseNumber' => '123',
            'city' => 'Marília',
            'zipCode' => '17500-000'
        ],
        'delivery_type' => 'delivery'
    ];
    
    echo "   Tentando criar pedido...\n";
    $orderId = $orderModel->create($testData);
    
    echo "   ✓ Pedido criado com sucesso! ID: $orderId\n\n";
    
    echo "4. Verificando pedido criado...\n";
    $order = $orderModel->getById($orderId);
    echo "   Total: R$ " . number_format($order['total'], 2, ',', '.') . "\n";
    echo "   Status: " . $order['status'] . "\n";
    echo "   Itens: " . count($order['items']) . "\n\n";
    
    echo "✅ TESTE CONCLUÍDO COM SUCESSO!\n";
    echo "O sistema está funcionando perfeitamente.\n";
    
} catch (Exception $e) {
    echo "\n✗ ERRO: " . $e->getMessage() . "\n";
    echo "Arquivo: " . $e->getFile() . "\n";
    echo "Linha: " . $e->getLine() . "\n\n";
    
    if (strpos($e->getMessage(), 'database is locked') !== false) {
        echo "DIAGNÓSTICO:\n";
        echo "- O banco ainda está travado\n";
        echo "- Solução: Reinicie o computador\n";
        echo "- Ou feche TODOS os programas que possam estar acessando o banco\n";
    }
}
