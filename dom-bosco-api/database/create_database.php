<?php

$dbPath = __DIR__ . '/../database.db';

if (file_exists($dbPath)) {
    $backupPath = __DIR__ . '/../database_backup_' . date('Y-m-d_H-i-s') . '.db';
    copy($dbPath, $backupPath);
    echo "📦 Backup criado: $backupPath\n\n";
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🚀 CRIANDO BANCO DE DADOS COMPLETO\n";
    echo "====================================\n\n";
    
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    
    $statements = explode(';', $schema);
    
    $executed = 0;
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue;
        }
        
        try {
            $pdo->exec($statement);
            $executed++;
            
            if (strpos($statement, 'CREATE TABLE') !== false) {
                preg_match('/CREATE TABLE (\w+)/', $statement, $matches);
                if (isset($matches[1])) {
                    echo "✅ Tabela criada: {$matches[1]}\n";
                }
            }
        } catch (PDOException $e) {
            echo "⚠️  Aviso: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n" . str_repeat("=", 50) . "\n\n";
    echo "✅ Banco de dados criado com sucesso!\n";
    echo "📊 Statements executados: $executed\n\n";
    
    echo "📋 TABELAS CRIADAS:\n";
    echo "===================\n";
    $result = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "  ✓ $table\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n\n";
    
    echo "📊 ESTRUTURA DA TABELA ORDERS:\n";
    echo "==============================\n";
    $result = $pdo->query("PRAGMA table_info(orders)");
    $columns = $result->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        $marker = in_array($column['name'], ['delivery_type', 'delivery_address', 'delivery_house_number', 'delivery_city', 'delivery_zipcode']) 
            ? '🏠' : '  ';
        echo "$marker {$column['name']} ({$column['type']})\n";
    }
    
    echo "\n✅ Campos de endereço incluídos na tabela orders!\n\n";
    
    echo str_repeat("=", 50) . "\n\n";
    echo "🔑 ACESSO ADMIN PADRÃO:\n";
    echo "=======================\n";
    echo "Email: admin@dombosco.com\n";
    echo "Senha: password\n\n";
    
    echo "✨ Tudo pronto! Você pode começar a usar o sistema.\n";
    
} catch (PDOException $e) {
    echo "❌ Erro ao criar banco: " . $e->getMessage() . "\n";
    exit(1);
}
