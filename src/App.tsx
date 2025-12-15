import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Treinos from "./pages/Treinos";
import Habitos from "./pages/Habitos";
import Frequencia from "./pages/Frequencia";
import Comunidade from "./pages/Comunidade";
import NotFound from "./pages/NotFound";
import WhatsAppButton from "./components/WhatsAppButton";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showWhatsApp = location.pathname !== "/";

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/treinos" element={<Treinos />} />
        <Route path="/habitos" element={<Habitos />} />
        <Route path="/frequencia" element={<Frequencia />} />
        <Route path="/comunidade" element={<Comunidade />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showWhatsApp && <WhatsAppButton />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
