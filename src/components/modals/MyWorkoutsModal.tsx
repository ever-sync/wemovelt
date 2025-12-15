import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Clock, Calendar, Dumbbell } from "lucide-react";

interface MyWorkoutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const workoutHistory = [
  {
    id: 1,
    name: "Treino de Peito",
    date: "15/12/2024",
    duration: "45 min",
    exercises: 6,
  },
  {
    id: 2,
    name: "Treino de Pernas",
    date: "13/12/2024",
    duration: "50 min",
    exercises: 8,
  },
  {
    id: 3,
    name: "Treino de Costas",
    date: "11/12/2024",
    duration: "40 min",
    exercises: 5,
  },
  {
    id: 4,
    name: "Treino de Ombros",
    date: "09/12/2024",
    duration: "35 min",
    exercises: 4,
  },
  {
    id: 5,
    name: "Treino Completo",
    date: "07/12/2024",
    duration: "60 min",
    exercises: 10,
  },
];

const MyWorkoutsModal = ({ open, onOpenChange }: MyWorkoutsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Play className="text-primary" size={24} />
            Meus Treinos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Histórico dos seus últimos treinos realizados
          </p>

          {workoutHistory.map((workout) => (
            <div
              key={workout.id}
              className="bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{workout.name}</h4>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {workout.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {workout.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell size={12} />
                      {workout.exercises} exercícios
                    </span>
                  </div>
                </div>
                
                <div className="w-10 h-10 wemovelt-gradient rounded-xl flex items-center justify-center">
                  <Play size={18} />
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold wemovelt-gradient-text">{workoutHistory.length}</p>
              <p className="text-sm text-muted-foreground">treinos realizados</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyWorkoutsModal;
