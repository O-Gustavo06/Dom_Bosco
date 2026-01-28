# Levantamento de Requisitos - Migração PHP Puro → Laravel

## 🎯 Objetivo
Transcrever o código atual de PHP puro para Laravel Framework mantendo **exatamente a mesma funcionalidade**, apenas adaptando para a estrutura do framework.

---

## 📊 Estrutura Atual (PHP Puro)

### Banco de Dados
- **Tipo:** SQLite
- **Localização:** `C:/xampp/htdocs/Dom_Bosco/BANCO.db`
- **Conexão:** PDO com singleton pattern

### Estrutura de Pastas
```
dom-bosco-api/
├── app/
│   ├── Controllers/          # Controllers MVC
│   ├── Models/              # Models com PDO
│   ├── Services/            # Classes auxiliares (Response)
│   └── Utils/               # JWT, Logger
├── config/
│   └── database.php         # Conexão PDO
├── routes/
│   └── api.php              # Roteamento manual
├── public/
│   ├── index.php            # Entry point
│   └── images/products/     # Upload de imagens
├── migrations/              # SQL scripts manuais
└── storage/logs/            # Logs
```

---

## 📋 Mapeamento de Components

### 1️⃣ **Models** (app/Models/)

#### Modelo: User
**Arquivo atual:** `app/Models/User.php`
**Funcionalidades:**
- ✅ Autenticação (email + password com bcrypt)
- ✅ CRUD completo
- ✅ Roles: `admin` | `customer`
- ✅ Validações customizadas
- ✅ Método `authenticate()` para login

**Transcreção Laravel:**
```
- Model: App\Models\User (Eloquent)
- Usar trait Authenticatable
- Manter mesmos campos: id, name, email, password, role, created_at
- Manter validação de roles em ['admin', 'customer']
```

#### Modelo: Product
**Arquivo atual:** `app/Models/Product.php`
**Funcionalidades:**
- ✅ CRUD de produtos
- ✅ Relacionamento com imagens
- ✅ Campos: id, name, description, price, stock, category, image_url, created_at

**Transcreção Laravel:**
```
- Model: App\Models\Product (Eloquent)
- Relacionamento hasMany com Image
- Relacionamento hasMany com Inventory
```

#### Modelo: Order
**Arquivo atual:** `app/Models/Order.php`
**Funcionalidades:**
- ✅ Criação de pedidos
- ✅ Relacionamento com produtos (order_items)

**Transcreção Laravel:**
```
- Model: App\Models\Order (Eloquent)
- Model: App\Models\OrderItem (Eloquent)
- Relacionamento hasMany com OrderItems
```

#### Modelo: Image
**Arquivo atual:** `app/Models/Image.php`
**Funcionalidades:**
- ✅ Gerenciamento de imagens de produtos

**Transcreção Laravel:**
```
- Model: App\Models\Image (Eloquent)
- Relacionamento belongsTo com Product
```

#### Modelo: Inventory
**Arquivo atual:** `app/Models/Inventory.php`
**Funcionalidades:**
- ✅ Controle de estoque

**Transcreção Laravel:**
```
- Model: App\Models\Inventory (Eloquent)
- Relacionamento belongsTo com Product
```

---

### 2️⃣ **Controllers** (app/Controllers/)

#### AuthController
**Endpoints:**
- `POST /api/register` - Registro de usuários
- `POST /api/login` - Login

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/AuthController.php
- register(): Response
- login(): Response
- Usar Hash::make() para senhas
- Retornar JSON com token JWT
```

#### UserController
**Endpoints:**
- `POST /api/register` - Registro com lógica de role (@papelaria.com = admin)
- `POST /api/login` - Login

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/UserController.php
- Manter lógica: emails @papelaria.com => admin, outros => customer
```

#### ProductController (Público)
**Endpoints:**
- `GET /api/products` - Listar todos
- `GET /api/products/{id}` - Ver detalhes

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/ProductController.php
- index(): JsonResponse
- show(Product $product): JsonResponse
```

#### AdminProductController
**Endpoints:**
- `GET /api/admin/products` - Listar (admin only)
- `POST /api/admin/products` - Criar (admin only)
- `PUT /api/admin/products/{id}` - Editar (admin only)
- `DELETE /api/admin/products/{id}` - Deletar (admin only)

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/Admin/ProductController.php
- Middleware: auth:api, role:admin
- index(), store(), update(), destroy()
```

