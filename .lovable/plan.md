
## Corrigir conteúdo cortado na parte inferior do app (mobile)

### Problema identificado

Na imagem enviada, dois problemas são visíveis:

1. **Conteúdo cortado**: Os botões "Google Maps" e "Waze" na seção de academias estão sendo parcialmente ocultados pela BottomNav + pelo botão flutuante "Chamar Personal".
2. **Botão FAB sobreposto**: O `WhatsAppFAB` está posicionado em `bottom-[84px]`, ficando na frente dos botões de navegação no final da página.

### Causa raiz

Todas as páginas usam `pb-20` (80px) como padding inferior, mas isso não é suficiente quando há:
- BottomNav com ~64px de altura
- Safe area inset (barra de sistema iOS/Android) adicional
- Botão FAB flutuante que cobre parte do conteúdo

### O que será corrigido

**1. Aumentar padding inferior de todas as páginas principais:**

Mudar `pb-20` para `pb-32` nos containers das páginas:
- `src/pages/Home.tsx`
- `src/pages/Treinos.tsx`
- `src/pages/Habitos.tsx`
- `src/pages/Frequencia.tsx`
- `src/pages/Comunidade.tsx`

`pb-32` = 128px, suficiente para acomodar a BottomNav (64px) + safe area + espaço visual confortável.

**2. Adicionar suporte a safe-area-inset-bottom no padding:**

Usar `style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}` nos containers para garantir compatibilidade com dispositivos com barra de gestos (Android) e notch/home indicator (iPhone).

**3. Ajustar posição do FAB:**

Mover o `WhatsAppFAB` para `bottom-[96px]` para não sobrepor o último item visível da lista de academias.

### Arquivos modificados

- `src/pages/Home.tsx` — aumentar padding inferior
- `src/pages/Treinos.tsx` — aumentar padding inferior
- `src/pages/Habitos.tsx` — aumentar padding inferior
- `src/pages/Frequencia.tsx` — aumentar padding inferior
- `src/pages/Comunidade.tsx` — aumentar padding inferior
- `src/components/WhatsAppFAB.tsx` — ajustar posição do botão flutuante
