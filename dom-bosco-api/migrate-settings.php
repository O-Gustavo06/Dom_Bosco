<?php

require_once __DIR__ . '/config/database.php';

echo "🔄 Criando tabela de configurações...\n\n";

try {
    $pdo = Database::connection();
    
    // Ler o arquivo SQL
    $sql = file_get_contents(__DIR__ . '/migrations/create_settings_table.sql');
    
    // Executar o SQL
    $pdo->exec($sql);
    
    echo "✅ Tabela de configurações criada com sucesso!\n";
    
    // Verificar os dados inseridos
    $stmt = $pdo->query("SELECT * FROM settings");
    $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n📋 Configurações inseridas:\n";
    foreach ($settings as $setting) {
        echo "  - {$setting['setting_key']}: {$setting['setting_value']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n✨ Migração concluída!\n";
