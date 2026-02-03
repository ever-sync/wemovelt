
# Fase 3: Sistema de Treinos

## Resumo

Esta fase transforma o sistema de treinos de dados estaticos para uma solucao completa baseada em banco de dados, incluindo:
- Biblioteca de equipamentos carregada do banco de dados
- Videos demonstrativos reais (YouTube embeds)
- CRUD completo de treinos personalizados
- Historico e estatisticas de treinos realizados

---

## 1. Novas Tabelas no Banco de Dados

### 1.1 Tabela: workouts (Treinos do Usuario)

```sql
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT, -- fat_loss, muscle_gain, health, strength
  frequency INTEGER, -- dias por semana
  difficulty TEXT, -- beginner, intermediate, advanced
  is_template BOOLEAN DEFAULT false, -- treino pre-definido
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
ON public.workouts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
ON public.workouts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
ON public.workouts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
ON public.workouts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 1.2 Tabela: workout_exercises (Exercicios de um Treino)

```sql
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment(id),
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '12', -- pode ser "12" ou "8-12"
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (herda do workout via join)
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage exercises via workout"
ON public.workout_exercises FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w 
    WHERE w.id = workout_id AND w.user_id = auth.uid()
  )
);
```

### 1.3 Tabela: workout_sessions (Treinos Realizados)

```sql
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_name TEXT NOT NULL, -- denormalizado para historico
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  exercises_completed INTEGER DEFAULT 0,
  total_exercises INTEGER,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON public.workout_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON public.workout_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.workout_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

### 1.4 Adicionar campos a tabela equipment

A tabela `equipment` ja existe com os campos necessarios (`video_url`, `description`, `muscles`, `difficulty`, `category`). Precisamos apenas popular com dados reais.

---

## 2. Dados Iniciais dos Equipamentos

Inserir equipamentos com videos do YouTube:

```sql
INSERT INTO public.equipment (name, muscles, category, difficulty, description, video_url, image_url) VALUES
('Supino Reto', ARRAY['Peitoral', 'Triceps', 'Deltoides'], 'peito', 'intermediate', 
 'Exercicio fundamental para desenvolvimento do peitoral.', 
 'https://www.youtube.com/embed/rT7DgCr-3pg', 
 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),

('Leg Press', ARRAY['Quadriceps', 'Gluteos', 'Isquiotibiais'], 'pernas', 'beginner',
 'Exercicio de pernas em maquina guiada, seguro para iniciantes.',
 'https://www.youtube.com/embed/IZxyjW7MPJQ',
 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'),

-- ... mais equipamentos
```

---

## 3. Novos Hooks

### 3.1 Hook: useEquipment

Arquivo: `src/hooks/useEquipment.ts`

```typescript
// Carregar equipamentos do banco de dados
const useEquipment = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });
  
  return { equipment: data, isLoading };
};
```

### 3.2 Hook: useWorkouts

Arquivo: `src/hooks/useWorkouts.ts`

Funcionalidades:
- Listar treinos do usuario
- Criar novo treino
- Atualizar treino
- Deletar treino
- Duplicar treino

```typescript
interface UseWorkoutsReturn {
  workouts: Workout[];
  isLoading: boolean;
  createWorkout: (data: CreateWorkoutInput) => Promise<Workout>;
  updateWorkout: (id: string, data: UpdateWorkoutInput) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  duplicateWorkout: (id: string) => Promise<Workout>;
}
```

### 3.3 Hook: useWorkoutSessions

Arquivo: `src/hooks/useWorkoutSessions.ts`

Funcionalidades:
- Iniciar sessao de treino
- Finalizar sessao
- Historico de sessoes
- Estatisticas

```typescript
interface UseWorkoutSessionsReturn {
  sessions: WorkoutSession[];
  currentSession: WorkoutSession | null;
  startSession: (workoutId: string) => Promise<void>;
  completeSession: (notes?: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  getStats: () => WorkoutStats;
}
```

---

## 4. Componentes Atualizados

### 4.1 Treinos.tsx

Mudancas:
- Carregar equipamentos via `useEquipment` em vez de dados estaticos
- Exibir loading skeleton enquanto carrega
- Filtro por categoria de equipamento

```text
+------------------------+
|  [Meus Treinos] [Dia]  |
|  [+ Criar Treino]      |
+------------------------+
| Filtros: [Todos] [Peito] [Pernas] ...
+------------------------+
|  EQUIPAMENTOS          |
|  +------+ +------+     |
|  |Supino| |LegPrs|     |
|  +------+ +------+     |
+------------------------+
```

### 4.2 EquipmentModal.tsx

Mudancas:
- Exibir video real do YouTube (iframe embed)
- Carregar instrucoes e dicas do banco de dados
- Mostrar exercicios relacionados

```text
+------------------------+
|  [VIDEO YOUTUBE EMBED] |
|                        |
+------------------------+
|  Supino Reto           |
|  Peito, Triceps        |
|                        |
|  > Como executar       |
|  > Dicas importantes   |
|                        |
|  [Adicionar ao Treino] |
+------------------------+
```

### 4.3 MyWorkoutsModal.tsx (Refatorado)

Mudancas:
- Carregar treinos do usuario do banco
- Exibir sessoes recentes (historico)
- Permitir iniciar treino
- Permitir editar/deletar treino

