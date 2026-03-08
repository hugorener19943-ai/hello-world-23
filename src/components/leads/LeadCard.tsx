import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, ExternalLink, Flame, Thermometer, Snowflake, Phone, Mail, Globe, MessageCircle } from "lucide-react";
import type { LeadWithOrigin } from "./types";
import { useToast } from "@/hooks/use-toast";

interface LeadCardProps {
  lead: LeadWithOrigin;
  selected?: boolean;
  onToggleSelect?: () => void;
}

function tempCardClass(temp?: string) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return "border-l-4 border-l-destructive bg-destructive/5";
  if (t.includes("morno")) return "border-l-4 border-l-yellow-500 bg-yellow-500/5";
  return "border-l-4 border-l-muted-foreground/30 bg-muted/20";
}

function tempBadgeClass(temp?: string) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return "bg-destructive/15 text-destructive border-destructive/30";
  if (t.includes("morno")) return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
  return "bg-muted text-muted-foreground border-border";
}

function TempIcon({ temp }: { temp?: string }) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return <Flame className="h-4 w-4 text-destructive" />;
  if (t.includes("morno")) return <Thermometer className="h-4 w-4 text-yellow-500" />;
  return <Snowflake className="h-4 w-4 text-muted-foreground" />;
}

function ScoreBar({ score }: { score?: number }) {
  const val = score ?? 0;
  const pct = Math.min(100, Math.round((val / 200) * 100));
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs font-bold text-foreground min-w-[2rem] text-right">{val}</span>
    </div>
  );
}

export function LeadCard({ lead, selected = false, onToggleSelect }: LeadCardProps) {
  const { toast } = useToast();
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  return (
    <div className={`rounded-lg border bg-card p-5 space-y-3 transition-all hover:shadow-lg hover:shadow-neon/5 ${tempCardClass(lead.temperatura_lead)} ${selected ? "ring-2 ring-primary border-primary" : "border-border"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {onToggleSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              className="shrink-0"
            />
          )}
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{lead.nome}</h3>
        </div>
        <TempIcon temp={lead.temperatura_lead} />
      </div>

      <Badge variant="secondary" className="text-[10px]">{lead.originLabel}</Badge>

      <ScoreBar score={lead.score} />

      <div className="flex flex-wrap gap-1.5">
        {lead.temperatura_lead && <Badge variant="outline" className={`text-[10px] ${tempBadgeClass(lead.temperatura_lead)}`}>{lead.temperatura_lead}</Badge>}
        {lead.prioridade_comercial && <Badge variant="outline" className="text-[10px]">{lead.prioridade_comercial}</Badge>}
        {lead.canal_sugerido && <Badge variant="outline" className="text-[10px]">{lead.canal_sugerido}</Badge>}
      </div>

      <div className="text-xs space-y-1.5 text-muted-foreground">
        {lead.telefone_raw && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {lead.telefone_raw}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => copyText(lead.telefone_raw!, "Telefone")}><Copy className="h-3 w-3" /></Button>
              <a href={`https://wa.me/${lead.telefone_raw.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-neon hover:text-neon"><MessageCircle className="h-3 w-3" /></Button>
              </a>
            </div>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" /> {lead.email}</span>
            <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => copyText(lead.email!, "Email")}><Copy className="h-3 w-3" /></Button>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center justify-between">
            <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-neon hover:underline truncate">
              <Globe className="h-3 w-3 shrink-0" /> {lead.website}
            </a>
            <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-6 px-1.5"><ExternalLink className="h-3 w-3" /></Button>
            </a>
          </div>
        )}
      </div>

      {(lead.abordagem_sugerida || lead.tipo_automacao_indicada) && (
        <div className="border-t border-border pt-2.5 space-y-1.5 text-[11px] text-muted-foreground">
          {lead.tipo_automacao_indicada && <p><span className="font-semibold text-foreground">Automação:</span> {lead.tipo_automacao_indicada}</p>}
          {lead.abordagem_sugerida && <p><span className="font-semibold text-foreground">Abordagem:</span> {lead.abordagem_sugerida}</p>}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {lead.telefone_raw && (
          <a href={`https://wa.me/${lead.telefone_raw.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs h-8 border-neon text-neon hover:bg-primary hover:text-primary-foreground"><MessageCircle className="h-3 w-3 mr-1" /> WhatsApp</Button>
          </a>
        )}
        {lead.website && (
          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs h-8 border-border"><Globe className="h-3 w-3 mr-1" /> Website</Button>
          </a>
        )}
      </div>
    </div>
  );
}
