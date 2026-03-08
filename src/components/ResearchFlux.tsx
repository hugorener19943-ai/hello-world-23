import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Lightbulb, Flame } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const niches = [
  {
    emoji: "🧠",
    name: "Saúde",
    tip: "Saúde gera muito lead e muito agendamento",
    terms: [
      { term: "clinica", hot: true },
      { term: "clinica medica", hot: true },
      { term: "dentista", hot: true },
      { term: "odontologia", hot: false },
      { term: "clinica odontologica", hot: true },
      { term: "laboratorio", hot: false },
      { term: "clinica estetica", hot: true },
      { term: "estetica", hot: true },
      { term: "dermatologia", hot: false },
      { term: "psicologo", hot: false },
      { term: "psiquiatra", hot: false },
      { term: "fisioterapia", hot: false },
      { term: "nutricionista", hot: false },
    ],
    offers: ["Chatbot de agendamento via WhatsApp", "Automação de confirmação de consulta", "Funil de captação de pacientes", "Follow-up pós-consulta automatizado", "Disparo de lembretes de retorno", "Pesquisa de satisfação automática"],
  },
  {
    emoji: "💄",
    name: "Estética",
    tip: "Muito bom para automação",
    terms: [
      { term: "estetica", hot: true },
      { term: "clinica estetica", hot: true },
      { term: "estetica facial", hot: true },
      { term: "estetica corporal", hot: false },
      { term: "harmonizacao facial", hot: true },
      { term: "depilacao", hot: false },
      { term: "laser estetico", hot: false },
      { term: "spa estetico", hot: false },
    ],
    offers: ["Agendamento automatizado por WhatsApp", "Remarketing de clientes inativos", "Funil de promoções sazonais", "Automação de avaliação gratuita", "Upsell de pacotes automático", "Follow-up pós-procedimento"],
  },
  {
    emoji: "🐶",
    name: "Pet",
    tip: "Pet shops recebem muito WhatsApp",
    terms: [
      { term: "pet shop", hot: true },
      { term: "clinica veterinaria", hot: true },
      { term: "veterinario", hot: false },
      { term: "banho e tosa", hot: true },
      { term: "hospital veterinario", hot: false },
    ],
    offers: ["Agendamento de banho e tosa por WhatsApp", "Lembrete de vacinas e vermífugos", "Automação de delivery de ração", "Programa de fidelidade automatizado", "Follow-up pós-consulta veterinária"],
  },
  {
    emoji: "🍔",
    name: "Restaurantes",
    tip: "Automação ajuda com pedidos",
    terms: [
      { term: "restaurante", hot: true },
      { term: "pizzaria", hot: true },
      { term: "hamburgueria", hot: true },
      { term: "lanchonete", hot: false },
      { term: "delivery", hot: true },
      { term: "comida japonesa", hot: false },
    ],
    offers: ["Chatbot de pedidos via WhatsApp", "Automação de cardápio digital", "Programa de fidelidade automatizado", "Pesquisa de satisfação pós-pedido", "Disparo de promoções segmentadas", "Gestão automatizada de reservas"],
  },
  {
    emoji: "🏋️",
    name: "Academias",
    tip: "Muito bom para funil de vendas",
    terms: [
      { term: "academia", hot: true },
      { term: "personal trainer", hot: true },
      { term: "crossfit", hot: false },
      { term: "pilates", hot: true },
      { term: "studio pilates", hot: false },
      { term: "yoga", hot: false },
    ],
    offers: ["Funil de captação de alunos", "Automação de aula experimental", "Recuperação de alunos inativos", "Disparo de treinos e dicas", "Cobrança automatizada de mensalidade", "Chatbot de matrículas"],
  },
  {
    emoji: "🏠",
    name: "Imobiliárias",
    tip: "Automação para qualificação de leads",
    terms: [
      { term: "imobiliaria", hot: true },
      { term: "corretor de imoveis", hot: true },
      { term: "imoveis", hot: false },
      { term: "venda de imoveis", hot: false },
      { term: "locacao de imoveis", hot: false },
    ],
    offers: ["Qualificação automática de leads", "Envio automatizado de imóveis compatíveis", "Follow-up de visitas agendadas", "Chatbot de atendimento 24h", "Funil de nutrição para compradores", "Automação de documentação"],
  },
  {
    emoji: "🎓",
    name: "Educação",
    tip: "Muito lead",
    terms: [
      { term: "curso", hot: true },
      { term: "escola", hot: false },
      { term: "curso profissionalizante", hot: true },
      { term: "curso tecnico", hot: false },
      { term: "curso online", hot: true },
      { term: "ingles", hot: true },
      { term: "escola de idiomas", hot: false },
    ],
    offers: ["Funil de captação de alunos", "Automação de matrículas", "Chatbot de dúvidas sobre cursos", "Disparo de conteúdo educativo", "Recuperação de leads não matriculados", "Lembrete de aulas e provas"],
  },
  {
    emoji: "🛠️",
    name: "Serviços Locais",
    tip: "Grande volume de atendimento",
    terms: [
      { term: "contabilidade", hot: true },
      { term: "escritorio contabilidade", hot: false },
      { term: "advocacia", hot: true },
      { term: "advogado", hot: false },
      { term: "despachante", hot: false },
      { term: "assistencia tecnica", hot: true },
      { term: "manutencao", hot: false },
    ],
    offers: ["Chatbot de atendimento inicial", "Automação de orçamentos", "Follow-up de propostas enviadas", "Agendamento de reuniões automatizado", "Disparo de lembretes de prazos", "Funil de indicações"],
  },
];

