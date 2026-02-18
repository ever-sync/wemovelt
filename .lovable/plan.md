
## Problema identificado

O auto-preenchimento de campos via CEP **já funciona** no `GymForm.tsx` — a lógica da ViaCEP está implementada e operacional. O que impede o cadastro é outro problema: a geocodificação via Google Maps API falha com `REQUEST_DENIED` (a API de Geocoding não está ativada), e o formulário bloqueia o salvamento quando isso ocorre (`if (!coordinates) return`).

**Root cause:** A função `handleSubmit` exige coordenadas GPS obrigatoriamente. Se a geocodificação falha, o formulário não salva — nem mostra um erro claro ao usuário sobre por quê não está salvando.

---

## O que será corrigido

### 1. Geocodificação como etapa opcional (`GymForm.tsx`)

Quando a geocodificação falha, em vez de bloquear o salvamento, o sistema salvará a academia **sem coordenadas** e exibirá um aviso (não um erro bloqueante):

```
⚠ Academia salva sem coordenadas GPS.
  As coordenadas podem ser configuradas manualmente depois.
```

Isso permite que o admin complete o cadastro agora e configure o GPS em outro momento.

#### Lógica atual (bloqueante):
```typescript
const coordinates = await geocodeAddress(fullAddress);
if (!coordinates) {
  return; // ← bloqueia o salvamento
}
```

#### Lógica nova (não-bloqueante):
```typescript
const coordinates = await geocodeAddress(fullAddress);
// Se falhar, coordenadas ficam nulas — o cadastro prossegue com aviso
const data = {
  name: formData.name,
  address: fullAddress,
  lat: coordinates?.lat ?? null,
  lng: coordinates?.lng ?? null,
  radius: parseInt(formData.radius) || 50,
  image_url: null,
  ...(gym?.id && { id: gym.id }),
};
onSubmit(data);
```

### 2. Toast de aviso (não erro) quando GPS não disponível

Substituir o toast de `variant: "destructive"` que bloqueia a ação por um toast de aviso informativo — e deixar o salvamento prosseguir:

```typescript
toast({
  title: "Salvo sem coordenadas GPS",
  description: "A geocodificação falhou. A academia foi salva sem localização no mapa.",
});
```

### 3. Melhoria visual: campos preenchidos automaticamente ficam destacados

Após o CEP ser preenchido com sucesso, os campos auto-preenchidos (`Rua`, `Bairro`, `Cidade`, `UF`) receberão a classe `bg-primary/5 border-primary/30` temporariamente para indicar visualmente que foram preenchidos automaticamente. O destaque some após 2 segundos.

Implementado com um estado `highlightedFields: boolean` que é ativado no `setCepStatus("success")` e desativado com `setTimeout`:

```typescript
const [fieldsHighlighted, setFieldsHighlighted] = useState(false);

// dentro de fetchAddressByCep, após setCepStatus("success"):
setFieldsHighlighted(true);
setTimeout(() => setFieldsHighlighted(false), 2000);
```

---

## Arquivos modificados

**Único arquivo:** `src/components/admin/GymForm.tsx`

- Geocodificação torna-se não-bloqueante: salva mesmo sem coordenadas
- Toast de aviso em vez de erro bloqueante quando GPS falha
- Destaque visual temporário nos campos preenchidos automaticamente pelo CEP

---

## Nenhuma mudança no banco de dados

As colunas `lat` e `lng` já aceitam `NULL` na tabela `gyms` — sem migrações necessárias.
