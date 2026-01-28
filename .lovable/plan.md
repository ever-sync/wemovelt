

## Plano de Implementação: Sistema de Check-in Real com QR Code

### Visão Geral
Transformar o modal de check-in visual em um sistema funcional que utiliza a câmera do dispositivo para escanear QR Codes dos equipamentos da academia, validando a presença do usuário.

---

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUXO DE CHECK-IN                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Usuário clica Check-in]                                   │
│           ↓                                                 │
│  [Escolhe: QR Code ou Geolocalização]                       │
│           ↓                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   QR SCANNER    │    │  GEOLOCATION    │                │
│  │                 │    │                 │                │
│  │ • Abre câmera   │    │ • Solicita GPS  │                │
│  │ • Detecta QR    │    │ • Valida raio   │                │
│  │ • Valida código │    │ • Confirma gym  │                │
│  └────────┬────────┘    └────────┬────────┘                │
│           ↓                      ↓                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              REGISTRO DO CHECK-IN                    │   │
│  │  • Salva no localStorage (sem backend)               │   │
│  │  • Atualiza estado local                             │   │
│  │  • Exibe mensagem motivacional                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 1. Instalação de Dependência

**Biblioteca escolhida:** `@yudiel/react-qr-scanner`
- Ativamente mantida (última versão há 8 dias)
- TypeScript nativo
- Leve e performática
- Suporte a câmera frontal/traseira

```bash
npm install @yudiel/react-qr-scanner
```

---

### 2. Novo Componente: QRScanner

**Arquivo:** `src/components/QRScanner.tsx`

**Funcionalidades:**
- Renderiza preview da câmera em tempo real
- Overlay visual com guia de enquadramento
- Detecção automática de QR Code
- Callback `onScan(data: string)` ao detectar
- Callback `onError(error: Error)` para erros
- Botão para alternar câmera frontal/traseira
- Botão para ativar/desativar flash (se disponível)
- Estados visuais: carregando, escaneando, erro

---

### 3. Atualização do CheckInModal

**Arquivo:** `src/components/modals/CheckInModal.tsx`

**Novos estados:**
```typescript
type Step = "choose" | "qr-scanning" | "geo-checking" | "success" | "error";
```

**Fluxo QR Code:**
1. Usuário clica "Escanear QR Code"
2. Modal expande para mostrar câmera
3. Usuário aponta para QR do equipamento
4. Sistema detecta e valida código
5. Exibe sucesso com nome do equipamento

**Fluxo Geolocalização:**
1. Usuário clica "Usar localização"
2. Sistema solicita permissão de GPS
3. Valida se está dentro do raio da academia (50m)
4. Exibe sucesso ou erro de localização

---

### 4. Hook Personalizado: useCheckIn

**Arquivo:** `src/hooks/useCheckIn.ts`

**Responsabilidades:**
- Gerenciar histórico de check-ins no localStorage
- Calcular sequência de dias (streak)
- Calcular porcentagem semanal
- Validar QR Codes (formato esperado)
- Validar geolocalização (coordenadas das academias)

**Interface:**
```typescript
interface CheckIn {
  id: string;
  date: string; // ISO date
  method: "qr" | "geo";
  gymId?: string;
  equipmentId?: string;
}

interface UseCheckInReturn {
  checkIns: CheckIn[];
  streak: number;
  weeklyPercentage: number;
  todayCheckedIn: boolean;
  registerCheckIn: (method: "qr" | "geo", data?: string) => void;
  getWeekData: () => WeekDay[];
}
```

---

### 5. Validação de QR Codes

**Formato esperado do QR:**
```
wemovelt://gym/{gymId}/equipment/{equipmentId}
```

**Exemplo:**
```
wemovelt://gym/zona-sul-01/equipment/puxada-alta
```

**Validação:**
- Verificar prefixo `wemovelt://`
- Extrair gymId e equipmentId
- Validar contra lista de academias/equipamentos cadastrados

---

### 6. Validação de Geolocalização

**Academias cadastradas (mock):**
```typescript
const GYMS = [
  { id: "zona-sul-01", name: "WEMOVELT Zona Sul", lat: -23.6245, lng: -46.6634, radius: 50 },
  { id: "zona-leste-01", name: "WEMOVELT Zona Leste", lat: -23.5428, lng: -46.4747, radius: 50 }
];
```

**Fórmula Haversine** para calcular distância entre coordenadas e validar se usuário está dentro do raio.

---

### 7. Tratamento de Erros

| Erro | Mensagem | Ação |
|------|----------|------|
| Câmera negada | "Permita o acesso à câmera para escanear" | Botão "Tentar novamente" |
| QR inválido | "QR Code não reconhecido" | Continuar escaneando |
| GPS negado | "Permita o acesso à localização" | Botão "Configurações" |
| Fora do raio | "Você não está próximo de uma academia" | Mostrar academias próximas |

---

### 8. Persistência Local (sem backend)

**localStorage keys:**
- `wemovelt_checkins`: Array de check-ins
- `wemovelt_streak`: Sequência atual

**Estrutura:**
```typescript
{
  "wemovelt_checkins": [
    { "id": "abc123", "date": "2026-01-28", "method": "qr", "gymId": "zona-sul-01" },
    { "id": "def456", "date": "2026-01-27", "method": "geo", "gymId": "zona-leste-01" }
  ]
}
```

---

### 9. Integração com Páginas

**Home.tsx e Frequencia.tsx:**
- Importar `useCheckIn` hook
- Substituir dados mockados por dados reais do hook
- Atualizar visualização da semana em tempo real após check-in

---

### 10. UI/UX do Scanner

**Visual do scanner:**
- Fundo escuro semitransparente
- Área de enquadramento com bordas animadas (laranja WEMOVELT)
- Texto instrucional: "Aponte para o QR Code do equipamento"
- Ícone de flash e troca de câmera
- Botão "Cancelar" para voltar

**Animação de sucesso:**
- Vibração do dispositivo (se disponível)
- Som de confirmação (opcional)
- Ícone de check animado
- Confetti ou partículas (sutil)

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `package.json` | Adicionar `@yudiel/react-qr-scanner` |
| `src/components/QRScanner.tsx` | **CRIAR** - Componente do scanner |
| `src/hooks/useCheckIn.ts` | **CRIAR** - Hook de gerenciamento |
| `src/hooks/useGeolocation.ts` | **CRIAR** - Hook de geolocalização |
| `src/utils/qrValidation.ts` | **CRIAR** - Funções de validação |
| `src/utils/geoValidation.ts` | **CRIAR** - Cálculo de distância |
| `src/data/gyms.ts` | **CRIAR** - Dados das academias |
| `src/components/modals/CheckInModal.tsx` | **MODIFICAR** - Integrar scanner |
| `src/pages/Home.tsx` | **MODIFICAR** - Usar hook real |
| `src/pages/Frequencia.tsx` | **MODIFICAR** - Usar hook real |

---

### Considerações Técnicas

1. **HTTPS obrigatório**: APIs de câmera e geolocalização exigem HTTPS (já atendido no Lovable)

2. **Permissões**: O navegador solicitará permissão para câmera e/ou localização

3. **Compatibilidade**: Funciona em navegadores modernos (Chrome, Safari, Firefox)

4. **Mobile-first**: Otimizado para dispositivos móveis

5. **Fallback**: Se câmera não disponível, sugerir geolocalização

