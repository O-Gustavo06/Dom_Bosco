<?php

/**
 * Stubs para IntelliSense
 * Este arquivo ajuda o editor a reconhecer as classes do projeto
 */

namespace {
    class JWT {
        public static function generate(array $payload): string { return ''; }
        public static function verify(string $token): ?array { return null; }
        public static function getTokenFromHeader(): ?string { return null; }
    }

    class User {
        public function __construct() {}
        public function getByEmail(string $email): ?array { return null; }
        public function getById(int $id): ?array { return null; }
        public function getAll(): array { return []; }
        public function create(string $name, string $email, string $password, string $role = 'customer'): int { return 0; }
        public function update(int $id, array $data): bool { return false; }
        public function delete(int $id): bool { return false; }
        public function authenticate(string $email, string $password): ?array { return null; }
    }

    class Product {
        public function __construct() {}
        public function getAll(): array { return []; }
        public function getAllAdmin(): array { return []; }
        public function getById(int $id): ?array { return null; }
        public function create(array $data): int { return 0; }
        public function update(int $id, array $data): bool { return false; }
        public function delete(int $id): bool { return false; }
    }

    class Order {
        public function __construct() {}
        public function create(array $data): int { return 0; }
    }

    class Image {
        public function __construct() {}
        public function getByProductId(int $productId): array { return []; }
        public function upload(int $productId, array $file, ?string $customName = null): ?array { return null; }
    }

    class Inventory {
        public function __construct() {}
        public function getByProductId(int $productId): ?array { return null; }
        public function getAll(): array { return []; }
        public function create(int $productId, int $quantity = 0, int $minQuantity = 5): bool { return false; }
        public function updateQuantity(int $productId, int $quantity): bool { return false; }
    }

    class Logger {
        public function __construct(string $filename) {}
        public function info(string $message, array $context = []): void {}
        public function error(string $message, array $context = []): void {}
        public function warning(string $message, array $context = []): void {}
    }

    class Database {
        public static function connection(): \PDO { return new \PDO('sqlite::memory:'); }
        public static function connect(): \PDO { return new \PDO('sqlite::memory:'); }
    }
}

namespace App\Http {
    class Response {
        public static function json($data, int $code = 200): void {}
        public static function success($data, string $message = null, int $code = 200): void {}
        public static function error(string $message, int $code = 400): void {}
        public static function created($data, string $message = 'Criado com sucesso'): void {}
        public static function unauthorized(string $message = 'Não autorizado'): void {}
        public static function forbidden(string $message = 'Acesso negado'): void {}
        public static function notFound(string $message = 'Não encontrado'): void {}
    }
}

namespace App\Http\Middleware {
    class Authenticate {
        public static function handle(): ?array { return null; }
    }

    class CheckRole {
        public static function handle(array $user, string $requiredRole): void {}
        public static function admin(array $user): void {}
        public static function customer(array $user): void {}
    }

    class Cors {
        public static function handle(): void {}
    }
}

namespace App\Utils {
    class JWT {
        public static function generate(array $payload): string { return ''; }
        public static function verify(string $token): ?array { return null; }
        public static function getTokenFromHeader(): ?string { return null; }
    }
}
