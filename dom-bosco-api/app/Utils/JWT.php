<?php

class JWT
{
    private static string $SECRET = 'sua_chave_secreta_super_segura_2024';

    /**
     * Gera um token JWT
     */
    public static function generate(array $payload): string
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + (24 * 60 * 60); // 24 horas

        $header = self::base64UrlEncode(json_encode($header));
        $payload = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", self::$SECRET, true)
        );

        return "$header.$payload.$signature";
    }

    /**
     * Valida e decodifica um token JWT
     */
    public static function verify(string $token): ?array
    {
        try {
            $parts = explode('.', $token);
            
            if (count($parts) !== 3) {
                return null;
            }

            [$header, $payload, $signature] = $parts;

            $newSignature = self::base64UrlEncode(
                hash_hmac('sha256', "$header.$payload", self::$SECRET, true)
            );

            if ($signature !== $newSignature) {
                return null;
            }

            $decoded = json_decode(self::base64UrlDecode($payload), true);

            // Verifica expiração
            if (isset($decoded['exp']) && $decoded['exp'] < time()) {
                return null;
            }

            return $decoded;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Extrai o token do header Authorization
     */
    public static function getTokenFromHeader(): ?string
    {
        $headers = getallheaders();
        
        if (!isset($headers['Authorization'])) {
            return null;
        }

        $authHeader = $headers['Authorization'];
        
        if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Codifica em base64 URL safe
     */
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decodifica base64 URL safe
     */
    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 4 - (strlen($data) % 4)));
    }
}
