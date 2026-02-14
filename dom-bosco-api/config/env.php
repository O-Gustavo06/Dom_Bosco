<?php

function loadEnv($path = null) {
    if ($path === null) {
        $path = __DIR__ . '/../.env';
    }
    
    if (!file_exists($path)) {
        return false;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        if (strpos($line, '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            $value = trim($value, "\"'");
            
            if (!array_key_exists($name, $_ENV)) {
                $_ENV[$name] = $value;
                putenv("$name=$value");
            }
        }
    }
    
    return true;
}


if (!function_exists('env')) {
    function env($key, $default = null) {
        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }
        
        $value = getenv($key);
        return $value !== false ? $value : $default;
    }
}

loadEnv();
