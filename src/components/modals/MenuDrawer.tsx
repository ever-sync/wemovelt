import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { User, Settings, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleLogout = () => {
    onOpenChange(false);
    navigate("/");
  };

  const handleMenuClick = (action: string) => {
    onOpenChange(false);
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
              <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center">
                <User size={32} className="text-foreground" />
              </div>
              <div>
                <SheetTitle className="text-foreground text-lg">Usuário</SheetTitle>
                <p className="text-foreground/80 text-sm">usuario@email.com</p>
              </div>
            </div>
          </SheetHeader>
          
          <nav className="p-4">
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
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-destructive/10 text-destructive transition-colors touch-target"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
};

export default MenuDrawer;
