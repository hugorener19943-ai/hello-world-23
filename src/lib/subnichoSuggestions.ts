/** Strong subnicho suggestions by niche keyword */
const SUGGESTIONS: Record<string, string[]> = {
  odontologia: [
    "clinica odontologica", "implante dentario", "ortodontia",
    "harmonizacao facial odontologica", "dentista estetico",
    "dentista infantil", "clinica odontologica estetica",
  ],
  dentista: [
    "clinica odontologica", "implante dentario", "ortodontia",
    "dentista estetico", "dentista infantil",
  ],
  estetica: [
    "clinica estetica", "depilacao a laser", "harmonizacao facial",
    "esteticista", "procedimentos esteticos", "estetica facial", "estetica corporal",
  ],
  veterinaria: [
    "clinica veterinaria", "pet shop", "hospital veterinario",
    "veterinario 24h", "banho e tosa",
  ],
  psicologia: [
    "psicologo", "psicoterapia", "terapia online",
    "psicologo infantil", "neuropsicologia",
  ],
  imobiliaria: [
    "imobiliaria", "corretor de imoveis", "construtora",
    "administradora de imoveis", "loteamento",
  ],
  contabilidade: [
    "escritorio contabil", "contador", "contabilidade empresarial",
    "contabilidade digital", "assessoria contabil",
  ],
  advocacia: [
    "advogado", "escritorio de advocacia", "advogado trabalhista",
    "advogado previdenciario", "advogado empresarial",
  ],
  autoescola: [
    "auto escola", "centro de formacao de condutores",
    "autoescola", "cfc",
  ],
  academia: [
    "academia", "crossfit", "studio de pilates",
    "personal trainer", "academia funcional",
  ],
  saude: [
    "clinica medica", "clinica odontologica", "clinica estetica",
    "clinica veterinaria", "laboratorio de analises",
    "fisioterapia", "nutricionista",
  ],
  educacao: [
    "escola particular", "curso de idiomas", "escola de musica",
    "reforco escolar", "creche",
  ],
  alimentacao: [
    "restaurante", "pizzaria", "hamburgueria",
    "doceria", "confeitaria", "marmitaria",
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
  for (const [key, suggestions] of Object.entries(SUGGESTIONS)) {
    if (q.includes(key) || key.includes(q)) {
      return suggestions;
    }
  }
  return [];
}