#### AdminUserController
**Endpoints:**
- `GET /api/admin/users` - Listar usuários (admin only)
- `POST /api/admin/users` - Criar usuário (admin only)
- `PUT /api/admin/users/{id}` - Editar usuário (admin only)
- `DELETE /api/admin/users/{id}` - Deletar usuário (admin only)

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/Admin/UserController.php
- Middleware: auth:api, role:admin
- index(), store(), update(), destroy()
```

#### OrderController
**Endpoints:**
- `POST /api/orders` - Criar pedido

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/OrderController.php
- store(): JsonResponse
```

#### SettingsController
**Endpoints:**
- `GET /api/settings` - Ver configurações
- `PUT /api/settings` - Atualizar configurações

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/SettingsController.php
- index(), update()
```

#### ImageController
**Endpoints:**
- `POST /api/images/upload` - Upload de imagens

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/ImageController.php
- upload(): JsonResponse
- Usar Storage::disk('public')
```

#### InventoryController
**Endpoints:**
- Gerenciamento de estoque

**Transcreção Laravel:**
```php
// app/Http/Controllers/Api/InventoryController.php
```

---

### 3️⃣ **Autenticação & JWT**

#### JWT Atual
**Arquivo:** `app/Utils/JWT.php`
**Funcionalidades:**
- ✅ generate($payload) - Cria token
- ✅ verify($token) - Valida token
- ✅ getTokenFromHeader() - Extrai token do header

**Transcreção Laravel:**
```
- Instalar: composer require tymon/jwt-auth
- Configurar jwt.php
- Manter mesma estrutura de payload: id, name, email, role
- Criar middleware CheckRole para validar admin
```

---

### 4️⃣ **Rotas** (routes/api.php)

#### Estrutura Atual
Manual com `if/else` e regex para capturar parâmetros

**Transcreção Laravel:**
```php
// routes/api.php

// Públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

// Settings (público para leitura)
Route::get('/settings', [SettingsController::class, 'index']);

// Admin (protegido)
Route::prefix('admin')->middleware(['auth:api', 'role:admin'])->group(function () {
    // Produtos
    Route::get('/products', [Admin\ProductController::class, 'index']);
    Route::post('/products', [Admin\ProductController::class, 'store']);
    Route::put('/products/{id}', [Admin\ProductController::class, 'update']);
    Route::delete('/products/{id}', [Admin\ProductController::class, 'destroy']);
    
    // Usuários
    Route::get('/users', [Admin\UserController::class, 'index']);
    Route::post('/users', [Admin\UserController::class, 'store']);
    Route::put('/users/{id}', [Admin\UserController::class, 'update']);
    Route::delete('/users/{id}', [Admin\UserController::class, 'destroy']);
    
    // Settings
    Route::put('/settings', [SettingsController::class, 'update']);
});

// Imagens
Route::post('/images/upload', [ImageController::class, 'upload'])->middleware('auth:api');
```

---

### 5️⃣ **Validações**

#### Validações Atuais (manual)
- Email válido
- Senha mínima 6 caracteres
- Campos obrigatórios
- Role em ['admin', 'customer']

**Transcreção Laravel:**
```php
// app/Http/Requests/RegisterRequest.php
// app/Http/Requests/StoreProductRequest.php
// app/Http/Requests/UpdateProductRequest.php
// etc.

// Usar Form Requests para validação
```

---

### 6️⃣ **Middleware**

#### Necessários no Laravel

```php
// app/Http/Middleware/CheckRole.php
// Validar se usuário tem role específica

// app/Http/Middleware/Cors.php (se necessário)
// Headers CORS para frontend React
```

---

### 7️⃣ **Database Migrations**

#### Tabelas Atuais (SQLite)
- users
- products
- orders
- order_items
- images
- inventory
- settings

**Transcreção Laravel:**
```
- Criar migrations para todas as tabelas
- Manter mesma estrutura de campos
- Adicionar constraints (CHECK role IN ('admin', 'customer'))
- Manter foreign keys
```

---

### 8️⃣ **Configurações**

