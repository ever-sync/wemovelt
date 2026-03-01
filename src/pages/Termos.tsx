import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Termos = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft size={20} /></Link>
          </Button>
          <FileText className="text-primary" size={28} />
          <h1 className="text-2xl font-bold">Termos de Uso</h1>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h3 className="font-bold text-foreground mb-2">1. Aceitação dos Termos</h3>
            <p>Ao utilizar o aplicativo WEMOVELT, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o aplicativo.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">2. Descrição do Serviço</h3>
            <p>O WEMOVELT é uma plataforma de acompanhamento de treinos em academias ao ar livre, oferecendo funcionalidades de check-in, registro de exercícios, acompanhamento de hábitos e interação social entre usuários.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">3. Cadastro e Conta</h3>
            <p>Para utilizar o WEMOVELT, você deve criar uma conta fornecendo informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">4. Uso Adequado</h3>
            <p>Você concorda em:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Não publicar conteúdo ofensivo, ilegal ou que viole direitos de terceiros</li>
              <li>Não utilizar o serviço para fins fraudulentos</li>
              <li>Não tentar acessar contas de outros usuários</li>
              <li>Respeitar outros usuários da comunidade</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">5. Conteúdo do Usuário</h3>
            <p>Você mantém a propriedade do conteúdo que publica. Ao publicar, você concede ao WEMOVELT uma licença para exibir e distribuir esse conteúdo dentro da plataforma.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">6. Saúde e Segurança</h3>
            <p>O WEMOVELT não substitui orientação médica ou profissional de educação física. Consulte um profissional antes de iniciar qualquer programa de exercícios. O uso do aplicativo é por sua conta e risco.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">7. Modificações</h3>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas através do aplicativo.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">8. Contato</h3>
            <p>Para dúvidas sobre estes termos, entre em contato através do suporte no aplicativo.</p>
          </section>

          <p className="text-xs text-muted-foreground/70 pt-4">Última atualização: Fevereiro de 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Termos;