interface ResearchFluxProps {
  onSelectNiche?: (term: string) => void;
}

export function ResearchFlux({ onSelectNiche }: ResearchFluxProps = {}) {
  const [openNiche, setOpenNiche] = useState<string | null>(null);
  const { toast } = useToast();

  const copyTerm = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: text });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-2">
        <p className="text-sm text-muted-foreground px-2 mb-3">
          Clique em um nicho para ver termos e o que oferecer
        </p>
        {niches.map((niche) => {
          const isOpen = openNiche === niche.name;
          const hotCount = niche.terms.filter((t) => t.hot).length;
          return (
            <div key={niche.name}>
              <button
                onClick={() => setOpenNiche(isOpen ? null : niche.name)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold bg-muted/30 hover:bg-muted/50 rounded-lg transition-all"
              >
                {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-primary" /> : <ChevronRight className="h-4 w-4 shrink-0 text-primary" />}
                <span className="text-lg">{niche.emoji}</span>
                <span className="text-foreground text-base">{niche.name}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-destructive font-semibold">
                  <Flame className="h-3.5 w-3.5" />
                  {hotCount} quentes
                </span>
              </button>
              {isOpen && (
                <div className="ml-3 mt-3 mb-4 space-y-4 animate-fade-in">
                  <p className="text-sm font-semibold text-primary px-3 py-2 bg-primary/10 rounded-md inline-block">
                    💡 {niche.tip}
                  </p>

                  {/* Termos de busca */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">🔍 Termos de busca</p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {niche.terms.map(({ term, hot }) => (
                        <button
                          key={term}
                          onClick={() => copyTerm(term)}
                          className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 border ${
                            hot
                              ? "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25"
                              : "bg-muted/50 text-foreground border-border/30 hover:bg-primary/15 hover:text-primary"
                          }`}
                          title="Clique para copiar"
                        >
                          {hot && <Flame className="h-3.5 w-3.5" />}
                          {term}
                          <Copy className="h-3 w-3 opacity-50" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* O que oferecer */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">💰 O que oferecer</p>
                    <div className="space-y-1.5 px-2">
                      {niche.offers.map((offer) => (
                        <button
                          key={offer}
                          onClick={() => copyTerm(offer)}
                          className="w-full text-left flex items-start gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg bg-muted/30 text-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 border border-border/20"
                          title="Clique para copiar"
                        >
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-destructive/70" />
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
