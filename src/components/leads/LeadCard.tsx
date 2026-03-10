import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, ExternalLink, Flame, Thermometer, Snowflake, Phone, Mail, Globe, MessageCircle, Instagram, Linkedin, ChevronDown, ChevronUp, Zap, AlertTriangle, Cpu, Target, TrendingUp, Bot, ShieldAlert } from "lucide-react";
import type { LeadWithOrigin } from "./types";
import { getEffectiveScore, getEffectiveLevel, getAutomationSignals, getTechBadges, getSalesTags, getPainText, getLeadSummary, getCommercialHooks } from "./types";
import { useToast } from "@/hooks/use-toast";

interface LeadCardProps {
  lead: LeadWithOrigin;
  selected?: boolean;
  onToggleSelect?: () => void;
}

function levelConfig(level: string) {
  const l = level.toLowerCase();
  if (l.includes("muito quente")) return { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: <Flame className="h-4 w-4 text-red-400" />, label: "Muito Quente", border: "border-l-red-500" };
  if (l.includes("quente")) return { color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", icon: <Flame className="h-4 w-4 text-orange-400" />, label: "Quente", border: "border-l-orange-500" };
  if (l.includes("méd") || l.includes("med")) return { color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30", icon: <Thermometer className="h-4 w-4 text-yellow-400" />, label: "Médio", border: "border-l-yellow-500" };
  return { color: "text-muted-foreground", bg: "bg-muted/30 border-border", icon: <Snowflake className="h-4 w-4 text-muted-foreground" />, label: "Baixo", border: "border-l-muted-foreground/30" };
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score));
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke={score >= 60 ? "hsl(var(--neon))" : score >= 30 ? "hsl(50, 90%, 50%)" : "hsl(var(--muted-foreground))"} strokeWidth="3" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground">{score}</span>
    </div>
  );
}

