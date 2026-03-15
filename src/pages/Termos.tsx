import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import LegalDocument from "@/components/legal/LegalDocument";
import { termsLastUpdated, termsSections } from "@/content/legal";

const Termos = () => {
  return (
    <div className="app-shell min-h-screen px-4 py-6">
      <div className="app-screen">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="secondary" size="icon" asChild className="h-11 w-11 rounded-full">
            <Link to="/">
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <div className="orange-glow flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FileText size={18} />
          </div>
          <div>
            <p className="app-kicker">Legal</p>
            <h1 className="text-[1.7rem] font-bold tracking-[-0.06em]">Termos de uso</h1>
          </div>
        </div>

        <LegalDocument
          accent="#ff6600"
          intro="Estes termos definem o uso esperado do aplicativo, limites de responsabilidade e regras de convivencia dentro do produto."
          lastUpdated={termsLastUpdated}
          sections={termsSections}
        />
      </div>
    </div>
  );
};

export default Termos;
