import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/brand/BrandMark";
import LegalDocument from "@/components/legal/LegalDocument";
import { privacyLastUpdated, privacySections } from "@/content/legal";

const Privacidade = () => {
  return (
    <div className="app-shell min-h-screen px-4 py-6">
      <div className="app-screen">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="secondary" size="icon" asChild className="h-11 w-11 rounded-full">
            <Link to="/">
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <div className="relative">
            <BrandMark className="orange-glow h-11 w-11 rounded-[1rem] border-white/10 bg-black/30" imageClassName="h-7 w-7" />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Shield size={10} />
            </div>
          </div>
          <div>
            <p className="app-kicker">Legal</p>
            <h1 className="text-[1.7rem] font-bold tracking-[-0.06em]">Politica de privacidade</h1>
          </div>
        </div>

        <LegalDocument
          accent="#ff6600"
          intro="Explicamos aqui quais dados sao processados, para que servem e como voce pode exercer seus direitos dentro do WEMOVELT."
          lastUpdated={privacyLastUpdated}
          sections={privacySections}
        />
      </div>
    </div>
  );
};

export default Privacidade;
