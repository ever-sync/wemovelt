
# Plano: Adicionar Botao de Instalar PWA no Modal de Ajuda

## Objetivo

Adicionar um botao dentro do modal de Ajuda que permite aos usuarios instalar o WEMOVELT como um app no celular (PWA).

## Como Funciona a Instalacao PWA

O navegador dispara um evento `beforeinstallprompt` quando o app atende aos criterios de PWA. Precisamos:

1. Capturar esse evento antes que ele seja usado
2. Guardar a referencia para usar quando o usuario clicar no botao
3. Mostrar o botao apenas quando a instalacao estiver disponivel
4. Esconder o botao se o app ja estiver instalado

## Implementacao

### 1. Criar Hook `usePWAInstall`

Novo arquivo: `src/hooks/usePWAInstall.ts`

```typescript
// Hook que gerencia o estado de instalacao do PWA
// - Captura evento beforeinstallprompt
// - Detecta se ja esta instalado (display-mode: standalone)
// - Expoe funcao promptInstall() e estado canInstall
```

**Funcionalidades:**
- `canInstall`: boolean - indica se o botao deve aparecer
- `isInstalled`: boolean - indica se ja esta instalado
- `promptInstall()`: funcao que dispara o prompt de instalacao

### 2. Atualizar HelpModal

Arquivo: `src/components/modals/HelpModal.tsx`

**Mudancas:**
- Importar hook `usePWAInstall`
- Adicionar botao "Instalar App" com icone `Download`
- Botao aparece apenas quando `canInstall` e true
- Se ja instalado, mostra badge "Instalado" ao inves do botao

### Layout do Botao

```
+------------------------------------------+
|  [Download Icon]  Instalar no celular    |
+------------------------------------------+
```

- Estilo: Fundo azul (#3B82F6) com icone Download
- Posicao: Entre os FAQs e os botoes do WhatsApp
- Texto auxiliar: "Adicione o WEMOVELT a tela inicial"

## Experiencia do Usuario

| Estado | O que aparece |
|--------|---------------|
| Navegador suporta e nao instalado | Botao "Instalar no celular" |
| App ja instalado | Badge "App instalado" (opcional) ou nada |
| Navegador nao suporta | Botao nao aparece |
| iOS Safari | Instrucoes manuais (Share > Add to Home Screen) |

## Tratamento iOS

O Safari iOS nao suporta `beforeinstallprompt`. Para esses usuarios, mostraremos instrucoes manuais:

"Para instalar no iPhone: toque em Compartilhar e depois em 'Adicionar a Tela de Inicio'"

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `src/hooks/usePWAInstall.ts` | Criar - hook de instalacao PWA |
| `src/components/modals/HelpModal.tsx` | Modificar - adicionar botao de instalacao |

## Secao Tecnica

### Hook usePWAInstall

```typescript
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = 
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detecta se ja esta instalado
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    setIsInstalled(isStandalone);

    // Captura o evento de instalacao
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    
    // Detecta quando foi instalado
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    return outcome === "accepted";
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS,
    promptInstall,
  };
}
```

### Deteccao iOS

Como iOS nao suporta `beforeinstallprompt`, o hook detecta iOS para mostrar instrucoes manuais de instalacao.
