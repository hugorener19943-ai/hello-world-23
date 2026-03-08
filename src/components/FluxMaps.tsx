import { useState } from "react";
import { MapPin, TrendingUp, Flame, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BairroData {
  nome: string;
  conversao: "alta" | "media";
}

interface SubCity {
  cidade: string;
  potencial: "alto" | "medio";
  bairros: BairroData[];
}

interface StateData {
  capital: string;
  estado: string;
  potencial: "alto" | "medio";
  bairros: BairroData[];
  cidades: SubCity[];
}

const estados: StateData[] = [
  {
    capital: "São Paulo", estado: "SP", potencial: "alto",
    bairros: [
      { nome: "Pinheiros", conversao: "alta" }, { nome: "Vila Mariana", conversao: "alta" },
      { nome: "Moema", conversao: "alta" }, { nome: "Itaim Bibi", conversao: "alta" },
      { nome: "Jardins", conversao: "alta" }, { nome: "Vila Olímpia", conversao: "alta" },
      { nome: "Brooklin", conversao: "alta" }, { nome: "Perdizes", conversao: "alta" },
      { nome: "Santana", conversao: "media" }, { nome: "Tatuapé", conversao: "media" },
      { nome: "Lapa", conversao: "media" }, { nome: "Consolação", conversao: "alta" },
      { nome: "Campo Belo", conversao: "alta" }, { nome: "Morumbi", conversao: "media" },
      { nome: "Santo Amaro", conversao: "media" }, { nome: "Liberdade", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Campinas", potencial: "alto",
        bairros: [
          { nome: "Cambuí", conversao: "alta" }, { nome: "Nova Campinas", conversao: "alta" },
          { nome: "Barão Geraldo", conversao: "alta" }, { nome: "Taquaral", conversao: "alta" },
          { nome: "Guanabara", conversao: "alta" }, { nome: "Jardim Chapadão", conversao: "alta" },
          { nome: "Mansões Santo Antônio", conversao: "alta" }, { nome: "Parque Prado", conversao: "media" },
        ],
      },
      {
        cidade: "São José do Rio Preto", potencial: "alto",
        bairros: [
          { nome: "Redentora", conversao: "alta" }, { nome: "Boa Vista", conversao: "alta" },
          { nome: "Jardim Walkíria", conversao: "alta" }, { nome: "Higienópolis", conversao: "alta" },
          { nome: "Jardim Redentor", conversao: "alta" }, { nome: "Jardim Vivendas", conversao: "alta" },
          { nome: "Centro", conversao: "media" },
        ],
      },
      {
        cidade: "Ribeirão Preto", potencial: "alto",
        bairros: [
          { nome: "Jardim Sumaré", conversao: "alta" }, { nome: "Alto da Boa Vista", conversao: "alta" },
          { nome: "Jardim Irajá", conversao: "alta" }, { nome: "Jardim Califórnia", conversao: "alta" },
          { nome: "Jardim Santa Ângela", conversao: "alta" }, { nome: "Nova Aliança", conversao: "alta" },
          { nome: "Jardim São Luiz", conversao: "media" }, { nome: "Centro", conversao: "media" },
        ],
      },
      {
        cidade: "Sorocaba", potencial: "alto",
        bairros: [
          { nome: "Campolim", conversao: "alta" }, { nome: "Parque Campolim", conversao: "alta" },
          { nome: "Jardim Europa", conversao: "alta" }, { nome: "Jardim Gonçalves", conversao: "alta" },
          { nome: "Wanel Ville", conversao: "media" }, { nome: "Centro", conversao: "media" },
        ],
      },
      {
        cidade: "Santos", potencial: "alto",
        bairros: [
          { nome: "Gonzaga", conversao: "alta" }, { nome: "Boqueirão", conversao: "alta" },
          { nome: "Ponta da Praia", conversao: "alta" }, { nome: "José Menino", conversao: "alta" },
          { nome: "Embaré", conversao: "media" }, { nome: "Aparecida", conversao: "media" },
        ],
      },
      {
        cidade: "São José dos Campos", potencial: "alto",
        bairros: [
          { nome: "Jardim Aquarius", conversao: "alta" }, { nome: "Vila Adyana", conversao: "alta" },
          { nome: "Urbanova", conversao: "alta" }, { nome: "Jardim Esplanada", conversao: "alta" },
          { nome: "Jardim das Colinas", conversao: "alta" }, { nome: "Centro", conversao: "media" },
        ],
      },
      {
        cidade: "Jundiaí", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Anhangabaú", conversao: "alta" },
          { nome: "Chácara Urbana", conversao: "alta" }, { nome: "Vila Arens", conversao: "alta" },
          { nome: "Eloy Chaves", conversao: "media" },
        ],
      },
      {
        cidade: "Bauru", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim Estoril", conversao: "alta" },
          { nome: "Vila Universitária", conversao: "alta" }, { nome: "Jardim América", conversao: "alta" },
          { nome: "Altos da Cidade", conversao: "alta" },
        ],
      },
      {
        cidade: "Piracicaba", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "São Dimas", conversao: "alta" },
          { nome: "Nova Piracicaba", conversao: "alta" }, { nome: "Paulista", conversao: "alta" },
        ],
      },
      {
        cidade: "Guarulhos", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Gopouva", conversao: "alta" },
          { nome: "Vila Augusta", conversao: "alta" }, { nome: "Macedo", conversao: "media" },
        ],
      },
      {
        cidade: "Osasco", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Presidente Altino", conversao: "alta" },
          { nome: "Continental", conversao: "alta" }, { nome: "Vila Yara", conversao: "alta" },
        ],
      },
      {
        cidade: "Santo André", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim", conversao: "alta" },
          { nome: "Campestre", conversao: "alta" }, { nome: "Vila Assunção", conversao: "alta" },
        ],
      },
      {
        cidade: "São Bernardo do Campo", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Rudge Ramos", conversao: "alta" },
          { nome: "Nova Petrópolis", conversao: "alta" }, { nome: "Baeta Neves", conversao: "media" },
        ],
      },
      {
        cidade: "Presidente Prudente", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim Paulista", conversao: "alta" },
          { nome: "Vila Marcondes", conversao: "media" },
        ],
      },
      {
        cidade: "Marília", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim Cavalari", conversao: "alta" },
          { nome: "Somenzari", conversao: "media" },
        ],
      },
      {
        cidade: "Araraquara", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim São Paulo", conversao: "alta" },
          { nome: "Carmo", conversao: "media" },
        ],
      },
      {
        cidade: "Franca", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim Petraglia", conversao: "alta" },
          { nome: "City Petrópolis", conversao: "alta" },
        ],
      },
    ],
  },
  {
    capital: "Rio de Janeiro", estado: "RJ", potencial: "alto",
    bairros: [
      { nome: "Copacabana", conversao: "alta" }, { nome: "Ipanema", conversao: "alta" },
      { nome: "Leblon", conversao: "alta" }, { nome: "Botafogo", conversao: "alta" },
      { nome: "Barra da Tijuca", conversao: "alta" }, { nome: "Tijuca", conversao: "media" },
      { nome: "Flamengo", conversao: "alta" }, { nome: "Centro", conversao: "media" },
      { nome: "Recreio", conversao: "media" }, { nome: "Méier", conversao: "media" },
      { nome: "Jardim Botânico", conversao: "alta" }, { nome: "Gávea", conversao: "alta" },
    ],
    cidades: [
      {
        cidade: "Niterói", potencial: "alto",
        bairros: [
          { nome: "Icaraí", conversao: "alta" }, { nome: "Santa Rosa", conversao: "alta" },
          { nome: "Ingá", conversao: "alta" }, { nome: "São Francisco", conversao: "alta" },
          { nome: "Charitas", conversao: "alta" }, { nome: "Centro", conversao: "media" },
        ],
      },
      {
        cidade: "Petrópolis", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Quitandinha", conversao: "alta" },
          { nome: "Itaipava", conversao: "alta" }, { nome: "Valparaíso", conversao: "alta" },
          { nome: "Retiro", conversao: "media" },
        ],
      },
      {
        cidade: "Volta Redonda", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Aterrado", conversao: "alta" },
          { nome: "Vila Santa Cecília", conversao: "alta" }, { nome: "Laranjal", conversao: "media" },
        ],
      },
      {
        cidade: "Campos dos Goytacazes", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Pelinca", conversao: "alta" },
          { nome: "Parque Tamandaré", conversao: "alta" }, { nome: "Flamboyant", conversao: "media" },
        ],
      },
      {
        cidade: "Nova Friburgo", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Cônego", conversao: "alta" },
          { nome: "Olaria", conversao: "media" },
        ],
      },
      {
        cidade: "Macaé", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Cavaleiros", conversao: "alta" },
          { nome: "Glória", conversao: "alta" }, { nome: "Granja dos Cavaleiros", conversao: "alta" },
        ],
      },
      {
        cidade: "São Gonçalo", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Alcântara", conversao: "alta" },
          { nome: "Neves", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Belo Horizonte", estado: "MG", potencial: "alto",
    bairros: [
      { nome: "Savassi", conversao: "alta" }, { nome: "Lourdes", conversao: "alta" },
      { nome: "Funcionários", conversao: "alta" }, { nome: "Pampulha", conversao: "media" },
      { nome: "Buritis", conversao: "alta" }, { nome: "Mangabeiras", conversao: "media" },
      { nome: "Serra", conversao: "alta" }, { nome: "Santo Agostinho", conversao: "alta" },
      { nome: "Gutierrez", conversao: "media" }, { nome: "Sion", conversao: "alta" },
    ],
    cidades: [
      {
        cidade: "Uberlândia", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Santa Mônica", conversao: "alta" },
          { nome: "Saraiva", conversao: "media" }, { nome: "Altamira", conversao: "media" },
          { nome: "Jardim Karaíba", conversao: "alta" },
        ],
      },
      {
        cidade: "Juiz de Fora", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "São Mateus", conversao: "alta" },
          { nome: "Cascatinha", conversao: "media" }, { nome: "Bom Pastor", conversao: "media" },
        ],
      },
      {
        cidade: "Contagem", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Eldorado", conversao: "alta" },
          { nome: "Industrial", conversao: "media" },
        ],
      },
      {
        cidade: "Montes Claros", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Ibituruna", conversao: "alta" },
          { nome: "Major Prates", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Curitiba", estado: "PR", potencial: "alto",
    bairros: [
      { nome: "Batel", conversao: "alta" }, { nome: "Água Verde", conversao: "alta" },
      { nome: "Bigorrilho", conversao: "alta" }, { nome: "Ecoville", conversao: "alta" },
      { nome: "Centro", conversao: "media" }, { nome: "Juvevê", conversao: "media" },
      { nome: "Cabral", conversao: "alta" }, { nome: "Alto da XV", conversao: "media" },
      { nome: "Champagnat", conversao: "alta" }, { nome: "Rebouças", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Londrina", potencial: "alto",
        bairros: [
          { nome: "Gleba Palhano", conversao: "alta" }, { nome: "Centro", conversao: "alta" },
          { nome: "Bela Suíça", conversao: "media" }, { nome: "Jardim Higienópolis", conversao: "media" },
          { nome: "Petrópolis", conversao: "alta" },
        ],
      },
      {
        cidade: "Maringá", potencial: "alto",
        bairros: [
          { nome: "Zona 7", conversao: "alta" }, { nome: "Zona 3", conversao: "alta" },
          { nome: "Centro", conversao: "media" }, { nome: "Novo Centro", conversao: "alta" },
          { nome: "Zona 1", conversao: "alta" },
        ],
      },
      {
        cidade: "Cascavel", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Parque São Paulo", conversao: "alta" },
          { nome: "Country", conversao: "media" }, { nome: "Neva", conversao: "media" },
        ],
      },
      {
        cidade: "Ponta Grossa", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Estrela", conversao: "alta" },
          { nome: "Nova Rússia", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Porto Alegre", estado: "RS", potencial: "alto",
    bairros: [
      { nome: "Moinhos de Vento", conversao: "alta" }, { nome: "Petrópolis", conversao: "alta" },
      { nome: "Bom Fim", conversao: "alta" }, { nome: "Cidade Baixa", conversao: "media" },
      { nome: "Menino Deus", conversao: "alta" }, { nome: "Mont'Serrat", conversao: "alta" },
      { nome: "Rio Branco", conversao: "media" }, { nome: "Independência", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Caxias do Sul", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Lourdes", conversao: "alta" },
          { nome: "São Pelegrino", conversao: "media" }, { nome: "Exposição", conversao: "media" },
        ],
      },
      {
        cidade: "Canoas", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Niterói", conversao: "alta" },
          { nome: "Marechal Rondon", conversao: "media" },
        ],
      },
      {
        cidade: "Novo Hamburgo", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Hamburgo Velho", conversao: "alta" },
          { nome: "Rio Branco", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Florianópolis", estado: "SC", potencial: "alto",
    bairros: [
      { nome: "Centro", conversao: "alta" }, { nome: "Trindade", conversao: "media" },
      { nome: "Jurerê", conversao: "alta" }, { nome: "Lagoa da Conceição", conversao: "alta" },
      { nome: "Ingleses", conversao: "media" }, { nome: "Campeche", conversao: "media" },
      { nome: "Coqueiros", conversao: "alta" }, { nome: "Itacorubi", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Joinville", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "América", conversao: "alta" },
          { nome: "Atiradores", conversao: "media" }, { nome: "Glória", conversao: "media" },
          { nome: "Anita Garibaldi", conversao: "alta" },
        ],
      },
      {
        cidade: "Blumenau", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Victor Konder", conversao: "alta" },
          { nome: "Vila Nova", conversao: "media" }, { nome: "Ponta Aguda", conversao: "media" },
        ],
      },
      {
        cidade: "Balneário Camboriú", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Barra Sul", conversao: "alta" },
          { nome: "Pioneiros", conversao: "alta" }, { nome: "Nações", conversao: "media" },
        ],
      },
      {
        cidade: "Chapecó", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Presidente Médici", conversao: "alta" },
          { nome: "Maria Goretti", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Brasília", estado: "DF", potencial: "alto",
    bairros: [
      { nome: "Asa Sul", conversao: "alta" }, { nome: "Asa Norte", conversao: "alta" },
      { nome: "Lago Sul", conversao: "alta" }, { nome: "Sudoeste", conversao: "alta" },
      { nome: "Águas Claras", conversao: "alta" }, { nome: "Noroeste", conversao: "alta" },
      { nome: "Lago Norte", conversao: "alta" }, { nome: "Guará", conversao: "alta" },
      { nome: "Taguatinga", conversao: "alta" }, { nome: "Park Sul", conversao: "alta" },
      { nome: "Cruzeiro", conversao: "media" }, { nome: "Octogonal", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Águas Claras", potencial: "alto",
        bairros: [
          { nome: "Norte", conversao: "alta" }, { nome: "Sul", conversao: "alta" },
          { nome: "Vertical", conversao: "alta" },
        ],
      },
      {
        cidade: "Taguatinga", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Taguatinga Norte", conversao: "alta" },
          { nome: "Taguatinga Sul", conversao: "media" },
        ],
      },
      {
        cidade: "Vicente Pires", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Colônia Agrícola Samambaia", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Goiânia", estado: "GO", potencial: "alto",
    bairros: [
      { nome: "Setor Bueno", conversao: "alta" }, { nome: "Setor Marista", conversao: "alta" },
      { nome: "Jardim Goiás", conversao: "alta" }, { nome: "Setor Oeste", conversao: "alta" },
      { nome: "Setor Sul", conversao: "media" }, { nome: "Setor Central", conversao: "media" },
      { nome: "Alphaville Flamboyant", conversao: "alta" },
    ],
    cidades: [
      {
        cidade: "Anápolis", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jundiaí", conversao: "alta" },
          { nome: "Vila Jaiara", conversao: "media" },
        ],
      },
      {
        cidade: "Aparecida de Goiânia", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Cidade Vera Cruz", conversao: "alta" },
          { nome: "Jardim Luz", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Salvador", estado: "BA", potencial: "alto",
    bairros: [
      { nome: "Barra", conversao: "alta" }, { nome: "Pituba", conversao: "alta" },
      { nome: "Itaigara", conversao: "alta" }, { nome: "Rio Vermelho", conversao: "alta" },
      { nome: "Caminho das Árvores", conversao: "alta" }, { nome: "Graça", conversao: "alta" },
      { nome: "Ondina", conversao: "media" }, { nome: "Stella Maris", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Feira de Santana", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Kalilândia", conversao: "alta" },
          { nome: "Santa Mônica", conversao: "media" }, { nome: "Ponto Central", conversao: "media" },
        ],
      },
      {
        cidade: "Vitória da Conquista", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Candeias", conversao: "alta" },
          { nome: "Recreio", conversao: "media" },
        ],
      },
      {
        cidade: "Camaçari", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Vila de Abrantes", conversao: "alta" },
          { nome: "Arembepe", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Vitória", estado: "ES", potencial: "alto",
    bairros: [
      { nome: "Praia do Canto", conversao: "alta" }, { nome: "Jardim da Penha", conversao: "alta" },
      { nome: "Enseada do Suá", conversao: "alta" }, { nome: "Centro", conversao: "media" },
      { nome: "Jardim Camburi", conversao: "alta" }, { nome: "Mata da Praia", conversao: "alta" },
      { nome: "Bento Ferreira", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Vila Velha", potencial: "alto",
        bairros: [
          { nome: "Praia da Costa", conversao: "alta" }, { nome: "Itapuã", conversao: "alta" },
          { nome: "Centro", conversao: "media" }, { nome: "Glória", conversao: "media" },
        ],
      },
      {
        cidade: "Serra", potencial: "medio",
        bairros: [
          { nome: "Laranjeiras", conversao: "alta" }, { nome: "Carapina", conversao: "alta" },
          { nome: "Serra Sede", conversao: "media" },
        ],
      },
      {
        cidade: "Cachoeiro de Itapemirim", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Gilberto Machado", conversao: "alta" },
          { nome: "Guandu", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Recife", estado: "PE", potencial: "alto",
    bairros: [
      { nome: "Boa Viagem", conversao: "alta" }, { nome: "Espinheiro", conversao: "alta" },
      { nome: "Graças", conversao: "alta" }, { nome: "Casa Forte", conversao: "alta" },
      { nome: "Derby", conversao: "alta" }, { nome: "Madalena", conversao: "media" },
      { nome: "Aflitos", conversao: "alta" }, { nome: "Torre", conversao: "media" },
      { nome: "Pina", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Jaboatão dos Guararapes", potencial: "medio",
        bairros: [
          { nome: "Piedade", conversao: "alta" }, { nome: "Candeias", conversao: "alta" },
          { nome: "Centro", conversao: "media" },
        ],
      },
      {
        cidade: "Caruaru", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Maurício de Nassau", conversao: "alta" },
          { nome: "Universitário", conversao: "media" }, { nome: "Boa Vista", conversao: "media" },
        ],
      },
      {
        cidade: "Olinda", potencial: "medio",
        bairros: [
          { nome: "Casa Caiada", conversao: "alta" }, { nome: "Bairro Novo", conversao: "alta" },
          { nome: "Centro", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Fortaleza", estado: "CE", potencial: "alto",
    bairros: [
      { nome: "Aldeota", conversao: "alta" }, { nome: "Meireles", conversao: "alta" },
      { nome: "Cocó", conversao: "alta" }, { nome: "Varjota", conversao: "alta" },
      { nome: "Dionísio Torres", conversao: "alta" }, { nome: "Fátima", conversao: "media" },
      { nome: "Papicu", conversao: "media" }, { nome: "Edson Queiroz", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Juazeiro do Norte", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Lagoa Seca", conversao: "alta" },
          { nome: "Triângulo", conversao: "media" }, { nome: "São Miguel", conversao: "media" },
        ],
      },
      {
        cidade: "Sobral", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Junco", conversao: "alta" },
          { nome: "Derby", conversao: "media" },
        ],
      },
      {
        cidade: "Maracanaú", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Pajuçara", conversao: "alta" },
          { nome: "Jereissati", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Manaus", estado: "AM", potencial: "medio",
    bairros: [
      { nome: "Adrianópolis", conversao: "alta" }, { nome: "Vieiralves", conversao: "alta" },
      { nome: "Ponta Negra", conversao: "alta" }, { nome: "Parque 10", conversao: "alta" },
      { nome: "Flores", conversao: "alta" }, { nome: "Nossa Sra. das Graças", conversao: "alta" },
      { nome: "Centro", conversao: "media" }, { nome: "Dom Pedro", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Parintins", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "São José", conversao: "alta" },
        ],
      },
    ],
  },
  {
    capital: "Belém", estado: "PA", potencial: "medio",
    bairros: [
      { nome: "Umarizal", conversao: "alta" }, { nome: "Nazaré", conversao: "alta" },
      { nome: "Batista Campos", conversao: "alta" }, { nome: "Centro", conversao: "media" },
      { nome: "Marco", conversao: "media" }, { nome: "Reduto", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Ananindeua", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Coqueiro", conversao: "alta" },
          { nome: "Cidade Nova", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Cuiabá", estado: "MT", potencial: "medio",
    bairros: [
      { nome: "Centro", conversao: "alta" }, { nome: "Goiabeiras", conversao: "alta" },
      { nome: "Quilombo", conversao: "alta" }, { nome: "Jardim Aclimação", conversao: "media" },
      { nome: "Bosque da Saúde", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Rondonópolis", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Vila Aurora", conversao: "alta" },
          { nome: "Jardim Europa", conversao: "media" },
        ],
      },
      {
        cidade: "Sinop", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim Botânico", conversao: "alta" },
          { nome: "Jardim Paraíso", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Campo Grande", estado: "MS", potencial: "medio",
    bairros: [
      { nome: "Centro", conversao: "alta" }, { nome: "Jardim dos Estados", conversao: "alta" },
      { nome: "Chácara Cachoeira", conversao: "alta" }, { nome: "Carandá Bosque", conversao: "alta" },
      { nome: "Rita Vieira", conversao: "media" }, { nome: "Vilas Boas", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Dourados", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim América", conversao: "alta" },
          { nome: "Vila Industrial", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Natal", estado: "RN", potencial: "medio",
    bairros: [
      { nome: "Petrópolis", conversao: "alta" }, { nome: "Tirol", conversao: "alta" },
      { nome: "Ponta Negra", conversao: "alta" }, { nome: "Capim Macio", conversao: "alta" },
      { nome: "Centro", conversao: "media" }, { nome: "Lagoa Nova", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Mossoró", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Nova Betânia", conversao: "alta" },
          { nome: "Alto de São Manoel", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "João Pessoa", estado: "PB", potencial: "medio",
    bairros: [
      { nome: "Manaíra", conversao: "alta" }, { nome: "Tambaú", conversao: "alta" },
      { nome: "Cabo Branco", conversao: "alta" }, { nome: "Bessa", conversao: "alta" },
      { nome: "Centro", conversao: "media" }, { nome: "Bancários", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Campina Grande", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Alto Branco", conversao: "alta" },
          { nome: "Prata", conversao: "media" }, { nome: "Mirante", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "São Luís", estado: "MA", potencial: "medio",
    bairros: [
      { nome: "Renascença", conversao: "alta" }, { nome: "Calhau", conversao: "alta" },
      { nome: "Ponta D'Areia", conversao: "alta" }, { nome: "Cohama", conversao: "alta" },
      { nome: "Jardim Renascença", conversao: "alta" }, { nome: "Turu", conversao: "alta" },
      { nome: "São Francisco", conversao: "media" }, { nome: "Centro", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Imperatriz", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Nova Imperatriz", conversao: "alta" },
          { nome: "Maranhão Novo", conversao: "alta" }, { nome: "Santa Inês", conversao: "media" },
        ],
      },
      {
        cidade: "Timon", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Parque Piauí", conversao: "alta" },
        ],
      },
    ],
  },
  {
    capital: "Teresina", estado: "PI", potencial: "medio",
    bairros: [
      { nome: "Centro", conversao: "alta" }, { nome: "Jóquei", conversao: "alta" },
      { nome: "Fátima", conversao: "alta" }, { nome: "Horto", conversao: "alta" },
      { nome: "Ilhotas", conversao: "alta" }, { nome: "Noivos", conversao: "alta" },
      { nome: "Ininga", conversao: "alta" }, { nome: "São Cristóvão", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Parnaíba", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "São Francisco", conversao: "alta" },
          { nome: "Piauí", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Maceió", estado: "AL", potencial: "medio",
    bairros: [
      { nome: "Pajuçara", conversao: "alta" }, { nome: "Ponta Verde", conversao: "alta" },
      { nome: "Jatiúca", conversao: "alta" }, { nome: "Stella Maris", conversao: "alta" },
      { nome: "Mangabeiras", conversao: "alta" }, { nome: "Farol", conversao: "alta" },
      { nome: "Centro", conversao: "media" }, { nome: "Gruta de Lourdes", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Arapiraca", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Primavera", conversao: "alta" },
          { nome: "Brasília", conversao: "alta" }, { nome: "Jardim Tropical", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Aracaju", estado: "SE", potencial: "medio",
    bairros: [
      { nome: "Jardins", conversao: "alta" }, { nome: "13 de Julho", conversao: "alta" },
      { nome: "Grageru", conversao: "alta" }, { nome: "Luzia", conversao: "alta" },
      { nome: "Atalaia", conversao: "alta" }, { nome: "Salgado Filho", conversao: "alta" },
      { nome: "Centro", conversao: "media" }, { nome: "Farolândia", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Nossa Senhora do Socorro", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Marcos Freire", conversao: "alta" },
          { nome: "Conjunto João Alves", conversao: "media" },
        ],
      },
    ],
  },
];

interface FluxMapsProps {
  onSelectLocation?: (cidade: string, estado: string, bairro?: string) => void;
  onSelectMultipleBairros?: (cidade: string, estado: string, bairros: string[]) => void;
  onSelectCity?: (cidade: string, estado: string) => void;
  selectedNiche?: string;
}

const MAX_BAIRROS = 8;

export function FluxMaps({ onSelectLocation, onSelectMultipleBairros, onSelectCity, selectedNiche }: FluxMapsProps) {
  const [openState, setOpenState] = useState<string | null>(null);
  const [openSubCity, setOpenSubCity] = useState<string | null>(null);
  const [filterAlta, setFilterAlta] = useState(false);
  const [selectedBairros, setSelectedBairros] = useState<string[]>([]);
  const [multiSelectCity, setMultiSelectCity] = useState<{ cidade: string; estado: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const toggleBairroSelection = (bairro: string, cidade: string, estado: string) => {
    // If selecting from a different city, reset
    if (multiSelectCity && (multiSelectCity.cidade !== cidade || multiSelectCity.estado !== estado)) {
      setSelectedBairros([bairro]);
      setMultiSelectCity({ cidade, estado });
      return;
    }
    if (!multiSelectCity) {
      setMultiSelectCity({ cidade, estado });
    }
    if (selectedBairros.includes(bairro)) {
      const next = selectedBairros.filter(b => b !== bairro);
      setSelectedBairros(next);
      if (next.length === 0) setMultiSelectCity(null);
    } else if (selectedBairros.length < MAX_BAIRROS) {
      setSelectedBairros([...selectedBairros, bairro]);
    } else {
      toast({ title: `Máximo de ${MAX_BAIRROS} bairros por cidade`, variant: "destructive" });
    }
  };

  const confirmMultiSelect = () => {
    if (!multiSelectCity || selectedBairros.length === 0) return;
    if (onSelectMultipleBairros) {
      onSelectMultipleBairros(multiSelectCity.cidade, multiSelectCity.estado, selectedBairros);
    } else {
      selectedBairros.forEach(b => onSelectLocation?.(multiSelectCity.cidade, multiSelectCity.estado, b));
    }
    toast({ title: "Bairros selecionados!", description: `${selectedBairros.join(", ")} — ${multiSelectCity.cidade}/${multiSelectCity.estado}` });
    setSelectedBairros([]);
    setMultiSelectCity(null);
    setShowConfirmDialog(false);
  };

  const cancelMultiSelect = () => {
    setSelectedBairros([]);
    setMultiSelectCity(null);
    setShowConfirmDialog(false);
  };

  const renderBairros = (bairros: { nome: string; conversao: "alta" | "media" }[], cidade: string, estado: string) => {
    const filtered = filterAlta ? bairros.filter((b) => b.conversao === "alta") : bairros;
    if (filtered.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 px-2">
      {filtered.map((b) => {
          const isThisCity = multiSelectCity?.cidade === cidade && multiSelectCity?.estado === estado;
          const isSelected = isThisCity && selectedBairros.includes(b.nome);
          return (
            <button
              key={b.nome}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/flux-location", JSON.stringify({ cidade, estado, bairro: b.nome }));
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => {
                toggleBairroSelection(b.nome, cidade, estado);
              }}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/50"
                  : b.conversao === "alta"
                  ? "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25"
                  : "bg-muted/50 text-foreground border-border/30 hover:bg-primary/15 hover:text-primary"
              }`}
              title="Clique para selecionar/deselecionar"
            >
              {isSelected && <span className="text-xs">✓</span>}
              {b.conversao === "alta" && !isSelected && <Flame className="h-3.5 w-3.5" />}
              <MapPin className="h-3 w-3 opacity-60" />
              {b.nome}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-3">
        {selectedNiche && (
          <div className="px-3 py-2 rounded-lg bg-primary/15 border border-primary/30">
            <p className="text-xs text-muted-foreground">Nicho selecionado:</p>
            <p className="text-sm font-bold text-primary">{selectedNiche}</p>
          </div>
        )}

        {/* Confirm button - only shows when bairros are selected */}
        {selectedBairros.length > 0 && multiSelectCity && (
          <div className="space-y-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">
                {selectedBairros.length}/{MAX_BAIRROS} bairros • {multiSelectCity.cidade}/{multiSelectCity.estado}
              </p>
              <div className="flex gap-2">
                <button onClick={cancelMultiSelect} className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors">
                  Limpar
                </button>
                <button onClick={() => setShowConfirmDialog(true)} className="text-xs font-bold px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  ✓ Confirmar
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedBairros.map((b, i) => (
                <span key={`${b}-${i}`} className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation dialog */}
        {showConfirmDialog && multiSelectCity && selectedBairros.length > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ pointerEvents: "auto" }}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowConfirmDialog(false)} />
            <div className="relative z-10 bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-foreground">Confirmar bairros selecionados</h3>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {multiSelectCity.cidade}/{multiSelectCity.estado}
                </p>
                <div className="flex flex-wrap gap-1.5 pl-5">
                  {selectedBairros.map(b => (
                    <span key={b} className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md">{b}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Total: {selectedBairros.length} bairro{selectedBairros.length > 1 ? "s" : ""}
              </p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowConfirmDialog(false)} className="flex-1 text-sm font-semibold py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
                  Voltar
                </button>
                <button onClick={confirmMultiSelect} className="flex-1 text-sm font-bold py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  ✅ Confirmar e avançar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm text-white">Clique nos bairros para selecionar (até {MAX_BAIRROS})</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterAlta(!filterAlta)}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all ${
                filterAlta
                  ? "bg-destructive/20 text-white border border-destructive/40"
                  : "bg-muted/50 text-white border border-border/30 hover:border-primary/50"
              }`}
            >
              <Flame className="h-3 w-3" />
              {filterAlta ? "Alta ✓" : "Alta"}
            </button>
          </div>
        </div>

        {estados.map((st) => {
          const isOpen = openState === st.capital;
          const altaCount = st.bairros.filter((b) => b.conversao === "alta").length;
          const totalCidades = st.cidades.length;

          return (
            <div key={st.capital}>
              <button
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/flux-location", JSON.stringify({ cidade: st.capital, estado: st.estado }));
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => {
                  const willOpen = !isOpen;
                  setOpenState(willOpen ? st.capital : null);
                  setOpenSubCity(null);
                  if (willOpen && onSelectCity) onSelectCity(st.capital, st.estado);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold bg-muted/30 hover:bg-muted/50 rounded-lg transition-all cursor-pointer"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                )}
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-white text-base">{st.capital}</span>
                <Badge variant="outline" className="ml-1 text-[10px] text-white border-muted-foreground/30">
                  {st.estado}
                </Badge>
                <span className="ml-auto flex items-center gap-2">
                  {totalCidades > 0 && (
                    <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                      +{totalCidades} cidades
                    </Badge>
                  )}
                  {st.potencial === "alto" && (
                    <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> Alto
                    </Badge>
                  )}
                  <span className="text-xs text-destructive font-semibold flex items-center gap-0.5">
                    <Flame className="h-3 w-3" /> {altaCount}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="ml-4 mt-2 mb-3 space-y-3 animate-fade-in">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      📍 {st.capital} — Bairros
                    </p>
                    {renderBairros(st.bairros, st.capital, st.estado)}
                  </div>

                  {st.cidades.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                        🏙️ Interior de {st.estado}
                      </p>
                      {st.cidades.map((sub) => {
                        const subOpen = openSubCity === sub.cidade;
                        const subAlta = sub.bairros.filter((b) => b.conversao === "alta").length;
                        return (
                          <div key={sub.cidade} className="ml-2">
                            <button
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("application/flux-location", JSON.stringify({ cidade: sub.cidade, estado: st.estado }));
                                e.dataTransfer.effectAllowed = "copy";
                              }}
                              onClick={() => {
                                const willOpen = !subOpen;
                                setOpenSubCity(willOpen ? sub.cidade : null);
                                if (willOpen && onSelectCity) onSelectCity(sub.cidade, st.estado);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer border border-primary/40 bg-primary/15 hover:bg-primary/25"
                            >
                              {subOpen ? (
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-primary" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                              )}
                              <MapPin className="h-3.5 w-3.5 text-primary/70" />
                              <span className="text-white text-sm">{sub.cidade}</span>
                              <span className="ml-auto text-xs text-destructive font-semibold flex items-center gap-0.5">
                                <Flame className="h-3 w-3" /> {subAlta}
                              </span>
                            </button>
                            {subOpen && (
                              <div className="ml-4 mt-1.5 mb-2 animate-fade-in">
                                {renderBairros(sub.bairros, sub.cidade, st.estado)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
