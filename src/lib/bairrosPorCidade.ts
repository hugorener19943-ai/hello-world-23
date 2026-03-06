// Mapa de bairros sugeridos por cidade (case-insensitive match)
const bairrosMap: Record<string, string[]> = {
  "são paulo": [
    "Pinheiros", "Vila Mariana", "Moema", "Itaim Bibi", "Jardins", "Perdizes",
    "Lapa", "Santana", "Tatuapé", "Vila Olímpia", "Brooklin", "Campo Belo",
    "Liberdade", "Consolação", "Bela Vista", "República", "Butantã", "Morumbi",
    "Santo Amaro", "Saúde", "Ipiranga", "Penha", "Vila Prudente", "Mooca",
  ],
  "rio de janeiro": [
    "Copacabana", "Ipanema", "Leblon", "Botafogo", "Flamengo", "Tijuca",
    "Barra da Tijuca", "Centro", "Lapa", "Santa Teresa", "Recreio",
    "Méier", "Madureira", "Jacarepaguá", "Vila Isabel", "Grajaú",
  ],
  "belo horizonte": [
    "Savassi", "Lourdes", "Funcionários", "Centro", "Pampulha", "Buritis",
    "Barreiro", "Mangabeiras", "Serra", "Santo Agostinho", "Gutierrez",
    "Santa Efigênia", "Floresta", "Padre Eustáquio", "Carlos Prates",
  ],
  "curitiba": [
    "Centro", "Batel", "Água Verde", "Bigorrilho", "Juvevê", "Centro Cívico",
    "Rebouças", "Portão", "Santa Felicidade", "Ecoville", "Mercês", "Alto da XV",
  ],
  "porto alegre": [
    "Moinhos de Vento", "Centro Histórico", "Bom Fim", "Cidade Baixa",
    "Petrópolis", "Menino Deus", "Floresta", "Independência", "Auxiliadora",
    "Mont'Serrat", "Rio Branco", "Tristeza", "Ipanema",
  ],
  "salvador": [
    "Barra", "Pituba", "Itaigara", "Ondina", "Rio Vermelho", "Pelourinho",
    "Caminho das Árvores", "Paralela", "Stella Maris", "Brotas", "Graça",
  ],
  "recife": [
    "Boa Viagem", "Espinheiro", "Graças", "Derby", "Casa Forte", "Madalena",
    "Pina", "Imbiribeira", "Aflitos", "Torre", "Encruzilhada",
  ],
  "fortaleza": [
    "Aldeota", "Meireles", "Centro", "Varjota", "Dionísio Torres", "Fátima",
    "Papicu", "Cocó", "Edson Queiroz", "Montese", "Benfica",
  ],
  "brasília": [
    "Asa Sul", "Asa Norte", "Lago Sul", "Lago Norte", "Sudoeste",
    "Noroeste", "Águas Claras", "Taguatinga", "Ceilândia", "Guará",
  ],
  "campinas": [
    "Cambuí", "Centro", "Barão Geraldo", "Taquaral", "Sousas",
    "Nova Campinas", "Guanabara", "Jardim Chapadão", "Botafogo",
  ],
  "goiânia": [
    "Setor Bueno", "Setor Marista", "Setor Oeste", "Centro", "Jardim Goiás",
    "Setor Sul", "Setor Central", "Alphaville Flamboyant",
  ],
  "florianópolis": [
    "Centro", "Trindade", "Ingleses", "Jurerê", "Campeche", "Lagoa da Conceição",
    "Canasvieiras", "Coqueiros", "Itacorubi", "Agronômica",
  ],
};

export function getBairrosPorCidade(cidade: string): string[] {
  if (!cidade) return [];
  const key = cidade.toLowerCase().trim();
  return bairrosMap[key] || [];
}
