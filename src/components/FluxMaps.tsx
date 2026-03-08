import { useState } from "react";
import { MapPin, TrendingUp, Flame, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CityData {
  cidade: string;
  estado: string;
  potencial: "alto" | "medio";
  bairros: { nome: string; conversao: "alta" | "media" }[];
}

const cidadesRecomendadas: CityData[] = [
  {
    cidade: "São Paulo", estado: "SP", potencial: "alto",
    bairros: [
      { nome: "Pinheiros", conversao: "alta" }, { nome: "Vila Mariana", conversao: "alta" },
      { nome: "Moema", conversao: "alta" }, { nome: "Itaim Bibi", conversao: "alta" },
      { nome: "Jardins", conversao: "alta" }, { nome: "Vila Olímpia", conversao: "alta" },
      { nome: "Brooklin", conversao: "media" }, { nome: "Perdizes", conversao: "media" },
      { nome: "Santana", conversao: "media" }, { nome: "Tatuapé", conversao: "media" },
    ],
  },
  {
    cidade: "Rio de Janeiro", estado: "RJ", potencial: "alto",
    bairros: [
      { nome: "Copacabana", conversao: "alta" }, { nome: "Ipanema", conversao: "alta" },
      { nome: "Leblon", conversao: "alta" }, { nome: "Botafogo", conversao: "alta" },
      { nome: "Barra da Tijuca", conversao: "alta" }, { nome: "Tijuca", conversao: "media" },
      { nome: "Flamengo", conversao: "media" }, { nome: "Centro", conversao: "media" },
    ],
  },
  {
    cidade: "Belo Horizonte", estado: "MG", potencial: "alto",
    bairros: [
      { nome: "Savassi", conversao: "alta" }, { nome: "Lourdes", conversao: "alta" },
      { nome: "Funcionários", conversao: "alta" }, { nome: "Pampulha", conversao: "media" },
      { nome: "Buritis", conversao: "media" }, { nome: "Mangabeiras", conversao: "media" },
    ],
  },
  {
    cidade: "Curitiba", estado: "PR", potencial: "alto",
    bairros: [
      { nome: "Batel", conversao: "alta" }, { nome: "Água Verde", conversao: "alta" },
      { nome: "Bigorrilho", conversao: "alta" }, { nome: "Ecoville", conversao: "media" },
      { nome: "Centro", conversao: "media" }, { nome: "Juvevê", conversao: "media" },
    ],
  },
  {
    cidade: "Porto Alegre", estado: "RS", potencial: "medio",
    bairros: [
      { nome: "Moinhos de Vento", conversao: "alta" }, { nome: "Petrópolis", conversao: "alta" },
      { nome: "Bom Fim", conversao: "media" }, { nome: "Cidade Baixa", conversao: "media" },
      { nome: "Menino Deus", conversao: "media" },
    ],
  },
  {
    cidade: "Florianópolis", estado: "SC", potencial: "medio",
    bairros: [
      { nome: "Centro", conversao: "alta" }, { nome: "Trindade", conversao: "media" },
      { nome: "Jurerê", conversao: "alta" }, { nome: "Lagoa da Conceição", conversao: "media" },
    ],
  },
  {
    cidade: "Brasília", estado: "DF", potencial: "alto",
    bairros: [
      { nome: "Asa Sul", conversao: "alta" }, { nome: "Asa Norte", conversao: "alta" },
      { nome: "Lago Sul", conversao: "alta" }, { nome: "Sudoeste", conversao: "media" },
      { nome: "Águas Claras", conversao: "media" },
    ],
  },
  {
    cidade: "Goiânia", estado: "GO", potencial: "medio",
    bairros: [
      { nome: "Setor Bueno", conversao: "alta" }, { nome: "Setor Marista", conversao: "alta" },
      { nome: "Jardim Goiás", conversao: "media" }, { nome: "Setor Oeste", conversao: "media" },
    ],
  },
  {
    cidade: "Salvador", estado: "BA", potencial: "medio",
    bairros: [
      { nome: "Barra", conversao: "alta" }, { nome: "Pituba", conversao: "alta" },
      { nome: "Itaigara", conversao: "media" }, { nome: "Rio Vermelho", conversao: "media" },
    ],
  },
  {
    cidade: "Campinas", estado: "SP", potencial: "medio",
    bairros: [
      { nome: "Cambuí", conversao: "alta" }, { nome: "Barão Geraldo", conversao: "media" },
      { nome: "Taquaral", conversao: "media" }, { nome: "Nova Campinas", conversao: "alta" },
    ],
  },
];

interface FluxMapsProps {
  onSelectLocation?: (cidade: string, estado: string, bairro?: string) => void;
  selectedNiche?: string;
}

export function FluxMaps({ onSelectLocation, selectedNiche }: FluxMapsProps) {
  const [openCity, setOpenCity] = useState<string | null>(null);
  const [filterAlta, setFilterAlta] = useState(false);
  const { toast } = useToast();

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

        {cidadesRecomendadas.map((city) => {
          const isOpen = openCity === city.cidade;
          const bairrosToShow = filterAlta
            ? city.bairros.filter((b) => b.conversao === "alta")
            : city.bairros;
          const altaCount = city.bairros.filter((b) => b.conversao === "alta").length;

          if (filterAlta && bairrosToShow.length === 0) return null;

          return (
            <div key={city.cidade}>
              <button
                onClick={() => {
                  setOpenCity(isOpen ? null : city.cidade);
                  onSelectLocation?.(city.cidade, city.estado);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold bg-muted/30 hover:bg-muted/50 rounded-lg transition-all"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                )}
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-white text-base">{city.cidade}</span>
                <Badge variant="outline" className="ml-1 text-[10px] border-muted-foreground/30">
                  {city.estado}
                </Badge>
                <span className="ml-auto flex items-center gap-2">
                  {city.potencial === "alto" && (
                    <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> Alto potencial
                    </Badge>
                  )}
                  <span className="text-xs text-destructive font-semibold flex items-center gap-0.5">
                    <Flame className="h-3 w-3" /> {altaCount}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="ml-4 mt-2 mb-3 space-y-1.5 animate-fade-in">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                    📍 Bairros — clique para selecionar
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {bairrosToShow.map((b) => (
                      <button
                        key={b.nome}
                        onClick={() => {
                          onSelectLocation?.(city.cidade, city.estado, b.nome);
                          toast({ title: "Local selecionado!", description: `${b.nome} - ${city.cidade}/${city.estado}` });
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
