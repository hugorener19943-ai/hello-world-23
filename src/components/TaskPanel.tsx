import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Loader2, XCircle, AlertTriangle } from "lucide-react";

interface AITask {
  id: string;
  command: string;
  status: string;
  plan: string | null;
  requires_confirmation: boolean;
  confirmed: boolean;
  error_message: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", icon: <Clock className="h-3 w-3" />, variant: "secondary" },
  aguardando_confirmacao: { label: "Confirmar", icon: <AlertTriangle className="h-3 w-3" />, variant: "outline" },
  em_execucao: { label: "Executando", icon: <Loader2 className="h-3 w-3 animate-spin" />, variant: "default" },
  concluida: { label: "Concluída", icon: <CheckCircle className="h-3 w-3" />, variant: "secondary" },
  falhou: { label: "Falhou", icon: <XCircle className="h-3 w-3" />, variant: "destructive" },
};

interface TaskPanelProps {
  onConfirm: (taskId: string) => void;
}

export function TaskPanel({ onConfirm }: TaskPanelProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AITask[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      const { data } = await supabase
        .from("ai_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setTasks(data as AITask[]);
    };

    fetchTasks();

    const channel = supabase
      .channel("ai_tasks_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_tasks", filter: `user_id=eq.${user.id}` }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Últimas Tarefas</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {tasks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhuma tarefa ainda</p>
          )}
          {tasks.map((task) => {
            const config = statusConfig[task.status] ?? statusConfig.pendente;
            return (
              <div key={task.id} className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs text-foreground line-clamp-2">{task.command}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
                    {config.icon} {config.label}
                  </Badge>
                  {task.status === "aguardando_confirmacao" && !task.confirmed && (
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onConfirm(task.id)}>
                      Confirmar
                    </Button>
                  )}
                </div>
                {task.error_message && (
                  <p className="text-xs text-destructive">{task.error_message}</p>
                )}
                {task.plan && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{task.plan}</p>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
