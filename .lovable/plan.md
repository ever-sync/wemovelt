

# Plano: Corrigir Contador de Hábitos Completados

## Problema Identificado

O contador "0/4 hábitos hoje" no hero não está atualizando quando os hábitos são marcados como completos.

### Causa Raiz

O cálculo atual usa uma lógica incorreta:

```typescript
// Código atual (INCORRETO)
const totalCompletedToday = weeklyStats.reduce((acc, stat) => {
  const todayData = stat.weeklyData[stat.weeklyData.length - 1]; // Assume último = hoje
  return acc + (todayData?.completed ? 1 : 0);
}, 0);
```

O `weeklyData` é um array fixo de 7 dias (Seg-Dom). O índice 6 sempre é domingo, não o dia atual. Se hoje é segunda-feira, o código verifica domingo em vez de segunda.

---

## Solução

Usar a função `isHabitCompleted` que já existe no hook `useHabits`, que verifica corretamente os logs de **hoje** (`todayLogs`).

### Código Corrigido

```typescript
// Código corrigido (CORRETO)
const { weeklyStats, isLoading, isHabitCompleted } = useHabits();

const totalCompletedToday = [
  "hydration", 
  "sleep", 
  "nutrition", 
  "wellness"
].filter(type => isHabitCompleted(type)).length;
```

---

## Mudanças Necessárias

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Habitos.tsx` | Usar `isHabitCompleted` ao invés de `weeklyStats` para calcular hábitos do dia |

---

## Por que funciona

A função `isHabitCompleted` usa `todayLogs` que:
1. Filtra logs pela data de **hoje** (`format(new Date(), "yyyy-MM-dd")`)
2. Verifica se o log tem `completed: true`
3. É atualizada em tempo real após cada toggle

Enquanto `weeklyStats.weeklyData` usa índices fixos da semana que não correspondem ao dia atual.

