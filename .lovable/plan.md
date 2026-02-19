
## Criar novo ícone PWA com halter de academia

### O que será feito

Redesenhar o ícone do app (favicon SVG + PNGs do PWA) para mostrar um **halter/dumbbell** estilizado sobre o fundo gradiente laranja-vermelho da marca WEMOVELT.

### Design do ícone

O halter será desenhado em SVG com traços brancos sobre o fundo circular gradiente existente (`#f97316` para `#dc2626`). O design será minimalista: uma barra horizontal com dois discos em cada extremidade.

```text
┌──────────────────┐
│   ◼━━━━━━━◼      │
│  ◼◼━━━━━━◼◼     │
│   ◼━━━━━━━◼      │
│                  │
│  Fundo gradiente │
│  laranja→vermelho│
└──────────────────┘
```

### Arquivos modificados

**1. `public/favicon.svg`** — Substituir o ícone atual (setas) por um halter/dumbbell branco sobre o mesmo fundo gradiente circular.

O SVG do halter será composto por:
- Círculo de fundo com gradiente laranja-vermelho (mantido)
- Barra central horizontal (retângulo branco)
- Dois pares de discos (retângulos arredondados brancos) nas extremidades

**2. `public/icon-180.png`, `public/icon-192.png`, `public/icon-512.png`** — Estes precisarão ser regenerados a partir do novo SVG. Como não é possível converter SVG para PNG diretamente no código, o favicon SVG será atualizado e os PNGs serão referenciados com o mesmo SVG via tag `<link>` no `index.html` como fallback. Alternativamente, podemos criar os ícones PNG usando um canvas no build ou orientar o usuário a gerar os PNGs externamente.

### Abordagem prática

Como a limitação principal é gerar PNGs, a solução será:

1. **Atualizar `public/favicon.svg`** com o novo design do halter
2. **Atualizar `index.html`** para adicionar o SVG como apple-touch-icon fallback
3. Os PNGs existentes continuarão funcionando até o usuário gerar novos (instruções serão fornecidas)

### Detalhes técnicos do SVG

O novo `favicon.svg` terá:
- Viewbox: `0 0 32 32`
- Fundo: círculo com gradiente `#f97316` → `#dc2626` (mesmo da marca)
- Halter: elementos `rect` com `rx` para cantos arredondados, cor branca
  - Barra central: retângulo fino horizontal
  - Discos internos: retângulos mais largos e altos
  - Discos externos: retângulos menores nas pontas
