<?php

namespace App\Http\Middleware;

use App\Utils\JWT;

class Authenticate
{
    public static function handle(): ?array
    {
        $token = JWT::getTokenFromHeader();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Token não fornecido']);
            exit;
        }

        $payload = JWT::verify($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido ou expirado']);
            exit;
        }

        return $payload;
    }
}
