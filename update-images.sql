-- Script para atualizar imagens dos produtos
-- Copie e cole no DB Browser for SQLite

UPDATE products SET image = 'caderno-brochura.jpg' WHERE id = 27;
UPDATE products SET image = 'lapis-preto.jpg' WHERE id = 31;
UPDATE products SET image = 'mochila-escolar.jpg' WHERE id = 37;
UPDATE products SET image = 'organizador-mesa.jpg' WHERE id = 51;

-- Verificar resultado
SELECT id, name, image FROM products WHERE id IN (27, 31, 37, 51);
