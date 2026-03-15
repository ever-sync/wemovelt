import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import LegalDocument from "@/components/legal/LegalDocument";
import { termsLastUpdated, termsSections } from "@/content/legal";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsModal = ({ open, onOpenChange }: TermsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel max-w-md rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl font-bold">
            <FileText className="text-primary" size={20} />
            Termos de uso
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <LegalDocument
            accent="#ff6600"
            intro="Regras de uso, responsabilidades e condicoes para utilizar o aplicativo e os recursos sociais."
            lastUpdated={termsLastUpdated}
            sections={termsSections}
            compact
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
