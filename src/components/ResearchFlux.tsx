import { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
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
    <ScrollArea className="h-[500px]">
      <div className="p-4 space-y-2">
        <p className="text-sm font-medium text-primary-foreground/80 px-2 mb-3">
          Clique em um nicho para ver os termos de busca
        </p>
        {niches.map((niche) => {
          const isOpen = openNiche === niche.name;
          return (
            <div key={niche.name} className="rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenNiche(isOpen ? null : niche.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-primary-foreground bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span className="text-base">{niche.emoji}</span>
                <span className="text-primary-foreground">{niche.name}</span>
              </button>
              {isOpen && (
                <div className="ml-4 mt-2 mb-3 space-y-2 animate-fade-in">
                  <p className="text-xs font-semibold text-primary px-2 py-1.5 bg-primary/10 rounded-md inline-block glow-neon-strong">
                    💡 {niche.tip}
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {niche.terms.map((term) => (
                      <button
                        key={term}
                        onClick={() => copyTerm(term)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary/15 text-primary-foreground hover:bg-primary/30 hover:shadow-[0_0_12px_hsl(142_71%_45%/0.3)] transition-all duration-200 border border-primary/20"
                        title="Clique para copiar"
                      >
                        {term}
                        <Copy className="h-3 w-3 opacity-60" />
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
