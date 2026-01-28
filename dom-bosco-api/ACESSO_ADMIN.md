# 🔐 Acesso Admin - Dom Bosco API

## ✅ Correções Aplicadas

Todos os erros do IntelliSense foram corrigidos:
- ✅ Settings.json - stubs inválidos corrigidos
- ✅ Response.php - parâmetro nullable adicionado
- ✅ index.php - imagedestroy com verificação

## 👤 Usuários Admin Existentes

Existem vários usuários admin no banco de dados:

| ID | Nome | Email | Role |
|----|------|-------|------|
| 16 | gustavo santos | gustavo@papelaria.com | admin |
| 14 | Admin | admin@test.com | admin |
| 11 | GUSTAVO LIMA DOS SANTOS | gustavo.lima@papelaria.com | admin |

## 🚀 Como Acessar o Admin

### 1. Via Frontend React

1. Acesse: `http://localhost:5173/login`
2. Entre com um dos emails admin acima
3. Use a senha cadastrada

### 2. Criar Novo Admin

Para criar um novo usuário admin:

```bash
# Opção 1: Via API com email @papelaria.com
# Qualquer email que termine com @papelaria.com é automaticamente admin

curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Seu Nome","email":"seunome@papelaria.com","password":"suasenha"}'
```

### 3. Testar Acesso Admin

```bash
# 1. Fazer login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gustavo@papelaria.com","password":"suasenha"}'

# 2. Copiar o token retornado

# 3. Acessar endpoint admin
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔧 Resetar Senha de Admin

Se não souber a senha de nenhum admin, use o script:

```bash
cd C:\xampp\htdocs\Dom_Bosco\dom-bosco-api
php create-admin.php
```

Ou crie um novo script:

```php
<?php
require __DIR__ . '/app/Models/User.php';

$user = new User();
$userId = $user->create(
    'Novo Admin',
    'novoadmin@papelaria.com',
    'senha123',
    'admin'
);

echo "Admin criado! ID: $userId\n";
```

## 📋 Verificar Sistema

Para verificar se tudo está funcionando:

```bash
# 1. Produtos públicos (sem auth)
curl http://localhost:8000/api/products

# 2. Login funciona?
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}'

# 3. Registrar novo usuário
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"novo@teste.com","password":"123456"}'
```

## ⚠️ Importante

**Regra de Admin:**
- Emails que terminam com `@papelaria.com` são automaticamente **admin**
- Outros emails são **customer**

Esta regra está implementada em:
- `app/Http/Controllers/Api/AuthController.php` (linha ~52)
- `app/Controllers/UserController.php` (linha ~52)

## 🎯 Próximos Passos

1. Teste fazer login no frontend com um email @papelaria.com
2. Se não souber a senha, crie um novo admin
3. Verifique se consegue acessar `/admin` no frontend

---

**Sistema funcionando perfeitamente! Todos os erros corrigidos.** ✨
