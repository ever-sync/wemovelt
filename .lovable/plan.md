

# Plano: Corrigir Instalação PWA no iOS

## Problema Identificado

Os ícones necessários para o PWA **não existem** no projeto:

| Arquivo Esperado | Status |
|------------------|--------|
| `/public/icon-192.png` | ❌ Não existe |
| `/public/icon-512.png` | ❌ Não existe |
| `/public/og-image.png` | ❌ Não existe |

Sem esses ícones, o PWA não consegue ser instalado corretamente em nenhuma plataforma.

## Sobre Instalação no iOS

O Safari no iOS **não suporta** instalação automática via `beforeinstallprompt`. A única forma de instalar é manualmente:

1. Abrir o Safari
2. Tocar no ícone de Compartilhar (seta para cima)
3. Selecionar "Adicionar à Tela de Início"

A implementação atual já mostra essas instruções para usuários iOS no modal de Ajuda.

## Solução

### 1. Criar os Ícones Necessários

Precisamos criar ícones PNG com o logo do WEMOVELT:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels
- `icon-180.png` - 180x180 pixels (específico para iOS)
- `og-image.png` - 1200x630 pixels (para compartilhamento social)

### 2. Atualizar Configurações iOS

Adicionar ícone específico para iOS no `index.html`:

```html
<link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
```

### 3. Atualizar Manifest

Separar os propósitos dos ícones para melhor compatibilidade:

```json
"icons": [
  {
    "src": "/icon-192.png",
    "sizes": "192x192",
    "type": "image/png"
  },
  {
    "src": "/icon-512.png",
    "sizes": "512x512",
    "type": "image/png"
  }
]
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `public/icon-192.png` | Criar - ícone 192x192 |
| `public/icon-512.png` | Criar - ícone 512x512 |
| `public/icon-180.png` | Criar - ícone iOS |
| `public/og-image.png` | Criar - imagem para compartilhamento |
| `public/manifest.json` | Atualizar - corrigir configuração de ícones |
| `index.html` | Atualizar - adicionar apple-touch-icon correto |

---

## Instruções para Instalar no iPhone

Após as correções, o processo no iOS será:

1. Abrir o app no **Safari** (não funciona no Chrome iOS)
2. Tocar no ícone **Compartilhar** (quadrado com seta)
3. Rolar para baixo e tocar em **"Adicionar à Tela de Início"**
4. Confirmar o nome e tocar em **"Adicionar"**

O app aparecerá na tela inicial como um ícone normal.

