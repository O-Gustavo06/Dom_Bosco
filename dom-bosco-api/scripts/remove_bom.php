<?php
$files = [
    __DIR__ . '/../app/Http/Controllers/Api/Admin/UserController.php'
];

foreach ($files as $f) {
    if (!file_exists($f)) {
        echo "File not found: $f\n";
        continue;
    }

    $s = file_get_contents($f);
    if (substr($s, 0, 3) === "\xEF\xBB\xBF") {
        file_put_contents($f, substr($s, 3));
        echo "Removed BOM from: $f\n";
    } else {
        echo "No BOM in: $f\n";
    }
}
