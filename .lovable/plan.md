
## Objetivo

Duas melhorias integradas:

1. **Seção de academias**: Ao clicar em "Minha localização" no mapa, mostrar automaticamente a academia mais próxima destacada na lista, com a distância em metros exibida em cada card.
2. **Check-in**: O modal já usa GPS automaticamente — vamos melhorar o feedback visual durante a espera, mostrando a academia que está sendo verificada em tempo real.

---

## O que será alterado

### 1. `src/components/GymLocationsSection.tsx`

- Usar `getGymsWithDistance` (já existe no hook `useGyms`) para calcular a distância de cada academia quando a localização do usuário estiver disponível.
- Exibir a distância em metros em cada card da lista (ex: `📍 1.2 km` ou `📍 850 m`).
- Destacar automaticamente a academia mais próxima com um badge **"Mais Próxima 🏆"** quando a localização estiver ativa.
- Ao obter a localização, selecionar automaticamente a academia mais próxima no mapa (centralizar o marcador).
- Ordenar a lista pela distância quando a localização estiver disponível.

**Exemplo visual do card melhorado:**
```text
┌─────────────────────────────────────────────┐
│ 🏆 [Ícone] Academia Centro          850 m   │
│            Rua das Flores, 100    MAIS PRÓX. │
└─────────────────────────────────────────────┘
```

### 2. `src/components/modals/CheckInModal.tsx`

O modal **já** usa GPS automaticamente ao abrir — nenhuma mudança de lógica é necessária. A melhoria é visual:

- Durante o estado `"checking"`, mostrar o nome da academia mais próxima detectada em tempo real (assim que a posição for obtida e antes de submeter).
- Exibir a distância atual enquanto verifica.
- Isso dá feedback imediato ao usuário antes da confirmação final.

---

## Implementação técnica

### GymLocationsSection.tsx

```typescript
// Quando userPosition muda, calcular academias com distância
const gymsWithDistance = userPosition
  ? getGymsWithDistance(userPosition)
  : gyms.map(g => ({ ...g, distance: null }));

const nearestGym = gymsWithDistance[0]; // Já ordenado por distância

// Auto-selecionar a mais próxima ao obter localização
useEffect(() => {
  if (userPosition && nearestGym) {
    setSelectedLocation(nearestGym.id);
  }
}, [userPosition]);
```

### CheckInModal.tsx

```typescript
// Mostrar academia encontrada durante o "checking"
const nearestGymDuringCheck = geo.position && !gymsLoading
  ? getNearestGym(geo.position)
  : null;

// No JSX do step "checking":
{nearestGymDuringCheck && (
  <p className="text-sm text-primary">
    📍 {nearestGymDuringCheck.gym.name} — {nearestGymDuringCheck.distance}m
  </p>
)}
```

---

## Resumo dos arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/components/GymLocationsSection.tsx` | Distância em cada card, badge "Mais Próxima", auto-seleção, ordenação por distância |
| `src/components/modals/CheckInModal.tsx` | Feedback em tempo real da academia detectada durante verificação |

Nenhuma mudança no banco de dados ou lógica de check-in — tudo já está implementado no hook `useGyms` com `getGymsWithDistance` e `getNearestGym`.
