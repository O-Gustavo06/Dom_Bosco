-- Criação da tabela de inventário/estoque
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 5,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Índice para consultas rápidas por product_id
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- Índice para consultas de estoque baixo
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Inserir estoque inicial para produtos existentes (opcional)
-- Todos os produtos começam com 10 unidades em estoque
INSERT INTO inventory (product_id, quantity, min_quantity)
SELECT id, 10, 5
FROM products
WHERE id NOT IN (SELECT product_id FROM inventory);
