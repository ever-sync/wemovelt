import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Dumbbell, Target, Heart, Calendar } from "lucide-react";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notifications = [
  {
    id: 1,
    type: "reminder",
    icon: Calendar,
    title: "Lembrete de treino",
    message: "Não esqueça do seu treino de hoje! 💪",
    time: "Há 1 hora",
    read: false,
  },
  {
    id: 2,
    type: "motivation",
    icon: Heart,
    title: "Você está indo bem!",
    message: "3 dias consecutivos de treino! Continue assim! 🔥",
    time: "Há 3 horas",
    read: false,
  },
  {
    id: 3,
    type: "goal",
    icon: Target,
    title: "Meta atingida!",
    message: "Parabéns! Você completou sua meta semanal de treinos.",
    time: "Ontem",
    read: true,
  },
  {
    id: 4,
    type: "workout",
    icon: Dumbbell,
    title: "Novo treino disponível",
    message: "Confira o treino do dia para membros superiores.",
    time: "2 dias atrás",
    read: true,
  },
  {
    id: 5,
    type: "motivation",
    icon: Heart,
    title: "Dica de saúde",
    message: "Lembre-se de se hidratar durante os exercícios! 💧",
    time: "3 dias atrás",
    read: true,
  },
];

const NotificationsModal = ({ open, onOpenChange }: NotificationsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-4 rounded-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Bell className="text-primary" size={24} />
            Notificações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-xl transition-colors ${
                  notification.read ? "bg-secondary" : "bg-primary/10 border border-primary/20"
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.read ? "bg-muted-foreground/20" : "wemovelt-gradient"
                  }`}>
                    <Icon size={18} className={notification.read ? "text-muted-foreground" : "text-foreground"} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-bold text-sm ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <span className="text-xs text-muted-foreground/70 mt-2 block">{notification.time}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell size={48} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
