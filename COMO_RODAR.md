# 🚀 COMO RODAR A APLICAÇÃO DOM BOSCO

## ⚠️ IMPORTANTE: DOIS SERVIDORES DIFERENTES!

Você precisa rodar **2 servidores em paralelo**:

### 1️⃣ **SERVIDOR BACKEND (PHP API)**
**Local**: C:\xampp\htdocs\Dom_Bosco\dom-bosco-api

```powershell
cd C:\xampp\htdocs\Dom_Bosco\dom-bosco-api
php -S localhost:8000
```

- Porta: **8000**
- Função: API REST (login, produtos, imagens, etc)
- Linguagem: PHP puro

---

### 2️⃣ **SERVIDOR FRONTEND (React + Vite)**
**Local**: C:\xampp\htdocs\Dom_Bosco\dom-bosco-web

```powershell
cd C:\xampp\htdocs\Dom_Bosco\dom-bosco-web
npm run dev
```

- Porta: **5173** (padrão Vite)
- Função: Interface React
- Linguagem: JavaScript/React

---

## 📋 CHECKLIST

- [ ] Terminal 1: `php -S localhost:8000` rodando
- [ ] Terminal 2: `npm run dev` rodando  
- [ ] Acessar http://localhost:5173 no navegador
- [ ] Verificar console do navegador (F12) para erros
- [ ] Verificar Network tab para chamadas à API

---

## 🔍 PROBLEMAS COMUNS

### ❌ "Não é possível acessar esse site"
**Causa**: Vite não está rodando
**Solução**: 
```powershell
cd C:\xampp\htdocs\Dom_Bosco\dom-bosco-web
npm install  # Se necessário
npm run dev
```

### ❌ "Failed to fetch" nas requisições
**Causa**: API PHP não está rodando
**Solução**:
```powershell
cd C:\xampp\htdocs\Dom_Bosco\dom-bosco-api
php -S localhost:8000
```

### ❌ Porta já está em uso
**Solução**:
```powershell
# Para verificar qual processo está usando
netstat -ano | findstr ":8000"
netstat -ano | findstr ":5173"

# Para matar o processo (trocar PID)
taskkill /PID <numero> /F
```

---

## 📝 RESUMO DOS ARQUIVOS

```
dom-bosco-api/          ← API PHP (porta 8000)
├── app/
│   ├── Controllers/    ← Lógica das requisições
│   ├── Models/         ← Image.php, Product.php, etc
│   └── Middlewares/
├── config/
│   └── database.php    ← Conexão SQLite
└── routes/
    └── api.php         ← Definição das rotas

dom-bosco-web/          ← Interface React (porta 5173)
├── src/
│   ├── components/     ← Header.jsx, ProductCard.jsx
│   ├── pages/          ← Home, Login, Admin, etc
│   ├── contexts/       ← AuthContext, CartContext
│   └── api/
│       └── api.js      ← Chamadas para localhost:8000
└── package.json
```

---

## 🐛 ERROS CORRIGIDOS

1. ✅ **Header.jsx**: Sintaxe JSX corrigida (tags fechadas)
2. ✅ **Image.php**: Removido `finfo_close()` deprecated
3. ✅ **AuthContext**: Criado com login/register/logout
4. ✅ **AdminProducts.jsx**: Restaurado com CRUD completo
5. ✅ **Dashboard.jsx**: Layout admin com sidebar
