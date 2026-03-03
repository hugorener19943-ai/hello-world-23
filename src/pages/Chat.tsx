import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages, type ChatMessage } from "@/components/ChatMessages";
import { TaskPanel } from "@/components/TaskPanel";
import { Button } from "@/components/ui/button";
import { LogOut, PanelRightOpen, PanelRightClose } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

export default function Chat() {
  const { user, loading, roles, signOut } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const { toast } = useToast();

  const handleSend = useCallback(async (input: string) => {
    if (!user) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-command", {
        body: { message: input },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "Comando processado.",
        places: data.places,
        searchQuery: data.searchQuery,
        searchCity: data.searchCity,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.requiresConfirmation) {
        toast({ title: "Confirmação necessária", description: "Verifique o painel lateral." });
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "❌ Erro ao processar. Tente novamente." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [user, toast]);

  const handleConfirmTask = useCallback(async (taskId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-execute", { body: { taskId } });
      if (error) throw error;
      toast({ title: "Tarefa executada", description: data.message || "Concluída." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Prospecção IA</h1>
            {roles.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {roles.join(", ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowPanel(!showPanel)}>
              {showPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <ChatMessages messages={messages} isStreaming={isStreaming} />
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>

      {showPanel && (
        <div className="w-80 hidden md:block">
          <TaskPanel onConfirm={handleConfirmTask} />
        </div>
      )}
    </div>
  );
}
