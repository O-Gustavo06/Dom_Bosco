<?php

/**
 * Script de análise completa do sistema
 */

echo "=== ANÁLISE DO SISTEMA DOM BOSCO ===\n\n";

// 1. Verificar estrutura do banco vs schema.sql
echo "1. VERIFICAÇÃO DE CONSISTÊNCIA DO BANCO\n";
echo str_repeat('-', 50) . "\n";

$dbPath = 'C:/xampp/htdocs/Dom_Bosco/BANCO.db';
$pdo = new PDO("sqlite:$dbPath");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$problems = [];

// Verificar tabela products
echo "\nTabela PRODUCTS:\n";
$stmt = $pdo->query('PRAGMA table_info(products)');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
$productColumns = array_column($columns, 'name');

if (in_array('category', $productColumns)) {
    echo "  ✗ PROBLEMA: Coluna 'category' existe (VARCHAR)\n";
    echo "    → Deveria ser 'category_id' (INTEGER)\n";
    $problems[] = "Products table usa 'category' ao invés de 'category_id'";
} elseif (in_array('category_id', $productColumns)) {
    echo "  ✓ Usa 'category_id' (correto)\n";
} else {
    echo "  ✗ PROBLEMA: Nenhuma coluna de categoria encontrada\n";
    $problems[] = "Products table sem coluna de categoria";
}

// Verificar tabela settings
echo "\nTabela SETTINGS:\n";
$stmt = $pdo->query('PRAGMA table_info(settings)');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
$settingColumns = array_column($columns, 'name');

if (in_array('key', $settingColumns) && in_array('value', $settingColumns)) {
    echo "  ✓ Usa 'key' e 'value' (schema.sql)\n";
} elseif (in_array('setting_key', $settingColumns) && in_array('setting_value', $settingColumns)) {
    echo "  ✗ PROBLEMA: Usa 'setting_key' e 'setting_value'\n";
    echo "    → schema.sql define 'key' e 'value'\n";
    $problems[] = "Settings table tem nomes de colunas diferentes do schema.sql";
} else {
    echo "  ✗ PROBLEMA: Estrutura de colunas desconhecida\n";
    $problems[] = "Settings table com estrutura incorreta";
}

// 2. Verificar integridade dos dados
echo "\n\n2. VERIFICAÇÃO DE INTEGRIDADE DE DADOS\n";
echo str_repeat('-', 50) . "\n";

// Produtos sem categoria
$stmt = $pdo->query('SELECT COUNT(*) FROM products WHERE category_id IS NULL OR category_id = 0');
$count = $stmt->fetchColumn();
if ($count > 0) {
    echo "  ✗ $count produtos sem categoria definida\n";
    $problems[] = "$count produtos sem categoria";
} else {
    echo "  ✓ Todos os produtos têm categoria\n";
}

// Produtos sem imagem
$stmt = $pdo->query("SELECT COUNT(*) FROM products WHERE image IS NULL OR image = ''");
$count = $stmt->fetchColumn();
if ($count > 0) {
    echo "  ⚠ $count produtos sem imagem\n";
} else {
    echo "  ✓ Todos os produtos têm imagem\n";
}

// Produtos com estoque negativo
$stmt = $pdo->query('SELECT COUNT(*) FROM products WHERE stock < 0');
$count = $stmt->fetchColumn();
if ($count > 0) {
    echo "  ✗ $count produtos com estoque negativo\n";
    $problems[] = "$count produtos com estoque negativo";
} else {
    echo "  ✓ Nenhum produto com estoque negativo\n";
}

