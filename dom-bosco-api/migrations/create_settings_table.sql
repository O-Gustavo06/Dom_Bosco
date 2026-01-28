-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES
    ('store_name', 'Dom Bosco'),
    ('store_description', 'Loja online de produtos artesanais'),
    ('store_email', 'contato@dombosco.com.br'),
    ('store_phone', '(11) 1234-5678');
