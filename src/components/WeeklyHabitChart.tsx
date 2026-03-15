import { useHabits } from "@/hooks/useHabits";
import { Droplets, Moon, Apple, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const habitConfig = {
  hydration: { icon: Droplets, label: "Hidratacao" },
  sleep: { icon: Moon, label: "Sono" },
  nutrition: { icon: Apple, label: "Alimentacao" },
  wellness: { icon: Smile, label: "Bem-estar" },
};

const WeeklyHabitChart = () => {
  const { weeklyStats, isLoading } = useHabits();

  if (isLoading) {
    return (
      <div className="app-panel rounded-[1.6rem] p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-white/[0.06]" />
          <div className="h-24 rounded bg-white/[0.05]" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-panel rounded-[1.6rem] p-4 space-y-4" style={{ contentVisibility: "auto", containIntrinsicSize: "260px" }}>
      <h3 className="font-bold tracking-[-0.03em]">Progresso semanal</h3>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => (
          <span key={day} className="text-xs text-muted-foreground">
            {day}
          </span>
        ))}
      </div>

      {weeklyStats.map((stat) => {
        const config = habitConfig[stat.type as keyof typeof habitConfig];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <div key={stat.type} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">{config.label}</span>
              <span className="ml-auto text-xs font-medium">{stat.completedDays}/7</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {stat.weeklyData.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-6 rounded-md transition-colors",
                    day.completed ? "bg-primary shadow-[0_0_18px_rgba(255,102,0,0.22)]" : "bg-white/[0.05]",
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-center gap-4 border-t border-white/6 pt-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Concluido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-white/[0.08]" />
          <span className="text-xs text-muted-foreground">Pendente</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHabitChart;
