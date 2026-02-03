
# Plano: Reformular Formulario de Academia com Validacao de CEP

## Resumo

Simplificar o formulario de cadastro de academias removendo campos tecnicos (lat, lng, imagem) e adicionando busca automatica de endereco via CEP para maior precisao na navegacao GPS.

---

## Mudancas Planejadas

### 1. Remover Campos do Formulario

Campos a serem removidos de `GymForm.tsx`:
- Latitude (input manual)
- Longitude (input manual)
- Botao "Usar minha localizacao"
- URL da Imagem

### 2. Adicionar Campo de CEP com Validacao

Novo fluxo do formulario:

```text
+---------------------+
|  Nome da Academia*  |
+---------------------+
|  CEP  [________]    |  <-- Novo campo com mascara e validacao
+---------------------+
|  Rua (auto)         |  <-- Preenchido automaticamente
+---------------------+
|  Numero [___]       |  <-- Novo campo obrigatorio
+---------------------+
|  Bairro (auto)      |  <-- Preenchido automaticamente
+---------------------+
|  Cidade/UF (auto)   |  <-- Preenchido automaticamente
+---------------------+
|  Raio Check-in      |  <-- Mantido
+---------------------+
```

### 3. Integracao com API ViaCEP

A API ViaCEP e gratuita e retorna dados de endereco brasileiros:

```typescript
// Busca endereco pelo CEP
const fetchAddressByCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;
  
  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  const data = await response.json();
  
  if (data.erro) return null;
  
  return {
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf
  };
};
```

### 4. Novo Schema de Validacao

Adicionar em `src/lib/validations.ts`:

```typescript
// Schema para CEP brasileiro
export const cepSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, "CEP invalido. Use o formato 00000-000");

// Schema para formulario de academia
export const gymFormSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  cep: cepSchema,
  street: z.string().min(1, "Rua obrigatoria"),
  number: z.string().min(1, "Numero obrigatorio"),
  neighborhood: z.string().min(1, "Bairro obrigatorio"),
  city: z.string().min(1, "Cidade obrigatoria"),
  state: z.string().length(2, "UF invalido"),
  radius: z.number().min(10).max(500).default(50)
});
```

### 5. Montagem do Endereco Completo

O endereco sera montado automaticamente para salvar no banco:

```typescript
// Monta endereco completo para navegacao GPS
const fullAddress = `${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${cep}`;
// Exemplo: "Rua das Flores, 123 - Centro, Sao Paulo - SP, 01310-100"
```

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/components/admin/GymForm.tsx` | Reformular formulario completo |
| `src/lib/validations.ts` | Adicionar schemas de CEP e academia |

---

## Fluxo do Usuario

1. Admin digita o CEP (ex: 01310-100)
2. Sistema valida formato do CEP
3. Sistema busca endereco na API ViaCEP
4. Campos Rua, Bairro, Cidade e UF sao preenchidos automaticamente
5. Admin insere apenas o Numero
6. Ao salvar, endereco completo e montado para o campo `address`
7. Navegacao GPS usa endereco completo para maior precisao

---

## Beneficios

- Endereco padronizado e completo
- Maior precisao na navegacao GPS (endereco vs coordenadas)
- Menos erros de digitacao
- Formulario mais simples para o admin
- Validacao em tempo real do CEP
