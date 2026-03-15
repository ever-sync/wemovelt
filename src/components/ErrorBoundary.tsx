import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/brand/BrandMark";
import logger from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell flex min-h-screen items-center justify-center p-6">
          <div className="app-panel max-w-md w-full rounded-[2rem] p-6 text-center space-y-6">
            <div className="relative mx-auto w-fit">
              <BrandMark className="orange-glow h-20 w-20 rounded-[2rem] animate-bounce-in" imageClassName="h-14 w-14" />
              <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Ops! Algo deu errado</h1>
              <p className="text-muted-foreground">
                Encontramos um problema inesperado. Tente recarregar a pagina ou voltar para a tela inicial.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-left">
                <p className="break-all text-sm font-mono text-destructive">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 justify-center sm:flex-row">
              <Button onClick={this.handleReload} className="font-bold">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar pagina
              </Button>

              <Button onClick={this.handleGoHome} variant="outline" className="border-border">
                <Home className="mr-2 h-4 w-4" />
                Ir para inicio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
