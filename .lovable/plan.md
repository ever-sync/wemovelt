
# Plano: Simplificar Check-in (Apenas Geolocalização)

## Resumo

Remover a opção de QR Code do sistema de check-in e simplificar o fluxo para usar apenas geolocalização (GPS). O usuário só poderá fazer check-in quando estiver fisicamente dentro do raio da academia.

## Análise do Problema

### Situação Atual
1. **CheckInModal** oferece duas opções:
   - Escanear QR Code (a ser removido)
   - Usar localização GPS (manter)

2. **Dados do calendário semanal** - Não são dados mocados! A tabela `check_ins` está vazia no banco de dados, então todos os dias passados mostram X (sem check-in), que é o comportamento correto.

## Mudanças Necessárias

### 1. Simplificar CheckInModal

**Arquivo:** `src/components/modals/CheckInModal.tsx`

Mudanças:
- Remover step "choose" (tela de seleção de método)
- Remover step "qr-scanning"
- Iniciar diretamente com a verificação de geolocalização
- Remover imports não utilizados (QRScanner, QrCode, parseQRCode)
- Simplificar o fluxo para: abrir modal -> verificar GPS -> sucesso/erro

### 2. Simplificar Hook useCheckIn

**Arquivo:** `src/hooks/useCheckIn.ts`

Mudanças:
- Remover parâmetro `method` da função `registerCheckIn` (sempre será "geo")
- Remover parâmetro `equipmentId` (não usado sem QR)
- Manter apenas lat/lng e gymId

### 3. Arquivos a Remover (Opcionais)

Os seguintes arquivos podem ser removidos pois não serão mais utilizados:
- `src/components/QRScanner.tsx`
- `src/utils/qrValidation.ts`

Mas podem ser mantidos para uso futuro se desejado.

## Novo Fluxo de Check-in

```text
Usuário clica "Check-in"
        |
        v
+-------------------+
| Modal abre e      |
| solicita GPS      |
| automaticamente   |
+-------------------+
        |
        v
+-------------------+
| Verifica se está  |
| dentro do raio    |
| de uma academia   |
+-------------------+
        |
  Dentro? ----Não----> Mostra erro com distância
        |               e academia mais próxima
       Sim
        |
        v
+-------------------+
| Registra check-in |
| no banco de dados |
+-------------------+
        |
        v
+-------------------+
| Mostra sucesso    |
| com streak        |
+-------------------+
```

## Implementação Detalhada

### CheckInModal Simplificado

```typescript
// Estados simplificados
type Step = "checking" | "success" | "error";

// Ao abrir o modal, já inicia a verificação de GPS
useEffect(() => {
  if (open && user) {
    geo.requestLocation();
  }
}, [open, user]);

// Interface simplificada sem tela de escolha
```

### Estrutura do Modal

| Step | Conteúdo |
|------|----------|
| checking | Loader + "Verificando localização..." |
| success | Ícone de sucesso + nome da academia + streak |
| error | Mensagem de erro + distância da academia mais próxima |

## Ordem de Implementação

1. Atualizar `src/components/modals/CheckInModal.tsx`
   - Remover steps desnecessários
   - Iniciar verificação GPS automaticamente
   - Simplificar interface

2. Atualizar `src/hooks/useCheckIn.ts`
   - Remover parâmetros não utilizados
   - Simplificar tipo de registro

3. (Opcional) Remover arquivos não utilizados
   - `src/components/QRScanner.tsx`
   - `src/utils/qrValidation.ts`

## Sobre os Dados do Calendário

Os dias mostrando X não são dados mocados - é o comportamento correto porque:
- A tabela `check_ins` está vazia
- Para dias passados sem check-in, o sistema mostra X
- Para dias futuros, mostra o número do dia
- Quando o usuário fizer check-ins reais, os dias vão mostrar check (verde)

## Resultado Esperado

1. Modal de check-in abre e já começa a verificar localização
2. Se dentro do raio da academia: registra check-in automaticamente
3. Se fora do raio: mostra erro com distância e academia mais próxima
4. Interface mais simples e direta
5. Calendário semanal reflete dados reais do banco de dados
