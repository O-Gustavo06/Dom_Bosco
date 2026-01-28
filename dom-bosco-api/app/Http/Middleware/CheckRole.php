<?php

namespace App\Http\Middleware;

class CheckRole
{
    public static function handle(array $user, string $requiredRole): void
    {
        if (($user['role'] ?? null) !== $requiredRole) {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso permitido apenas para ' . $requiredRole]);
            exit;
        }
    }

    public static function admin(array $user): void
    {
        self::handle($user, 'admin');
    }

    public static function customer(array $user): void
    {
        self::handle($user, 'customer');
    }
}
