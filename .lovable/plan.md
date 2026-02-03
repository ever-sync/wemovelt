
# Fase 2: Perfil do Usuario

## Resumo

Esta fase implementa o sistema completo de perfil do usuario, incluindo:
- Salvar e carregar dados do perfil do banco de dados
- Upload e exibicao de avatar
- Fluxo de onboarding apos o cadastro

---

## 1. Configuracao do Storage para Avatares

### Migracao SQL

Criar um bucket de storage para os avatares com politicas RLS apropriadas:

```sql
-- Criar bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatares', true);

-- Politica: usuarios podem fazer upload do proprio avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politica: usuarios podem atualizar o proprio avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politica: usuarios podem deletar o proprio avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politica: qualquer um pode visualizar avatares (bucket publico)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## 2. Novo Componente: OnboardingModal

Criar `src/components/modals/OnboardingModal.tsx` - um modal em etapas que aparece apos o primeiro cadastro.

### Estrutura do componente

```text
+----------------------------------+
|        Bem-vindo ao WEMOVELT     |
|            Etapa 1 de 3          |
+----------------------------------+
|                                  |
|        [  Avatar Upload  ]       |
|                                  |
|   Nome: [___________________]    |
|                                  |
+----------------------------------+
|           [ Proximo ]            |
+----------------------------------+
```

### Etapas do Onboarding

1. **Etapa 1 - Foto e Nome**
   - Upload de foto de perfil (opcional)
   - Campo de nome pre-preenchido

2. **Etapa 2 - Dados Fisicos**
   - Idade
   - Peso (kg)
   - Altura (cm)

3. **Etapa 3 - Objetivo e Experiencia**
   - Selecao de objetivo (chips)
   - Nivel de experiencia (iniciante/intermediario/avancado)

### Props

```typescript
interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}
```

---

## 3. Refatorar ProfileModal

Atualizar `src/components/modals/ProfileModal.tsx` para:

- Carregar dados do perfil via `useAuth().profile`
- Usar `useState` com valores iniciais do perfil
- Chamar `updateProfile()` no submit
- Adicionar componente de upload de avatar
- Exibir estados de loading e feedback

### Novo fluxo

```text
1. Modal abre -> carrega dados do profile (ja no contexto)
2. Usuario edita campos
3. Se houver nova foto -> upload para storage
4. Clica em Salvar -> updateProfile() com avatar_url se necessario
5. Toast de sucesso/erro
```

---

## 4. Componente AvatarUpload

Criar `src/components/AvatarUpload.tsx`:

### Funcionalidades

- Exibir avatar atual ou placeholder
- Botao para selecionar nova imagem
- Preview da imagem selecionada
- Upload para bucket "avatars" do storage
- Retornar URL publica apos upload

### API

```typescript
interface AvatarUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  size?: "sm" | "md" | "lg";
}
```

---

## 5. Atualizar AuthContext

Adicionar funcao para detectar se e o primeiro login:

```typescript
// Verificar se perfil esta incompleto (onboarding necessario)
const needsOnboarding = profile && !profile.goal && !profile.experience_level;
```

Expor `needsOnboarding` no contexto e adicionar funcao `refreshProfile()`.

---

## 6. Atualizar Fluxo de Autenticacao

### Mudancas no AuthModal

Apos cadastro bem-sucedido:
1. Se auto-confirm estiver habilitado: fazer login automatico
2. Redirecionar para Home
3. Home detecta `needsOnboarding` e abre modal

### Mudancas no Welcome.tsx

Passar flag para indicar se vem de cadastro recente.

### Mudancas no Home.tsx

```typescript
const { profile, needsOnboarding } = useAuth();
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  if (needsOnboarding) {
    setShowOnboarding(true);
  }
}, [needsOnboarding]);
```

---

## 7. Arquivos a Criar/Modificar

### Novos arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/components/modals/OnboardingModal.tsx` | Modal de onboarding em 3 etapas |
| `src/components/AvatarUpload.tsx` | Componente de upload de avatar |

### Arquivos a modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/components/modals/ProfileModal.tsx` | Integracao com banco, avatar upload |
| `src/contexts/AuthContext.tsx` | Adicionar `needsOnboarding`, `refreshProfile` |
| `src/pages/Home.tsx` | Detectar e abrir onboarding |
| `src/components/modals/MenuDrawer.tsx` | Exibir avatar real no menu |

---

## 8. Detalhes Tecnicos

### Upload de Avatar

```typescript
const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### Validacao de Imagem

- Tipos aceitos: image/jpeg, image/png, image/webp
- Tamanho maximo: 2MB
- Redimensionamento no cliente (opcional, para performance)

### Estados do ProfileModal

```typescript
const [formData, setFormData] = useState({
  name: profile?.name || "",
  age: profile?.age || null,
  weight: profile?.weight || null,
  height: profile?.height || null,
  goal: profile?.goal || "",
  experience_level: profile?.experience_level || "",
});
const [avatarFile, setAvatarFile] = useState<File | null>(null);
const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
```

---

## Resultado Esperado

Apos implementacao:

1. Novos usuarios verao o onboarding completo apos primeiro login
2. O perfil sera salvo no banco de dados
3. Avatares serao armazenados no storage e exibidos em toda a aplicacao
4. Usuarios existentes podem editar perfil via menu lateral
5. Todas as mudancas persistem entre sessoes