#### .env
```env
APP_NAME="Dom Bosco API"
DB_CONNECTION=sqlite
DB_DATABASE=/caminho/completo/BANCO.db

JWT_SECRET=sua_chave_secreta_jwt
JWT_TTL=43200  # 30 dias em minutos

FILESYSTEM_DISK=public
```

#### config/database.php
```php
'sqlite' => [
    'driver' => 'sqlite',
    'database' => env('DB_DATABASE'),
    'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
],
```

---

## 🔄 Regras de Negócio a Manter

### 1. Autenticação
- ✅ Login com email + password
- ✅ Token JWT com payload: id, name, email, role
- ✅ Token válido por 30 dias
- ✅ Senha com bcrypt

### 2. Roles
- ✅ Emails @papelaria.com => role 'admin'
- ✅ Outros emails => role 'customer'
- ✅ Apenas admin pode acessar rotas /api/admin/*
- ✅ Constraint CHECK no banco: role IN ('admin', 'customer')

### 3. Produtos
- ✅ Campos: name, description, price, stock, category, image_url
- ✅ Admin pode criar/editar/deletar
- ✅ Público pode apenas listar e visualizar

### 4. Imagens
- ✅ Upload em public/images/products/
- ✅ Relacionamento com produtos

### 5. Pedidos
- ✅ Pode ser feito sem login (no código atual)
- ✅ Contém items com product_id e quantity

---

## 📦 Pacotes Laravel Necessários

```bash
# JWT Authentication
composer require tymon/jwt-auth

# (Opcional) Para facilitar desenvolvimento
composer require --dev barryvdh/laravel-debugbar
```

---

## 🚀 Passos de Migração

### Fase 1: Setup Laravel
1. ✅ Instalar Laravel 10.x
2. ✅ Configurar SQLite no .env
3. ✅ Instalar tymon/jwt-auth
4. ✅ Configurar CORS

### Fase 2: Models & Migrations
1. ✅ Criar migrations (users, products, orders, etc.)
2. ✅ Criar Models Eloquent
3. ✅ Definir relacionamentos

### Fase 3: Controllers
1. ✅ Transcrever AuthController
2. ✅ Transcrever ProductController
3. ✅ Transcrever AdminProductController
4. ✅ Transcrever AdminUserController
5. ✅ Transcrever OrderController
6. ✅ Transcrever SettingsController
7. ✅ Transcrever ImageController
8. ✅ Transcrever InventoryController

### Fase 4: Rotas & Middleware
1. ✅ Configurar routes/api.php
2. ✅ Criar middleware CheckRole
3. ✅ Configurar JWT middleware

### Fase 5: Validações
1. ✅ Criar Form Requests
2. ✅ Transcrever validações customizadas

### Fase 6: Testes
1. ✅ Testar cada endpoint
2. ✅ Validar autenticação
3. ✅ Validar permissões admin
4. ✅ Testar upload de imagens

---

## ⚠️ Pontos de Atenção

### 1. Compatibilidade com Frontend
- Manter mesmos endpoints
- Manter mesma estrutura de JSON response
- Manter mesmo formato de token JWT

### 2. Headers CORS
```php
'Access-Control-Allow-Origin' => '*'
'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE'
'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
```

### 3. Estrutura de Response
Manter padrão atual:
```json
// Sucesso
{
  "message": "...",
  "data": {...}
}

// Erro
{
  "error": "..."
}
```

### 4. Upload de Imagens
- Manter em public/images/products/
- Ou migrar para storage/app/public usando symlink

---

## 📝 Checklist Final

- [ ] Todas as rotas funcionando
- [ ] Autenticação JWT funcionando
- [ ] Middleware de admin funcionando
- [ ] CRUD de produtos completo
- [ ] CRUD de usuários completo
- [ ] Upload de imagens funcionando
- [ ] Validações corretas
- [ ] Frontend conectado sem erros
- [ ] Mesmos endpoints mantidos
- [ ] Mesma estrutura de responses

---

## 🎯 Resultado Esperado

Um projeto Laravel com:
- ✅ Mesma funcionalidade exata
- ✅ Código mais organizado (padrão Laravel)
- ✅ Migrations versionadas
- ✅ Eloquent ORM
- ✅ Validações com Form Requests
- ✅ Rotas organizadas
- ✅ Middleware de autenticação
- ✅ Melhor manutenibilidade

**SEM** alterações na lógica de negócio ou funcionalidades!
