<?php

namespace App\Utils;

class JWT
{
    private static function getSecret(): string
    {
        return $_ENV['JWT_SECRET'] ?? 'dombosco_jwt_secret_key_2026_secure_token';
    }
    
    private const ALG = 'HS256';
    private const TOKEN_TTL = 2592000; // 30 dias em segundos

    private static function logDebug(string $message): void
    {
        $logDir = __DIR__ . '/../../storage/logs';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/jwt_debug.log';
        $time = date('Y-m-d H:i:s');
        @file_put_contents($logFile, "[{$time}] {$message}\n", FILE_APPEND | LOCK_EX);
    }

    /**
     * Gera um token JWT
     */
    public static function generate(array $payload): string
    {
        $header = [
            'alg' => self::ALG,
            'typ' => 'JWT'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + self::TOKEN_TTL;

        $encodedHeader  = self::base64UrlEncode(json_encode($header));
        $encodedPayload = self::base64UrlEncode(json_encode($payload));

        $signature = self::sign("$encodedHeader.$encodedPayload");

        return "$encodedHeader.$encodedPayload.$signature";
    }

    /**
     * Valida e decodifica um token JWT
     */
    public static function verify(string $token): ?array
    {
        try {
            $parts = explode('.', $token);

            if (count($parts) !== 3) {
                self::logDebug("verify: token partes inválidas (count=" . count($parts) . ") - token={$token}");
                return null;
            }

            [$header, $payload, $signature] = $parts;

            $expected = self::sign("$header.$payload");

            if (!hash_equals($expected, $signature)) {
                self::logDebug("verify: assinatura inválida - expected={$expected} signature={$signature} token={$token}");
                return null;
            }

            $decodedPayload = json_decode(
                self::base64UrlDecode($payload),
                true
            );

            if (!is_array($decodedPayload)) {
                self::logDebug("verify: payload JSON inválido - payload={$payload} token={$token}");
                return null;
            }

            if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
                self::logDebug("verify: token expirado - exp={$decodedPayload['exp']} now=" . time() . " token={$token}");
                return null;
            }

            return $decodedPayload;
        } catch (\Throwable $e) {
            self::logDebug("verify: exceção - " . $e->getMessage() . " token={$token}");
            return null;
        }
    }

    /**
     * Extrai o token do header Authorization
     */
    public static function getTokenFromHeader(): ?string
    {
        $headers = [];

        if (function_exists('getallheaders')) {
            foreach (getallheaders() as $k => $v) {
                $headers[$k] = $v;
            }
        }

        $authHeader = null;

        foreach ($headers as $k => $v) {
            if (strtolower($k) === 'authorization') {
                $authHeader = $v;
                break;
            }
        }

        if (!$authHeader) {
            if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }
        }

        if (empty($authHeader)) {
            return null;
        }

        if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private static function sign(string $data): string
    {
        return self::base64UrlEncode(
            hash_hmac('sha256', $data, self::getSecret(), true)
        );
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(
            strtr(base64_encode($data), '+/', '-_'),
            '='
        );
    }

    private static function base64UrlDecode(string $data): string
    {
        $padding = strlen($data) % 4;

        if ($padding > 0) {
            $data .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(
            strtr($data, '-_', '+/')
        );
    }
}
