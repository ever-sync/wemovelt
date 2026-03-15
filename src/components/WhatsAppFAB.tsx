import { MessageCircle } from "lucide-react";
import { openWhatsApp } from "@/lib/native";

const WhatsAppFAB = () => {
  const handleClick = () => {
    void openWhatsApp("Ola! Gostaria de falar com um personal do WEMOVELT");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-[6.35rem] right-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#141414]/90 px-3.5 py-3 text-xs font-bold text-white shadow-[0_16px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 active:scale-95"
      aria-label="Chamar Personal no WhatsApp"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-[#041b0b]">
        <MessageCircle size={16} />
      </span>
      <span>Chamar Personal</span>
    </button>
  );
};

export default WhatsAppFAB;
