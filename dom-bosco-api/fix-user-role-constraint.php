<?php

/**
 * Script para corrigir a constraint de role na tabela users
 * Altera de 'customer' para 'user'
 */

$dbPath = __DIR__ . '/../BANCO.db';

if (!file_exists($dbPath)) {
    die("❌ Banco de dados não encontrado em: $dbPath\n");
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔄 Iniciando correção da constraint de role...\n\n";
    
    // 1. Verificar estrutura atual
    echo "1️⃣ Verificando estrutura atual da tabela users...\n";
    $result = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
    $currentSchema = $result->fetch(PDO::FETCH_ASSOC);
    
    if (!$currentSchema) {
        die("❌ Tabela users não encontrada!\n");
    }
    
    echo "Estrutura atual:\n";
    echo $currentSchema['sql'] . "\n\n";
    
    // 2. Limpar tabela temporária se existir e criar nova
    echo "2️⃣ Criando tabela temporária com constraint corrigida...\n";
    $pdo->exec("DROP TABLE IF EXISTS users_temp");
    $pdo->exec("
        CREATE TABLE users_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'user')) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // 3. Atualizar 'customer' para 'user' e copiar dados
    echo "3️⃣ Atualizando roles 'customer' para 'user' e copiando dados...\n";
    $pdo->exec("
        INSERT INTO users_temp (id, name, email, password, role, created_at)
        SELECT 
            id, 
            name, 
            email, 
            password, 
            CASE 
                WHEN role = 'customer' THEN 'user'
                ELSE role 
            END as role,
            created_at
        FROM users
    ");
    
    // 4. Verificar quantos registros foram copiados
    $count = $pdo->query("SELECT COUNT(*) as total FROM users_temp")->fetch(PDO::FETCH_ASSOC);
    echo "   ✅ {$count['total']} usuário(s) migrado(s)\n\n";
    
    // 5. Deletar tabela antiga e renomear
    echo "4️⃣ Substituindo tabela antiga...\n";
    $pdo->exec("DROP TABLE users");
    $pdo->exec("ALTER TABLE users_temp RENAME TO users");
    
    // 6. Verificar resultado
    echo "5️⃣ Verificando resultado...\n";
    $users = $pdo->query("SELECT id, name, email, role FROM users")->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n📊 Usuários no banco:\n";
    echo str_repeat("-", 80) . "\n";
    printf("%-5s %-25s %-35s %-10s\n", "ID", "Nome", "Email", "Role");
    echo str_repeat("-", 80) . "\n";
    
    foreach ($users as $user) {
        printf(
            "%-5s %-25s %-35s %-10s\n",
            $user['id'],
            substr($user['name'], 0, 25),
            substr($user['email'], 0, 35),
            $user['role']
        );
    }
    
    echo str_repeat("-", 80) . "\n";
    
    // 7. Verificar nova estrutura
    $result = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
    $newSchema = $result->fetch(PDO::FETCH_ASSOC);
    
    echo "\n✅ Nova estrutura:\n";
    echo $newSchema['sql'] . "\n\n";
    
    echo "✅ Correção concluída com sucesso!\n";
    echo "Agora a tabela aceita os roles: 'admin' e 'user'\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}