export function LeadCard({ lead, selected = false, onToggleSelect }: LeadCardProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const score = getEffectiveScore(lead);
  const level = getEffectiveLevel(lead);
  const config = levelConfig(level);
  const signals = getAutomationSignals(lead);
  const techs = getTechBadges(lead);
  const salesTags = getSalesTags(lead);
  const pain = getPainText(lead.dor_operacional_score);
  const summary = getLeadSummary(lead);
  const hooks = getCommercialHooks(lead);
  const site = lead.site || lead.website;
  const phone = lead.telefone || lead.telefone_raw;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  return (
    <div className={`rounded-lg border bg-card p-4 space-y-3 transition-all hover:shadow-lg hover:shadow-neon/5 border-l-4 ${config.border} ${selected ? "ring-2 ring-primary border-primary" : "border-border"}`}>
      {/* TOP */}
      <div className="flex items-start gap-3">
        {onToggleSelect && (
          <Checkbox checked={selected} onCheckedChange={onToggleSelect} className="shrink-0 mt-1" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2">{lead.nome || "Sem nome"}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {[lead.cidade, lead.estado].filter(Boolean).join("/")}{lead.categoria ? ` • ${lead.categoria}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`text-[10px] ${config.bg} ${config.color} border`}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
          <ScoreRing score={score} />
        </div>
      </div>

      {/* Summary */}
      <p className="text-[11px] italic text-neon leading-tight">💡 {summary}</p>

      {/* CONTACT */}
      <div className="text-xs space-y-1 text-muted-foreground">
        {phone && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {phone}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => copyText(phone, "Telefone")}><Copy className="h-3 w-3" /></Button>
              {(lead.whatsapp || lead.whatsapp_link) && (
                <a href={lead.whatsapp_link || `https://wa.me/${(lead.whatsapp || phone).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="h-6 px-1.5 text-neon"><MessageCircle className="h-3 w-3" /></Button>
                </a>
              )}
            </div>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" /> {lead.email}</span>
            <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => copyText(lead.email!, "Email")}><Copy className="h-3 w-3" /></Button>
          </div>
        )}
        {site && (
          <div className="flex items-center justify-between">
            <a href={site.startsWith("http") ? site : `https://${site}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-neon hover:underline truncate">
              <Globe className="h-3 w-3 shrink-0" /> {site}
            </a>
            <a href={site.startsWith("http") ? site : `https://${site}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-6 px-1.5"><ExternalLink className="h-3 w-3" /></Button>
            </a>
          </div>
        )}
        {lead.instagram && (
          <div className="flex items-center gap-1.5">
            <Instagram className="h-3 w-3 shrink-0" />
            <a href={lead.instagram.startsWith("http") ? lead.instagram : `https://instagram.com/${lead.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-neon hover:underline truncate">{lead.instagram}</a>
          </div>
        )}
        {lead.linkedin && (
          <div className="flex items-center gap-1.5">
            <Linkedin className="h-3 w-3 shrink-0" />
            <a href={lead.linkedin.startsWith("http") ? lead.linkedin : `https://linkedin.com/company/${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-neon hover:underline truncate">{lead.linkedin}</a>
          </div>
        )}
      </div>

      {/* Automation Signals */}
      {signals.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Sinais de Automação</p>
          <div className="flex flex-wrap gap-1">
            {signals.slice(0, expanded ? undefined : 4).map((s) => (
              <Badge key={s} variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">{s}</Badge>
            ))}
            {!expanded && signals.length > 4 && <Badge variant="outline" className="text-[10px]">+{signals.length - 4}</Badge>}
          </div>
        </div>
      )}

      {/* Tech Badges */}
      {techs.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Cpu className="h-3 w-3" /> Tecnologia</p>
          <div className="flex flex-wrap gap-1">
            {techs.map((t) => (
              <Badge key={t} variant="outline" className="text-[10px] bg-secondary text-secondary-foreground border-border">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sales Tags */}
      {salesTags.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Target className="h-3 w-3" /> Gancho Comercial</p>
          <div className="flex flex-wrap gap-1">
            {salesTags.map((t) => (
              <Badge key={t.tag} variant="outline" className="text-[10px] bg-primary/10 text-neon border-primary/30">🎯 {t.label}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Google Rating */}
      {(lead.google_nota != null || lead.google_avaliacoes != null) && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>⭐ {lead.google_nota ?? "—"}</span>
          <span>({lead.google_avaliacoes ?? 0} avaliações)</span>
        </div>
      )}

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors pt-1"
      >
        {expanded ? <><ChevronUp className="h-3 w-3" /> Recolher</> : <><ChevronDown className="h-3 w-3" /> Ver diagnóstico completo</>}
      </button>

      {/* EXPANDED DETAIL */}
      {expanded && (
        <div className="space-y-3 border-t border-border pt-3 animate-fade-in">
          {/* Pain Score */}
          {lead.dor_operacional_score != null && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Dor Operacional</p>
              <Progress value={Math.min(100, lead.dor_operacional_score)} className="h-2" />
              <p className={`text-[11px] ${pain.level === "high" ? "text-destructive" : pain.level === "medium" ? "text-yellow-400" : "text-muted-foreground"}`}>{pain.text}</p>
            </div>
          )}

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {lead.intent_score != null && <div className="flex justify-between"><span className="text-muted-foreground">Intenção</span><span className="font-bold">{lead.intent_score}</span></div>}
            {lead.site_weak_score != null && <div className="flex justify-between"><span className="text-muted-foreground">Site fraco</span><span className="font-bold">{lead.site_weak_score}</span></div>}
            {lead.chatbot_score != null && <div className="flex justify-between"><span className="text-muted-foreground">Chatbot</span><span className="font-bold">{lead.chatbot_score}</span></div>}
            {lead.whatsapp_score != null && <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp</span><span className="font-bold">{lead.whatsapp_score}</span></div>}
            {lead.form_score != null && <div className="flex justify-between"><span className="text-muted-foreground">Formulário</span><span className="font-bold">{lead.form_score}</span></div>}
            {lead.crm_score != null && <div className="flex justify-between"><span className="text-muted-foreground">CRM</span><span className="font-bold">{lead.crm_score}</span></div>}
          </div>

          {/* Commercial Hooks */}
          {hooks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Zap className="h-3 w-3" /> Oportunidades de Venda</p>
              {hooks.map((h) => (
                <div key={h} className="flex items-start gap-2 text-[11px] px-2 py-1.5 rounded bg-primary/5 text-foreground border border-primary/10">
                  <TrendingUp className="h-3 w-3 text-neon shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* All contacts expanded */}
          {lead.emails_all && lead.emails_all.length > 1 && (
            <div className="text-[11px] text-muted-foreground">
              <span className="font-bold">Outros emails:</span> {lead.emails_all.join(", ")}
            </div>
          )}
          {lead.telefones_all && lead.telefones_all.length > 1 && (
            <div className="text-[11px] text-muted-foreground">
              <span className="font-bold">Outros telefones:</span> {lead.telefones_all.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        {(lead.whatsapp || lead.whatsapp_link || phone) && (
          <a href={lead.whatsapp_link || `https://wa.me/${(lead.whatsapp || phone || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs h-8 border-neon text-neon hover:bg-primary hover:text-primary-foreground"><MessageCircle className="h-3 w-3 mr-1" /> WhatsApp</Button>
          </a>
        )}
        {site && (
          <a href={site.startsWith("http") ? site : `https://${site}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs h-8 border-border"><Globe className="h-3 w-3 mr-1" /> Website</Button>
          </a>
        )}
      </div>
    </div>
  );
}
