import { useState, useRef } from "react";
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
      { term: "odontologia", hot: true },
      { term: "clinica odontologica", hot: true },
      { term: "laboratorio", hot: false },
      { term: "clinica estetica", hot: true },
      { term: "estetica", hot: true },
      { term: "dermatologia", hot: true },
      { term: "psicologo", hot: false },
      { term: "psiquiatra", hot: false },
      { term: "fisioterapia", hot: true },
      { term: "nutricionista", hot: true },
      { term: "ortopedia", hot: false },
      { term: "pediatra", hot: false },
      { term: "clinica popular", hot: true },
      { term: "oftalmologista", hot: true },
      { term: "cardiologista", hot: false },
      { term: "fonoaudiologia", hot: false },
      { term: "clinica de vacinação", hot: true },
      { term: "clinica de exames", hot: true },
      { term: "endocrinologista", hot: false },
      { term: "ginecologista", hot: true },
      { term: "urologista", hot: false },
      { term: "otorrino", hot: false },
      { term: "pronto socorro", hot: false },
      { term: "clinica de reabilitação", hot: true },
      { term: "acupuntura", hot: true },
      { term: "quiropraxia", hot: true },
      { term: "implante dentario", hot: true },
      { term: "ortodontia", hot: true },
      { term: "protese dentaria", hot: true },
      { term: "clinica de fertilidade", hot: true },
      { term: "medicina do trabalho", hot: true },
      { term: "home care", hot: true },
      { term: "terapia ocupacional", hot: false },
      { term: "podologia", hot: true },
    ],
    offers: ["Chatbot de agendamento via WhatsApp", "Automação de confirmação de consulta", "Funil de captação de pacientes", "Follow-up pós-consulta automatizado", "Disparo de lembretes de retorno", "Pesquisa de satisfação automática"],
  },
  {
    emoji: "💄",
    name: "Estética & Beleza",
    tip: "Altíssima conversão — cliente recorrente + ticket alto",
    terms: [
      { term: "estetica", hot: true },
      { term: "clinica estetica", hot: true },
      { term: "estetica facial", hot: true },
      { term: "estetica corporal", hot: true },
      { term: "harmonizacao facial", hot: true },
      { term: "depilacao", hot: true },
      { term: "depilacao a laser", hot: true },
      { term: "laser estetico", hot: false },
      { term: "spa estetico", hot: false },
      { term: "microagulhamento", hot: true },
      { term: "limpeza de pele", hot: true },
      { term: "botox", hot: true },
      { term: "preenchimento labial", hot: true },
      { term: "skincare profissional", hot: false },
      { term: "salao de beleza", hot: true },
      { term: "cabeleireiro", hot: true },
      { term: "barbearia", hot: true },
      { term: "nail designer", hot: true },
      { term: "manicure", hot: true },
      { term: "sobrancelha", hot: true },
      { term: "design de sobrancelha", hot: true },
      { term: "extensao de cilios", hot: true },
      { term: "micropigmentacao", hot: true },
      { term: "bronzeamento", hot: false },
      { term: "peeling", hot: true },
      { term: "criolipolise", hot: true },
      { term: "drenagem linfatica", hot: true },
      { term: "massagem modeladora", hot: true },
      { term: "tratamento capilar", hot: true },
      { term: "escova progressiva", hot: true },
      { term: "coloracao", hot: true },
      { term: "studio de beleza", hot: true },
    ],
    offers: ["Agendamento automatizado por WhatsApp", "Remarketing de clientes inativos", "Funil de promoções sazonais", "Automação de avaliação gratuita", "Upsell de pacotes automático", "Follow-up pós-procedimento"],
  },
  {
    emoji: "🐶",
    name: "Pet",
    tip: "Pet shops recebem muito WhatsApp — automação vende fácil",
    terms: [
      { term: "pet shop", hot: true },
      { term: "clinica veterinaria", hot: true },
      { term: "veterinario", hot: true },
      { term: "banho e tosa", hot: true },
      { term: "hospital veterinario", hot: false },
      { term: "creche para cachorro", hot: true },
      { term: "hotel pet", hot: true },
      { term: "adestramento", hot: false },
      { term: "racao delivery", hot: true },
      { term: "dog walker", hot: false },
      { term: "aquario", hot: false },
      { term: "agropecuaria", hot: true },
      { term: "taxi dog", hot: true },
      { term: "pet sitter", hot: true },
      { term: "loja de animais", hot: true },
    ],
    offers: ["Agendamento de banho e tosa por WhatsApp", "Lembrete de vacinas e vermífugos", "Automação de delivery de ração", "Programa de fidelidade automatizado", "Follow-up pós-consulta veterinária"],
  },
  {
    emoji: "🍔",
    name: "Alimentação & Delivery",
    tip: "Volume altíssimo de pedidos — automação reduz custos",
    terms: [
      { term: "restaurante", hot: true },
      { term: "pizzaria", hot: true },
      { term: "hamburgueria", hot: true },
      { term: "lanchonete", hot: true },
      { term: "delivery", hot: true },
      { term: "comida japonesa", hot: true },
      { term: "churrascaria", hot: false },
      { term: "padaria", hot: true },
      { term: "doceria", hot: true },
      { term: "açaiteria", hot: true },
      { term: "marmitaria", hot: true },
      { term: "food truck", hot: false },
      { term: "sorveteria", hot: true },
      { term: "cafeteria", hot: true },
      { term: "confeitaria", hot: true },
      { term: "espetinho", hot: false },
      { term: "pastelaria", hot: true },
      { term: "distribuidora de bebidas", hot: true },
      { term: "casa de sucos", hot: true },
      { term: "rotisserie", hot: true },
      { term: "comida fitness", hot: true },
      { term: "comida vegana", hot: true },
      { term: "comida arabe", hot: false },
      { term: "comida italiana", hot: true },
      { term: "comida mexicana", hot: true },
      { term: "poke", hot: true },
      { term: "temakeria", hot: true },
      { term: "bar e restaurante", hot: true },
    ],
    offers: ["Chatbot de pedidos via WhatsApp", "Automação de cardápio digital", "Programa de fidelidade automatizado", "Pesquisa de satisfação pós-pedido", "Disparo de promoções segmentadas", "Gestão automatizada de reservas"],
  },
  {
    emoji: "🏋️",
    name: "Academias & Fitness",
    tip: "Muito bom para funil de vendas e retenção",
    terms: [
      { term: "academia", hot: true },
      { term: "personal trainer", hot: true },
      { term: "crossfit", hot: true },
      { term: "pilates", hot: true },
      { term: "studio pilates", hot: true },
      { term: "yoga", hot: false },
      { term: "funcional", hot: true },
      { term: "musculação", hot: true },
      { term: "studio de treino", hot: true },
      { term: "natação", hot: false },
      { term: "artes marciais", hot: false },
      { term: "luta", hot: false },
      { term: "jiu jitsu", hot: false },
      { term: "muay thai", hot: false },
      { term: "dança", hot: true },
      { term: "pole dance", hot: true },
      { term: "spinning", hot: true },
      { term: "hidroginastica", hot: true },
      { term: "treinamento funcional", hot: true },
      { term: "boxe", hot: true },
      { term: "studio fitness", hot: true },
    ],
    offers: ["Funil de captação de alunos", "Automação de aula experimental", "Recuperação de alunos inativos", "Disparo de treinos e dicas", "Cobrança automatizada de mensalidade", "Chatbot de matrículas"],
  },
  {
    emoji: "🏠",
    name: "Imobiliárias & Construção",
    tip: "Ticket altíssimo — automação qualifica e converte",
    terms: [
      { term: "imobiliaria", hot: true },
      { term: "corretor de imoveis", hot: true },
      { term: "imoveis", hot: true },
      { term: "venda de imoveis", hot: true },
      { term: "locacao de imoveis", hot: true },
      { term: "construtora", hot: true },
      { term: "incorporadora", hot: false },
      { term: "loteamento", hot: true },
      { term: "administradora de condominio", hot: false },
      { term: "arquiteto", hot: true },
      { term: "engenheiro civil", hot: false },
      { term: "decoracao de interiores", hot: true },
      { term: "paisagismo", hot: false },
      { term: "reformas", hot: true },
      { term: "pintura residencial", hot: false },
      { term: "moveis planejados", hot: true },
      { term: "marcenaria", hot: true },
      { term: "loja de materiais de construção", hot: true },
      { term: "vidraceiro", hot: false },
      { term: "gesso e drywall", hot: true },
      { term: "energia solar", hot: true },
      { term: "ar condicionado", hot: true },
      { term: "piscina", hot: true },
    ],
    offers: ["Qualificação automática de leads", "Envio automatizado de imóveis compatíveis", "Follow-up de visitas agendadas", "Chatbot de atendimento 24h", "Funil de nutrição para compradores", "Automação de documentação"],
  },
  {
    emoji: "🎓",
    name: "Educação & Cursos",
    tip: "Muito lead — automação converte matrícula",
    terms: [
      { term: "curso", hot: true },
      { term: "escola", hot: true },
      { term: "curso profissionalizante", hot: true },
      { term: "curso tecnico", hot: true },
      { term: "curso online", hot: true },
      { term: "ingles", hot: true },
      { term: "escola de idiomas", hot: true },
      { term: "reforço escolar", hot: true },
      { term: "faculdade", hot: false },
      { term: "preparatorio concurso", hot: true },
      { term: "auto escola", hot: true },
      { term: "escola infantil", hot: true },
      { term: "creche", hot: true },
      { term: "coaching", hot: true },
      { term: "mentoria", hot: true },
      { term: "escola de musica", hot: true },
      { term: "curso de informatica", hot: true },
      { term: "curso de programacao", hot: true },
      { term: "curso de estetica", hot: true },
      { term: "curso de gastronomia", hot: true },
      { term: "curso de fotografia", hot: true },
      { term: "curso de maquiagem", hot: true },
      { term: "aula particular", hot: true },
      { term: "escola de natação", hot: true },
    ],
    offers: ["Funil de captação de alunos", "Automação de matrículas", "Chatbot de dúvidas sobre cursos", "Disparo de conteúdo educativo", "Recuperação de leads não matriculados", "Lembrete de aulas e provas"],
  },
  {
    emoji: "🛠️",
    name: "Serviços Locais",
    tip: "Grande volume de atendimento — automatize o primeiro contato",
    terms: [
      { term: "contabilidade", hot: true },
      { term: "escritorio contabilidade", hot: true },
      { term: "advocacia", hot: true },
      { term: "advogado", hot: true },
      { term: "despachante", hot: true },
      { term: "assistencia tecnica", hot: true },
      { term: "manutencao", hot: false },
      { term: "encanador", hot: false },
      { term: "eletricista", hot: false },
      { term: "dedetizadora", hot: true },
      { term: "lavanderia", hot: true },
      { term: "grafica", hot: true },
      { term: "segurança eletronica", hot: true },
      { term: "chaveiro", hot: false },
      { term: "vidracaria", hot: false },
      { term: "serralheria", hot: false },
      { term: "limpeza comercial", hot: true },
      { term: "empresa de limpeza", hot: true },
      { term: "jardinagem", hot: true },
      { term: "mudança e frete", hot: true },
      { term: "cartorio", hot: false },
      { term: "tradutor juramentado", hot: false },
      { term: "consultoria empresarial", hot: true },
      { term: "recursos humanos", hot: true },
    ],
    offers: ["Chatbot de atendimento inicial", "Automação de orçamentos", "Follow-up de propostas enviadas", "Agendamento de reuniões automatizado", "Disparo de lembretes de prazos", "Funil de indicações"],
  },
  {
    emoji: "🚗",
    name: "Automotivo",
    tip: "Recorrência alta — manutenção periódica gera automação ideal",
    terms: [
      { term: "oficina mecanica", hot: true },
      { term: "mecanica automotiva", hot: true },
      { term: "funilaria e pintura", hot: true },
      { term: "lava rapido", hot: true },
      { term: "lava jato", hot: true },
      { term: "concessionaria", hot: true },
      { term: "revenda de veiculos", hot: true },
      { term: "autopeças", hot: true },
      { term: "borracharia", hot: false },
      { term: "auto eletrica", hot: true },
      { term: "som automotivo", hot: false },
      { term: "estacionamento", hot: false },
      { term: "guincho", hot: false },
      { term: "insulfilm", hot: true },
      { term: "locadora de veiculos", hot: true },
      { term: "despachante veicular", hot: true },
      { term: "retifica de motor", hot: false },
      { term: "polimento automotivo", hot: true },
      { term: "envelopamento", hot: true },
      { term: "rastreamento veicular", hot: true },
      { term: "alarme automotivo", hot: true },
    ],
    offers: ["Lembrete de revisão automático", "Chatbot de agendamento de serviço", "Automação de orçamento por WhatsApp", "Follow-up pós-serviço", "Programa de fidelidade para clientes recorrentes"],
  },
  {
    emoji: "👗",
    name: "Moda & Varejo",
    tip: "Remarketing e promoções geram vendas recorrentes",
    terms: [
      { term: "loja de roupas", hot: true },
      { term: "boutique", hot: true },
      { term: "moda feminina", hot: true },
      { term: "moda masculina", hot: true },
      { term: "loja de calcados", hot: true },
      { term: "otica", hot: true },
      { term: "joalheria", hot: true },
      { term: "relojoaria", hot: false },
      { term: "loja de acessorios", hot: true },
      { term: "sex shop", hot: true },
      { term: "loja de brinquedos", hot: true },
      { term: "papelaria", hot: true },
      { term: "floricultura", hot: true },
      { term: "loja de presentes", hot: true },
      { term: "perfumaria", hot: true },
      { term: "loja de cosmeticos", hot: true },
      { term: "moda infantil", hot: true },
      { term: "moda plus size", hot: true },
      { term: "moda fitness", hot: true },
      { term: "loja de lingerie", hot: true },
      { term: "brecó", hot: true },
      { term: "loja de tecidos", hot: false },
      { term: "loja de moveis", hot: true },
      { term: "colchoes", hot: true },
      { term: "eletrodomesticos", hot: true },
      { term: "loja de celulares", hot: true },
    ],
    offers: ["Catálogo digital por WhatsApp", "Automação de promoções sazonais", "Remarketing de clientes inativos", "Chatbot de atendimento e vendas", "Programa de fidelidade automatizado", "Disparo de lançamentos"],
  },
  {
    emoji: "💻",
    name: "Tecnologia & Marketing",
    tip: "Empresas digitais precisam de automação para escalar",
    terms: [
      { term: "agencia de marketing", hot: true },
      { term: "agencia digital", hot: true },
      { term: "agencia de publicidade", hot: true },
      { term: "desenvolvimento de sites", hot: true },
      { term: "software house", hot: true },
      { term: "consultoria de ti", hot: true },
      { term: "provedor de internet", hot: true },
      { term: "informatica", hot: false },
      { term: "assistencia de celular", hot: true },
      { term: "coworking", hot: true },
      { term: "grafica digital", hot: true },
      { term: "produtora de video", hot: true },
      { term: "fotografo", hot: true },
      { term: "estudio de fotografia", hot: true },
      { term: "social media", hot: true },
      { term: "gestor de trafego", hot: true },
      { term: "designer grafico", hot: true },
      { term: "criacao de logo", hot: true },
      { term: "ecommerce", hot: true },
      { term: "loja virtual", hot: true },
      { term: "marketplace", hot: true },
      { term: "automação comercial", hot: true },
    ],
    offers: ["Funil de vendas B2B automatizado", "Chatbot de qualificação de leads", "Automação de proposta comercial", "Follow-up automatizado de prospects", "Onboarding automatizado de clientes", "Relatórios automáticos"],
  },
  {
    emoji: "🏥",
    name: "Farmácia & Saúde Popular",
    tip: "Volume gigante de clientes — automação fideliza",
    terms: [
      { term: "farmacia", hot: true },
      { term: "drogaria", hot: true },
      { term: "farmacia de manipulacao", hot: true },
      { term: "produtos naturais", hot: true },
      { term: "loja de suplementos", hot: true },
      { term: "casa de saude", hot: false },
      { term: "ortopedia produtos", hot: false },
      { term: "material hospitalar", hot: false },
      { term: "ervanario", hot: true },
      { term: "loja de vitaminas", hot: true },
      { term: "oleo essencial", hot: true },
      { term: "homeopatia", hot: false },
      { term: "loja de yoga e bem estar", hot: true },
    ],
    offers: ["Lembrete de medicamentos contínuos", "Automação de pedidos recorrentes", "Chatbot para tirar dúvidas", "Programa de descontos automatizado", "Disparo de promoções por categoria"],
  },
  {
    emoji: "🎉",
    name: "Eventos & Festas",
    tip: "Sazonalidade alta — automação captura leads o ano todo",
    terms: [
      { term: "buffet", hot: true },
      { term: "buffet infantil", hot: true },
      { term: "casa de festas", hot: true },
      { term: "decoracao de festas", hot: true },
      { term: "DJ", hot: false },
      { term: "fotografo de eventos", hot: true },
      { term: "cerimonialista", hot: true },
      { term: "florista", hot: true },
      { term: "aluguel de mesa e cadeira", hot: true },
      { term: "som e iluminacao", hot: false },
      { term: "espaco para eventos", hot: true },
      { term: "salao de festas", hot: true },
      { term: "casamento", hot: true },
      { term: "debutante", hot: true },
      { term: "formatura", hot: true },
      { term: "convites personalizados", hot: true },
      { term: "bolo decorado", hot: true },
      { term: "animacao infantil", hot: true },
    ],
    offers: ["Chatbot de orçamentos por WhatsApp", "Funil de captação para datas comemorativas", "Automação de follow-up pós-evento", "Remarketing sazonal automatizado", "Gestão de agenda automatizada"],
  },
  {
    emoji: "🏦",
    name: "Financeiro & Seguros",
    tip: "Ticket alto + recorrência — automação gera confiança",
    terms: [
      { term: "corretora de seguros", hot: true },
      { term: "seguro auto", hot: true },
      { term: "seguro de vida", hot: true },
      { term: "plano de saude", hot: true },
      { term: "consorcio", hot: true },
      { term: "financiamento", hot: true },
      { term: "emprestimo", hot: true },
      { term: "credito pessoal", hot: true },
      { term: "assessoria financeira", hot: true },
      { term: "planejamento financeiro", hot: true },
      { term: "cambio", hot: false },
      { term: "investimentos", hot: true },
      { term: "previdencia privada", hot: true },
      { term: "cartao de credito", hot: true },
      { term: "cobranca", hot: true },
    ],
    offers: ["Chatbot de cotação automática", "Follow-up de propostas", "Lembrete de renovação de apólice", "Funil de qualificação de clientes", "Automação de documentos e contratos"],
  },
  {
    emoji: "✈️",
    name: "Turismo & Hospedagem",
    tip: "Alta sazonalidade — automação mantém pipeline cheio",
    terms: [
      { term: "agencia de viagens", hot: true },
      { term: "hotel", hot: true },
      { term: "pousada", hot: true },
      { term: "hostel", hot: true },
      { term: "turismo", hot: true },
      { term: "pacote de viagem", hot: true },
      { term: "transfer aeroporto", hot: true },
      { term: "aluguel de temporada", hot: true },
      { term: "guia turistico", hot: false },
      { term: "ecoturismo", hot: true },
      { term: "resort", hot: false },
      { term: "camping", hot: false },
      { term: "intercambio", hot: true },
      { term: "cruzeiro", hot: true },
    ],
    offers: ["Chatbot de reservas via WhatsApp", "Automação de pacotes personalizados", "Follow-up pós-viagem", "Remarketing sazonal", "Programa de indicações automatizado"],
  },
];

