-- Remover política atual que expõe todos os perfis
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Criar view pública com apenas campos não-sensíveis para a comunidade
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    name,
    username,
    avatar_url
  FROM public.profiles;

-- Política: usuários só podem ver seu próprio perfil completo na tabela base
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);