import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Loader2,
  Shield,
  Download,
  Smartphone,
} from "lucide-react";
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
  { icon: Settings, label: "Configuracoes", action: "settings" },
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
        <SheetContent
          side="left"
          className="h-[100dvh] w-[304px] max-w-[86vw] overflow-hidden rounded-r-[2rem] border-r-0 bg-[#0e0e0e] p-0 shadow-[0_30px_80px_rgba(0,0,0,0.52)] [&>button]:right-5 [&>button]:top-5 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-black/10 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/20"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="relative overflow-hidden border-b border-white/8 px-5 pb-5 pt-8 wemovelt-gradient">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />

              <div className="relative z-10 flex items-center gap-4 pr-10">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={28} className="text-white" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/70">Conta ativa</p>
                  <SheetTitle className="mt-1 truncate text-xl font-bold tracking-[-0.05em] text-white">
                    {profile?.name || "Usuario"}
                  </SheetTitle>
                  <p className="truncate text-sm text-white/78">{user?.email}</p>
                </div>
              </div>
            </SheetHeader>

            <nav className="flex-1 px-4 py-5">
              <div className="space-y-2">
                {isAdmin && (
                  <button
                    onClick={() => handleMenuClick("admin")}
                    className="orange-glow flex w-full items-center justify-between rounded-[1.35rem] border border-primary/25 bg-primary/12 px-4 py-4 text-left transition-all hover:bg-primary/16"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Shield size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Painel Admin</p>
                        <p className="text-xs text-white/55">Acesso rapido ao gerenciamento</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/58" />
                  </button>
                )}

                {menuItems.map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={() => handleMenuClick(action)}
                    className="flex w-full items-center justify-between rounded-[1.35rem] border border-white/6 bg-white/[0.03] px-4 py-4 text-left transition-all hover:border-primary/20 hover:bg-primary/[0.08]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20 text-primary">
                        <Icon size={18} />
                      </div>
                      <span className="font-medium text-foreground">{label}</span>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </button>
                ))}
              </div>

              <div className="my-5 h-px bg-white/8" />

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
                  className="flex w-full items-center gap-3 rounded-[1.45rem] border border-primary/18 bg-primary/10 px-4 py-4 text-primary transition-all hover:bg-primary/14"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Download size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Instalar App</p>
                    <p className="text-xs text-primary/80">Adicionar o atalho nativo</p>
                  </div>
                </button>
              )}

              <div className="my-5 h-px bg-white/8" />

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-[1.35rem] border border-white/6 bg-white/[0.02] px-4 py-4 text-[#ff5d5d] transition-all hover:bg-[#ff5d5d]/10 disabled:opacity-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff5d5d]/12">
                  {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                </div>
                <div className="text-left">
                  <p className="font-semibold">{loggingOut ? "Saindo..." : "Sair"}</p>
                  <p className="text-xs text-[#ff8e8e]">Encerrar sessao atual</p>
                </div>
              </button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />

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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuDrawer;
