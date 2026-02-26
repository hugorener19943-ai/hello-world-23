import ReactMarkdown from "react-markdown";
import { Bot, User, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { generateExcelCSV, downloadCSV, type PlaceResult } from "@/lib/excelExport";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  places?: PlaceResult[];
  searchQuery?: string;
  searchCity?: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
}

export function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDownload = (places: PlaceResult[], query: string, city: string) => {
    const csv = generateExcelCSV(places, query, city);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `prospeccao_${query.replace(/\s+/g, "_")}_${city.replace(/\s+/g, "_")}_${date}.csv`;
    downloadCSV(csv, filename);
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center space-y-2">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Agente de Prospecção B2B</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Envie comandos como "Busque restaurantes em São Paulo", "Encontre academias em Curitiba"...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="space-y-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.places && msg.places.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 mt-2"
                      onClick={() => handleDownload(msg.places!, msg.searchQuery || "busca", msg.searchCity || "local")}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar Excel (.csv)
                    </Button>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        {isStreaming && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
            </div>
            <div className="rounded-lg bg-muted px-4 py-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
