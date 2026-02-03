# WEMOVELT - Plano de Implementação para Produção

## Visão Geral

Transformar o protótipo visual em aplicação completa com backend, autenticação e dados persistentes.

---

## FASE 1: Fundação (Backend + Auth)
**Prioridade: 🔴 CRÍTICA | Complexidade: Média**

### 1.1 Ativar Lovable Cloud
- [ ] Habilitar Cloud no projeto
- [ ] Configurar Supabase integrado

### 1.2 Estrutura de Banco de Dados

```sql
-- Perfis de usuário
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  goal TEXT, -- 'perder_peso', 'ganhar_massa', 'manter', 'condicionamento'
  experience_level TEXT, -- 'iniciante', 'intermediario', 'avancado'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academias
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  radius INTEGER DEFAULT 50, -- metros
  image_url TEXT,
  equipment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipamentos
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- 'peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 'abdomen', 'cardio'
  description TEXT,
  muscles TEXT[], -- músculos trabalhados
  difficulty TEXT, -- 'iniciante', 'intermediario', 'avancado'
  video_url TEXT,
  image_url TEXT,
  qr_code TEXT UNIQUE, -- código único para check-in
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id),
  equipment_id UUID REFERENCES equipment(id),
  method TEXT NOT NULL, -- 'qr', 'geo'
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treinos salvos
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  equipment_ids UUID[],
  duration_minutes INTEGER,
  difficulty TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de treinos
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Metas
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'frequencia', 'peso', 'exercicios'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'ativa', -- 'ativa', 'concluida', 'cancelada'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hábitos
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'hidratacao', 'sono', 'alimentacao', 'alongamento', 'descanso', 'mental'
  date DATE DEFAULT CURRENT_DATE,
  value INTEGER, -- ex: ml de água, horas de sono
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts da comunidade
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curtidas
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'lembrete', 'conquista', 'social', 'sistema'
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Autenticação Real
- [ ] Criar página `/auth` com login/cadastro
- [ ] Implementar Supabase Auth
- [ ] Fluxo de recuperação de senha
- [ ] Proteção de rotas autenticadas
- [ ] Redirect automático após login

### 1.4 Políticas RLS
- [ ] Configurar RLS em todas as tabelas
- [ ] Usuários só acessam próprios dados
- [ ] Posts públicos para leitura

---

## FASE 2: Perfil e Dados do Usuário
**Prioridade: 🔴 ALTA | Complexidade: Baixa**

### 2.1 Perfil Funcional
- [ ] Salvar/carregar dados do perfil
- [ ] Upload de avatar (Supabase Storage)
- [ ] Edição de informações pessoais
- [ ] Configuração de objetivos

### 2.2 Onboarding
- [ ] Fluxo de onboarding pós-cadastro
- [ ] Coleta de dados (peso, altura, objetivo)
- [ ] Seleção de nível de experiência

---

## FASE 3: Sistema de Treinos
**Prioridade: 🟡 MÉDIA | Complexidade: Média**

### 3.1 Biblioteca de Equipamentos
- [ ] Migrar dados estáticos para banco
- [ ] Carregar equipamentos dinâmicos
- [ ] Filtros por categoria/músculo
- [ ] Busca por nome

### 3.2 Vídeos Demonstrativos
- [ ] Substituir placeholders por vídeos reais
- [ ] Player de vídeo otimizado
- [ ] Thumbnails dos exercícios

### 3.3 Treinos Personalizados
- [ ] CRUD de treinos
- [ ] Seleção de equipamentos
- [ ] Favoritar treinos
- [ ] Copiar/duplicar treinos

### 3.4 Histórico de Treinos
- [ ] Registro de sessões
- [ ] Visualização de histórico
- [ ] Estatísticas (frequência, tempo)

### 3.5 Treino do Dia
- [ ] Algoritmo de sugestão
- [ ] Baseado em objetivos do usuário
- [ ] Rotação de grupos musculares

---

## FASE 4: Check-in Real (Já iniciado)
**Prioridade: 🟡 MÉDIA | Complexidade: Alta**

### 4.1 QR Code Scanner ✅
- [x] Componente QRScanner
- [x] Validação de formato
- [ ] Integrar com banco de dados

### 4.2 Geolocalização ✅
- [x] Hook useGeolocation
- [x] Validação de proximidade
- [ ] Integrar com banco de dados

### 4.3 Persistência
- [ ] Migrar de localStorage para Supabase
- [ ] Sincronização de dados
- [ ] Histórico no banco

### 4.4 Estatísticas
- [ ] Sequência real (streak)
- [ ] Porcentagem semanal
- [ ] Metas de frequência

---

## FASE 5: Mapa de Academias Real
**Prioridade: 🟢 BAIXA | Complexidade: Média**

### 5.1 Integração com Mapas
- [ ] Escolher API (Google Maps/Mapbox)
- [ ] Adicionar chave de API
- [ ] Componente de mapa interativo

### 5.2 Funcionalidades
- [ ] Lista de academias do banco
- [ ] Marcadores no mapa
- [ ] Calcular distância do usuário
- [ ] Navegação para academia

---

## FASE 6: Comunidade Funcional
**Prioridade: 🟢 BAIXA | Complexidade: Alta**

### 6.1 Posts
- [ ] Criar posts com texto
- [ ] Upload de imagens
- [ ] Feed paginado
- [ ] Pull-to-refresh

### 6.2 Interações
- [ ] Sistema de curtidas
- [ ] Comentários
- [ ] Contagem em tempo real

### 6.3 Perfis Públicos
- [ ] Visualizar perfil de outros usuários
- [ ] Seguir/deixar de seguir (opcional)

---

## FASE 7: Hábitos e Metas
**Prioridade: 🟢 BAIXA | Complexidade: Média**

### 7.1 Rastreamento de Hábitos
- [ ] Registro diário
- [ ] Histórico de hábitos
- [ ] Gráficos de progresso

### 7.2 Metas Personalizadas
- [ ] Criar metas
- [ ] Acompanhamento automático
- [ ] Notificações de progresso

---

## FASE 8: Notificações
**Prioridade: 🟢 BAIXA | Complexidade: Alta**

### 8.1 Notificações In-App
- [ ] Feed de notificações real
- [ ] Marcar como lida
- [ ] Tipos de notificação

### 8.2 Push Notifications (Futuro)
- [ ] Service Worker
- [ ] Configurar Web Push
- [ ] Lembretes de treino

---

## FASE 9: Segurança e Performance
**Prioridade: 🔴 CONTÍNUA**

### 9.1 Segurança
- [ ] RLS em todas as tabelas
- [ ] Validação com Zod
- [ ] Sanitização de inputs
- [ ] Rate limiting

### 9.2 Performance
- [ ] Lazy loading de imagens
- [ ] Cache com React Query
- [ ] Otimização de queries

---

## Cronograma Sugerido

| Semana | Fase | Entregável |
|--------|------|------------|
| 1 | Fase 1 | Backend + Auth funcionando |
| 2 | Fase 2 | Perfil persistente |
| 3 | Fase 3 | Treinos funcionais |
| 4 | Fase 4 | Check-in com banco |
| 5-6 | Fase 5-6 | Mapa + Comunidade |
| 7+ | Fase 7-8 | Hábitos + Notificações |

---

## Próximo Passo Imediato

**Ativar Lovable Cloud** para configurar:
1. Supabase integrado
2. Banco de dados PostgreSQL
3. Autenticação
4. Storage para imagens

Após ativar, começamos pela **Fase 1.2** (criação das tabelas).
