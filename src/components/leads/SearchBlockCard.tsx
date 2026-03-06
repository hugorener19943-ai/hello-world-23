import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { SearchBlock } from "./types";

interface Props {
  block: SearchBlock;
  index: number;
  canRemove: boolean;
  status?: "idle" | "loading" | "done" | "error";
  onChange: (id: string, field: keyof SearchBlock, value: string | number) => void;
  onRemove: (id: string) => void;
}

export function SearchBlockCard({ block, index, canRemove, status = "idle", onChange, onRemove }: Props) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/30 relative">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
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
          <Label className="text-xs">Nicho</Label>
          <Input placeholder="ex: clínica odontológica" value={block.query} onChange={(e) => onChange(block.id, "query", e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cidade</Label>
          <Input placeholder="ex: São Paulo" value={block.cidade} onChange={(e) => onChange(block.id, "cidade", e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Estado</Label>
          <Input placeholder="ex: SP" value={block.estado} onChange={(e) => onChange(block.id, "estado", e.target.value)} className="bg-secondary border-border" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Quantidade</Label>
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
    </div>
  );
}
