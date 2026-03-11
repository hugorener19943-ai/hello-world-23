import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, AlertTriangle, Info } from "lucide-react";
import type { SearchBlock } from "./types";

interface Props {
  blocks: SearchBlock[];
}

function getQualityBadge(combinations: number): { label: string; color: string } {
  if (combinations <= 2) return { label: "Busca muito específica", color: "border-yellow-500/50 text-yellow-500" };
  if (combinations <= 15) return { label: "Busca equilibrada", color: "border-primary/50 text-neon" };
  return { label: "Busca ampla", color: "border-blue-400/50 text-blue-400" };
}

function getAlert(combinations: number, totalSubnichos: number, totalBairros: number): { type: "specific" | "broad"; message: string; tip: string } | null {
  if (combinations <= 2 && totalSubnichos <= 1 && totalBairros <= 1) {
    return {
      type: "specific",
      message: "Sua busca está muito específica.",
      tip: "Considere adicionar mais subnichos ou remover alguns bairros para ampliar os resultados.",
    };
  }
  if (combinations > 30) {
    return {
      type: "broad",
      message: "Sua busca está muito ampla.",
      tip: "Você pode refinar adicionando bairros ou subnichos mais específicos.",
    };
  }
  return null;
}

export function SearchSummary({ blocks }: Props) {
  const validBlocks = blocks.filter(b => b.query && b.cidade && b.estado);

  const summary = useMemo(() => {
    if (validBlocks.length === 0) return null;

    const totalSubnichos = validBlocks.reduce((acc, b) => acc + (b.subnichos?.length || 0), 0);
    const totalBairros = validBlocks.reduce((acc, b) => acc + b.bairros.length, 0);
    const totalRequested = validBlocks.reduce((acc, b) => acc + b.targetTotal, 0);

    const totalCombinations = validBlocks.reduce((acc, b) => {
      const subs = Math.max((b.subnichos?.length || 0), 1);
      const bairs = Math.max(b.bairros.length, 1);
      return acc + subs * bairs;
    }, 0);

    const estimateMin = Math.round(totalRequested * 0.6);
    const estimateMax = Math.round(totalRequested * 1.3);

    const quality = getQualityBadge(totalCombinations);
    const alert = getAlert(totalCombinations, totalSubnichos, totalBairros);

    return { totalSubnichos, totalBairros, totalRequested, totalCombinations, estimateMin, estimateMax, quality, alert };
  }, [validBlocks]);

  if (!summary) return null;

  const firstBlock = validBlocks[0];

  return (
    <Card className="border border-primary/30 bg-primary/5">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span className="font-bold text-white text-sm">Resumo da Busca</span>
          <Badge variant="outline" className={`text-[10px] ml-auto ${summary.quality.color}`}>
            {summary.quality.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-white/60">Nicho:</span>
            <span className="text-white font-medium">{firstBlock.query}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Subnichos:</span>
            <span className="text-white font-medium">{summary.totalSubnichos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Bairros:</span>
            <span className="text-white font-medium">{summary.totalBairros}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Cidade:</span>
            <span className="text-white font-medium">{firstBlock.cidade} / {firstBlock.estado}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Quantidade:</span>
            <span className="text-white font-medium">{summary.totalRequested} leads</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Combinações:</span>
            <span className="text-white font-medium">{summary.totalCombinations}</span>
          </div>
        </div>

        <p className="text-[11px] text-white/50">
          Estimativa de empresas encontradas: ~{summary.estimateMin} a {summary.estimateMax} empresas
        </p>

        {/* Smart Alert */}
        {summary.alert && (
          <div className={`flex items-start gap-2 text-xs rounded-md px-3 py-2 ${
            summary.alert.type === "specific"
              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              : "bg-blue-400/10 text-blue-400 border border-blue-400/20"
          }`}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{summary.alert.message}</p>
              <p className="text-white/60 mt-0.5">{summary.alert.tip}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
