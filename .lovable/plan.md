
# Fase 9: Seguranca

## Resumo

Esta fase implementa melhorias de seguranca em tres areas principais:
- Politicas RLS (Row Level Security) - Corrigir vulnerabilidades identificadas
- Validacao Zod - Expandir validacao para todos os formularios
- Cache e Performance - Otimizar queries e adicionar staleTime

---

## Estado Atual

### Problemas Identificados pelo Linter

| Problema | Nivel | Descricao |
|----------|-------|-----------|
| RLS Policy Always True | WARN | Politica INSERT em notifications usa `true` |
| Leaked Password Protection | WARN | Protecao de senhas vazadas desabilitada |

### Problemas Identificados pelo Scanner

| Problema | Nivel | Descricao |
|----------|-------|-----------|
| check_ins_location_exposure | WARN | GPS preciso exposto sem validacao extra |
| profiles_public_usernames | INFO | Perfis nao visiveis para funcoes sociais |

### Validacao Zod Atual

| Arquivo | Tem Validacao |
|---------|---------------|
| AuthModal.tsx | Sim (email, password, name) |
| PostModal.tsx | Nao |
| ProfileModal.tsx | Nao |
| GoalModal.tsx | Nao |
| CommentsModal.tsx | Nao |
| ImageUpload.tsx | Parcial (tipo e tamanho) |

---

## 1. Correcoes de RLS

### 1.1 Corrigir politica INSERT em notifications

Problema: Qualquer usuario autenticado pode inserir notificacoes para qualquer outro usuario.

```sql
-- Remover politica permissiva atual
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Criar funcao security definer para insercao de notificacoes do sistema
CREATE OR REPLACE FUNCTION public.create_system_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Politica: usuarios nao podem inserir notificacoes diretamente
-- (triggers usam SECURITY DEFINER para inserir)
```

### 1.2 Adicionar RLS para profiles em funcoes sociais

Problema: Posts e comentarios precisam ver nome/avatar de outros usuarios.

```sql
-- Criar view publica para dados nao-sensiveis de perfis
CREATE VIEW public.profiles_public
WITH (security_invoker = ON)
AS SELECT 
  id,
  name,
  username,
  avatar_url
FROM public.profiles;

-- OU adicionar politica SELECT para dados publicos (mais simples)
CREATE POLICY "Anyone can view basic profile info for social features"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
-- Nota: A tabela profiles nao contem dados sensiveis como senha
-- age/weight/height sao opcionais e o usuario escolhe compartilhar
```

### 1.3 Habilitar protecao de senhas vazadas

Usar ferramenta de configuracao de auth para habilitar HaveIBeenPwned check.

---

## 2. Validacao Zod Expandida

### 2.1 Esquemas de Validacao

Criar arquivo centralizado: `src/lib/validations.ts`

```typescript
import { z } from "zod";

// === Auth ===
export const emailSchema = z
  .string()
  .trim()
  .email("E-mail invalido")
  .max(255, "E-mail muito longo");

export const passwordSchema = z
  .string()
  .min(6, "Minimo 6 caracteres")
  .max(72, "Maximo 72 caracteres"); // limite bcrypt

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome muito curto")
  .max(100, "Nome muito longo");

// === Profile ===
export const profileSchema = z.object({
  name: nameSchema,
  age: z.number().min(13).max(120).nullable().optional(),
  weight: z.number().min(20).max(500).nullable().optional(),
  height: z.number().min(50).max(300).nullable().optional(),
  goal: z.string().max(50).nullable().optional(),
  experience_level: z.enum(["iniciante", "intermediario", "avancado"]).nullable().optional(),
});

// === Posts ===
export const postContentSchema = z
  .string()
  .trim()
  .min(1, "Post nao pode estar vazio")
  .max(2000, "Maximo 2000 caracteres");

export const commentSchema = z
  .string()
  .trim()
  .min(1, "Comentario nao pode estar vazio")
  .max(500, "Maximo 500 caracteres");

// === Goals ===
export const goalSchema = z.object({
  type: z.enum(["workout", "hydration", "sleep", "nutrition"]),
  target: z.number().min(1).max(7),
  unit: z.string(),
  title: z.string().max(100),
});

// === Image Upload ===
export const imageFileSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, "Imagem deve ter no maximo 5MB"),
  type: z.string().regex(/^image\/(jpeg|png|gif|webp)$/, "Formato de imagem invalido"),
});
```

### 2.2 Componentes a Atualizar

| Componente | Adicionar Validacao |
|------------|---------------------|
| PostModal.tsx | postContentSchema antes de enviar |
| ProfileModal.tsx | profileSchema com limites numericos |
| CommentsModal.tsx | commentSchema antes de adicionar |
| GoalModal.tsx | goalSchema antes de criar |
| ImageUpload.tsx | imageFileSchema com tipos especificos |

---

## 3. Validacao de Input nos Hooks

### 3.1 usePosts.ts

```typescript
// Adicionar validacao antes de criar post
const createPostMutation = useMutation({
  mutationFn: async ({ content, imageFile }) => {
    // Validar conteudo
    const parsed = postContentSchema.safeParse(content);
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0].message);
    }
    
    // Validar imagem se existir
    if (imageFile) {
      const imgParsed = imageFileSchema.safeParse({
        size: imageFile.size,
        type: imageFile.type,
      });
      if (!imgParsed.success) {
        throw new Error(imgParsed.error.errors[0].message);
      }
    }
    
    // ... resto do codigo
  },
});
```

