# Módulos de Pagamento - Dom Bosco

## 📋 Visão Geral

Este documento descreve os novos módulos de pagamento implementados no checkout, preparados para integração futura com a API do Mercado Pago.

## 🎯 Funcionalidades Implementadas

### 1. Pagamento via PIX (`PaymentPix.jsx`)

#### Recursos:
- ✅ Interface visual para pagamento via PIX
- ✅ Simulação de geração de código PIX
- ✅ QR Code placeholder (pronto para integração)
- ✅ Código PIX copiável (Copiar & Colar)
- ✅ Instruções de pagamento claras
- ✅ Feedback visual de segurança

#### Fluxo:
1. Usuário seleciona PIX como método de pagamento
2. Sistema exibe preview do QR Code (será gerado via API Mercado Pago)
3. Código PIX é gerado e pode ser copiado
4. Após confirmação, dados são enviados para o backend

#### Estrutura de Dados:
```javascript
{
  method: "pix",
  pixCode: "string", // Código PIX gerado
  status: "pending"
}
```

### 2. Pagamento via Cartão de Crédito (`PaymentCard.jsx`)

#### Recursos:
- ✅ Formulário completo de cartão de crédito
- ✅ Validação de campos (número, CVV, validade, nome)
- ✅ Formatação automática (número do cartão, validade)
- ✅ Detecção automática da bandeira do cartão
- ✅ Preview visual do cartão com animação
- ✅ Opção de salvar cartão para uso futuro
- ✅ Suporte para cartões salvos (mock preparado)
- ✅ Validação de cartão expirado
- ✅ Suporte para múltiplas bandeiras (Visa, Mastercard, Amex, Elo, etc.)

#### Bandeiras Suportadas:
- Visa
- Mastercard
- American Express
- Elo
- Diners
- Discover
- JCB

#### Validações Implementadas:
- ✅ Número do cartão (13-19 dígitos)
- ✅ Nome do titular (mínimo 3 caracteres)
- ✅ Validade (formato MM/AA, verifica expiração)
- ✅ CVV (3-4 dígitos)

#### Estrutura de Dados:
```javascript
{
  method: "credit_card",
  cardNumber: "string", // Número completo (será tokenizado)
  cardName: "string",
  cardExpiry: "MM/AA",
  cardCvv: "string",
  saveCard: boolean,
  brand: "string", // Ex: "Visa", "Mastercard"
  lastDigits: "string" // 4 últimos dígitos
}
```

### 3. Checkout Atualizado (`Checkout.jsx`)

#### Melhorias:
- ✅ Seleção visual de método de pagamento
- ✅ Validação de método de pagamento obrigatório
- ✅ Integração com componentes PIX e Cartão
- ✅ Exibição do método selecionado no resumo
- ✅ Gerenciamento de estado unificado
- ✅ Tratamento de erros aprimorado

## 🔄 Integração com Mercado Pago (Próximos Passos)

### Backend API

#### 1. Endpoint de Criação de Pagamento PIX
```php
POST /api/payments/pix
{
  "transaction_amount": 100.00,
  "description": "Pedido #123",
  "payment_method_id": "pix",
  "payer": {
    "email": "cliente@email.com"
  }
}

Response:
{
  "qr_code": "base64_image",
  "qr_code_base64": "string",
  "ticket_url": "string"
}
```

#### 2. Endpoint de Pagamento com Cartão
```php
POST /api/payments/card
{
  "transaction_amount": 100.00,
  "token": "card_token_from_mercadopago",
  "description": "Pedido #123",
  "installments": 1,
  "payment_method_id": "visa",
  "payer": {
    "email": "cliente@email.com"
  }
}
```

### Frontend

#### Integração do SDK do Mercado Pago

1. **Instalar SDK:**
```bash
npm install @mercadopago/sdk-react
```

