import { useEffect, useRef, useState } from "react";
import { BellRing, RefreshCw, WifiOff, X } from "lucide-react";
import { registerSW } from "virtual:pwa-register";
import { Button } from "@/components/ui/button";
import { isNativeApp } from "@/lib/native";

const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateServiceWorkerRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isNativeApp() || !import.meta.env.PROD) {
      return;
    }

    updateServiceWorkerRef.current = registerSW({
      immediate: true,
      onOfflineReady() {
        setOfflineReady(true);
      },
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegisterError(error) {
        console.error("PWA service worker registration failed:", error);
      },
    });
  }, []);

  const handleCloseOfflineReady = () => {
    setOfflineReady(false);
  };

  const handleCloseNeedRefresh = () => {
    setNeedRefresh(false);
  };

  const handleUpdate = async () => {
    setNeedRefresh(false);
    await updateServiceWorkerRef.current?.(true);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2100] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-[min(92vw,28rem)] flex-col gap-3 px-4">
        {!isOnline && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-black/95 px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <WifiOff size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Sem conexao</p>
              <p className="mt-1 text-xs text-muted-foreground">
                O app continua com o conteudo ja carregado. Acoes online ficam temporariamente indisponiveis.
              </p>
            </div>
          </div>
        )}

        {offlineReady && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-[1.4rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,102,0,0.18),rgba(255,102,0,0.06))] px-4 py-3 shadow-[0_16px_36px_rgba(255,102,0,0.14)] backdrop-blur-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BellRing size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Pronto para uso offline</p>
              <p className="mt-1 text-xs text-foreground/72">
                O shell do app ja foi salvo no dispositivo para abrir mesmo sem internet.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleCloseOfflineReady} className="h-9 rounded-full px-4">
              Fechar
            </Button>
          </div>
        )}

        {needRefresh && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-[1.4rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,102,0,0.18),rgba(255,102,0,0.06))] px-4 py-3 shadow-[0_16px_36px_rgba(255,102,0,0.14)] backdrop-blur-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <RefreshCw size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Nova versao disponivel</p>
              <p className="mt-1 text-xs text-foreground/72">
                Atualize para carregar as ultimas correcoes e novas telas.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => void handleUpdate()} size="sm" className="h-9 rounded-full px-4">
                Atualizar
              </Button>
              <button
                onClick={handleCloseNeedRefresh}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                aria-label="Fechar aviso de atualizacao"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAStatus;