interface ResearchFluxProps {
  onSelectNiche?: (niche: string, subnicho: string) => void;
  onConfirmSubnichos?: (limit?: number) => void;
}

export function ResearchFlux({ onSelectNiche, onConfirmSubnichos }: ResearchFluxProps = {}) {
  const [openNiche, setOpenNiche] = useState<string | null>(null);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLimit, setConfirmLimit] = useState(100);
  const { toast } = useToast();

  const handleNicheClick = (name: string) => {
    if (openNiche === name) {
      setOpenNiche(null);
    } else {
      setOpenNiche(name);
      setSelectedTerms([]);
    }
  };

  const handleTermClick = (term: string) => {
    if (selectedTerms.includes(term)) {
      setSelectedTerms((prev) => prev.filter((t) => t !== term));
      return;
    }
    if (selectedTerms.length >= 10) {
      toast({ title: "Limite atingido", description: "Máximo de 10 subnichos" });
      return;
    }
    setSelectedTerms((prev) => [...prev, term]);
    navigator.clipboard.writeText(term);
    toast({ title: `Subnicho ${selectedTerms.length + 1} preenchido!`, description: term });
    if (onSelectNiche && openNiche) {
      onSelectNiche(openNiche, term);
    }
  };

  const copyOffer = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: text });
  };

  const clearSelections = () => {
    setSelectedTerms([]);
  };

  const currentNicheData = openNiche ? niches.find((n) => n.name === openNiche) : null;

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-2">
        <p className="text-sm text-white px-2 mb-3">
          Clique em um nicho, depois selecione os subnichos
        </p>

        {/* Selection panel showing Subnicho slots */}
        {selectedTerms.length > 0 && (
          <div className="mx-2 mb-3 p-4 rounded-lg border border-primary/40 bg-primary/10 animate-fade-in space-y-3">
            <p className="text-sm font-semibold text-white">
              📋 SUBNICHOS SELECIONADOS ({selectedTerms.length}/10)
            </p>
            <div className="space-y-1">
              {Array.from({ length: 10 }, (_, i) => {
                const term = selectedTerms[i];
                return (
                  <div key={i} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ${
                    term ? "bg-primary/15 text-primary font-semibold" : "bg-muted/20 text-muted-foreground"
                  }`}>
                    <span className="font-bold min-w-[75px]">Subnicho {i + 1}:</span>
                    <span className="flex-1">{term || "— clique em um subnicho abaixo"}</span>
                    {term && (
                      <button
                        onClick={() => setSelectedTerms((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-destructive hover:text-destructive/80 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all"
              >
                ✅ Confirmar subnichos
              </button>
              <button
                onClick={clearSelections}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>
        )}

        {/* Confirmation overlay dialog */}
        {showConfirm && selectedTerms.length > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-card border border-primary/50 rounded-xl p-6 mx-4 max-w-md w-full shadow-2xl space-y-4">
              <p className="text-lg font-bold text-white">
                ✅ Confirmar {selectedTerms.length} subnicho{selectedTerms.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedTerms.map((term, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-primary/10 text-primary font-medium border border-primary/20">
                    <span className="font-bold text-xs text-muted-foreground w-5">{i + 1}.</span>
                    {term}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">📊 Limite máximo de leads por busca</label>
                <select
                  value={confirmLimit}
                  onChange={(e) => setConfirmLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                >
                  {[20, 50, 100, 200, 300, 400].map((n) => (
                    <option key={n} value={n}>{n} leads</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    if (onConfirmSubnichos) onConfirmSubnichos(confirmLimit);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  ✅ Confirmar e avançar
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-3 text-sm rounded-lg bg-muted/30 text-foreground border border-border/30 hover:bg-muted/50 transition-all"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {niches.map((niche) => {
          const isOpen = openNiche === niche.name;
          const hotCount = niche.terms.filter((t) => t.hot).length;
          return (
            <div key={niche.name}>
              <button
                onClick={() => handleNicheClick(niche.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all ${isOpen ? "bg-primary/20 border border-primary/40" : "bg-muted/30 hover:bg-muted/50"}`}
              >
                {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-primary" /> : <ChevronRight className="h-4 w-4 shrink-0 text-primary" />}
                <span className="text-lg">{niche.emoji}</span>
                <span className="text-white text-base">{niche.name}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-destructive font-semibold">
                  <Flame className="h-3.5 w-3.5" />
                  {hotCount} quentes
                </span>
              </button>
              {isOpen && (
                <div className="ml-3 mt-3 mb-4 space-y-4 animate-fade-in">
                  {/* Niche header */}
                  <p className="text-base font-black text-primary uppercase tracking-widest px-3 py-2 bg-primary/10 rounded-md">
                    {niche.emoji} NICHO {niche.name.toUpperCase()}
                  </p>

                  <p className="text-sm font-semibold text-primary px-3 py-2 bg-primary/10 rounded-md inline-block">
                    💡 {niche.tip}
                  </p>

                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">🔍 SUBNICHOS — escolha até 10</p>
                    <p className="text-xs text-muted-foreground px-2 mb-2">Termos de busca — clique para preencher as buscas</p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {niche.terms.map(({ term, hot }) => {
                        const isSelected = selectedTerms.includes(term);
                        return (
                          <button
                            key={term}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("application/flux-niche", JSON.stringify({ query: term }));
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                            onClick={() => handleTermClick(term)}
                            className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 border cursor-pointer ${
                              isSelected
                                ? "bg-primary/30 text-primary border-primary/50 ring-1 ring-primary/40"
                                : hot
                                  ? "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25"
                                  : "bg-muted/50 text-foreground border-border/30 hover:bg-primary/15 hover:text-primary"
                            }`}
                            title={isSelected ? "Clique para remover" : "Clique para adicionar à busca"}
                          >
                            {isSelected && <span className="text-xs">✓</span>}
                            {!isSelected && hot && <Flame className="h-3.5 w-3.5" />}
                            {term}
                            <Copy className="h-3 w-3 opacity-50" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Offers */}
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider px-2 mb-2">💰 O que oferecer</p>
                    <div className="space-y-1.5 px-2">
                      {niche.offers.map((offer) => (
                        <button
                          key={offer}
                          onClick={() => copyOffer(offer)}
                          className="w-full text-left flex items-start gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all duration-200 border border-red-500/30"
                          title="Clique para copiar"
                        >
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
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
