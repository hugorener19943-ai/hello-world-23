export interface FluxTemplateBusca {
  query: string;
  cidade: string;
  estado: string;
  bairro?: string;
}

export interface FluxTemplate {
  nome: string;
  descricao?: string;
  buscas: FluxTemplateBusca[];
}

export const FLUX_TEMPLATES: FluxTemplate[] = [
  {
    nome: "Dentistas São Paulo",
    descricao: "5 bairros estratégicos de SP",
    buscas: [
      { query: "dentista", cidade: "São Paulo", estado: "SP", bairro: "Pinheiros" },
      { query: "dentista", cidade: "São Paulo", estado: "SP", bairro: "Moema" },
      { query: "dentista", cidade: "São Paulo", estado: "SP", bairro: "Vila Mariana" },
      { query: "dentista", cidade: "São Paulo", estado: "SP", bairro: "Tatuapé" },
      { query: "dentista", cidade: "São Paulo", estado: "SP", bairro: "Santana" },
    ],
  },
  {
    nome: "Clínicas Estéticas RJ",
    descricao: "Principais bairros do Rio",
    buscas: [
      { query: "clínica estética", cidade: "Rio de Janeiro", estado: "RJ", bairro: "Copacabana" },
      { query: "clínica estética", cidade: "Rio de Janeiro", estado: "RJ", bairro: "Ipanema" },
      { query: "clínica estética", cidade: "Rio de Janeiro", estado: "RJ", bairro: "Barra da Tijuca" },
      { query: "clínica estética", cidade: "Rio de Janeiro", estado: "RJ", bairro: "Botafogo" },
      { query: "clínica estética", cidade: "Rio de Janeiro", estado: "RJ", bairro: "Leblon" },
    ],
  },
  {
    nome: "Restaurantes BH",
    descricao: "Regiões gastronômicas de BH",
    buscas: [
      { query: "restaurante", cidade: "Belo Horizonte", estado: "MG", bairro: "Savassi" },
      { query: "restaurante", cidade: "Belo Horizonte", estado: "MG", bairro: "Funcionários" },
      { query: "restaurante", cidade: "Belo Horizonte", estado: "MG", bairro: "Lourdes" },
      { query: "restaurante", cidade: "Belo Horizonte", estado: "MG", bairro: "Pampulha" },
    ],
  },
  {
    nome: "Academias Curitiba",
    descricao: "Bairros fitness de Curitiba",
    buscas: [
      { query: "academia", cidade: "Curitiba", estado: "PR", bairro: "Batel" },
      { query: "academia", cidade: "Curitiba", estado: "PR", bairro: "Água Verde" },
      { query: "academia", cidade: "Curitiba", estado: "PR", bairro: "Centro" },
      { query: "academia", cidade: "Curitiba", estado: "PR", bairro: "Etel Viana" },
    ],
  },
  {
    nome: "Advogados Porto Alegre",
    descricao: "Escritórios em bairros nobres de POA",
    buscas: [
      { query: "advogado", cidade: "Porto Alegre", estado: "RS", bairro: "Moinhos de Vento" },
      { query: "advogado", cidade: "Porto Alegre", estado: "RS", bairro: "Centro Histórico" },
      { query: "advogado", cidade: "Porto Alegre", estado: "RS", bairro: "Bela Vista" },
    ],
  },
];
