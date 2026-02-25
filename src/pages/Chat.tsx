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
        body: { message: input, userId: user.id },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || data.plan || "Comando processado.",
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.taskId && data.requiresConfirmation) {
        toast({
          title: "Confirmação necessária",
          description: "Verifique o painel lateral e confirme a ação.",
        });
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "❌ Erro ao processar comando. Tente novamente.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsStreaming(false);
    }
  }, [user, toast]);

  const handleConfirmTask = useCallback(async (taskId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-execute", {
        body: { taskId },
      });
      if (error) throw error;
      toast({ title: "Tarefa executada", description: data.message || "Ação concluída com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro na execução", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex h-screen bg-background">
      {/* Main chat */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">Chat IA</h1>
            {roles.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {roles.join(", ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowPanel(!showPanel)}>
              {showPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <ChatMessages messages={messages} isStreaming={isStreaming} />

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>

      {/* Task panel */}
      {showPanel && (
        <div className="w-80 hidden md:block">
          <TaskPanel onConfirm={handleConfirmTask} />
        </div>
      )}
    </div>
  );
}
