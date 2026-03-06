import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Lightbulb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const niches = [
  {
    emoji: "🧠",
    name: "Saúde",
    tip: "Saúde gera muito lead e muito agendamento",
    terms: ["clinica", "clinica medica", "dentista", "odontologia", "clinica odontologica", "laboratorio", "clinica estetica", "estetica", "dermatologia", "psicologo", "psiquiatra", "fisioterapia", "nutricionista"],
    offers: ["Chatbot de agendamento via WhatsApp", "Automação de confirmação de consulta", "Funil de captação de pacientes", "Follow-up pós-consulta automatizado", "Disparo de lembretes de retorno", "Pesquisa de satisfação automática"],
  },
  {
    emoji: "💄",
    name: "Estética",
    tip: "Muito bom para automação",
    terms: ["estetica", "clinica estetica", "estetica facial", "estetica corporal", "harmonizacao facial", "depilacao", "laser estetico", "spa estetico"],
    offers: ["Agendamento automatizado por WhatsApp", "Remarketing de clientes inativos", "Funil de promoções sazonais", "Automação de avaliação gratuita", "Upsell de pacotes automático", "Follow-up pós-procedimento"],
  },
  {
    emoji: "🐶",
    name: "Pet",
    tip: "Pet shops recebem muito WhatsApp",
    terms: ["pet shop", "clinica veterinaria", "veterinario", "banho e tosa", "hospital veterinario"],
    offers: ["Agendamento de banho e tosa por WhatsApp", "Lembrete de vacinas e vermífugos", "Automação de delivery de ração", "Programa de fidelidade automatizado", "Follow-up pós-consulta veterinária"],
  },
  {
    emoji: "🍔",
    name: "Restaurantes",
    tip: "Automação ajuda com pedidos",
    terms: ["restaurante", "pizzaria", "hamburgueria", "lanchonete", "delivery", "comida japonesa"],
    offers: ["Chatbot de pedidos via WhatsApp", "Automação de cardápio digital", "Programa de fidelidade automatizado", "Pesquisa de satisfação pós-pedido", "Disparo de promoções segmentadas", "Gestão automatizada de reservas"],
  },
  {
    emoji: "🏋️",
    name: "Academias",
    tip: "Muito bom para funil de vendas",
    terms: ["academia", "personal trainer", "crossfit", "pilates", "studio pilates", "yoga"],
    offers: ["Funil de captação de alunos", "Automação de aula experimental", "Recuperação de alunos inativos", "Disparo de treinos e dicas", "Cobrança automatizada de mensalidade", "Chatbot de matrículas"],
  },
  {
    emoji: "🏠",
    name: "Imobiliárias",
    tip: "Automação para qualificação de leads",
    terms: ["imobiliaria", "corretor de imoveis", "imoveis", "venda de imoveis", "locacao de imoveis"],
    offers: ["Qualificação automática de leads", "Envio automatizado de imóveis compatíveis", "Follow-up de visitas agendadas", "Chatbot de atendimento 24h", "Funil de nutrição para compradores", "Automação de documentação"],
  },
  {
    emoji: "🎓",
    name: "Educação",
    tip: "Muito lead",
    terms: ["curso", "escola", "curso profissionalizante", "curso tecnico", "curso online", "ingles", "escola de idiomas"],
    offers: ["Funil de captação de alunos", "Automação de matrículas", "Chatbot de dúvidas sobre cursos", "Disparo de conteúdo educativo", "Recuperação de leads não matriculados", "Lembrete de aulas e provas"],
  },
  {
    emoji: "🛠️",
    name: "Serviços Locais",
    tip: "Grande volume de atendimento",
    terms: ["contabilidade", "escritorio contabilidade", "advocacia", "advogado", "despachante", "assistencia tecnica", "manutencao"],
    offers: ["Chatbot de atendimento inicial", "Automação de orçamentos", "Follow-up de propostas enviadas", "Agendamento de reuniões automatizado", "Disparo de lembretes de prazos", "Funil de indicações"],
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
    <ScrollArea className="h-[550px]">
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground px-2 mb-2">
          Clique em um nicho para ver termos e o que oferecer
        </p>
        {niches.map((niche) => {
          const isOpen = openNiche === niche.name;
          return (
            <div key={niche.name}>
              <button
                onClick={() => setOpenNiche(isOpen ? null : niche.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold bg-muted/30 hover:bg-muted/50 rounded-lg transition-all"
              >
                {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-primary" /> : <ChevronRight className="h-4 w-4 shrink-0 text-primary" />}
                <span className="text-base">{niche.emoji}</span>
                <span className="text-foreground">{niche.name}</span>
              </button>
              {isOpen && (
                <div className="ml-4 mt-2 mb-3 space-y-3 animate-fade-in">
                  <p className="text-xs font-semibold text-primary px-2 py-1.5 bg-primary/10 rounded-md inline-block">
                    💡 {niche.tip}
                  </p>

                  {/* Termos de busca */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-1.5">🔍 Termos de busca</p>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {niche.terms.map((term) => (
                        <button
                          key={term}
                          onClick={() => copyTerm(term)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-muted/50 text-foreground hover:bg-primary/20 hover:text-primary transition-all duration-200 border border-border/30"
                          title="Clique para copiar"
                        >
                          {term}
                          <Copy className="h-3 w-3 opacity-50" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* O que oferecer */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-1.5">💰 O que oferecer</p>
                    <div className="space-y-1 px-1">
                      {niche.offers.map((offer) => (
                        <button
                          key={offer}
                          onClick={() => copyTerm(offer)}
                          className="w-full text-left flex items-start gap-2 text-xs font-medium px-2.5 py-2 rounded-md bg-muted/30 text-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 border border-border/20"
                          title="Clique para copiar"
                        >
                          <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-destructive/70" />
                          <span>{offer}</span>
                          <Copy className="h-3 w-3 opacity-40 ml-auto shrink-0 mt-0.5" />
                        </button>
                      ))}
                    </div>
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