2. **No PaymentCard.jsx:**
```javascript
import { CardPayment } from '@mercadopago/sdk-react';

// Tokenizar cartão antes de enviar
const createCardToken = async () => {
  const token = await window.MP.createToken({
    cardNumber: cardData.number,
    cardholderName: cardData.name,
    cardExpirationMonth: cardData.expiry.split('/')[0],
    cardExpirationYear: '20' + cardData.expiry.split('/')[1],
    securityCode: cardData.cvv
  });
  return token.id;
};
```

3. **No PaymentPix.jsx:**
```javascript
// Ao receber resposta do backend com QR Code
const pixResponse = await api.post('/api/payments/pix', payload);
setPixCode(pixResponse.data.qr_code_base64);
setQrCodeImage(pixResponse.data.qr_code);
```

## 📁 Estrutura de Arquivos

```
dom-bosco-web/
├── src/
│   ├── components/
│   │   ├── PaymentPix.jsx      # Componente de pagamento PIX
│   │   ├── PaymentCard.jsx     # Componente de cartão de crédito
│   │   └── ...
│   ├── pages/
│   │   └── Checkout.jsx        # Página de checkout atualizada
│   └── styles/
│       └── payment.css         # Estilos dos componentes de pagamento
```

## 🎨 Temas e Responsividade

- ✅ Suporte completo ao modo escuro/claro
- ✅ Design responsivo para mobile
- ✅ Animações suaves
- ✅ Feedback visual em todas as ações

## 🔒 Segurança

### Implementado:
- Validação de campos no frontend
- Formatação de dados sensíveis
- Feedback de segurança ao usuário

### A Implementar (Backend):
- Tokenização de cartões
- Criptografia de dados sensíveis
- Validação de transações
- Webhook para status de pagamento
- Logs de auditoria

## 📝 Notas de Desenvolvimento

### Dados Mock
Os componentes incluem dados mock para facilitar o desenvolvimento:
- Cartões salvos (comentado por padrão)
- Geração simulada de código PIX
- QR Code placeholder

### Configurações do Mercado Pago

Para integrar, será necessário:

1. Criar conta no Mercado Pago
2. Obter credenciais:
   - Public Key (frontend)
   - Access Token (backend)
3. Configurar webhooks
4. Implementar validação de pagamentos

### Exemplo de Configuração (Backend):
```php
// config/mercadopago.php
return [
    'public_key' => env('MERCADO_PAGO_PUBLIC_KEY'),
    'access_token' => env('MERCADO_PAGO_ACCESS_TOKEN'),
    'webhook_secret' => env('MERCADO_PAGO_WEBHOOK_SECRET'),
];
```

## 🧪 Testes

### Testar PIX:
1. Adicione produtos ao carrinho
2. Vá para o checkout
3. Preencha dados de entrega
4. Selecione PIX
5. Observe o código gerado (mock)

### Testar Cartão:
1. Adicione produtos ao carrinho
2. Vá para o checkout
3. Preencha dados de entrega
4. Selecione Cartão de Crédito
5. Preencha dados do cartão (use números de teste)
6. Observe validações em tempo real

#### Números de Cartão para Teste:
- Visa: 4532 1488 0343 6467
- Mastercard: 5425 2334 3010 9903
- Amex: 3782 822463 10005

## 📞 Suporte

Para dúvidas sobre a integração:
- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers)
- [SDK React do Mercado Pago](https://github.com/mercadopago/sdk-react)

## ✅ Checklist de Integração

### Frontend
- [x] Componente PIX criado
- [x] Componente Cartão criado
- [x] Checkout atualizado
- [x] Validações implementadas
- [x] Design responsivo
- [ ] SDK Mercado Pago instalado
- [ ] Tokenização implementada
- [ ] QR Code real integrado

### Backend
- [ ] Controller de pagamentos criado
- [ ] Integração com API Mercado Pago
- [ ] Webhook configurado
- [ ] Validações de segurança
- [ ] Logs de transações
- [ ] Tratamento de erros
- [ ] Testes unitários

---

**Última Atualização:** Janeiro 2026
**Versão:** 1.0.0
**Status:** Pronto para integração com Mercado Pago
