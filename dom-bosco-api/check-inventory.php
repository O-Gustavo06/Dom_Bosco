<?php
/**
 * Script para verificar divergências entre stock (products) e quantity (inventory)
 */

require_once __DIR__ . '/config/database.php';

$pdo = Database::connection();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║       VERIFICAÇÃO DE ESTOQUE - Products vs Inventory         ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$sql = "
    SELECT 
        p.id,
        p.name,
        p.stock as stock_products,
        COALESCE(i.quantity, 0) as stock_inventory,
        p.active,
        CASE 
            WHEN p.stock != COALESCE(i.quantity, 0) THEN '❌ DIVERGENTE'
            ELSE '✅ OK'
        END as status
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    ORDER BY p.id
";

$products = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);

echo "┌─────┬────────────────────────────┬──────────┬──────────┬────────┬─────────────┐\n";
echo "│ ID  │ Produto                    │ Products │ Inventory│ Status │ Divergência │\n";
echo "├─────┼────────────────────────────┼──────────┼──────────┼────────┼─────────────┤\n";

$divergencias = 0;

foreach ($products as $product) {
    $diff = abs($product['stock_products'] - $product['stock_inventory']);
    $isDivergent = $product['stock_products'] != $product['stock_inventory'];
    
    if ($isDivergent) {
        $divergencias++;
    }
    
    $status = $product['active'] ? '🟢 Ativo' : '🔴 Inativo';
    
    printf(
        "│ %-3d │ %-26s │ %8d │ %9d │ %-6s │ %-11s │\n",
        $product['id'],
        substr($product['name'], 0, 26),
        $product['stock_products'],
        $product['stock_inventory'],
        $status,
        $isDivergent ? "❌ Diff: $diff" : "✅ OK"
    );
}

echo "└─────┴────────────────────────────┴──────────┴──────────┴────────┴─────────────┘\n\n";

if ($divergencias > 0) {
    echo "⚠️  ATENÇÃO: $divergencias produto(s) com divergência de estoque!\n\n";
    echo "📝 EXPLICAÇÃO:\n";
    echo "   - Campo 'Products': Campo 'stock' da tabela 'products' (DESATUALIZADO)\n";
    echo "   - Campo 'Inventory': Campo 'quantity' da tabela 'inventory' (ATUALIZADO)\n\n";
    echo "💡 SOLUÇÃO:\n";
    echo "   - O sistema agora usa APENAS 'inventory.quantity'\n";
    echo "   - O campo 'products.stock' não é mais atualizado\n";
    echo "   - O frontend foi corrigido para exibir 'inventory_quantity'\n\n";
} else {
    echo "✅ Todos os produtos estão com estoque sincronizado!\n\n";
}

echo "📊 ESTATÍSTICAS:\n";
echo "   Total de produtos: " . count($products) . "\n";
echo "   Com divergência: $divergencias\n";
echo "   Sincronizados: " . (count($products) - $divergencias) . "\n\n";
