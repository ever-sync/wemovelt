import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Dumbbell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminEquipmentTab from "@/components/admin/AdminEquipmentTab";
import AdminGymsTab from "@/components/admin/AdminGymsTab";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="app-shell min-h-screen px-4 py-6">
      <div className="app-screen space-y-5">
        <section className="app-panel relative overflow-hidden rounded-[2rem] p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/16 blur-3xl" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Button variant="secondary" size="icon" onClick={() => navigate("/home")} className="h-11 w-11 rounded-full">
                <ArrowLeft size={18} />
              </Button>
              <div>
                <p className="app-kicker">Painel restrito</p>
                <h1 className="mt-1 text-[2rem] font-bold tracking-[-0.07em]">Controle operacional</h1>
                <p className="mt-2 max-w-[30ch] text-sm leading-6 text-muted-foreground">
                  Cadastre academias, equipamentos e mantenha os dados que alimentam check-in e treinos.
                </p>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-primary/12 text-primary">
              <Shield size={20} />
            </div>
          </div>
        </section>

        <Tabs defaultValue="equipment" className="space-y-4">
          <TabsList className="grid h-auto grid-cols-2 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-1">
            <TabsTrigger value="equipment" className="rounded-[1.15rem] py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Dumbbell size={16} />
                Equipamentos
              </span>
            </TabsTrigger>
            <TabsTrigger value="gyms" className="rounded-[1.15rem] py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Building2 size={16} />
                Academias
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="mt-0">
            <div className="app-panel rounded-[1.8rem] p-4">
              <AdminEquipmentTab />
            </div>
          </TabsContent>

          <TabsContent value="gyms" className="mt-0">
            <div className="app-panel rounded-[1.8rem] p-4">
              <AdminGymsTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
