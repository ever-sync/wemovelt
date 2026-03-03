import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { User, Settings, HelpCircle, LogOut, ChevronRight, Loader2, Shield, Download, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfileModal from "./ProfileModal";
import SettingsModal from "./SettingsModal";
import HelpModal from "./HelpModal";

interface MenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { icon: User, label: "Meu Perfil", action: "profile" },
  { icon: Settings, label: "Configurações", action: "settings" },
  { icon: HelpCircle, label: "Ajuda", action: "help" },
];

const MenuDrawer = ({ open, onOpenChange }: MenuDrawerProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const showInstallButton = (canInstall || isIOS) && !isInstalled;

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    onOpenChange(false);
    navigate("/");
  };

  const handleMenuClick = (action: string) => {
    onOpenChange(false);
    
    if (action === "admin") {
      navigate("/admin");
      return;
    }
    
    setTimeout(() => {
      if (action === "profile") setProfileOpen(true);
      if (action === "settings") setSettingsOpen(true);
      if (action === "help") setHelpOpen(true);
    }, 200);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[280px] bg-card border-r-border p-0">
          <SheetHeader className="p-6 wemovelt-gradient">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User size={32} className="text-foreground" />
                )}
              </div>
              <div>
                <SheetTitle className="text-foreground text-lg">
                  {profile?.name || "Usuário"}
                </SheetTitle>
                <p className="text-foreground/80 text-sm">{user?.email}</p>
              </div>
            </div>
          </SheetHeader>
          
          <nav className="p-4">
            {isAdmin && (
              <>
                <button
                  onClick={() => handleMenuClick("admin")}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors touch-target"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-primary" />
                    <span className="font-medium">Painel Admin</span>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
                <div className="h-px bg-border my-4" />
              </>
            )}
            
            {menuItems.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={() => handleMenuClick(action)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-secondary transition-colors touch-target"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-primary" />
                  <span>{label}</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            ))}
            
            <div className="h-px bg-border my-4" />

            {showInstallButton && (
              <button
                onClick={async () => {
                  if (canInstall) {
                    await promptInstall();
                  } else if (isIOS) {
                    onOpenChange(false);
                    setTimeout(() => setInstallModalOpen(true), 200);
                  }
                }}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors touch-target animate-pulse"
              >
                <Download size={20} />
                <span className="font-medium">Instalar App</span>
              </button>
            )}
            
            <div className="h-px bg-border my-4" />
            
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-destructive/10 text-destructive transition-colors touch-target disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogOut size={20} />
              )}
              <span>{loggingOut ? "Saindo..." : "Sair"}</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />

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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuDrawer;
