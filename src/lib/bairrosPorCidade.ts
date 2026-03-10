/**
 * Bairros comerciais fortes por cidade.
 * Priorizados por: alta densidade empresarial, maior poder aquisitivo,
 * centros médicos/comerciais e polos empresariais.
 * Bairros predominantemente residenciais são evitados.
 */
const bairrosMap: Record<string, string[]> = {
  "são paulo": [
    // Polos empresariais e comerciais de alto ticket
    "Itaim Bibi", "Vila Olímpia", "Pinheiros", "Jardins", "Moema",
    "Brooklin", "Vila Mariana", "Tatuapé", "Perdizes", "Lapa",
    "Consolação", "Bela Vista", "Santo Amaro", "Mooca", "Santana",
    "Campo Belo", "Liberdade", "República", "Morumbi", "Butantã",
    "Ipiranga", "Saúde", "Penha", "Vila Prudente",
  ],
  "rio de janeiro": [
    "Barra da Tijuca", "Botafogo", "Copacabana", "Ipanema", "Leblon",
    "Centro", "Tijuca", "Flamengo", "Recreio", "Lapa",
    "Jacarepaguá", "Méier", "Vila Isabel", "Madureira", "Santa Teresa",
    "Grajaú",
  ],
  "belo horizonte": [
    "Savassi", "Funcionários", "Lourdes", "Centro", "Santo Agostinho",
    "Serra", "Buritis", "Pampulha", "Gutierrez", "Santa Efigênia",
    "Floresta", "Mangabeiras", "Padre Eustáquio", "Carlos Prates",
    "Barreiro",
  ],
  "curitiba": [
    "Batel", "Centro", "Água Verde", "Bigorrilho", "Juvevê",
    "Centro Cívico", "Rebouças", "Ecoville", "Mercês", "Alto da XV",
    "Portão", "Santa Felicidade",
  ],
  "porto alegre": [
    "Moinhos de Vento", "Centro Histórico", "Bom Fim", "Petrópolis",
    "Independência", "Auxiliadora", "Mont'Serrat", "Rio Branco",
    "Floresta", "Menino Deus", "Cidade Baixa", "Tristeza", "Ipanema",
  ],
  "salvador": [
    "Pituba", "Caminho das Árvores", "Itaigara", "Barra", "Rio Vermelho",
    "Paralela", "Ondina", "Graça", "Stella Maris", "Brotas",
    "Pelourinho",
  ],
  "recife": [
    "Boa Viagem", "Espinheiro", "Graças", "Derby", "Casa Forte",
    "Madalena", "Pina", "Aflitos", "Torre", "Imbiribeira",
    "Encruzilhada",
  ],
  "fortaleza": [
    "Aldeota", "Meireles", "Varjota", "Dionísio Torres", "Cocó",
    "Centro", "Papicu", "Edson Queiroz", "Fátima", "Montese", "Benfica",
  ],
  "brasília": [
    "Asa Sul", "Asa Norte", "Sudoeste", "Noroeste", "Lago Sul",
    "Lago Norte", "Águas Claras", "Taguatinga", "Guará", "Ceilândia",
  ],
  "campinas": [
    "Cambuí", "Centro", "Nova Campinas", "Barão Geraldo", "Taquaral",
    "Sousas", "Guanabara", "Jardim Chapadão", "Botafogo",
  ],
  "goiânia": [
    "Setor Bueno", "Setor Marista", "Setor Oeste", "Jardim Goiás",
    "Centro", "Setor Sul", "Setor Central", "Alphaville Flamboyant",
  ],
  "florianópolis": [
    "Centro", "Trindade", "Itacorubi", "Agronômica", "Coqueiros",
    "Ingleses", "Jurerê", "Campeche", "Lagoa da Conceição", "Canasvieiras",
  ],
  "vitória": [
    "Praia do Canto", "Jardim da Penha", "Mata da Praia", "Enseada do Suá",
    "Centro", "Jardim Camburi", "Santa Lúcia", "Bento Ferreira",
  ],
  "manaus": [
    "Adrianópolis", "Vieiralves", "Centro", "Ponta Negra", "Aleixo",
    "Flores", "Parque 10", "Dom Pedro",
  ],
  "belém": [
    "Nazaré", "Umarizal", "Batista Campos", "Centro", "Marco",
    "São Brás", "Reduto", "Pedreira",
  ],
};

export function getBairrosPorCidade(cidade: string): string[] {
  if (!cidade) return [];
  const key = cidade.toLowerCase().trim();
  return bairrosMap[key] || [];
}
