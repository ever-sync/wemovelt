import { Menu, Bell, Download, Smartphone } from "lucide-react";
import { useState } from "react";
import MenuDrawer from "../modals/MenuDrawer";
import NotificationsModal from "../modals/NotificationsModal";
import { useNotifications } from "@/hooks/useNotifications";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    } else if (isIOS) {
      setInstallModalOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-40">
        <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto pt-[env(safe-area-inset-top)]">
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 touch-target hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <h1 className="text-xl font-bold wemovelt-gradient-text">WEMOVELT</h1>
          
          <div className="flex items-center gap-1">
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="p-2 touch-target hover:bg-secondary rounded-lg transition-colors animate-pulse"
                aria-label="Instalar app"
              >
                <Download size={22} className="text-primary" />
              </button>
            )}
            <button 
              onClick={() => setNotificationsOpen(true)}
              className="p-2 touch-target hover:bg-secondary rounded-lg transition-colors relative"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />

      {/* iOS Install Instructions Modal */}
      <Dialog open={installModalOpen} onOpenChange={setInstallModalOpen}>
        <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
              <Smartphone className="text-primary" size={22} />
              Instalar WEMOVELT
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground text-center">
              Para instalar no seu iPhone:
            </p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Toque no ícone de <strong className="text-foreground">Compartilhar</strong> (seta para cima)</li>
              <li>Role e toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong></li>
              <li>Toque em <strong className="text-foreground">"Adicionar"</strong></li>
            </ol>
            <p className="text-xs text-center text-muted-foreground">
              O app será adicionado à sua tela inicial como um ícone
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
