import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";
import LegalDocument from "@/components/legal/LegalDocument";
import { privacyLastUpdated, privacySections } from "@/content/legal";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel max-w-md rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl font-bold">
            <Shield className="text-primary" size={20} />
            Politica de privacidade
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <LegalDocument
            accent="#ff6600"
            intro="Como tratamos seus dados, localizacao, historicos e preferencias dentro do WEMOVELT."
            lastUpdated={privacyLastUpdated}
            sections={privacySections}
            compact
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
