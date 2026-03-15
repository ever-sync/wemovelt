import { useState } from "react";
import { Apple, CheckCircle2, Droplets, Dumbbell, Loader2, Moon, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import BrandLockup from "@/components/brand/BrandLockup";
import BrandMark from "@/components/brand/BrandMark";
import { useGoals } from "@/hooks/useGoals";
import { goalSchema, validateSafe } from "@/lib/validations";
import { toast } from "sonner";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goalTypes = [
  { type: "workout", icon: Dumbbell, label: "Treino", presets: [{ label: "3x/semana", value: 3 }, { label: "4x/semana", value: 4 }, { label: "5x/semana", value: 5 }], unit: "times_per_week" },
  { type: "hydration", icon: Droplets, label: "Hidratacao", presets: [{ label: "5 dias/semana", value: 5 }, { label: "6 dias/semana", value: 6 }, { label: "7 dias/semana", value: 7 }], unit: "times_per_week" },
  { type: "sleep", icon: Moon, label: "Sono", presets: [{ label: "5 dias/semana", value: 5 }, { label: "6 dias/semana", value: 6 }, { label: "7 dias/semana", value: 7 }], unit: "times_per_week" },
  { type: "nutrition", icon: Apple, label: "Alimentacao", presets: [{ label: "5 dias/semana", value: 5 }, { label: "6 dias/semana", value: 6 }, { label: "7 dias/semana", value: 7 }], unit: "times_per_week" },
];

const GoalModal = ({ open, onOpenChange }: GoalModalProps) => {
  const [step, setStep] = useState<"type" | "target" | "success">("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const { createGoal, isCreating } = useGoals();

  const selectedGoalType = goalTypes.find((goal) => goal.type === selectedType);

  const handleCreate = async () => {
    if (!selectedType || !selectedTarget || !selectedGoalType) return;

    const title =
      selectedType === "workout"
        ? `Treinar ${selectedTarget}x/semana`
        : `${selectedGoalType.label} ${selectedTarget} dias/semana`;

    const goalData = { type: selectedType, target: selectedTarget, unit: selectedGoalType.unit, title };
    const result = validateSafe(goalSchema, goalData);

    if (!result.success) {
      const errorResult = result as { success: false; error: string };
      toast.error(errorResult.error);
      return;
    }

    try {
      await createGoal(goalData);
      setStep("success");
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleClose = () => {
    setStep("type");
    setSelectedType(null);
    setSelectedTarget(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="app-panel max-w-sm rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        {step !== "success" ? (
          <>
            <DialogHeader className="px-6 pt-6">
              <div className="rounded-[1.6rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(255,102,0,0.16),transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <BrandLockup compact iconClassName="h-9 w-9" kickerClassName="text-[0.58rem]" titleClassName="text-sm" />
                    <div>
                      <DialogTitle className="text-left text-[1.55rem] font-bold tracking-[-0.06em]">
                        {step === "type" ? "Criar nova meta" : `Meta de ${selectedGoalType?.label ?? "progresso"}`}
                      </DialogTitle>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Defina um alvo semanal simples para acompanhar com clareza.
                      </p>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Target size={18} />
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 px-6 pb-6">
              {step === "type" && (
                <>
                  <Label className="text-foreground">Escolha o tipo de meta</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalTypes.map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setStep("target");
                        }}
                        className="app-panel-soft rounded-[1.3rem] border border-white/8 p-4 text-center transition-all hover:-translate-y-1 hover:border-primary/25"
                      >
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                          <Icon size={22} />
                        </div>
                        <span className="text-sm font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "target" && selectedGoalType && (
                <>
                  <Label className="text-foreground">Escolha sua meta semanal</Label>
                  <div className="space-y-2">
                    {selectedGoalType.presets.map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedTarget(value)}
                        className={`w-full rounded-[1.25rem] border p-4 text-left transition-all ${
                          selectedTarget === value
                            ? "border-primary/30 bg-primary/10"
                            : "border-white/8 bg-white/[0.03] hover:border-primary/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${selectedTarget === value ? "border-primary bg-primary" : "border-white/20"}`}>
                            {selectedTarget === value && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                          </div>
                          <span className="font-medium">{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setStep("type");
                        setSelectedTarget(null);
                      }}
                      className="h-12 flex-1 rounded-full"
                    >
                      Voltar
                    </Button>
                    <Button onClick={handleCreate} disabled={!selectedTarget || isCreating} className="h-12 flex-1 rounded-full font-semibold">
                      {isCreating ? <Loader2 className="animate-spin" size={18} /> : "Criar meta"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-6 py-10 text-center animate-bounce-in">
            <BrandMark className="orange-glow mb-5 h-24 w-24 rounded-[2rem]" imageClassName="h-16 w-16" />
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-2xl font-bold tracking-[-0.05em]">Meta criada</h3>
            <p className="mt-3 max-w-[24ch] text-sm leading-6 text-muted-foreground">
              Seu objetivo ja entrou no ritmo do app. Agora e acompanhar a consistencia.
            </p>
            <Button onClick={handleClose} className="mt-6 rounded-full px-8">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;
