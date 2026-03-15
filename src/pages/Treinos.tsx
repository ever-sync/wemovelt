import { lazy, Suspense, useState } from "react";
import { ArrowRight, Calendar, Dumbbell, Play, Plus } from "lucide-react";
import Header from "@/components/layout/Header";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import BottomNav from "@/components/layout/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useEquipment, Equipment } from "@/hooks/useEquipment";

const EquipmentModal = lazy(() => import("@/components/modals/EquipmentModal"));
const MyWorkoutsModal = lazy(() => import("@/components/modals/MyWorkoutsModal"));
const DailyWorkoutModal = lazy(() => import("@/components/modals/DailyWorkoutModal"));
const CreateWorkoutModal = lazy(() => import("@/components/modals/CreateWorkoutModal"));

const workoutCards = [
  { icon: Play, label: "Meus treinos", description: "Retomar sessoes salvas", featured: true, action: "my-workouts" },
  { icon: Calendar, label: "Treino do dia", description: "Sugestao pronta", featured: false, action: "daily-workout" },
  { icon: Plus, label: "Criar treino", description: "Monte sua rotina", featured: false, action: "create-workout" },
];

const Treinos = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [myWorkoutsOpen, setMyWorkoutsOpen] = useState(false);
  const [dailyWorkoutOpen, setDailyWorkoutOpen] = useState(false);
  const [createWorkoutOpen, setCreateWorkoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { equipment, isLoading, categories } = useEquipment();

  const filteredEquipment = selectedCategory ? equipment.filter((eq) => eq.category === selectedCategory) : equipment;

  const handleCardClick = (action: string) => {
    if (action === "my-workouts") setMyWorkoutsOpen(true);
    if (action === "daily-workout") setDailyWorkoutOpen(true);
    if (action === "create-workout") setCreateWorkoutOpen(true);
  };

  return (
    <div className="app-shell" style={{ paddingBottom: "calc(8.5rem + env(safe-area-inset-bottom))" }}>
      <Header />

      <main className="app-screen space-y-5 pt-[calc(6.75rem+env(safe-area-inset-top))]">
        <section className="animate-fade-in">
          <div className="mb-3">
            <p className="app-kicker">Treinos</p>
            <h1 className="mt-1 text-[2rem] font-bold tracking-[-0.07em]">Escolha seu fluxo.</h1>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {workoutCards.map(({ icon: Icon, label, description, featured, action }) => (
              <button
                key={label}
                onClick={() => handleCardClick(action)}
                className={`group rounded-[1.8rem] p-[1px] text-left transition-transform duration-300 hover:-translate-y-1 ${
                  featured ? "orange-glow wemovelt-gradient" : "app-panel"
                }`}
              >
                <div
                  className={`flex items-center justify-between rounded-[1.75rem] px-4 py-4 ${
                    featured ? "bg-[linear-gradient(180deg,rgba(15,15,15,0.2),rgba(15,15,15,0.58))]" : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        featured ? "bg-black/20 text-white" : "bg-primary/14 text-primary"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-[-0.04em]">{label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className={`transition-transform duration-300 group-hover:translate-x-1 ${featured ? "text-white" : "text-primary"}`} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="animate-slide-up" style={{ contentVisibility: "auto", containIntrinsicSize: "110px" }}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="app-kicker">Filtro rapido</p>
              <h2 className="app-section-title mt-1">Categorias</h2>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                !selectedCategory ? "orange-glow wemovelt-gradient text-primary-foreground" : "app-panel-soft text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "orange-glow wemovelt-gradient text-primary-foreground"
                    : "app-panel-soft text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="animate-slide-up" style={{ contentVisibility: "auto", containIntrinsicSize: "760px" }}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="app-kicker">Catalogo</p>
              <h2 className="app-section-title mt-1">Equipamentos</h2>
            </div>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
              {filteredEquipment.length} itens
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="app-panel overflow-hidden rounded-[1.6rem]">
                  <Skeleton className="aspect-square rounded-none bg-white/[0.06]" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-3/4 bg-white/[0.06]" />
                    <Skeleton className="h-3 w-1/2 bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="app-panel rounded-[1.8rem] p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-white/[0.04]">
                <Dumbbell size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum equipamento encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredEquipment.map((eq) => (
                <button
                  key={eq.id}
                  onClick={() => setSelectedEquipment(eq)}
                  className="app-panel overflow-hidden rounded-[1.65rem] text-left transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square bg-white/[0.03]">
                    {eq.image_url ? (
                      <img src={eq.image_url} alt={eq.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Dumbbell size={30} className="text-primary/70" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <h3 className="line-clamp-2 text-sm font-bold tracking-[-0.03em]">{eq.name}</h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{eq.muscles?.join(", ") || "Equipamento funcional"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      <WhatsAppFAB />

      <Suspense fallback={null}>
        {selectedEquipment && (
          <EquipmentModal
            equipment={selectedEquipment}
            open={!!selectedEquipment}
            onOpenChange={(open) => !open && setSelectedEquipment(null)}
          />
        )}
        {myWorkoutsOpen && <MyWorkoutsModal open={myWorkoutsOpen} onOpenChange={setMyWorkoutsOpen} />}
        {dailyWorkoutOpen && <DailyWorkoutModal open={dailyWorkoutOpen} onOpenChange={setDailyWorkoutOpen} />}
        {createWorkoutOpen && <CreateWorkoutModal open={createWorkoutOpen} onOpenChange={setCreateWorkoutOpen} />}
      </Suspense>
    </div>
  );
};

export default Treinos;
