

# Plano: Ajustar Formulario de Equipamento com Base no Card

## Resumo

Atualizar o formulario de cadastro de equipamento para incluir o campo **Musculos** que e exibido no card e modal, garantindo consistencia entre o que e cadastrado e o que e visualizado.

---

## Analise do Card de Equipamento

O card exibe:
- Imagem (ou icone padrao)
- Nome do equipamento
- Musculos trabalhados (texto abaixo do nome)

O modal detalha:
- Video/Imagem
- Nome
- Musculos (destacado em cor primaria)
- Dificuldade
- Descricao

---

## Problema Identificado

O formulario atual **nao possui campo para Musculos**, porem:
- O card exibe `eq.muscles?.join(", ")`
- O modal exibe `equipment.muscles?.join(", ")`
- A tabela no banco tem coluna `muscles` do tipo ARRAY

Sem esse campo, os equipamentos ficam com "Musculos: Nao especificado".

---

## Mudancas Necessarias

### 1. Adicionar Campo de Musculos no Formulario

**Arquivo:** `src/components/admin/EquipmentForm.tsx`

Adicionar input para musculos com sugestoes pre-definidas:

```text
+------------------------+
| Músculos trabalhados   |
| [Peitoral, Tríceps]    |  <-- Campo com tags/chips
+------------------------+
```

Opcoes sugeridas:
- Peitoral, Costas, Biceps, Triceps, Ombros
- Quadriceps, Posterior, Gluteos, Panturrilha
- Abdomen, Obliquos, Core, Antebraco

### 2. Componente de Multi-Selecao

Usar checkboxes ou chips para facilitar a selecao de multiplos musculos de forma intuitiva.

---

## Estrutura do Formulario Atualizado

```text
+--------------------------------+
| Nome do Equipamento *          |
+--------------------------------+
| Descrição                      |
| [                        ]     |
+--------------------------------+
| Músculos Trabalhados           |  <-- NOVO
| [x] Peitoral  [ ] Costas       |
| [ ] Bíceps    [x] Tríceps      |
| [ ] Ombros    [ ] Core         |
+--------------------------------+
| Link do Vídeo (YouTube)        |
+--------------------------------+
| URL da Imagem                  |
+--------------------------------+
| Categoria    | Dificuldade     |
+--------------------------------+
| Academia (vincular)            |
+--------------------------------+
```

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/admin/EquipmentForm.tsx` | Adicionar campo de musculos com multi-selecao |

---

## Lista de Musculos Sugeridos

```typescript
const MUSCLES = [
  { value: "Peitoral", label: "Peitoral" },
  { value: "Costas", label: "Costas" },
  { value: "Bíceps", label: "Bíceps" },
  { value: "Tríceps", label: "Tríceps" },
  { value: "Ombros", label: "Ombros" },
  { value: "Quadríceps", label: "Quadríceps" },
  { value: "Posterior", label: "Posterior" },
  { value: "Glúteos", label: "Glúteos" },
  { value: "Panturrilha", label: "Panturrilha" },
  { value: "Abdômen", label: "Abdômen" },
  { value: "Core", label: "Core" },
  { value: "Antebraço", label: "Antebraço" },
];
```

---

## Beneficios

- Card exibe musculos corretamente
- Modal mostra informacao completa
- Consistencia entre cadastro e visualizacao
- Interface intuitiva com checkboxes

