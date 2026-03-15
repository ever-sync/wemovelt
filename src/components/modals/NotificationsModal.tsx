import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, CheckCheck, Flame, Heart, Loader2, MessageCircle, Target, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import BrandMark from "@/components/brand/BrandMark";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return Heart;
    case "comment":
      return MessageCircle;
    case "goal_completed":
      return Target;
    case "streak":
      return Flame;
    case "reminder":
      return Calendar;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string, read: boolean) => {
  if (read) return "bg-white/[0.05] text-muted-foreground";

  switch (type) {
    case "like":
      return "bg-primary text-primary-foreground";
    case "comment":
      return "bg-primary/80 text-primary-foreground";
    case "goal_completed":
      return "bg-primary text-primary-foreground";
    case "streak":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-primary text-primary-foreground";
  }
};

const NotificationsModal = ({ open, onOpenChange }: NotificationsModalProps) => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotifications();

  const handleNotificationClick = async (id: string, read: boolean | null) => {
    if (!read) {
      await markAsRead(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-panel max-w-sm rounded-[1.9rem] border-white/10 bg-card/95 p-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.05]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl font-bold">
            <BrandMark className="h-11 w-11 rounded-[1.2rem] border-white/10 bg-black/30" imageClassName="h-7 w-7" />
            Notificacoes
            {unreadCount > 0 && (
              <span className="orange-glow rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" onClick={() => markAllAsRead()} className="flex-1 text-xs">
                  <CheckCheck size={14} className="mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => clearAll()} className="text-xs">
                <Trash2 size={14} className="mr-1" />
                Limpar
              </Button>
            </div>
          )}

          <div className="max-h-[65vh] space-y-3 overflow-y-auto scrollbar-hide">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-muted-foreground" size={28} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="app-panel-soft rounded-[1.6rem] py-10 text-center">
                <BrandMark className="mx-auto mb-4 h-16 w-16 rounded-[1.4rem] border-white/10 bg-black/25" imageClassName="h-10 w-10" />
                <p className="text-muted-foreground">Nenhuma notificacao</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Quando houver atividade relevante, ela aparecera aqui em tempo real.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                });

                return (
                  <button
                    key={notification.id}
                    onClick={() => void handleNotificationClick(notification.id, notification.read)}
                    className={cn(
                      "group block w-full rounded-[1.45rem] border p-4 text-left transition-colors",
                      notification.read
                        ? "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
                        : "border-primary/20 bg-primary/10 hover:bg-primary/15",
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl",
                          getNotificationColor(notification.type, Boolean(notification.read)),
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{notification.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              void deleteNotification(notification.id);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Excluir notificacao"
                          >
                            <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                          <span className="text-xs text-muted-foreground/80">{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
