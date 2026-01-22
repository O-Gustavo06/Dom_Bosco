# 📝 Como Usar Nomes Customizados nas Imagens

## O que mudou?

Agora quando você adiciona uma imagem a um produto, o sistema pedirá um nome descritivo antes de fazer o upload.

## Como funciona:

### 1. Clique no botão 🖼️ de gerenciar imagens do produto

### 2. Clique em "Selecionar Imagens" e escolha um ou mais arquivos

### 3. Um modal aparecerá pedindo o nome para cada imagem:
- **Arquivo original**: mostra o nome do arquivo que você selecionou
- **Nome da Imagem**: campo onde você digita o nome descritivo
- O sistema já preenche com o nome do arquivo (sem extensão) como sugestão

### 4. Digite um nome descritivo:
- ✅ Use apenas letras, números e hífens
- ✅ Exemplos bons: `caneta-azul`, `caderno-50-folhas`, `tesoura-escolar`
- ❌ Evite: espaços, acentos, caracteres especiais

### 5. Clique em:
- **➡️ Próxima** - se tiver mais imagens para nomear
- **✓ Enviar** - se for a última imagem

### 6. O sistema salvará a imagem com o nome que você escolheu!

## Exemplo:

Antes:
```
["prod_6971813c6d20b3.90391917.jpg", "prod_6971813c6d20b3.90391918.jpg"]
```

Depois:
```
["tesoura-escolar-inox.jpg", "tesoura-escolar-cabo-azul.jpg"]
```

## Vantagens:

✅ **Nomes descritivos** - Fácil de identificar cada imagem no banco
✅ **Organização** - Imagens bem nomeadas facilitam manutenção
✅ **SEO** - Nomes descritivos são melhores para buscas
✅ **Clareza** - Você sabe exatamente qual imagem é qual

## Observações:

- O sistema sanitiza automaticamente o nome (remove caracteres inválidos)
- A extensão do arquivo original é mantida (.jpg, .png, etc)
- Se você não fornecer um nome, o sistema gera um automaticamente
- Cada imagem pode ter um nome diferente
