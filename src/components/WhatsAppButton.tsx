import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const handleClick = () => {
    window.open(
      "https://wa.me/5511999999999?text=Olá! Gostaria de falar com um personal do WEMOVELT",
      "_blank"
    );
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 animate-bounce-in"
      style={{ animationDelay: "0.5s" }}
    >
      <MessageCircle size={20} />
      <span className="text-sm font-bold whitespace-nowrap">Chame nosso personal</span>
    </button>
  );
};

export default WhatsAppButton;
