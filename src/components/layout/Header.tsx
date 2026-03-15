import { Menu, Bell, Download, Smartphone } from "lucide-react";
import { useState } from "react";
import MenuDrawer from "../modals/MenuDrawer";
import NotificationsModal from "../modals/NotificationsModal";
import { useNotifications } from "@/hooks/useNotifications";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BrandLockup from "@/components/brand/BrandLockup";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const showInstallButton = (canInstall || isIOS) && !isInstalled;

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }

    if (isIOS) {
      setInstallModalOpen(true);
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="app-screen pt-3">
          <div className="app-panel flex items-center justify-between rounded-[1.75rem] px-3 py-2.5">
            <button
              onClick={() => setMenuOpen(true)}
              className="app-icon-button flex h-11 w-11 items-center justify-center"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            <BrandLockup />

            <div className="flex items-center gap-2">
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="app-icon-button flex h-11 w-11 items-center justify-center"
                  aria-label="Instalar app"
                >
                  <Download size={18} className="text-primary" />
                </button>
              )}

              <button
                onClick={() => setNotificationsOpen(true)}
                className="app-icon-button relative flex h-11 w-11 items-center justify-center"
                aria-label="Abrir notificacoes"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="orange-glow absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />

      <Dialog open={installModalOpen} onOpenChange={setInstallModalOpen}>
        <DialogContent className="app-panel max-w-sm rounded-[1.75rem] border-white/10 bg-card/95 p-0">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 px-6 pt-6 text-center text-lg font-bold">
              <Smartphone className="text-primary" size={22} />
              Instalar WEMOVELT
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 px-6 pb-6 pt-2">
            <p className="text-center text-sm text-muted-foreground">
              Para instalar no seu iPhone:
            </p>
            <ol className="space-y-2 rounded-[1.35rem] border border-white/6 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              <li>1. Toque no icone de compartilhar.</li>
              <li>2. Escolha "Adicionar a Tela de Inicio".</li>
              <li>3. Confirme em "Adicionar".</li>
            </ol>
            <p className="text-center text-xs text-muted-foreground">
              O app sera adicionado a sua tela inicial como um atalho nativo.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
