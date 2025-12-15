import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Scale, Ruler, Target, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const objectives = [
  "Emagrecimento",
  "Ganho de massa",
  "Saúde geral",
  "Força",
  "Resistência",
  "Bem-estar",
];

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

  const toggleObjective = (obj: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]
    );
  };

  const handleSave = () => {
    toast.success("Perfil salvo com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <User className="text-primary" size={24} />
            Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="name"
                placeholder="Seu nome completo"
                className="pl-10 h-12 bg-secondary border-border rounded-xl"
                defaultValue="Usuário"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground text-sm">Idade</Label>
              <div className="relative">
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  className="h-12 bg-secondary border-border rounded-xl text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="text-foreground text-sm">Peso (kg)</Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  className="h-12 bg-secondary border-border rounded-xl text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-foreground text-sm">Altura (cm)</Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  className="h-12 bg-secondary border-border rounded-xl text-center"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <Target size={16} className="text-primary" />
              Objetivos
            </Label>
            <div className="flex flex-wrap gap-2">
              {objectives.map((obj) => (
                <button
                  key={obj}
                  onClick={() => toggleObjective(obj)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedObjectives.includes(obj)
                      ? "wemovelt-gradient text-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-12 text-lg font-bold wemovelt-gradient rounded-xl mt-4"
          >
            <Save size={18} className="mr-2" />
            Salvar Perfil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
