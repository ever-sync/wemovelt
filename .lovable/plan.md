
Objetivo: corrigir a Etapa 3 do formulário de equipamento para voltar a listar corretamente Dificuldade e Academias.

Diagnóstico feito
- O campo Dificuldade está definido em código com 3 opções (Iniciante, Intermediário, Avançado), então não depende do banco.
- O campo Academia depende de `useGyms()`.
- No backend existem academias cadastradas (2 registros), então o problema não é falta de dados.
- As políticas de acesso de academias/equipamentos estão ativas para usuários autenticados.
- Conclusão: o problema está no fluxo de carregamento/cache no frontend (consulta de academias ficando vazia em algumas sessões), somado à ausência de feedback visual quando a lista falha/carrega.

Plano de implementação
1) Fortalecer o hook `useGyms` para contexto autenticado
- Incluir dependência do usuário/sessão no `queryKey` (ex.: `["gyms", user?.id]`) para evitar cache “vazio” entre estados de login.
- Só executar a query quando autenticação estiver pronta e houver usuário (`enabled`).
- Manter retry/refetch seguro para evitar estado travado sem academias.

2) Melhorar UX da Etapa 3 em `EquipmentForm`
- Usar também `isLoading` e `error` de `useGyms`.
- No Select de Academia:
  - mostrar “Carregando academias...” enquanto busca.
  - mostrar mensagem de erro quando falhar.
  - mostrar lista normal quando dados chegarem.
- Manter opção “Nenhuma” sempre disponível.
- No Select de Dificuldade:
  - manter explicitamente as 3 opções fixas.
  - garantir renderização consistente com fallback visual (caso algo inesperado ocorra).

3) Exibir erro de academias também no Admin de academias (opcional, mas recomendado)
- Em `AdminGymsTab`, se `error` existir, exibir aviso curto (“Não foi possível carregar academias”) para facilitar diagnóstico futuro.

4) Validação após ajuste
- Abrir `/admin` → aba Equipamentos → Novo/Editar → Etapa 3.
- Confirmar:
  - Dificuldade abre com 3 opções.
  - Academia lista “Nenhuma” + academias cadastradas.
  - Fluxo de salvar continua normal.

Detalhes técnicos
- Arquivos previstos:
  - `src/hooks/useGyms.ts`
  - `src/components/admin/EquipmentForm.tsx`
  - `src/components/admin/AdminGymsTab.tsx` (feedback de erro)
- Sem mudanças de banco/migração.
- Sem alterar arquivos autogerados de integração.
