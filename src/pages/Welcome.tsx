import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { prefetchAuthFlow, prefetchPrimaryRoutes } from "@/lib/prefetch";
import BrandLockup from "@/components/brand/BrandLockup";

const AuthModal = lazy(() => import("@/components/modals/AuthModal"));

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    prefetchAuthFlow();
  }, []);

  const handleAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    prefetchPrimaryRoutes();
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="app-panel flex h-20 w-20 items-center justify-center rounded-[2rem]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen px-4 py-6">
      <div className="app-screen">
        <section className="relative min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2.4rem] border border-white/8 bg-black">
          <img
            src="/125729.jpg"
            alt="Atleta treinando com pesos"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.15)_0%,rgba(4,4,4,0.38)_28%,rgba(4,4,4,0.7)_58%,rgba(4,4,4,0.96)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,102,0,0.16),transparent_62%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(255,102,0,0.2),transparent_56%)]" />

          <div className="relative z-10 flex min-h-[calc(100vh-3rem)] flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur">
                <BrandLockup
                  compact
                  iconClassName="h-8 w-8"
                  kickerClassName="text-[0.62rem] text-primary/90"
                  titleClassName="text-sm tracking-[-0.04em] text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAuth("login")}
                className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-black/45"
              >
                Pular
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-primary" />
                <span className="h-1.5 w-2 rounded-full bg-white/70" />
                <span className="h-1.5 w-2 rounded-full bg-white/35" />
              </div>

              <div className="max-w-[16rem] space-y-3">
                <p className="app-kicker text-primary">Seu ritmo comeca aqui</p>
                <h1 className="text-[3rem] font-bold leading-[0.92] tracking-[-0.08em] text-white">
                  Treine forte.
                  <span className="block text-primary">Viva em movimento.</span>
                </h1>
                <p className="text-sm leading-6 text-white/78">
                  Voce ainda tem energia para mudar o dia de hoje. Entre, registre seus treinos e mantenha a constancia.
                </p>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div className="rounded-[1.6rem] border border-white/10 bg-black/35 p-4 backdrop-blur-md">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/60">Frase do dia</p>
                  <p className="mt-2 max-w-[11rem] text-2xl font-bold tracking-[-0.06em] text-white">
                    Seu proximo treino muda seu proximo passo.
                  </p>
                </div>
                <div className="orange-glow flex h-14 w-14 items-center justify-center rounded-full wemovelt-gradient text-primary-foreground">
                  <Play size={18} className="ml-0.5" />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-black/55 p-4 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.22em] text-primary/90">Comece agora</p>
                    <p className="mt-1 text-sm text-white/70">Fluxo rapido para entrar ou criar sua conta.</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                    <Sparkles size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={() => handleAuth("login")} className="h-14 w-full justify-between px-5 text-base">
                    Entrar agora
                    <ArrowRight size={18} />
                  </Button>

                  <Button
                    onClick={() => handleAuth("register")}
                    variant="outline"
                    className="h-14 w-full border-white/12 bg-white/[0.02] text-base text-white hover:bg-white/[0.06]"
                  >
                    Criar conta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Suspense fallback={null}>
        {authModalOpen && (
          <AuthModal
            open={authModalOpen}
            onOpenChange={setAuthModalOpen}
            mode={authMode}
            onSuccess={handleAuthSuccess}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Welcome;
