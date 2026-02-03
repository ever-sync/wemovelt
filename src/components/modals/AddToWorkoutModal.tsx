import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Target, Calendar, Sparkles, FolderPlus, List, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWorkouts, WorkoutWithExercises } from "@/hooks/useWorkouts";
import { useAuth } from "@/contexts/AuthContext";
import type { Equipment } from "@/hooks/useEquipment";

interface AddToWorkoutModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const objectives = [
  { id: "fat_loss", label: "Emagrecimento", icon: "🔥" },
  { id: "muscle_gain", label: "Ganho de massa", icon: "💪" },
  { id: "health", label: "Saúde geral", icon: "❤️" },
  { id: "strength", label: "Força", icon: "🏋️" },
];

const frequencies = [
  { id: 2, label: "2x" },
  { id: 3, label: "3x" },
  { id: 4, label: "4x" },
  { id: 5, label: "5x" },
];

type ModalStep = "choice" | "new-objective" | "new-frequency" | "new-name" | "existing-select";

const AddToWorkoutModal = ({ equipment, open, onOpenChange, onSuccess }: AddToWorkoutModalProps) => {
  const { user } = useAuth();
  const { workouts, createWorkout, isCreating } = useWorkouts();
  
  const [step, setStep] = useState<ModalStep>("choice");
  const [workoutName, setWorkoutName] = useState("");
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const resetForm = () => {
    setStep("choice");
    setWorkoutName("");
    setSelectedObjective(null);
    setSelectedFrequency(null);
    setSelectedWorkout(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleCreateNewWorkout = async () => {
    if (!user || !equipment) {
      toast.error("Faça login para criar treinos");
      return;
    }

    if (!workoutName.trim()) {
      toast.error("Dê um nome ao seu treino");
      return;
    }

    try {
      await createWorkout({
        name: workoutName.trim(),
        objective: selectedObjective || undefined,
        frequency: selectedFrequency || undefined,
        exercises: [{
          equipment_id: equipment.id,
          name: equipment.name,
          sets: 3,
          reps: "12",
          rest_seconds: 60,
          order_index: 0,
        }],
      });
      
      toast.success(`${equipment.name} adicionado ao novo treino! 🎉`);
      handleClose(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao criar treino");
    }
  };

  const handleAddToExisting = async () => {
    if (!user || !equipment || !selectedWorkout) {
      toast.error("Selecione um treino");
      return;
    }

    setIsAdding(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Get current exercise count to determine order
      const workout = workouts.find(w => w.id === selectedWorkout);
      const orderIndex = workout?.workout_exercises?.length ?? 0;

      const { error } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: selectedWorkout,
          equipment_id: equipment.id,
          name: equipment.name,
          sets: 3,
          reps: "12",
          rest_seconds: 60,
          order_index: orderIndex,
        });

      if (error) throw error;
      
      toast.success(`${equipment.name} adicionado ao treino! 💪`);
      handleClose(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding to workout:", error);
      toast.error("Erro ao adicionar exercício");
    } finally {
      setIsAdding(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "choice": return "Adicionar ao Treino";
      case "new-objective": return "Qual seu objetivo?";
      case "new-frequency": return "Frequência semanal";
      case "new-name": return "Nome do treino";
      case "existing-select": return "Escolha o treino";
      default: return "Adicionar ao Treino";
    }
  };

  const canProceed = () => {
    if (step === "new-objective") return !!selectedObjective;
    if (step === "new-frequency") return !!selectedFrequency;
    if (step === "new-name") return workoutName.trim().length > 0;
    if (step === "existing-select") return !!selectedWorkout;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Plus className="text-primary" size={24} />
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Step: Choice */}
          {step === "choice" && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-center text-muted-foreground text-sm mb-4">
                Onde você quer adicionar <span className="text-primary font-medium">{equipment?.name}</span>?
              </p>

              <button
                onClick={() => setStep("new-objective")}
                className="w-full bg-secondary hover:bg-secondary/80 rounded-xl p-4 flex items-center gap-4 transition-all"
              >
                <div className="w-12 h-12 wemovelt-gradient rounded-xl flex items-center justify-center">
                  <FolderPlus size={24} />
                </div>
                <div className="text-left">
                  <span className="font-bold block">Criar novo treino</span>
                  <span className="text-sm text-muted-foreground">Montar um treino do zero</span>
                </div>
              </button>

              {workouts.length > 0 && (
                <button
                  onClick={() => setStep("existing-select")}
                  className="w-full bg-secondary hover:bg-secondary/80 rounded-xl p-4 flex items-center gap-4 transition-all"
                >
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <List size={24} className="text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block">Adicionar a treino existente</span>
                    <span className="text-sm text-muted-foreground">{workouts.length} treino(s) disponível(is)</span>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Step: Objective for new workout */}
          {step === "new-objective" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Target className="mx-auto text-primary mb-2" size={32} />
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

          {/* Step: Frequency for new workout */}
          {step === "new-frequency" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Calendar className="mx-auto text-primary mb-2" size={32} />
                <p className="text-sm text-muted-foreground">Quantas vezes você pretende treinar por semana?</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
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
                    <span className="text-xl font-bold block">{freq.label}</span>
                    <span className="text-xs opacity-80">/semana</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Name for new workout */}
          {step === "new-name" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-4">
                <Sparkles className="mx-auto text-primary mb-2" size={32} />
                <p className="text-sm text-muted-foreground">Dê um nome para identificar seu treino</p>
              </div>

              <Input
                placeholder="Ex: Treino de Pernas"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-secondary border-0 rounded-xl h-12"
                autoFocus
              />

              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <h4 className="font-medium text-sm">Resumo:</h4>
                <p className="text-xs text-muted-foreground">
                  Objetivo: {objectives.find(o => o.id === selectedObjective)?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Frequência: {selectedFrequency}x por semana
                </p>
                <p className="text-xs text-muted-foreground">
                  Exercício inicial: {equipment?.name}
                </p>
              </div>
            </div>
          )}

          {/* Step: Select existing workout */}
          {step === "existing-select" && (
            <div className="space-y-3 animate-fade-in max-h-64 overflow-y-auto scrollbar-hide">
              {workouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => setSelectedWorkout(workout.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                    selectedWorkout === workout.id
                      ? "wemovelt-gradient"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <div>
                    <span className="font-bold block">{workout.name}</span>
                    <span className="text-xs opacity-80">
                      {workout.workout_exercises?.length || 0} exercício(s) • {workout.frequency ? `${workout.frequency}x/sem` : "Sem frequência"}
                    </span>
                  </div>
                  {selectedWorkout === workout.id && (
                    <Check size={20} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          {step !== "choice" && (
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  if (step === "new-objective") setStep("choice");
                  else if (step === "new-frequency") setStep("new-objective");
                  else if (step === "new-name") setStep("new-frequency");
                  else if (step === "existing-select") setStep("choice");
                }}
                className="flex-1 rounded-xl"
              >
                Voltar
              </Button>
              
              {step === "new-name" ? (
                <Button
                  onClick={handleCreateNewWorkout}
                  disabled={!canProceed() || isCreating}
                  className="flex-1 wemovelt-gradient rounded-xl font-bold"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={18} />
                      Criar Treino
                    </>
                  )}
                </Button>
              ) : step === "existing-select" ? (
                <Button
                  onClick={handleAddToExisting}
                  disabled={!canProceed() || isAdding}
                  className="flex-1 wemovelt-gradient rounded-xl font-bold"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={18} />
                      Adicionar
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (step === "new-objective") setStep("new-frequency");
                    else if (step === "new-frequency") setStep("new-name");
                  }}
                  disabled={!canProceed()}
                  className="flex-1 wemovelt-gradient rounded-xl font-bold"
                >
                  Próximo
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWorkoutModal;
