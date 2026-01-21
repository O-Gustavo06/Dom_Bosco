<?php
require_once __DIR__ . '/app/Utils/JWT.php';

// Conectar ao banco de dados
try {
    $dbPath = 'C:/xampp/htdocs/Dom_Bosco/BANCO.db';
    $pdo = new PDO(
        'sqlite:' . $dbPath,
        null,
        null,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Erro ao conectar ao banco de dados: " . $e->getMessage());
}

// Criar um usuário admin para teste
$email = "admin@test.com";
$password = "admin123";
$name = "Admin";

// Verificar se já existe
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    echo "Usuário admin já existe!\n";
    echo "Email: " . $user['email'] . "\n";
    echo "Role: " . $user['role'] . "\n";
} else {
    // Criar novo admin
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $hashedPassword, 'admin']);
    
    echo "✅ Admin criado com sucesso!\n";
    echo "Email: $email\n";
    echo "Senha: $password\n";
}

// Testar geração de token
echo "\n--- Testando geração de token ---\n";

$payload = [
    'id' => 1,
    'email' => $email,
    'name' => $name,
    'role' => 'admin'
];

$token = JWT::generate($payload);
echo "Token gerado: " . substr($token, 0, 50) . "...\n";

// Testar validação
$verified = JWT::verify($token);
if ($verified) {
    echo "✅ Token validado com sucesso!\n";
    echo "Dados: " . json_encode($verified, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "❌ Erro ao validar token\n";
}

echo "\n--- PRÓXIMOS PASSOS ---\n";
echo "1. Faça login com email: $email\n";
echo "2. Senha: $password\n";
echo "3. Clique em Admin no menu\n";
echo "4. Teste o gerenciador de imagens\n";
