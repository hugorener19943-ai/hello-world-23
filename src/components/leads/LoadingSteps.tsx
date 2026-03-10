import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  "Analisando presença digital...",
  "Detectando sinais de automação...",
  "Classificando leads...",
  "Verificando site, contato e tecnologias...",
  "Calculando scores de automação...",
  "Identificando oportunidades comerciais...",
];

export function LoadingSteps() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-primary/30 bg-card glow-neon">
      <CardContent className="py-12 flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-neon" />
          <div className="absolute inset-0 h-10 w-10 rounded-full animate-ping bg-primary/10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-foreground font-bold text-lg font-display">Processando busca inteligente</p>
          <p className="text-neon font-medium animate-pulse">{STEPS[step]}</p>
          <div className="flex gap-1 justify-center mt-3">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 w-6 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
