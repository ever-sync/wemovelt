import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const parseRedirectUrl = (rawUrl: string) => {
  const url = new URL(rawUrl);
  const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  const searchParams = new URLSearchParams(url.search);

  return {
    type: searchParams.get("type") ?? hashParams.get("type"),
    code: searchParams.get("code"),
    accessToken: hashParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token"),
    errorDescription: searchParams.get("error_description") ?? hashParams.get("error_description"),
  };
};

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rawUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("incoming") ?? window.location.href;
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    const resolveAuth = async () => {
      try {
        const { type, code, accessToken, refreshToken, errorDescription } = parseRedirectUrl(rawUrl);

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        }

        if (cancelled) {
          return;
        }

        navigate(type === "recovery" ? "/reset-password" : "/home", { replace: true });
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel validar o link.");
        }
      }
    };

    void resolveAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, rawUrl]);

  return (
    <div className="app-shell flex min-h-screen items-center justify-center">
      <div className="app-panel mx-4 w-full max-w-sm rounded-[2rem] p-6 text-center">
        {errorMessage ? (
          <>
            <p className="app-kicker">Autenticacao</p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.06em]">Link invalido</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{errorMessage}</p>
            <Link
              to="/"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Voltar ao inicio
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Loader2 size={28} className="animate-spin" />
            </div>
            <p className="app-kicker mt-4">Autenticacao</p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.06em]">Validando acesso</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Estamos finalizando sua confirmacao para continuar no app.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
