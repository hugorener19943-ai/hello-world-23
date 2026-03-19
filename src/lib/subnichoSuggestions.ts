/** Strong subnicho suggestions by niche keyword — focused on high operational pain */
const SUGGESTIONS: Record<string, string[]> = {
  odontologia: [
    "clinica odontologica", "implante dentario", "ortodontia",
    "dentista estetico", "harmonizacao facial odontologica",
    "aparelho invisivel", "clareamento dental", "odontologia estetica",
    "tratamento de canal", "protese dentaria",
  ],
  dentista: [
    "clinica odontologica", "implante dentario", "ortodontia",
    "dentista estetico", "dentista infantil", "clareamento dental",
    "protese dentaria", "tratamento de canal",
  ],
  estetica: [
    "clinica estetica", "depilacao a laser", "harmonizacao facial",
    "esteticista", "procedimentos esteticos", "estetica facial",
    "estetica corporal", "limpeza de pele", "peeling", "microagulhamento",
  ],
  veterinaria: [
    "clinica veterinaria", "pet shop", "hospital veterinario",
    "veterinario 24h", "banho e tosa", "veterinario domiciliar",
    "laboratorio veterinario", "veterinario de emergencia",
  ],
  psicologia: [
    "psicologo", "psicoterapia", "terapia online",
    "psicologo infantil", "neuropsicologia", "terapia cognitiva",
    "psicologo clinico", "psicanalise",
  ],
  imobiliaria: [
    "imobiliaria", "corretor de imoveis", "construtora",
    "administradora de imoveis", "loteamento", "incorporadora",
    "imobiliaria de luxo", "aluguel de imoveis",
  ],
  contabilidade: [
    "escritorio contabil", "contador", "contabilidade empresarial",
    "contabilidade digital", "assessoria contabil", "consultoria tributaria",
    "contabilidade para mei", "contabilidade online",
  ],
  advocacia: [
    "advogado", "escritorio de advocacia", "advogado trabalhista",
    "advogado previdenciario", "advogado empresarial", "advogado criminal",
    "advogado imobiliario", "advogado de familia",
  ],
  autoescola: [
    "auto escola", "centro de formacao de condutores",
    "autoescola", "cfc", "escola de conducao", "aulas de direcao",
  ],
  academia: [
    "academia", "crossfit", "studio de pilates",
    "personal trainer", "academia funcional", "musculacao",
    "studio de yoga", "treinamento funcional",
  ],
  saude: [
    "clinica medica", "clinica odontologica", "clinica estetica",
    "clinica veterinaria", "laboratorio de analises",
    "fisioterapia", "nutricionista", "fonoaudiologia",
    "clinica de reabilitacao", "medicina do trabalho",
  ],
  educacao: [
    "escola particular", "curso de idiomas", "escola de musica",
    "reforco escolar", "creche", "pre vestibular",
    "curso profissionalizante", "escola de informatica",
  ],
  alimentacao: [
    "restaurante", "pizzaria", "hamburgueria",
    "doceria", "confeitaria", "marmitaria",
    "buffet", "padaria", "cafeteria", "acaiteria",
  ],
  concessionaria: [
    "concessionaria de veiculos", "loja de carros", "revenda de veiculos",
    "oficina mecanica", "funilaria e pintura", "concessionaria motos",
    "locadora de veiculos", "auto center",
  ],
  beleza: [
    "salao de beleza", "barbearia", "studio de sobrancelha",
    "nail designer", "cabeleireiro", "maquiadora",
    "extensao de cilios", "micropigmentacao",
  ],
  tecnologia: [
    "agencia de marketing digital", "desenvolvimento de software",
    "consultoria de ti", "suporte tecnico", "agencia de publicidade",
    "criacao de sites", "automacao comercial", "empresa de tecnologia",
  ],
  financeiro: [
    "consultoria financeira", "assessoria de investimentos",
    "corretora de seguros", "planejamento financeiro",
    "escritorio de cambio", "cooperativa de credito",
  ],
  construcao: [
    "construtora", "empreiteira", "arquitetura", "engenharia civil",
    "reforma residencial", "projeto estrutural", "paisagismo",
    "impermeabilizacao", "pintura predial", "instalacao eletrica",
  ],
  logistica: [
    "transportadora", "motoboy", "entrega rapida",
    "logistica reversa", "armazem", "frete expresso",
    "mudancas", "courrier",
  ],
  moda: [
    "loja de roupas", "moda feminina", "moda masculina",
    "loja de calcados", "moda infantil", "moda fitness",
    "loja de acessorios", "moda praia", "brechó", "atelie de costura",
  ],
  turismo: [
    "agencia de viagens", "pousada", "hotel", "hostel",
    "turismo de aventura", "receptivo turistico",
    "pacotes de viagem", "ecoturismo",
  ],
  fotografia: [
    "fotografo", "estudio fotografico", "fotografia de casamento",
    "fotografia newborn", "fotografia de produto",
    "filmagem profissional", "ensaio fotografico", "drone",
  ],
  eventos: [
    "organizadora de eventos", "buffet para festas", "decoracao de festas",
    "cerimonialista", "casa de festas", "aluguel de brinquedos",
    "som e iluminacao", "espaco para eventos",
  ],
  pet: [
    "pet shop", "banho e tosa", "clinica veterinaria",
    "hotel para pets", "adestramento", "dog walker",
    "racao premium", "creche para caes",
  ],
  limpeza: [
    "empresa de limpeza", "limpeza pos obra", "lavanderia",
    "higienizacao de estofados", "desentupidora", "controle de pragas",
    "limpeza de piscina", "limpeza industrial",
  ],
  agronegocio: [
    "loja agropecuaria", "consultoria agro", "irrigacao",
    "maquinas agricolas", "sementes e insumos", "pecuaria",
    "agronomia", "drones agricolas",
  ],
  energia: [
    "energia solar", "paineis solares", "instalacao fotovoltaica",
    "eficiencia energetica", "projeto eletrico", "automacao residencial",
    "carregador de veiculos eletricos", "iluminacao led",
  ],
  marketing: [
    "agencia de marketing", "gestao de redes sociais", "trafego pago",
    "marketing de conteudo", "branding", "producao de video",
    "assessoria de imprensa", "influencer marketing",
  ],
  mecanica: [
    "oficina mecanica", "auto eletrica", "funilaria e pintura",
    "troca de oleo", "alinhamento e balanceamento", "ar condicionado automotivo",
    "mecanica diesel", "centro automotivo",
  ],
  saude_mental: [
    "psicologo", "psiquiatra", "terapia de casal",
    "coaching", "hipnoterapia", "terapia ocupacional",
    "clinica de reabilitacao", "centro de apoio",
  ],
  farmacia: [
    "farmacia", "farmacia de manipulacao", "drogaria",
    "farmacia homeopatica", "produtos naturais",
    "suplementos", "farmacia veterinaria",
  ],
  seguros: [
    "corretora de seguros", "seguro auto", "seguro de vida",
    "seguro empresarial", "plano de saude", "consorcio",
    "seguro residencial", "previdencia privada",
  ],
  grafica: [
    "grafica", "impressao digital", "comunicacao visual",
    "plotagem", "serigrafia", "grafica rapida",
    "banner e adesivo", "cartao de visita",
  ],
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getSubnichoSuggestions(query: string): string[] {
  const q = normalize(query);
  if (!q) return [];
  for (const [key, suggestions] of Object.entries(SUGGESTIONS)) {
    if (q.includes(key) || key.includes(q)) {
      return suggestions;
    }
  }
  return [];
}
