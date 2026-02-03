

# Plano: Corrigir Safe Area do iOS no PWA

## Problema

No modo PWA standalone do iOS, o header esta usando `top-0` e fica escondido atras da area do status bar/notch do iPhone. O app precisa respeitar as "safe areas" do iOS.

```
+---------------------------+
|  [Status Bar/Notch]       |  <- Header fica escondido aqui
|  HEADER CORTADO           |
+---------------------------+
|  Conteudo                 |
```

## Causa

O header usa `fixed top-0` sem considerar `safe-area-inset-top` do iOS. Apesar do viewport ter `viewport-fit=cover`, o CSS nao esta usando os insets corretamente.

## Solucao

### 1. Adicionar Utilidades CSS para Safe Area

Adicionar classes no `src/index.css`:

```css
.safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}

.safe-left {
  padding-left: env(safe-area-inset-left, 0px);
}

.safe-right {
  padding-right: env(safe-area-inset-right, 0px);
}
```

### 2. Atualizar Header

Modificar o header para incluir padding-top com safe area:

```tsx
<header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40 border-b border-border pt-[env(safe-area-inset-top)]">
```

### 3. Ajustar Padding das Paginas

Como o header agora tera altura variavel (h-14 + safe-area), precisamos ajustar o padding-top das paginas principais para usar calc com safe area.

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| src/index.css | Adicionar classes safe-top, safe-left, safe-right |
| src/components/layout/Header.tsx | Adicionar pt-[env(safe-area-inset-top)] no header |
| src/pages/Home.tsx | Ajustar pt para considerar safe area |
| src/pages/Treinos.tsx | Ajustar pt para considerar safe area |
| src/pages/Habitos.tsx | Ajustar pt para considerar safe area |
| src/pages/Frequencia.tsx | Ajustar pt para considerar safe area |
| src/pages/Comunidade.tsx | Ajustar pt para considerar safe area |

---

## Secao Tecnica

### CSS a Adicionar (src/index.css)

```css
/* Safe area utilities para iOS */
.safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}

.safe-left {
  padding-left: env(safe-area-inset-left, 0px);
}

.safe-right {
  padding-right: env(safe-area-inset-right, 0px);
}
```

### Header.tsx - Mudanca

**Antes:**
```tsx
<header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40 border-b border-border">
```

**Depois:**
```tsx
<header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40 border-b border-border pt-[env(safe-area-inset-top)]">
```

### Paginas - Mudanca no padding-top

**Antes:**
```tsx
<main className="pt-20 px-4 max-w-md mx-auto space-y-6">
```

**Depois:**
```tsx
<main className="pt-[calc(5rem+env(safe-area-inset-top))] px-4 max-w-md mx-auto space-y-6">
```

Onde `5rem` = 80px (pt-20) e `env(safe-area-inset-top)` adiciona a altura do notch/status bar.

---

## Resultado Esperado

```
+---------------------------+
|  [Status Bar/Notch]       |  <- Respeitado como espaco
+---------------------------+
|  HEADER VISIVEL           |  <- Agora aparece corretamente
+---------------------------+
|                           |
|  Conteudo com respiro     |
|                           |
```

O app funcionara corretamente em:
- iPhone com notch (X, 11, 12, 13, 14, 15)
- iPhone com Dynamic Island (14 Pro, 15 Pro, 16)
- iPhone SE e modelos antigos (sem notch, safe-area = 0)
- Android e Desktop (safe-area = 0, sem mudanca visual)

