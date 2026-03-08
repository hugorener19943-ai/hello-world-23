import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, CheckCircle2, XCircle, MapPin, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBairrosPorCidade } from "@/lib/bairrosPorCidade";
import type { SearchBlock } from "./types";

interface Props {
  block: SearchBlock;
  index: number;
  canRemove: boolean;
  status?: "idle" | "loading" | "done" | "error";
  result?: { found: number; requested: number; message?: string };
  onChange: (id: string, field: keyof SearchBlock, value: string | number) => void;
  onRemove: (id: string) => void;
  onDropData?: (id: string, data: Record<string, string>) => void;
}

export function SearchBlockCard({ block, index, canRemove, status = "idle", result, onChange, onRemove, onDropData }: Props) {
  const [showBairros, setShowBairros] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const bairrosSugeridos = useMemo(() => getBairrosPorCidade(block.cidade), [block.cidade]);
  const hasSuggestions = bairrosSugeridos.length > 0;

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/flux-niche") || e.dataTransfer.types.includes("application/flux-location")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const nicheData = e.dataTransfer.getData("application/flux-niche");
    const locationData = e.dataTransfer.getData("application/flux-location");
    if (nicheData) {
      try {
        const { query } = JSON.parse(nicheData);
        onChange(block.id, "query", query);
      } catch {}
    }
    if (locationData) {
      try {
        const { cidade, estado, bairro } = JSON.parse(locationData);
        if (cidade) onChange(block.id, "cidade", cidade);
        if (estado) onChange(block.id, "estado", estado);
        if (bairro) onChange(block.id, "bairro", bairro);
      } catch {}
    }
  };

  const hasShortfall = result && result.found < result.requested;
  const hasError = status === "error";

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 relative glow-neon transition-all duration-200 ${
        isDragOver
          ? "border-primary bg-primary/20 ring-2 ring-primary/50"
          : hasError
          ? "border-destructive/50 bg-destructive/10"
          : hasShortfall
          ? "border-yellow-500/50 bg-yellow-500/5"
          : "border-primary/30 bg-primary/10"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white flex items-center gap-2">
          Busca {index + 1}
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-neon" />}
          {status === "done" && <CheckCircle2 className="h-4 w-4 text-neon" />}
          {status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
          {result && (
            <Badge
              variant="outline"
              className={`text-xs ml-1 ${
                result.found >= result.requested
                  ? "border-primary/50 text-neon"
                  : result.found === 0
                  ? "border-destructive/50 text-destructive"
                  : "border-yellow-500/50 text-yellow-500"
              }`}
            >
              {result.found}/{result.requested} leads
            </Badge>
          )}
        </span>
        {canRemove && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-destructive" onClick={() => onRemove(block.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Result feedback */}
      {result && result.message && (
        <div className={`flex items-start gap-2 text-xs rounded-md px-3 py-2 ${
          result.found === 0
            ? "bg-destructive/10 text-destructive border border-destructive/20"
            : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
        }`}>
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{result.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-base font-bold text-white">Nicho</Label>
          <Input placeholder="ex: clínica odontológica" value={block.query} onChange={(e) => onChange(block.id, "query", e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-1">
          <Label className="text-base font-bold text-white">Cidade</Label>
          <Input placeholder="ex: São Paulo" value={block.cidade} onChange={(e) => onChange(block.id, "cidade", e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-1">
          <Label className="text-base font-bold text-white">Estado</Label>
          <Input placeholder="ex: SP" value={block.estado} onChange={(e) => onChange(block.id, "estado", e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-1">
          <Label className="text-base font-bold text-white">Quantidade</Label>
          <Select value={String(block.targetTotal)} onValueChange={(v) => onChange(block.id, "targetTotal", Number(v))}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100, 200, 300, 400].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} leads</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bairro - opcional */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-bold text-white flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-neon" />
            Bairro <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </Label>
          {hasSuggestions && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-neon hover:text-primary-foreground hover:bg-primary"
              onClick={() => setShowBairros(!showBairros)}
            >
              {showBairros ? "Ocultar sugestões" : "Ver sugestões"}
            </Button>
          )}
        </div>
        <Input
          placeholder="ex: Pinheiros"
          value={block.bairro}
          onChange={(e) => onChange(block.id, "bairro", e.target.value)}
          className="bg-secondary border-border max-w-xs"
        />
        {showBairros && hasSuggestions && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bairrosSugeridos.map((b) => (
              <Badge
                key={b}
                variant={block.bairro === b ? "default" : "outline"}
                className={`cursor-pointer text-xs transition-colors ${
                  block.bairro === b
                    ? "bg-primary text-primary-foreground glow-neon"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
                onClick={() => onChange(block.id, "bairro", block.bairro === b ? "" : b)}
              >
                {b}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
