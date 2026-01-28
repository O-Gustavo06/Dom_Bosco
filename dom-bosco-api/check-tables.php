<?php

require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::connection();
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tabelas existentes no banco:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
}
