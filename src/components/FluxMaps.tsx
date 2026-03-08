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
      { nome: "Brooklin", conversao: "media" }, { nome: "Perdizes", conversao: "media" },
      { nome: "Santana", conversao: "media" }, { nome: "Tatuapé", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Campinas", potencial: "alto",
        bairros: [
          { nome: "Cambuí", conversao: "alta" }, { nome: "Nova Campinas", conversao: "alta" },
          { nome: "Barão Geraldo", conversao: "media" }, { nome: "Taquaral", conversao: "media" },
        ],
      },
      {
        cidade: "São José do Rio Preto", potencial: "alto",
        bairros: [
          { nome: "Redentora", conversao: "alta" }, { nome: "Boa Vista", conversao: "alta" },
          { nome: "Jardim Walkíria", conversao: "alta" }, { nome: "Centro", conversao: "media" },
          { nome: "Higienópolis", conversao: "media" },
        ],
      },
      {
        cidade: "Ribeirão Preto", potencial: "alto",
        bairros: [
          { nome: "Jardim Sumaré", conversao: "alta" }, { nome: "Alto da Boa Vista", conversao: "alta" },
          { nome: "Jardim Irajá", conversao: "alta" }, { nome: "Centro", conversao: "media" },
        ],
      },
      {
        cidade: "Sorocaba", potencial: "alto",
        bairros: [
          { nome: "Campolim", conversao: "alta" }, { nome: "Parque Campolim", conversao: "alta" },
          { nome: "Centro", conversao: "media" }, { nome: "Jardim Faculdade", conversao: "media" },
        ],
      },
      {
        cidade: "Santos", potencial: "alto",
        bairros: [
          { nome: "Gonzaga", conversao: "alta" }, { nome: "Boqueirão", conversao: "alta" },
          { nome: "Ponta da Praia", conversao: "media" }, { nome: "Embaré", conversao: "media" },
        ],
      },
      {
        cidade: "Bauru", potencial: "medio",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Jardim Estoril", conversao: "alta" },
          { nome: "Vila Universitária", conversao: "media" },
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
      { nome: "Flamengo", conversao: "media" }, { nome: "Centro", conversao: "media" },
    ],
    cidades: [],
  },
  {
    capital: "Belo Horizonte", estado: "MG", potencial: "alto",
    bairros: [
      { nome: "Savassi", conversao: "alta" }, { nome: "Lourdes", conversao: "alta" },
      { nome: "Funcionários", conversao: "alta" }, { nome: "Pampulha", conversao: "media" },
      { nome: "Buritis", conversao: "media" }, { nome: "Mangabeiras", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Uberlândia", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "Santa Mônica", conversao: "alta" },
          { nome: "Saraiva", conversao: "media" }, { nome: "Altamira", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Curitiba", estado: "PR", potencial: "alto",
    bairros: [
      { nome: "Batel", conversao: "alta" }, { nome: "Água Verde", conversao: "alta" },
      { nome: "Bigorrilho", conversao: "alta" }, { nome: "Ecoville", conversao: "media" },
      { nome: "Centro", conversao: "media" }, { nome: "Juvevê", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Londrina", potencial: "alto",
        bairros: [
          { nome: "Gleba Palhano", conversao: "alta" }, { nome: "Centro", conversao: "alta" },
          { nome: "Bela Suíça", conversao: "media" }, { nome: "Jardim Higienópolis", conversao: "media" },
        ],
      },
      {
        cidade: "Maringá", potencial: "alto",
        bairros: [
          { nome: "Zona 7", conversao: "alta" }, { nome: "Zona 3", conversao: "alta" },
          { nome: "Centro", conversao: "media" }, { nome: "Novo Centro", conversao: "alta" },
        ],
      },
    ],
  },
  {
    capital: "Porto Alegre", estado: "RS", potencial: "medio",
    bairros: [
      { nome: "Moinhos de Vento", conversao: "alta" }, { nome: "Petrópolis", conversao: "alta" },
      { nome: "Bom Fim", conversao: "media" }, { nome: "Cidade Baixa", conversao: "media" },
      { nome: "Menino Deus", conversao: "media" },
    ],
    cidades: [],
  },
  {
    capital: "Florianópolis", estado: "SC", potencial: "medio",
    bairros: [
      { nome: "Centro", conversao: "alta" }, { nome: "Trindade", conversao: "media" },
      { nome: "Jurerê", conversao: "alta" }, { nome: "Lagoa da Conceição", conversao: "media" },
    ],
    cidades: [
      {
        cidade: "Joinville", potencial: "alto",
        bairros: [
          { nome: "Centro", conversao: "alta" }, { nome: "América", conversao: "alta" },
          { nome: "Atiradores", conversao: "media" }, { nome: "Glória", conversao: "media" },
        ],
      },
    ],
  },
  {
    capital: "Brasília", estado: "DF", potencial: "alto",
    bairros: [
      { nome: "Asa Sul", conversao: "alta" }, { nome: "Asa Norte", conversao: "alta" },
      { nome: "Lago Sul", conversao: "alta" }, { nome: "Sudoeste", conversao: "media" },
      { nome: "Águas Claras", conversao: "media" },
    ],
    cidades: [],
  },
  {
    capital: "Goiânia", estado: "GO", potencial: "medio",
    bairros: [
      { nome: "Setor Bueno", conversao: "alta" }, { nome: "Setor Marista", conversao: "alta" },
      { nome: "Jardim Goiás", conversao: "media" }, { nome: "Setor Oeste", conversao: "media" },
    ],
    cidades: [],
  },
  {
    capital: "Salvador", estado: "BA", potencial: "medio",
    bairros: [
      { nome: "Barra", conversao: "alta" }, { nome: "Pituba", conversao: "alta" },
      { nome: "Itaigara", conversao: "media" }, { nome: "Rio Vermelho", conversao: "media" },
    ],
    cidades: [],
  },
  {
    capital: "Vitória", estado: "ES", potencial: "medio",
    bairros: [
      { nome: "Praia do Canto", conversao: "alta" }, { nome: "Jardim da Penha", conversao: "alta" },
      { nome: "Enseada do Suá", conversao: "alta" }, { nome: "Centro", conversao: "media" },
    ],
    cidades: [],
  },
  {
    capital: "Recife", estado: "PE", potencial: "medio",
    bairros: [
      { nome: "Boa Viagem", conversao: "alta" }, { nome: "Espinheiro", conversao: "alta" },
      { nome: "Graças", conversao: "alta" }, { nome: "Casa Forte", conversao: "media" },
    ],
    cidades: [],
  },
  {
    capital: "Fortaleza", estado: "CE", potencial: "medio",
    bairros: [
      { nome: "Aldeota", conversao: "alta" }, { nome: "Meireles", conversao: "alta" },
      { nome: "Cocó", conversao: "alta" }, { nome: "Varjota", conversao: "media" },
    ],
    cidades: [],
  },
];

interface FluxMapsProps {
  onSelectLocation?: (cidade: string, estado: string, bairro?: string) => void;
  selectedNiche?: string;
}

export function FluxMaps({ onSelectLocation, selectedNiche }: FluxMapsProps) {
  const [openState, setOpenState] = useState<string | null>(null);
  const [openSubCity, setOpenSubCity] = useState<string | null>(null);
  const [filterAlta, setFilterAlta] = useState(false);
  const { toast } = useToast();

  const renderBairros = (bairros: { nome: string; conversao: "alta" | "media" }[], cidade: string, estado: string) => {
    const filtered = filterAlta ? bairros.filter((b) => b.conversao === "alta") : bairros;
    if (filtered.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 px-2">
        {filtered.map((b) => (
          <button
            key={b.nome}
            onClick={() => {
              onSelectLocation?.(cidade, estado, b.nome);
              toast({ title: "Local selecionado!", description: `${b.nome} - ${cidade}/${estado}` });
            }}
            className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 border ${
              b.conversao === "alta"
                ? "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25"
                : "bg-muted/50 text-foreground border-border/30 hover:bg-primary/15 hover:text-primary"
            }`}
          >
            {b.conversao === "alta" && <Flame className="h-3.5 w-3.5" />}
            <MapPin className="h-3 w-3 opacity-60" />
            {b.nome}
          </button>
        ))}
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

        <div className="flex items-center justify-between">
          <p className="text-sm text-white">Clique para preencher cidade e bairro</p>
          <button
            onClick={() => setFilterAlta(!filterAlta)}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all ${
              filterAlta
                ? "bg-destructive/20 text-white border border-destructive/40"
                : "bg-muted/50 text-white border border-border/30 hover:border-primary/50"
            }`}
          >
            <Flame className="h-3 w-3" />
            {filterAlta ? "Alta conversão ✓" : "Filtrar alta conversão"}
          </button>
        </div>

        {estados.map((st) => {
          const isOpen = openState === st.capital;
          const altaCount = st.bairros.filter((b) => b.conversao === "alta").length;
          const totalCidades = st.cidades.length;

          return (
            <div key={st.capital}>
              <button
                onClick={() => {
                  setOpenState(isOpen ? null : st.capital);
                  setOpenSubCity(null);
                  onSelectLocation?.(st.capital, st.estado);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold bg-muted/30 hover:bg-muted/50 rounded-lg transition-all"
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
                              onClick={() => {
                                setOpenSubCity(subOpen ? null : sub.cidade);
                                onSelectLocation?.(sub.cidade, st.estado);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-muted/20 hover:bg-muted/40 rounded-md transition-all"
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
