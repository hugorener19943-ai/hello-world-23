import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const niches = [
  {
    emoji: "🧠",
    name: "Saúde",
    tip: "Saúde gera muito lead e muito agendamento",
    terms: ["clinica", "clinica medica", "dentista", "odontologia", "clinica odontologica", "laboratorio", "clinica estetica", "estetica", "dermatologia", "psicologo", "psiquiatra", "fisioterapia", "nutricionista"],
  },
  {
    emoji: "💄",
    name: "Estética",
    tip: "Muito bom para automação",
    terms: ["estetica", "clinica estetica", "estetica facial", "estetica corporal", "harmonizacao facial", "depilacao", "laser estetico", "spa estetico"],
  },
  {
    emoji: "🐶",
    name: "Pet",
    tip: "Pet shops recebem muito WhatsApp",
    terms: ["pet shop", "clinica veterinaria", "veterinario", "banho e tosa", "hospital veterinario"],
  },
  {
    emoji: "🍔",
    name: "Restaurantes",
    tip: "Automação ajuda com pedidos",
    terms: ["restaurante", "pizzaria", "hamburgueria", "lanchonete", "delivery", "comida japonesa"],
  },
  {
    emoji: "🏋️",
    name: "Academias",
    tip: "Muito bom para funil de vendas",
    terms: ["academia", "personal trainer", "crossfit", "pilates", "studio pilates", "yoga"],
  },
  {
    emoji: "🏠",
    name: "Imobiliárias",
    tip: "Automação para qualificação de leads",
    terms: ["imobiliaria", "corretor de imoveis", "imoveis", "venda de imoveis", "locacao de imoveis"],
  },
  {
    emoji: "🎓",
    name: "Educação",
    tip: "Muito lead",
    terms: ["curso", "escola", "curso profissionalizante", "curso tecnico", "curso online", "ingles", "escola de idiomas"],
  },
  {
    emoji: "🛠️",
    name: "Serviços Locais",
    tip: "Grande volume de atendimento",
    terms: ["contabilidade", "escritorio contabilidade", "advocacia", "advogado", "despachante", "assistencia tecnica", "manutencao"],
  },
];

export function ResearchFlux() {
  const [openNiche, setOpenNiche] = useState<string | null>(null);
  const { toast } = useToast();

  const copyTerm = (term: string) => {
    navigator.clipboard.writeText(term);
    toast({ title: "Copiado!", description: term });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-1">
        <p className="text-xs text-muted-foreground px-2 mb-2">
          Nichos que mais compram automação. Clique para ver os termos de busca.
        </p>
        {niches.map((niche) => {
          const isOpen = openNiche === niche.name;
          return (
            <div key={niche.name}>
              <button
                onClick={() => setOpenNiche(isOpen ? null : niche.name)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                <span>{niche.emoji}</span>
                <span className="font-medium">{niche.name}</span>
              </button>
              {isOpen && (
                <div className="ml-6 mb-2 space-y-1">
                  <p className="text-xs text-neon px-2 py-1">💡 {niche.tip}</p>
                  <div className="flex flex-wrap gap-1 px-2">
                    {niche.terms.map((term) => (
                      <button
                        key={term}
                        onClick={() => copyTerm(term)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                        title="Clique para copiar"
                      >
                        {term}
                        <Copy className="h-2.5 w-2.5 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
