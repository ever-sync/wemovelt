import { Droplets, Moon, Apple, Smile, Check, Flame } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";

const habits = [
  {
    type: "hydration",
    icon: Droplets,
    label: "Hidratacao",
    color: "bg-white/[0.04]",
    activeColor: "bg-primary text-primary-foreground",
    iconColor: "text-primary",
  },
  {
    type: "sleep",
    icon: Moon,
    label: "Sono",
    color: "bg-white/[0.04]",
    activeColor: "bg-primary text-primary-foreground",
    iconColor: "text-foreground",
  },
  {
    type: "nutrition",
    icon: Apple,
    label: "Alimentacao",
    color: "bg-white/[0.04]",
    activeColor: "bg-primary text-primary-foreground",
    iconColor: "text-foreground",
  },
  {
    type: "wellness",
    icon: Smile,
    label: "Bem-estar",
    color: "bg-white/[0.04]",
    activeColor: "bg-primary text-primary-foreground",
    iconColor: "text-foreground",
  },
];

interface HabitTrackerProps {
  compact?: boolean;
}

const HabitTracker = ({ compact = false }: HabitTrackerProps) => {
  const { isHabitCompleted, toggleHabit, getStreakForHabit, isToggling, isLoading } = useHabits();

  const handleToggle = async (type: string) => {
    try {
      await toggleHabit({ habitType: type });
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="app-panel rounded-[1.6rem] p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        {habits.map(({ type, icon: Icon, color, activeColor, iconColor }) => {
          const completed = isHabitCompleted(type);

          return (
            <button
              key={type}
              onClick={() => handleToggle(type)}
              disabled={isToggling}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                completed ? `${activeColor} orange-glow` : color,
                isToggling && "opacity-50",
              )}
            >
              {completed ? <Check className="text-primary-foreground" size={20} /> : <Icon className={iconColor} size={20} />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="app-panel rounded-[1.6rem] p-4 space-y-3" style={{ contentVisibility: "auto", containIntrinsicSize: "320px" }}>
      <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
        Habitos de hoje
      </h3>

      {habits.map(({ type, icon: Icon, label, color, activeColor, iconColor }) => {
        const completed = isHabitCompleted(type);
        const streak = getStreakForHabit(type);

        return (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            disabled={isToggling}
            className={cn(
              "flex w-full items-center gap-3 rounded-[1.2rem] p-3 transition-all",
              completed ? `${activeColor} orange-glow` : color,
              isToggling && "opacity-50",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                completed ? "bg-black/10" : "bg-black/20",
              )}
            >
              {completed ? (
                <Check className="text-primary-foreground" size={20} />
              ) : (
                <Icon className={iconColor} size={20} />
              )}
            </div>

            <div className="flex-1 text-left">
              <span className={cn("font-medium", completed ? "text-primary-foreground" : "text-foreground")}>
                {label}
              </span>
            </div>

            {streak > 0 && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
                  completed ? "bg-black/10 text-primary-foreground" : "bg-primary/12 text-primary",
                )}
              >
                <Flame size={12} />
                {streak}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HabitTracker;
