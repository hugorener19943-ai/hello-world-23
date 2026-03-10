/**
 * Metropolitan expansion engine.
 * Maps major cities to nearby cities with strong business activity.
 * Used to suggest volume expansion when search results are low.
 */

export interface MetroCity {
  cidade: string;
  estado: string;
  potencial: "alto" | "medio";
}

const METRO_MAP: Record<string, MetroCity[]> = {
  "são paulo|sp": [
    { cidade: "Guarulhos", estado: "SP", potencial: "alto" },
    { cidade: "Osasco", estado: "SP", potencial: "alto" },
    { cidade: "Santo André", estado: "SP", potencial: "alto" },
    { cidade: "São Bernardo do Campo", estado: "SP", potencial: "alto" },
    { cidade: "São Caetano do Sul", estado: "SP", potencial: "alto" },
    { cidade: "Barueri", estado: "SP", potencial: "alto" },
    { cidade: "Alphaville", estado: "SP", potencial: "alto" },
    { cidade: "Santana de Parnaíba", estado: "SP", potencial: "medio" },
    { cidade: "Diadema", estado: "SP", potencial: "medio" },
    { cidade: "Mauá", estado: "SP", potencial: "medio" },
    { cidade: "Cotia", estado: "SP", potencial: "medio" },
    { cidade: "Taboão da Serra", estado: "SP", potencial: "medio" },
  ],
  "rio de janeiro|rj": [
    { cidade: "Niterói", estado: "RJ", potencial: "alto" },
    { cidade: "Duque de Caxias", estado: "RJ", potencial: "medio" },
    { cidade: "Nova Iguaçu", estado: "RJ", potencial: "medio" },
    { cidade: "São Gonçalo", estado: "RJ", potencial: "medio" },
    { cidade: "Petrópolis", estado: "RJ", potencial: "alto" },
    { cidade: "Macaé", estado: "RJ", potencial: "alto" },
    { cidade: "Volta Redonda", estado: "RJ", potencial: "medio" },
  ],
  "belo horizonte|mg": [
    { cidade: "Contagem", estado: "MG", potencial: "alto" },
    { cidade: "Betim", estado: "MG", potencial: "medio" },
    { cidade: "Nova Lima", estado: "MG", potencial: "alto" },
    { cidade: "Ribeirão das Neves", estado: "MG", potencial: "medio" },
    { cidade: "Santa Luzia", estado: "MG", potencial: "medio" },
    { cidade: "Sabará", estado: "MG", potencial: "medio" },
  ],
  "curitiba|pr": [
    { cidade: "São José dos Pinhais", estado: "PR", potencial: "alto" },
    { cidade: "Colombo", estado: "PR", potencial: "medio" },
    { cidade: "Araucária", estado: "PR", potencial: "medio" },
    { cidade: "Pinhais", estado: "PR", potencial: "medio" },
    { cidade: "Campo Largo", estado: "PR", potencial: "medio" },
  ],
  "porto alegre|rs": [
    { cidade: "Canoas", estado: "RS", potencial: "alto" },
    { cidade: "Novo Hamburgo", estado: "RS", potencial: "alto" },
    { cidade: "São Leopoldo", estado: "RS", potencial: "medio" },
    { cidade: "Gravataí", estado: "RS", potencial: "medio" },
    { cidade: "Viamão", estado: "RS", potencial: "medio" },
    { cidade: "Cachoeirinha", estado: "RS", potencial: "medio" },
  ],
  "salvador|ba": [
    { cidade: "Lauro de Freitas", estado: "BA", potencial: "alto" },
    { cidade: "Camaçari", estado: "BA", potencial: "medio" },
    { cidade: "Simões Filho", estado: "BA", potencial: "medio" },
  ],
  "recife|pe": [
    { cidade: "Jaboatão dos Guararapes", estado: "PE", potencial: "medio" },
    { cidade: "Olinda", estado: "PE", potencial: "medio" },
    { cidade: "Paulista", estado: "PE", potencial: "medio" },
    { cidade: "Cabo de Santo Agostinho", estado: "PE", potencial: "medio" },
  ],
  "fortaleza|ce": [
    { cidade: "Caucaia", estado: "CE", potencial: "medio" },
    { cidade: "Maracanaú", estado: "CE", potencial: "medio" },
    { cidade: "Eusébio", estado: "CE", potencial: "alto" },
    { cidade: "Aquiraz", estado: "CE", potencial: "medio" },
  ],
  "brasília|df": [
    { cidade: "Águas Claras", estado: "DF", potencial: "alto" },
    { cidade: "Taguatinga", estado: "DF", potencial: "alto" },
    { cidade: "Ceilândia", estado: "DF", potencial: "medio" },
    { cidade: "Samambaia", estado: "DF", potencial: "medio" },
    { cidade: "Valparaíso de Goiás", estado: "GO", potencial: "medio" },
    { cidade: "Luziânia", estado: "GO", potencial: "medio" },
  ],
  "goiânia|go": [
    { cidade: "Aparecida de Goiânia", estado: "GO", potencial: "alto" },
    { cidade: "Anápolis", estado: "GO", potencial: "alto" },
    { cidade: "Senador Canedo", estado: "GO", potencial: "medio" },
    { cidade: "Trindade", estado: "GO", potencial: "medio" },
  ],
  "florianópolis|sc": [
    { cidade: "São José", estado: "SC", potencial: "alto" },
    { cidade: "Palhoça", estado: "SC", potencial: "medio" },
    { cidade: "Biguaçu", estado: "SC", potencial: "medio" },
  ],
  "vitória|es": [
    { cidade: "Vila Velha", estado: "ES", potencial: "alto" },
    { cidade: "Serra", estado: "ES", potencial: "alto" },
    { cidade: "Cariacica", estado: "ES", potencial: "medio" },
  ],
  "manaus|am": [
    { cidade: "Iranduba", estado: "AM", potencial: "medio" },
  ],
  "belém|pa": [
    { cidade: "Ananindeua", estado: "PA", potencial: "alto" },
    { cidade: "Marituba", estado: "PA", potencial: "medio" },
  ],
  "campinas|sp": [
    { cidade: "Sumaré", estado: "SP", potencial: "medio" },
    { cidade: "Hortolândia", estado: "SP", potencial: "medio" },
    { cidade: "Indaiatuba", estado: "SP", potencial: "alto" },
    { cidade: "Valinhos", estado: "SP", potencial: "alto" },
    { cidade: "Vinhedo", estado: "SP", potencial: "alto" },
    { cidade: "Americana", estado: "SP", potencial: "medio" },
  ],
};

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/**
 * Get metropolitan expansion cities for a given city/state.
 * Returns cities near the searched city that have strong business activity.
 */
export function getMetroCities(cidade: string, estado: string): MetroCity[] {
  const key = `${normalize(cidade)}|${normalize(estado)}`;
  return METRO_MAP[key] || [];
}

/**
 * Check if a city has metropolitan expansion available.
 */
export function hasMetroExpansion(cidade: string, estado: string): boolean {
  return getMetroCities(cidade, estado).length > 0;
}
