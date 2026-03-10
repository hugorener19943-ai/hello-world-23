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
