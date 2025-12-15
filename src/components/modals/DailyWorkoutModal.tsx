import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const workouts = [
  {
    id: 1,
    day: "Ontem",
    date: "14/12",
    name: "Treino de Pernas",
    status: "completed",
    exercises: ["Leg Press", "Cadeira Extensora", "Agachamento", "Panturrilha"],
    duration: "45 min",
  },
  {
    id: 2,
    day: "Hoje",
    date: "15/12",
    name: "Treino de Peito e Tríceps",
    status: "today",
    exercises: ["Supino Reto", "Supino Inclinado", "Crucifixo", "Tríceps Corda"],
    duration: "50 min",
  },
  {
    id: 3,
    day: "Amanhã",
    date: "16/12",
    name: "Treino de Costas e Bíceps",
    status: "upcoming",
    exercises: ["Puxada Frontal", "Remada Baixa", "Rosca Direta", "Rosca Martelo"],
    duration: "45 min",
  },
  {
    id: 4,
    day: "Terça",
    date: "17/12",
    name: "Treino de Ombros",
    status: "upcoming",
    exercises: ["Desenvolvimento", "Elevação Lateral", "Elevação Frontal"],
    duration: "40 min",
  },
];

const DailyWorkoutModal = ({ open, onOpenChange }: DailyWorkoutModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Calendar className="text-primary" size={24} />
            Treino do Dia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className={`rounded-xl p-4 transition-all ${
                workout.status === "today"
                  ? "bg-primary/10 border-2 border-primary"
                  : workout.status === "completed"
                  ? "bg-success/10 border border-success/30"
                  : "bg-secondary"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    workout.status === "today"
                      ? "wemovelt-gradient"
                      : workout.status === "completed"
                      ? "bg-success"
                      : "bg-muted-foreground/30 text-muted-foreground"
                  }`}>
                    {workout.day}
                  </span>
                  <span className="text-xs text-muted-foreground">{workout.date}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {workout.duration}
                </div>
              </div>

              <h4 className="font-bold">{workout.name}</h4>

              <div className="flex flex-wrap gap-1 mt-2">
                {workout.exercises.map((exercise, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-background/50 px-2 py-1 rounded-full text-muted-foreground"
                  >
                    {exercise}
                  </span>
                ))}
              </div>

              {workout.status === "today" && (
                <Button className="w-full mt-4 wemovelt-gradient font-bold rounded-xl">
                  <Dumbbell size={18} className="mr-2" />
                  Iniciar Treino
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyWorkoutModal;
