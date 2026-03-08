import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBairrosPorCidade } from "@/lib/bairrosPorCidade";
import type { SearchBlock } from "./types";

interface Props {
  block: SearchBlock;
  index: number;
  canRemove: boolean;
  status?: "idle" | "loading" | "done" | "error";
  onChange: (id: string, field: keyof SearchBlock, value: string | number) => void;
  onRemove: (id: string) => void;
  onDropData?: (id: string, data: Record<string, string>) => void;
}

export function SearchBlockCard({ block, index, canRemove, status = "idle", onChange, onRemove }: Props) {
  const [showBairros, setShowBairros] = useState(false);

  const bairrosSugeridos = useMemo(() => getBairrosPorCidade(block.cidade), [block.cidade]);
  const hasSuggestions = bairrosSugeridos.length > 0;

  return (
    <div className="border border-primary/30 rounded-lg p-4 space-y-3 bg-primary/10 relative glow-neon">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white flex items-center gap-2">
          Busca {index + 1}
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-neon" />}
          {status === "done" && <CheckCircle2 className="h-4 w-4 text-neon" />}
          {status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
        </span>
        {canRemove && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-destructive" onClick={() => onRemove(block.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
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
