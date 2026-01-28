# Dom Bosco API - Versão Laravel-style

## 🚀 O que foi feito

O código foi reescrito de PHP puro para uma estrutura **Laravel-style**, mantendo toda a funcionalidade original mas com melhor organização e padrões modernos.

## 📋 Mudanças Principais

### 1. **Estrutura de Diretórios**
```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── ProductController.php
│   │       ├── OrderController.php
│   │       ├── SettingsController.php
│   │       └── Admin/
│   │           ├── ProductController.php
│   │           └── UserController.php
│   ├── Middleware/
│   │   ├── Authenticate.php
│   │   ├── CheckRole.php
│   │   └── Cors.php
│   └── Response.php (Helper)
├── Models/ (mantido com PDO)
├── Utils/
│   └── JWT.php (atualizado com namespace)
config/
├── app.php
├── cors.php
├── database.php
└── jwt.php
database/
└── migrations/ (migrations Laravel-style)
routes/
└── api.php (rotas organizadas)
.env (configurações)
```

### 2. **Namespaces PHP**

Todos os controllers e classes agora usam namespaces:

```php
namespace App\Http\Controllers\Api;
namespace App\Http\Middleware;
namespace App\Utils;
```

### 3. **Middleware Pattern**

- `Authenticate` - Valida JWT token
- `CheckRole` - Valida role (admin/customer)
- `Cors` - Headers CORS automáticos

### 4. **Response Helper**

Classe unificada para respostas JSON:

```php
Response::success($data, $message);
Response::error($message, $code);
Response::created($data);
Response::unauthorized();
Response::forbidden();
Response::notFound();
```

### 5. **Configurações (.env)**

Todas as configurações sensíveis agora estão no `.env`:

```env
DB_DATABASE=C:/xampp/htdocs/Dom_Bosco/BANCO.db
JWT_SECRET=dombosco_jwt_secret_key_2026_secure_token
JWT_TTL=43200
```

### 6. **Migrations Laravel-Style**

Migrations organizadas com versionamento:

```
database/migrations/
├── 2024_01_01_000001_create_users_table.php
├── 2024_01_01_000002_create_products_table.php
├── 2024_01_01_000003_create_orders_table.php
├── 2024_01_01_000004_create_order_items_table.php
├── 2024_01_01_000005_create_images_table.php
├── 2024_01_01_000006_create_inventory_table.php
└── 2024_01_01_000007_create_settings_table.php
```

## ✅ O que foi mantido

- ✅ **Todos os endpoints** funcionam exatamente igual
- ✅ **Mesma lógica de negócio** (@papelaria.com = admin)
- ✅ **Mesmo banco SQLite**
- ✅ **Mesma autenticação JWT**
- ✅ **Mesmas validações**
- ✅ **Compatibilidade total** com o frontend React

## 🔄 Endpoints (inalterados)

### Públicos
- `POST /api/register` - Registrar usuário
- `POST /api/login` - Login
- `GET /api/products` - Listar produtos
- `GET /api/products/{id}` - Ver produto
- `POST /api/orders` - Criar pedido
- `GET /api/settings` - Ver configurações

### Admin (requer token + role:admin)
- `GET /api/admin/products` - Listar produtos (admin)
- `POST /api/admin/products` - Criar produto
- `PUT /api/admin/products/{id}` - Atualizar produto
- `DELETE /api/admin/products/{id}` - Deletar produto
- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/users` - Criar usuário
- `PUT /api/admin/users/{id}` - Atualizar usuário
- `DELETE /api/admin/users/{id}` - Deletar usuário
- `PUT /api/settings` - Atualizar configurações

## 🎯 Benefícios da Reescrita

### Organização
- Controllers separados por contexto (Api, Admin)
- Middleware reutilizável
- Response helper unificado
- Namespaces claros

### Manutenibilidade
- Código mais limpo e legível
- Separação de responsabilidades
- Fácil adicionar novos recursos
- Configurações centralizadas

### Segurança
- Validações consistentes
- Middleware de autenticação
- JWT com configuração segura
- Roles bem definidos

### Escalabilidade
- Estrutura preparada para crescer
- Fácil adicionar novas rotas
- Migrations versionadas
- Padrão Laravel facilita contratação

## 🚦 Como Usar

### 1. Verificar Configurações

Edite `.env` se necessário:
```env
DB_DATABASE=C:/caminho/para/seu/BANCO.db
JWT_SECRET=sua_chave_secreta
```

### 2. Iniciar Servidor

```bash
# Opção 1: PHP Built-in Server
cd C:\xampp\htdocs\Dom_Bosco\dom-bosco-api\public
php -S localhost:8000

# Opção 2: Apache/XAMPP
# Configure DocumentRoot para /public
```

### 3. Testar Endpoints

```bash
# Registro
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Produtos
curl http://localhost:8000/api/products
```

## 📝 Próximos Passos (Opcional)

Se quiser migrar para Laravel completo no futuro:

1. ✅ Estrutura já está Laravel-style
2. ⏭️ Instalar Laravel via Composer
3. ⏭️ Migrar Models para Eloquent ORM
4. ⏭️ Usar Artisan commands
5. ⏭️ Implementar Form Requests
6. ⏭️ Usar Laravel Queue, Cache, etc.

## ⚠️ Notas Importantes

- **Compatibilidade**: Frontend React funciona sem alterações
- **Banco de Dados**: SQLite mantido no mesmo local
- **JWT**: Tokens antigos continuam válidos
- **Roles**: Constraint CHECK mantida (admin|customer)

## 🆘 Troubleshooting

### Erro de permissões no .env
```bash
chmod 644 .env
```

### Token inválido
- Verifique JWT_SECRET no .env
- Gere novo token fazendo login novamente

### Banco não encontrado
- Verifique DB_DATABASE no .env
- Use caminho absoluto

## 📚 Arquivos Importantes

- `.env` - Configurações
- `routes/api.php` - Todas as rotas
- `app/Http/Response.php` - Helper de respostas
- `app/Http/Middleware/` - Middleware de auth e roles
- `config/` - Arquivos de configuração
- `database/migrations/` - Estrutura do banco

---

✨ **Código reescrito mantendo 100% de compatibilidade!**
