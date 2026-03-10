import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, CheckCircle2, XCircle, MapPin, AlertTriangle, Plus, X, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBairrosPorCidade } from "@/lib/bairrosPorCidade";
import { getSubnichoSuggestions } from "@/lib/subnichoSuggestions";
import type { SearchBlock } from "./types";

const MAX_BAIRROS = 8;

function normalizeKey(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function hasSubnicho(list: string[], value: string): boolean {
  const key = normalizeKey(value);
  return list.some(s => normalizeKey(s) === key);
}

interface Props {
  block: SearchBlock;
  index: number;
  canRemove: boolean;
  status?: "idle" | "loading" | "done" | "error";
  result?: { found: number; requested: number; message?: string };
  onChange: (id: string, field: keyof SearchBlock, value: any) => void;
  onRemove: (id: string) => void;
  onDropData?: (id: string, data: Record<string, string>) => void;
}

export function SearchBlockCard({ block, index, canRemove, status = "idle", result, onChange, onRemove, onDropData }: Props) {
  const [showBairros, setShowBairros] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newBairroInput, setNewBairroInput] = useState("");

  const bairrosSugeridos = useMemo(() => getBairrosPorCidade(block.cidade), [block.cidade]);
  const subnichoSuggestions = useMemo(() => getSubnichoSuggestions(block.query), [block.query]);
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
        if (bairro && block.bairros.length < MAX_BAIRROS && !block.bairros.includes(bairro)) {
          onChange(block.id, "bairros", [...block.bairros, bairro]);
        }
      } catch {}
    }
  };

  const addBairro = (b: string) => {
    const trimmed = b.trim();
    if (!trimmed || block.bairros.length >= MAX_BAIRROS || block.bairros.includes(trimmed)) return;
    onChange(block.id, "bairros", [...block.bairros, trimmed]);
    setNewBairroInput("");
  };

  const removeBairro = (b: string) => {
    onChange(block.id, "bairros", block.bairros.filter((x) => x !== b));
  };

  const toggleSuggestion = (b: string) => {
    if (block.bairros.includes(b)) {
      removeBairro(b);
    } else if (block.bairros.length < MAX_BAIRROS) {
      onChange(block.id, "bairros", [...block.bairros, b]);
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
          <Input placeholder="ex: Saúde" value={block.query} onChange={(e) => onChange(block.id, "query", e.target.value)} className="bg-secondary border-border" />
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

      {/* Subnichos - até 10 */}
      <div className="space-y-2">
        <Label className="text-base font-bold text-white flex items-center gap-1.5">
          🔍 Subnichos <span className="text-xs font-normal text-muted-foreground">(até 10)</span>
        </Label>
        {block.subnichos && block.subnichos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {block.subnichos.map((s) => (
              <Badge key={s} className="bg-primary text-primary-foreground glow-neon gap-1 pr-1">
                {s}
                <button onClick={() => onChange(block.id, "subnichos", (block.subnichos || []).filter((x) => x !== s))} className="ml-0.5 hover:bg-primary-foreground/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {(!block.subnichos || block.subnichos.length < 10) && (
          <div className="flex gap-2 items-center">
            <Input
              placeholder="ex: clínica odontológica"
              className="bg-secondary border-border max-w-xs h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !hasSubnicho(block.subnichos || [], val)) {
                    onChange(block.id, "subnichos", [...(block.subnichos || []), val]);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <span className="text-xs text-muted-foreground">Enter para adicionar</span>
          </div>
        )}
        {/* Subnicho suggestions */}
        {subnichoSuggestions.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-3 w-3 text-primary" /> Sugestões com alta demanda de automação:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {subnichoSuggestions.map((s) => {
                const isAdded = (block.subnichos || []).includes(s);
                return (
                  <Badge
                    key={s}
                    variant={isAdded ? "default" : "outline"}
                    className={`cursor-pointer text-[10px] transition-colors ${
                      isAdded
                        ? "bg-primary text-primary-foreground"
                        : (block.subnichos || []).length >= 10
                        ? "border-border text-muted-foreground/50 cursor-not-allowed"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                    onClick={() => {
                      if (isAdded) {
                        onChange(block.id, "subnichos", (block.subnichos || []).filter(x => x !== s));
                      } else if ((block.subnichos || []).length < 10) {
                        onChange(block.id, "subnichos", [...(block.subnichos || []), s]);
                      }
                    }}
                  >
                    {isAdded ? "✓ " : ""}{s}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bairros - até 4 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-bold text-white flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-neon" />
            Bairros <span className="text-xs font-normal text-muted-foreground">(até {MAX_BAIRROS}, opcional)</span>
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

        {/* Selected bairros chips */}
        {block.bairros.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {block.bairros.map((b) => (
              <Badge key={b} className="bg-primary text-primary-foreground glow-neon gap-1 pr-1">
                {b}
                <button onClick={() => removeBairro(b)} className="ml-0.5 hover:bg-primary-foreground/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add bairro input */}
        {block.bairros.length < MAX_BAIRROS && (
          <div className="flex gap-2 items-center">
            <Input
              placeholder="ex: Pinheiros"
              value={newBairroInput}
              onChange={(e) => setNewBairroInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBairro(newBairroInput); } }}
              className="bg-secondary border-border max-w-xs h-8 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs border-primary/30 text-neon"
              onClick={() => addBairro(newBairroInput)}
              disabled={!newBairroInput.trim()}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
            </Button>
          </div>
        )}

        {showBairros && hasSuggestions && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bairrosSugeridos.map((b) => (
              <Badge
                key={b}
                variant={block.bairros.includes(b) ? "default" : "outline"}
                className={`cursor-pointer text-xs transition-colors ${
                  block.bairros.includes(b)
                    ? "bg-primary text-primary-foreground glow-neon"
                    : block.bairros.length >= MAX_BAIRROS
                    ? "border-border text-muted-foreground/50 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
                onClick={() => { if (block.bairros.length < MAX_BAIRROS || block.bairros.includes(b)) toggleSuggestion(b); }}
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
