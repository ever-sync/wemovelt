import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Target, BarChart3, Calendar, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const objectives = [
  { id: "fat_loss", label: "Emagrecimento", icon: "🔥" },
  { id: "muscle_gain", label: "Ganho de massa", icon: "💪" },
  { id: "health", label: "Saúde geral", icon: "❤️" },
  { id: "strength", label: "Força", icon: "🏋️" },
];

const levels = [
  { id: "beginner", label: "Iniciante", description: "Estou começando agora" },
  { id: "intermediate", label: "Intermediário", description: "Já treino há alguns meses" },
  { id: "advanced", label: "Avançado", description: "Treino há mais de 1 ano" },
];

const frequencies = [
  { id: 2, label: "2x por semana" },
  { id: 3, label: "3x por semana" },
  { id: 4, label: "4x por semana" },
  { id: 5, label: "5x por semana" },
];

const CreateWorkoutModal = ({ open, onOpenChange }: CreateWorkoutModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success("Treino criado com sucesso! 🎉");
      onOpenChange(false);
      // Reset state
      setStep(1);
      setSelectedObjective(null);
      setSelectedLevel(null);
      setSelectedFrequency(null);
    }, 2000);
  };

  const canProceed = () => {
    if (step === 1) return selectedObjective;
    if (step === 2) return selectedLevel;
    if (step === 3) return selectedFrequency;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Plus className="text-primary" size={24} />
            Criar Treino
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  s === step ? "wemovelt-gradient w-6" : s < step ? "bg-success" : "bg-secondary"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Objective */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Target className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Qual seu objetivo?</h3>
                <p className="text-sm text-muted-foreground">Escolha o foco principal do treino</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjective(obj.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedObjective === obj.id
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{obj.icon}</span>
                    <span className="text-sm font-medium">{obj.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Level */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <BarChart3 className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Qual seu nível?</h3>
                <p className="text-sm text-muted-foreground">Isso ajuda a definir a intensidade</p>
              </div>

              <div className="space-y-3">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedLevel === level.id
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="font-bold block">{level.label}</span>
                    <span className="text-sm opacity-80">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Frequency */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Calendar className="mx-auto text-primary mb-2" size={32} />
                <h3 className="font-bold">Quantas vezes por semana?</h3>
                <p className="text-sm text-muted-foreground">Defina sua frequência de treino</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {frequencies.map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => setSelectedFrequency(freq.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedFrequency === freq.id
                        ? "wemovelt-gradient"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="text-2xl font-bold block">{freq.id}x</span>
                    <span className="text-xs opacity-80">por semana</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-xl"
              >
                Voltar
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 wemovelt-gradient rounded-xl font-bold"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!canProceed() || generating}
                className="flex-1 wemovelt-gradient rounded-xl font-bold"
              >
                {generating ? (
                  <>
                    <Sparkles className="mr-2 animate-spin" size={18} />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={18} />
                    Gerar Treino
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkoutModal;
