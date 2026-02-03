
# Plano: Corrigir Check-in com Geocoding Automatico

## Problema Identificado

O check-in nao funciona porque:
1. O formulario de academia foi simplificado para usar apenas endereco (sem lat/lng manuais)
2. Os campos lat/lng no banco estao NULL para todas as academias
3. O sistema de check-in usa coordenadas GPS para calcular distancia
4. Sem coordenadas, a funcao `getNearestGym` retorna `null` -> "Nenhuma academia encontrada"

## Solucao

Implementar geocoding automatico usando a API Google Geocoding para converter o endereco em coordenadas ao salvar a academia.

---

## Arquitetura da Solucao

```text
+-------------------+     +------------------+     +-------------------+
|  Formulario Admin | --> | Edge Function    | --> | Banco de Dados    |
|  (endereco)       |     | (geocoding)      |     | (lat, lng, address)|
+-------------------+     +------------------+     +-------------------+
                                  |
                                  v
                          +------------------+
                          | Google Geocoding |
                          | API              |
                          +------------------+
```

---

## Mudancas Necessarias

### 1. Criar Edge Function para Geocoding

**Arquivo:** `supabase/functions/geocode-address/index.ts`

Nova funcao que:
- Recebe o endereco completo
- Chama a API Google Geocoding
- Retorna lat/lng

```typescript
// Exemplo de resposta
{
  "lat": -23.508900,
  "lng": -46.628000
}
```

### 2. Atualizar GymForm para usar Geocoding

**Arquivo:** `src/components/admin/GymForm.tsx`

Ao submeter o formulario:
1. Monta endereco completo
2. Chama edge function de geocoding
3. Recebe lat/lng
4. Salva academia com endereco + coordenadas

### 3. Atualizar Academias Existentes

Opcao A: Script SQL para atualizar manualmente
Opcao B: Botao no admin para "Atualizar Coordenadas"

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/geocode-address/index.ts` | Criar edge function |
| `src/components/admin/GymForm.tsx` | Chamar geocoding antes de salvar |

---

## Configuracao Necessaria

A API Google Geocoding requer uma chave de API. Sera necessario:
1. Criar/usar chave do Google Cloud Platform
2. Configurar como secret no projeto

---

## Fluxo Atualizado do Cadastro

1. Admin preenche CEP
2. Sistema busca endereco via ViaCEP (ja implementado)
3. Admin confirma dados e clica Salvar
4. Sistema chama edge function de geocoding
5. Edge function converte endereco -> coordenadas
6. Academia salva com endereco + lat/lng
7. Check-in funciona corretamente

---

## Beneficios

- Check-in funciona com validacao de distancia precisa
- Navegacao funciona com endereco legivel
- Processo automatico sem entrada manual de coordenadas
- Dados consistentes e padronizados
