import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { Trophy, Clock, Flame, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const WorkoutStats = () => {
  const { isLoading, getStats } = useWorkoutSessions();
  const stats = getStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-[74px] rounded-xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Trophy,
      value: stats.totalSessions,
      label: "Treinos",
      color: "text-yellow-500",
    },
    {
      icon: Clock,
      value: `${Math.floor(stats.totalMinutes / 60)}h`,
      label: "Total",
      color: "text-blue-500",
    },
    {
      icon: Flame,
      value: `${stats.averageDuration}min`,
      label: "Média",
      color: "text-orange-500",
    },
    {
      icon: Calendar,
      value: `${stats.sessionsThisWeek}x`,
      label: "Esta semana",
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statCards.map(({ icon: Icon, value, label, color }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-xl bg-card p-3"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutStats;
