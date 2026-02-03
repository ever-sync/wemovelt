import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "login" | "register";
  onSuccess: () => void;
}

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nome muito curto"),
});

const getErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes("user already registered") || message.includes("already exists")) {
    return "Este e-mail já está cadastrado";
  }
  if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
    return "E-mail ou senha incorretos";
  }
  if (message.includes("email not confirmed")) {
    return "Confirme seu e-mail para continuar";
  }
  if (message.includes("weak password") || message.includes("password")) {
    return "Senha muito fraca, use pelo menos 6 caracteres";
  }
  if (message.includes("rate limit")) {
    return "Muitas tentativas. Aguarde um momento.";
  }
  
  return "Ocorreu um erro. Tente novamente.";
};

const AuthModal = ({ open, onOpenChange, mode, onSuccess }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [resetMode, setResetMode] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    try {
      if (mode === "register") {
        registerSchema.parse({ name, email, password });
      } else {
        loginSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: typeof errors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (resetMode) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Erro",
            description: getErrorMessage(error),
            variant: "destructive",
          });
        } else {
          toast({
            title: "E-mail enviado!",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          });
          setResetMode(false);
        }
      } else if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro ao entrar",
            description: getErrorMessage(error),
            variant: "destructive",
          });
        } else {
          onSuccess();
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast({
            title: "Erro ao cadastrar",
            description: getErrorMessage(error),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu e-mail para confirmar a conta.",
          });
          onOpenChange(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setErrors({});
      setResetMode(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in [&>button]:bg-secondary [&>button]:rounded-full [&>button]:w-8 [&>button]:h-8 [&>button]:hover:bg-secondary/80 [&>button]:border-0 [&>button]:top-4 [&>button]:right-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center wemovelt-gradient-text">
            {resetMode 
              ? "Recuperar senha" 
              : mode === "login" 
                ? "Bem-vindo de volta!" 
                : "Criar conta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "register" && !resetMode && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="pl-10 h-12 bg-secondary border-border rounded-xl"
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10 h-12 bg-secondary border-border rounded-xl"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          {!resetMode && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-secondary border-border rounded-xl"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
          )}

          {mode === "login" && !resetMode && (
            <button 
              type="button" 
              onClick={() => setResetMode(true)}
              className="text-sm text-primary hover:underline"
            >
              Esqueci minha senha
            </button>
          )}

          {resetMode && (
            <button 
              type="button" 
              onClick={() => setResetMode(false)}
              className="text-sm text-primary hover:underline"
            >
              Voltar ao login
            </button>
          )}

          <Button 
            type="submit"
            className="w-full h-12 text-lg font-bold wemovelt-gradient rounded-xl mt-6"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : resetMode ? (
              "Enviar e-mail"
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Cadastrar"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
