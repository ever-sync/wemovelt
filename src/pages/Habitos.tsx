import Header from "@/components/layout/Header";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import BottomNav from "@/components/layout/BottomNav";
import { Heart, Droplets, Moon, Apple, Smile, TrendingUp } from "lucide-react";
import { useState } from "react";
import HabitModal from "@/components/modals/HabitModal";
import HabitTracker from "@/components/HabitTracker";
import WeeklyHabitChart from "@/components/WeeklyHabitChart";
import { useHabits } from "@/hooks/useHabits";

const categories = [
  {
    id: "hydration",
    icon: Droplets,
    label: "Hidratacao",
    description: "Beba agua de forma constante.",
    tips: [
      "Beba pelo menos 2 litros de agua por dia",
      "Tenha sempre uma garrafa por perto",
      "Beba agua ao acordar",
      "Nao espere sentir sede para beber",
    ],
  },
  {
    id: "sleep",
    icon: Moon,
    label: "Sono",
    description: "Recupere energia com constancia.",
    tips: [
      "Durma de 7 a 9 horas por noite",
      "Mantenha horarios regulares",
      "Evite telas antes de dormir",
      "Escureca e silencie o ambiente",
    ],
  },
  {
    id: "nutrition",
    icon: Apple,
    label: "Alimentacao",
    description: "Coma melhor para sustentar a rotina.",
    tips: [
      "Distribua melhor as refeicoes",
      "Inclua frutas e vegetais",
      "Evite ultraprocessados",
      "Mastigue com calma",
    ],
  },
  {
    id: "wellness",
    icon: Smile,
    label: "Bem-estar",
    description: "Proteja a mente e mantenha leveza.",
    tips: [
      "Separe tempo para o que voce gosta",
      "Respire fundo todos os dias",
      "Mantenha conexoes saudaveis",
      "Celebre pequenas conquistas",
    ],
  },
];

const Habitos = () => {
  const [selectedHabit, setSelectedHabit] = useState<typeof categories[0] | null>(null);
  const { weeklyStats, isLoading, isHabitCompleted } = useHabits();

  const totalCompletedToday = ["hydration", "sleep", "nutrition", "wellness"].filter((type) =>
    isHabitCompleted(type),
  ).length;

  return (
    <div className="app-shell" style={{ paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }}>
      <Header />

      <main className="app-screen space-y-5 pt-[calc(6.75rem+env(safe-area-inset-top))]">
        <section className="animate-fade-in">
          <div className="app-panel relative overflow-hidden rounded-[2rem] p-6">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/18 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="orange-glow flex h-12 w-12 items-center justify-center rounded-[1.35rem] wemovelt-gradient text-primary-foreground">
                  <Heart size={22} />
                </div>
                <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Daily care
                </div>
              </div>
              <p className="app-kicker">Saude e constancia</p>
              <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.07em]">Habitos que sustentam o treino.</h1>
              <p className="mt-3 max-w-[30ch] text-sm leading-6 text-muted-foreground">
                Menos ruido, mais repeticao. Marque sua rotina e acompanhe consistencia.
              </p>

              {!isLoading && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-sm font-medium text-primary">
                  <TrendingUp size={16} />
                  {totalCompletedToday}/4 habitos hoje
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="animate-slide-up">
          <HabitTracker />
        </section>

        <section className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="mb-4">
            <p className="app-kicker">Categorias</p>
            <h2 className="app-section-title mt-1">Pilares da rotina</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const stats = weeklyStats.find((item) => item.type === category.id);

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedHabit(category)}
                  className="app-panel-soft relative overflow-hidden rounded-[1.6rem] p-5 text-left transition-transform hover:-translate-y-1"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold tracking-[-0.03em]">{category.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{category.description}</p>

                  {stats && stats.streak > 0 && (
                    <div className="absolute right-3 top-3 rounded-full bg-primary/12 px-2 py-1 text-xs font-bold text-primary">
                      streak {stats.streak}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="mb-4">
            <p className="app-kicker">Progresso</p>
            <h2 className="app-section-title mt-1">Semana atual</h2>
          </div>
          <WeeklyHabitChart />
        </section>

        <section className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="mb-4">
            <p className="app-kicker">Dica rapida</p>
            <h2 className="app-section-title mt-1">Micro-ajuste do dia</h2>
          </div>
          <div className="app-panel rounded-[1.6rem] p-5">
            <div className="flex items-start gap-4">
              <div className="orange-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-xl wemovelt-gradient text-primary-foreground">
                <Droplets size={24} />
              </div>
              <div>
                <h3 className="font-bold tracking-[-0.03em]">Hidrate antes do treino</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Agua antes, durante e depois ajuda na recuperacao e reduz a queda de desempenho.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />

      <HabitModal
        habit={selectedHabit}
        open={!!selectedHabit}
        onOpenChange={(open) => !open && setSelectedHabit(null)}
      />
      <WhatsAppFAB />
    </div>
  );
};

export default Habitos;
