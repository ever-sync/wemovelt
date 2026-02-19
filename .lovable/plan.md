
## Adicionar botões de navegação no modal de erro do Check-in

### O que será feito

No estado de erro do `CheckInModal`, quando o usuário está fora do raio da academia, serão adicionados dois botões de navegação: **Google Maps** e **Waze**, para guiar o usuário até a academia mais próxima.

### Lógica dos links de navegação

Os links usarão o **endereço textual** da academia (campo `address` do `Gym`), conforme a memória técnica do projeto que indica que a navegação externa usa o endereço textual para garantir precisão no destino final.

- **Google Maps**: `https://www.google.com/maps/dir/?api=1&destination=ENDEREÇO`
- **Waze**: `https://waze.com/ul?q=ENDEREÇO`

Se a academia tiver coordenadas `lat/lng`, usaremos elas diretamente para maior precisão:
- **Google Maps**: `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`
- **Waze**: `https://waze.com/ul?ll=LAT,LNG&navigate=yes`

### Mudança no arquivo

**Arquivo:** `src/components/modals/CheckInModal.tsx`

1. Adicionar novo ícone `Map` do lucide-react no import.
2. Criar função `handleNavigate(app: "google" | "waze")` que monta a URL correta a partir dos dados da academia mais próxima (coordenadas ou endereço) e abre em nova aba.
3. No bloco de erro (linha 217-228), abaixo do card com o nome da academia, adicionar dois botões lado a lado:

```
[ 🗺 Google Maps ]  [ Waze ]
```

### Visual da área de erro após a mudança

```text
┌─────────────────────────────────┐
│           Ops!                  │
│  Você está a 350m da academia   │
│                                 │
│  📍 Academia mais próxima:      │
│     WeWork Faria Lima           │
│     a 350m de distância         │
│                                 │
│  [ 🗺 Google Maps ] [ Waze ]    │
│                                 │
│  [ Tentar novamente ] [ Fechar ]│
└─────────────────────────────────┘
```

### Detalhes técnicos

- Os botões de navegação aparecem **apenas** quando `nearestGymInfo` existe e `!nearestGymInfo.isWithinRadius` — ou seja, somente no cenário de "academia encontrada mas fora do raio".
- Quando a academia tiver `lat` e `lng`, a URL usa coordenadas (mais preciso). Caso contrário, usa `address` como fallback.
- Os botões abrem em `_blank` (nova aba/app no celular).
- Nenhum outro arquivo precisa ser alterado.
