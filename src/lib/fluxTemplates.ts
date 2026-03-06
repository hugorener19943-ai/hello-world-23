export interface FluxTemplateBusca {
  query: string;
  cidade: string;
  estado: string;
  bairro?: string;
  quantidade?: number;
  targetTotal?: number;
}

export interface FluxTemplate {
  nome: string;
  descricao?: string;
  buscas: FluxTemplateBusca[];
}

export const FLUX_TEMPLATES: FluxTemplate[] = [
  // São Paulo
  {
    nome: "Dentistas São Paulo",
    descricao: "5 bairros estratégicos de SP",
    buscas: [
      { query: "dentista", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Moema", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Tatuape", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Santana", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Clínicas São Paulo",
    descricao: "Clínicas em bairros estratégicos de SP",
    buscas: [
      { query: "clinica", cidade: "Bela Vista", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Santana", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Tatuape", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Estética São Paulo",
    descricao: "Clínicas de estética e harmonização em SP",
    buscas: [
      { query: "estetica", cidade: "Jardins", estado: "SP", quantidade: 80 },
      { query: "clinica estetica", cidade: "Moema", estado: "SP", quantidade: 80 },
      { query: "harmonizacao facial", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
      { query: "estetica facial", cidade: "Tatuape", estado: "SP", quantidade: 80 },
      { query: "estetica", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Pet Shops São Paulo",
    descricao: "Pet shops em bairros de SP",
    buscas: [
      { query: "pet shop", cidade: "Moema", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Santana", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Tatuape", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Academias São Paulo",
    descricao: "Academias em bairros de SP",
    buscas: [
      { query: "academia", cidade: "Moema", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Tatuape", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Santana", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Imobiliárias São Paulo",
    descricao: "Imobiliárias em bairros nobres de SP",
    buscas: [
      { query: "imobiliaria", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "imobiliaria", cidade: "Moema", estado: "SP", quantidade: 80 },
      { query: "imobiliaria", cidade: "Tatuape", estado: "SP", quantidade: 80 },
      { query: "imobiliaria", cidade: "Santana", estado: "SP", quantidade: 80 },
      { query: "imobiliaria", cidade: "Brooklin", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Restaurantes São Paulo",
    descricao: "Restaurantes e food em SP",
    buscas: [
      { query: "restaurante", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "restaurante", cidade: "Moema", estado: "SP", quantidade: 80 },
      { query: "pizzaria", cidade: "Tatuape", estado: "SP", quantidade: 80 },
      { query: "hamburgueria", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
      { query: "restaurante", cidade: "Bela Vista", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Cursos São Paulo",
    descricao: "Cursos e escolas em SP",
    buscas: [
      { query: "curso", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "curso profissionalizante", cidade: "Santana", estado: "SP", quantidade: 80 },
      { query: "curso tecnico", cidade: "Tatuape", estado: "SP", quantidade: 80 },
      { query: "escola de idiomas", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "curso de ingles", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Contabilidades São Paulo",
    descricao: "Escritórios contábeis em SP",
    buscas: [
      { query: "contabilidade", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "escritorio contabilidade", cidade: "Santana", estado: "SP", quantidade: 80 },
      { query: "contabilidade", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "contabilidade", cidade: "Bela Vista", estado: "SP", quantidade: 80 },
      { query: "contabilidade", cidade: "Vila Mariana", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Advocacia São Paulo",
    descricao: "Escritórios de advocacia em SP",
    buscas: [
      { query: "advogado", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "advocacia", cidade: "Bela Vista", estado: "SP", quantidade: 80 },
      { query: "advogado", cidade: "Pinheiros", estado: "SP", quantidade: 80 },
      { query: "advogado", cidade: "Santana", estado: "SP", quantidade: 80 },
      { query: "advocacia", cidade: "Tatuape", estado: "SP", quantidade: 80 },
    ],
  },
  // Campinas
  {
    nome: "Dentistas Campinas",
    descricao: "Dentistas em bairros de Campinas",
    buscas: [
      { query: "dentista", cidade: "Cambuí", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Taquaral", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Nova Campinas", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Barao Geraldo", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Clínicas Campinas",
    descricao: "Clínicas em bairros de Campinas",
    buscas: [
      { query: "clinica", cidade: "Cambuí", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Taquaral", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Nova Campinas", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Barao Geraldo", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Estética Campinas",
    descricao: "Estética em bairros de Campinas",
    buscas: [
      { query: "estetica", cidade: "Cambuí", estado: "SP", quantidade: 80 },
      { query: "clinica estetica", cidade: "Nova Campinas", estado: "SP", quantidade: 80 },
      { query: "harmonizacao facial", cidade: "Taquaral", estado: "SP", quantidade: 80 },
      { query: "estetica", cidade: "Barao Geraldo", estado: "SP", quantidade: 80 },
      { query: "estetica facial", cidade: "Centro", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Pet Shops Campinas",
    descricao: "Pet shops em bairros de Campinas",
    buscas: [
      { query: "pet shop", cidade: "Cambuí", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Taquaral", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Barao Geraldo", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Nova Campinas", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Centro", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Academias Campinas",
    descricao: "Academias em bairros de Campinas",
    buscas: [
      { query: "academia", cidade: "Cambuí", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Taquaral", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Nova Campinas", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Barao Geraldo", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Centro", estado: "SP", quantidade: 80 },
    ],
  },
  // São José do Rio Preto
  {
    nome: "Dentistas São José do Rio Preto",
    descricao: "Dentistas em bairros de Rio Preto",
    buscas: [
      { query: "dentista", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Redentora", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Boa Vista", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Vila Imperial", estado: "SP", quantidade: 80 },
      { query: "dentista", cidade: "Higienopolis", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Clínicas São José do Rio Preto",
    descricao: "Clínicas em bairros de Rio Preto",
    buscas: [
      { query: "clinica", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Redentora", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Boa Vista", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Vila Imperial", estado: "SP", quantidade: 80 },
      { query: "clinica", cidade: "Higienopolis", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Estética São José do Rio Preto",
    descricao: "Estética em bairros de Rio Preto",
    buscas: [
      { query: "estetica", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "clinica estetica", cidade: "Redentora", estado: "SP", quantidade: 80 },
      { query: "harmonizacao facial", cidade: "Boa Vista", estado: "SP", quantidade: 80 },
      { query: "estetica facial", cidade: "Vila Imperial", estado: "SP", quantidade: 80 },
      { query: "estetica", cidade: "Higienopolis", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Pet Shops São José do Rio Preto",
    descricao: "Pet shops em bairros de Rio Preto",
    buscas: [
      { query: "pet shop", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Redentora", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Boa Vista", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Vila Imperial", estado: "SP", quantidade: 80 },
      { query: "pet shop", cidade: "Higienopolis", estado: "SP", quantidade: 80 },
    ],
  },
  {
    nome: "Academias São José do Rio Preto",
    descricao: "Academias em bairros de Rio Preto",
    buscas: [
      { query: "academia", cidade: "Centro", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Redentora", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Boa Vista", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Vila Imperial", estado: "SP", quantidade: 80 },
      { query: "academia", cidade: "Higienopolis", estado: "SP", quantidade: 80 },
    ],
  },
];
