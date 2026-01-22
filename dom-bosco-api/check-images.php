<?php
$pdo = new PDO('sqlite:C:/xampp/htdocs/Dom_Bosco/BANCO.db');
$stmt = $pdo->query('SELECT id, name, image FROM products LIMIT 5');
echo "Verificando formato de imagens no banco:\n\n";
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']}\n";
    echo "Nome: {$row['name']}\n";
    echo "Image: {$row['image']}\n";
    echo "Tipo: " . (is_string($row['image']) && $row['image'][0] === '[' ? 'JSON Array' : 'String simples') . "\n";
    echo "---\n";
}
