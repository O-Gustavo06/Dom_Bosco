<?php

namespace App\Http;

class Response
{
    public static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data, ?string $message = null, int $code = 200): void
    {
        $response = $message ? ['message' => $message, 'data' => $data] : $data;
        self::json($response, $code);
    }

    public static function error(string $message, int $code = 400): void
    {
        self::json(['error' => $message], $code);
    }

    public static function created($data, string $message = 'Criado com sucesso'): void
    {
        self::json(['message' => $message, 'data' => $data], 201);
    }

    public static function unauthorized(string $message = 'Não autorizado'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Acesso negado'): void
    {
        self::error($message, 403);
    }

    public static function notFound(string $message = 'Não encontrado'): void
    {
        self::error($message, 404);
    }
}
