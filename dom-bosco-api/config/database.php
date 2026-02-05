<?php

// Helper function para acessar variáveis de ambiente
if (!function_exists('env')) {
    function env($key, $default = null) {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }
}

return [
    'default' => env('DB_CONNECTION', 'sqlite'),
    
    'connections' => [
        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DATABASE_URL'),
            'database' => env('DB_DATABASE', 'C:/xampp/htdocs/Dom_Bosco/BANCO.db'),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],
    ],
    
    'migrations' => 'migrations',
];

class Database
{
    private static $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/database.php';
            $dbConfig = $config['connections'][$config['default']];
            
            $path = $dbConfig['database'];

            if (!file_exists($path)) {
                throw new Exception('Banco SQLite não encontrado em: ' . $path);
            }

            self::$pdo = new PDO("sqlite:$path");
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Configurações otimizadas para performance
            self::$pdo->setAttribute(PDO::ATTR_TIMEOUT, 30);
            
            // Journal na MEMÓRIA para evitar locks
            self::$pdo->exec('PRAGMA journal_mode = MEMORY');
            
            // Timeout para locks
            self::$pdo->exec('PRAGMA busy_timeout = 30000');
            
            // Sincronização NORMAL
            self::$pdo->exec('PRAGMA synchronous = NORMAL');
            
            // Cache grande
            self::$pdo->exec('PRAGMA cache_size = -64000');
            
            // Temp store na memória
            self::$pdo->exec('PRAGMA temp_store = MEMORY');
            
            // Foreign keys
            self::$pdo->exec('PRAGMA foreign_keys = ON');
        }

        return self::$pdo;
    }

    // Compatibilidade com código antigo
    public static function connect()
    {
        return self::connection();
    }
}
