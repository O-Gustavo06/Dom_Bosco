<?php
require __DIR__ . '/app/Models/User.php';

$user = new User();

try {
    $userId = $user->create(
        'Admin Sistema',
        'admin@papelaria.com',
        'admin123',
        'admin'
    );
    echo "✅ Usuário admin criado com sucesso!\n";
    echo "Email: admin@papelaria.com\n";
    echo "Senha: admin123\n";
    echo "User ID: $userId\n";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
}