### 4.4 CreateWorkoutModal.tsx (Refatorado)

Mudancas:
- Salvar treino no banco de dados
- Adicionar etapa para selecionar exercicios
- Permitir reordenar exercicios
- Definir series/repeticoes por exercicio

Novo fluxo:
1. Objetivo (existente)
2. Nivel (existente)
3. Frequencia (existente)
4. **NOVO: Selecionar exercicios**
5. **NOVO: Configurar series/reps**
6. Confirmar e salvar

### 4.5 Novo: WorkoutPlayerModal.tsx

Modal para executar um treino:

```text
+------------------------+
|  Treino de Peito       |
|  Exercicio 2 de 6      |
+------------------------+
|                        |
|  [VIDEO DO EXERCICIO]  |
|                        |
+------------------------+
|  Supino Reto           |
|  3 series x 12 reps    |
|  Descanso: 60s         |
|                        |
|  [ ] Serie 1 concluida |
|  [ ] Serie 2 concluida |
|  [ ] Serie 3 concluida |
|                        |
|  [< Anterior] [Proximo >]
+------------------------+
|  [Timer: 00:45:32]     |
|  [Finalizar Treino]    |
+------------------------+
```

---

## 5. Novo Componente: WorkoutStats

Arquivo: `src/components/WorkoutStats.tsx`

Exibe estatisticas do usuario:
- Total de treinos realizados
- Tempo total de treino
- Media de duracao
- Treinos por semana
- Grupo muscular mais treinado

```text
+------------------------+
|  Suas Estatisticas     |
+------------------------+
| Treinos: 47   Horas: 35|
| Media: 45min  Sem: 3x  |
+------------------------+
| Grupo mais treinado:   |
| [=======] Peito (28%)  |
| [=====] Pernas (22%)   |
| [====] Costas (18%)    |
+------------------------+
```

---

## 6. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useEquipment.ts` | Hook para carregar equipamentos do banco |
| `src/hooks/useWorkouts.ts` | CRUD de treinos do usuario |
| `src/hooks/useWorkoutSessions.ts` | Gerenciar sessoes de treino |
| `src/components/modals/WorkoutPlayerModal.tsx` | Modal para executar treino |
| `src/components/modals/EditWorkoutModal.tsx` | Modal para editar treino |
| `src/components/WorkoutStats.tsx` | Componente de estatisticas |
| `src/components/ExerciseSelector.tsx` | Seletor de exercicios para criar treino |

---

## 7. Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/Treinos.tsx` | Usar hook useEquipment, adicionar filtros |
| `src/components/modals/EquipmentModal.tsx` | Video YouTube, dados do banco |
| `src/components/modals/MyWorkoutsModal.tsx` | Carregar do banco, CRUD |
| `src/components/modals/CreateWorkoutModal.tsx` | Salvar no banco, selecao de exercicios |
| `src/components/modals/DailyWorkoutModal.tsx` | Carregar treino real do dia |

---

## 8. Integracao de Video do YouTube

Para exibir videos de forma segura, usar iframe embed:

```tsx
const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  // Converte URL normal para embed
  const embedUrl = videoUrl.includes('embed') 
    ? videoUrl 
    : videoUrl.replace('watch?v=', 'embed/');
  
  return (
    <div className="aspect-video">
      <iframe
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-xl"
      />
    </div>
  );
};
```

---

## 9. Fluxo de Execucao de Treino

```text
Usuario clica "Iniciar Treino"
         |
         v
+------------------+
| Criar session    | --> INSERT workout_sessions (status: in_progress)
| started_at = now |
+------------------+
         |
         v
+------------------+
| WorkoutPlayer    | --> Exibe exercicios um a um
| Modal            |     Timer rodando
+------------------+
         |
    [Cada serie completa]
         |
         v
+------------------+
| Atualizar progresso (local state)
+------------------+
         |
    [Usuario finaliza]
         |
         v
+------------------+
| UPDATE session   | --> finished_at, duration, status: completed
+------------------+
         |
         v
+------------------+
| Toast sucesso    |
| Atualizar stats  |
+------------------+
```

---

## 10. Ordem de Implementacao

1. **Migracao SQL**: Criar tabelas workouts, workout_exercises, workout_sessions
2. **Dados equipamentos**: Popular tabela equipment com dados reais e videos
3. **Hook useEquipment**: Carregar equipamentos do banco
4. **Treinos.tsx**: Integrar com useEquipment, adicionar loading/filtros
5. **EquipmentModal**: Integrar video YouTube e dados reais
6. **Hook useWorkouts**: CRUD de treinos
7. **CreateWorkoutModal**: Refatorar para salvar no banco
8. **Hook useWorkoutSessions**: Gerenciar sessoes
9. **WorkoutPlayerModal**: Criar modal de execucao
10. **MyWorkoutsModal**: Integrar com hooks, exibir historico
11. **WorkoutStats**: Componente de estatisticas

---

## Resultado Esperado

Apos implementacao:

1. Equipamentos carregados dinamicamente do banco de dados
2. Videos reais do YouTube nos detalhes de cada equipamento
3. Usuarios podem criar, editar e deletar treinos personalizados
4. Sistema de execucao de treino com timer e progresso
5. Historico completo de todos os treinos realizados
6. Estatisticas detalhadas de desempenho

