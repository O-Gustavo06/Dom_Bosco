<?php

require_once __DIR__ . '/config/database.php';

$pdo = Database::connect();

$inserted = $pdo->exec("
    INSERT INTO inventory (product_id, quantity, min_quantity)
    SELECT id, 10, 5
    FROM products
    WHERE id NOT IN (SELECT product_id FROM inventory)
");

echo "✓ Inseridos {$inserted} produtos com estoque inicial de 10 unidades\n";

// Mostrar resumo
$stmt = $pdo->query("
    SELECT COUNT(*) as total FROM inventory
");
$total = $stmt->fetchColumn();

echo "✓ Total de produtos com estoque: {$total}\n";
