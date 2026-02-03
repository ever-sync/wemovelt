
# Plano: Adicionar Acesso ao Painel Admin no Menu Lateral

## Resumo

Adicionar um item de menu no sidebar (MenuDrawer) que só aparece para usuários com a role de Super Admin. Ao clicar, o usuário é direcionado para o painel administrativo em `/admin`.

## Estrutura Atual

O `MenuDrawer` atual possui:
- Meu Perfil (abre modal)
- Configurações (abre modal)
- Ajuda (abre modal)
- Sair (logout)

## Mudanças Necessárias

### 1. Atualizar MenuDrawer

**Arquivo:** `src/components/modals/MenuDrawer.tsx`

Mudanças:
- Importar o hook `useUserRole` para verificar se o usuário é admin
- Importar o ícone `Shield` do lucide-react (representa administração)
- Adicionar um item de menu condicional "Painel Admin" que:
  - Só aparece se `isAdmin === true`
  - Navega para `/admin` ao clicar
  - Fica visualmente destacado com estilo diferenciado

### 2. Layout do Menu Atualizado

```
+---------------------------+
|  Avatar + Nome + Email    |
+---------------------------+
|  🛡️  Painel Admin        |  <- Novo (só para admins)
+---------------------------+
|  👤  Meu Perfil           |
|  ⚙️  Configurações        |
|  ❓  Ajuda                |
+---------------------------+
|  🚪  Sair                 |
+---------------------------+
```

## Implementação Detalhada

### MenuDrawer Atualizado

```typescript
import { useUserRole } from "@/hooks/useUserRole";
import { Shield } from "lucide-react";

// No componente:
const { isAdmin } = useUserRole();

const handleMenuClick = (action: string) => {
  onOpenChange(false);
  
  if (action === "admin") {
    navigate("/admin");
    return;
  }
  
  setTimeout(() => {
    if (action === "profile") setProfileOpen(true);
    // ...
  }, 200);
};
```

### Renderização Condicional

```typescript
{isAdmin && (
  <>
    <button
      onClick={() => handleMenuClick("admin")}
      className="w-full flex items-center justify-between p-4 rounded-lg 
                 bg-primary/10 hover:bg-primary/20 transition-colors touch-target"
    >
      <div className="flex items-center gap-3">
        <Shield size={20} className="text-primary" />
        <span className="font-medium">Painel Admin</span>
      </div>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
    <div className="h-px bg-border my-4" />
  </>
)}
```

## Estilo Visual

| Item | Estilo |
|------|--------|
| Painel Admin | Fundo com `bg-primary/10`, texto destacado |
| Separador | Linha divisória abaixo do item admin |
| Ícone | `Shield` (escudo) representando proteção/admin |

## Segurança

A verificação de admin é feita de forma segura:
1. O hook `useUserRole` consulta a função `has_role` no banco (SECURITY DEFINER)
2. A rota `/admin` também está protegida pelo componente `AdminRoute`
3. Dupla proteção: menu condicional + rota protegida

## Resultado Esperado

1. Usuários normais: veem o menu sem a opção "Painel Admin"
2. Super Admins: veem "Painel Admin" destacado no topo do menu
3. Ao clicar: navegam diretamente para `/admin`
4. Menu fecha automaticamente após o clique
