<?php
require __DIR__ . '/config/database.php';

$pdo = Database::connection();
$stmt = $pdo->query('SELECT id, name, email, role FROM users ORDER BY id DESC LIMIT 10');
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Usuários no banco:\n";
echo json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
