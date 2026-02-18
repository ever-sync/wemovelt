
## Remover linha do Header

A linha visível abaixo do header vem da classe `border-b border-border` no elemento `<header>` em `src/components/layout/Header.tsx`.

### Mudança

**Arquivo:** `src/components/layout/Header.tsx`

Remover `border-b border-border` da classe do `<header>`:

```tsx
// Antes
<header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40 border-b border-border">

// Depois
<header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40">
```

Apenas essa remoção — nenhum outro arquivo alterado.
