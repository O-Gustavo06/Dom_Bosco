<?php

require_once __DIR__ . '/config/database.php';

$pdo = Database::connect();

$updates = [
    27 => 'caderno-brochura.jpg',
    31 => 'lapis-preto.jpg',
    37 => 'mochila-escolar.jpg',
    51 => 'organizador-mesa.jpg',
];

foreach ($updates as $productId => $imageName) {
    $sql = "UPDATE products SET image = :image WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':image' => $imageName,
        ':id' => $productId
    ]);
    echo "✅ Produto ID $productId atualizado com: $imageName\n";
}

echo "\n🎉 Todas as imagens foram associadas com sucesso!\n";
echo "Você pode deletar este arquivo agora.\n";
?>