// Inventário vs estoque
$stmt = $pdo->query('
    SELECT COUNT(*) 
    FROM products p 
    LEFT JOIN inventory i ON i.product_id = p.id 
    WHERE i.id IS NULL
');
$count = $stmt->fetchColumn();
if ($count > 0) {
    echo "  ⚠ $count produtos sem registro no inventário\n";
} else {
    echo "  ✓ Todos os produtos têm inventário\n";
}

// 3. Verificar configurações importantes
echo "\n\n3. CONFIGURAÇÕES DO SISTEMA\n";
echo str_repeat('-', 50) . "\n";

try {
    $keyColumn = in_array('key', $settingColumns) ? 'key' : 'setting_key';
    $valueColumn = in_array('value', $settingColumns) ? 'value' : 'setting_value';
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM settings");
    $count = $stmt->fetchColumn();
    echo "  ✓ $count configurações cadastradas\n";
    
    $requiredSettings = ['store_name', 'store_email', 'store_phone'];
    foreach ($requiredSettings as $key) {
        $stmt = $pdo->prepare("SELECT $valueColumn FROM settings WHERE $keyColumn = ?");
        $stmt->execute([$key]);
        $value = $stmt->fetchColumn();
        if ($value) {
            echo "  ✓ $key: $value\n";
        } else {
            echo "  ✗ $key: NÃO CONFIGURADO\n";
            $problems[] = "Configuração '$key' não definida";
        }
    }
} catch (Exception $e) {
    echo "  ✗ Erro ao ler settings: " . $e->getMessage() . "\n";
    $problems[] = "Erro ao acessar configurações";
}

// 4. Verificar usuários admin
echo "\n\n4. USUÁRIOS ADMINISTRADORES\n";
echo str_repeat('-', 50) . "\n";

$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
$count = $stmt->fetchColumn();
if ($count > 0) {
    echo "  ✓ $count administrador(es) cadastrado(s)\n";
    
    $stmt = $pdo->query("SELECT name, email FROM users WHERE role = 'admin' LIMIT 3");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($admins as $admin) {
        echo "    - {$admin['name']} ({$admin['email']})\n";
    }
} else {
    echo "  ✗ Nenhum administrador cadastrado\n";
    $problems[] = "Sistema sem administradores";
}

// 5. Estatísticas gerais
echo "\n\n5. ESTATÍSTICAS GERAIS\n";
echo str_repeat('-', 50) . "\n";

$stats = [
    'Usuários totais' => 'SELECT COUNT(*) FROM users',
    'Produtos ativos' => 'SELECT COUNT(*) FROM products WHERE active = 1',
    'Produtos inativos' => 'SELECT COUNT(*) FROM products WHERE active = 0',
    'Pedidos totais' => 'SELECT COUNT(*) FROM orders',
    'Pedidos pendentes' => "SELECT COUNT(*) FROM orders WHERE status = 'pending'",
    'Pedidos concluídos' => "SELECT COUNT(*) FROM orders WHERE status = 'completed'"
];

foreach ($stats as $label => $query) {
    $stmt = $pdo->query($query);
    $count = $stmt->fetchColumn();
    echo "  $label: $count\n";
}

// 6. Verificar arquivos críticos
echo "\n\n6. ARQUIVOS E DIRETÓRIOS\n";
echo str_repeat('-', 50) . "\n";

$criticalPaths = [
    'public/images/products' => 'Diretório de imagens de produtos',
    'storage/logs' => 'Diretório de logs',
    'storage/logs/emails' => 'Diretório de logs de email',
    '.env' => 'Arquivo de configuração'
];

foreach ($criticalPaths as $path => $description) {
    $fullPath = __DIR__ . '/' . $path;
    if (file_exists($fullPath)) {
        if (is_dir($fullPath)) {
            $files = count(scandir($fullPath)) - 2;
            echo "  ✓ $description ($files arquivos)\n";
        } else {
            echo "  ✓ $description\n";
        }
    } else {
        echo "  ✗ $description - NÃO EXISTE\n";
        $problems[] = "$description não existe em $path";
    }
}

// RESUMO FINAL
echo "\n\n" . str_repeat('=', 50) . "\n";
if (count($problems) === 0) {
    echo "✓✓✓ SISTEMA SEM PROBLEMAS CRÍTICOS ✓✓✓\n";
} else {
    echo "PROBLEMAS ENCONTRADOS: " . count($problems) . "\n";
    echo str_repeat('=', 50) . "\n";
    foreach ($problems as $i => $problem) {
        echo ($i + 1) . ". $problem\n";
    }
}
echo str_repeat('=', 50) . "\n\n";