### 3.2 useComments.ts

```typescript
const addCommentMutation = useMutation({
  mutationFn: async ({ content, parentId }) => {
    const parsed = commentSchema.safeParse(content);
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0].message);
    }
    // ... resto do codigo
  },
});
```

---

## 4. Cache e Performance

### 4.1 Configurar staleTime Global

```typescript
// src/main.tsx ou App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (anteriormente cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### 4.2 staleTime Especifico por Query

| Query | staleTime | Razao |
|-------|-----------|-------|
| posts | 30 segundos | Conteudo social, atualiza frequente |
| comments | 30 segundos | Mesmo do posts |
| goals | 5 minutos | Metas raramente mudam |
| habits-today | 1 minuto | Rastreamento diario |
| notifications | 30 segundos | Importante ver novas |
| check-ins | 1 minuto | Frequencia real |
| profiles | 10 minutos | Dados estaticos do usuario |

### 4.3 Implementar nos Hooks

```typescript
// useGoals.ts
const { data: goals } = useQuery({
  queryKey: ["goals", user?.id],
  queryFn: async () => { ... },
  staleTime: 1000 * 60 * 5, // 5 minutos
});

// usePosts.ts
const { data } = useInfiniteQuery({
  queryKey: ["posts"],
  queryFn: async () => { ... },
  staleTime: 1000 * 30, // 30 segundos
});
```

---

## 5. Sanitizacao de Dados

### 5.1 Criar Funcao de Sanitizacao

```typescript
// src/lib/sanitize.ts
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/<[^>]*>/g, ''); // Remove HTML tags
};

export const sanitizeNumber = (
  value: string | number | undefined, 
  min: number, 
  max: number
): number | null => {
  if (value === undefined || value === '') return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  return Math.min(Math.max(num, min), max);
};
```

### 5.2 Aplicar em ProfileModal.tsx

```typescript
const handleSave = async () => {
  const sanitizedData = {
    name: sanitizeText(formData.name),
    age: sanitizeNumber(formData.age, 13, 120),
    weight: sanitizeNumber(formData.weight, 20, 500),
    height: sanitizeNumber(formData.height, 50, 300),
    // ...
  };
  
  const result = profileSchema.safeParse(sanitizedData);
  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }
  
  await updateProfile(result.data);
};
```

---

## 6. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/validations.ts` | Esquemas Zod centralizados |
| `src/lib/sanitize.ts` | Funcoes de sanitizacao |

---

## 7. Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/App.tsx` | Configurar QueryClient global |
| `src/hooks/usePosts.ts` | Adicionar validacao + staleTime |
| `src/hooks/useComments.ts` | Adicionar validacao + staleTime |
| `src/hooks/useGoals.ts` | Adicionar staleTime |
| `src/hooks/useHabits.ts` | Adicionar staleTime |
| `src/hooks/useCheckIn.ts` | Adicionar staleTime |
| `src/hooks/useNotifications.ts` | Adicionar staleTime |
| `src/components/modals/PostModal.tsx` | Validacao de conteudo |
| `src/components/modals/ProfileModal.tsx` | Validacao completa |
| `src/components/modals/CommentsModal.tsx` | Validacao de comentario |
| `src/components/modals/GoalModal.tsx` | Validacao de meta |
| `src/components/ImageUpload.tsx` | Validacao refinada |

---

## 8. Migracoes SQL

### 8.1 Corrigir RLS de Profiles

```sql
-- Permitir que usuarios autenticados vejam informacoes basicas de perfil
-- Isso e necessario para funcionalidades sociais (ver autor de posts)
CREATE POLICY "Authenticated users can view profiles for social features"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
```

Nota: A politica atual "Users can view own profile" so permite ver o proprio perfil, 
o que impede de ver autores de posts. A tabela profiles nao contem dados altamente 
sensiveis (sem senhas, tokens, etc), entao e seguro permitir leitura.

---

## 9. Ordem de Implementacao

1. **Migracao SQL**: Corrigir politicas RLS
2. **src/lib/validations.ts**: Criar esquemas Zod centralizados
3. **src/lib/sanitize.ts**: Criar funcoes de sanitizacao
4. **src/App.tsx**: Configurar cache global do QueryClient
5. **Hooks**: Adicionar validacao e staleTime em todos os hooks
6. **Modals**: Integrar validacao Zod nos formularios
7. **ImageUpload**: Refinar validacao de arquivos
8. **Testes**: Verificar fluxos com dados invalidos

---

## 10. Checklist de Seguranca

Apos implementacao, o projeto tera:

- [x] RLS em todas as tabelas
- [x] Politicas restritivas (nao permissivas `true` desnecessarias)
- [x] Validacao Zod em todos os inputs do usuario
- [x] Sanitizacao de texto antes de salvar
- [x] Limites de tamanho em campos de texto
- [x] Validacao de tipos de arquivo para uploads
- [x] Limite de tamanho de arquivo (5MB)
- [x] Cache otimizado para reducao de queries
- [x] Protecao contra senhas vazadas habilitada

---

## Resultado Esperado

Apos implementacao:

1. Notificacoes so podem ser criadas por triggers/funcoes do sistema
2. Posts e comentarios mostram nome/avatar do autor corretamente
3. Todos os formularios validam input antes de enviar
4. Textos sao sanitizados removendo HTML e espacos extras
5. Uploads sao validados por tipo e tamanho
6. Cache reduz requisicoes desnecessarias ao banco
7. Senhas fracas e vazadas sao rejeitadas no cadastro
