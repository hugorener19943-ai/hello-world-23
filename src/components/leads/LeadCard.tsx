import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Copy, ExternalLink, Flame, Thermometer, Snowflake, Phone, Mail, Globe,
  MessageCircle, Instagram, Linkedin, ChevronDown, ChevronUp, Zap,
  AlertTriangle, Cpu, Target, TrendingUp, ShieldAlert, MapPin, Star,
  FileText, Download, Heart
} from "lucide-react";
import type { LeadWithOrigin } from "./types";
import {
  getEffectiveScore, getEffectiveLevel, getLevelMicrocopy,
  getAutomationSignalsTyped, getTechBadges, getSalesTags,
  getPainText, getLeadSummary, getCommercialHooks, getScoreReasons,
  buildCommercialClipboard,
  type AutomationSignal,
} from "./types";
import { useToast } from "@/hooks/use-toast";

interface LeadCardProps {
  lead: LeadWithOrigin;
  selected?: boolean;
  onToggleSelect?: () => void;
}

function levelConfig(level: string) {
  const l = level.toLowerCase();
  if (l.includes("muito quente")) return {
    color: "text-red-400", bg: "bg-red-500/15 border-red-500/30",
    icon: <Flame className="h-3.5 w-3.5 text-red-400" />, label: "Muito Quente",
    border: "border-l-red-500", glow: "shadow-red-500/10",
  };
  if (l.includes("quente")) return {
    color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30",
    icon: <Flame className="h-3.5 w-3.5 text-orange-400" />, label: "Quente",
    border: "border-l-orange-500", glow: "shadow-orange-500/10",
  };
  if (l.includes("morno") || l.includes("méd") || l.includes("med")) return {
    color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30",
    icon: <Thermometer className="h-3.5 w-3.5 text-yellow-400" />, label: "Morno",
    border: "border-l-yellow-500", glow: "shadow-yellow-500/10",
  };
  return {
    color: "text-muted-foreground", bg: "bg-muted/30 border-border",
    icon: <Snowflake className="h-3.5 w-3.5 text-muted-foreground" />, label: "Baixo",
    border: "border-l-muted-foreground/30", glow: "",
  };
}

function signalBadgeClass(type: AutomationSignal["type"]): string {
  switch (type) {
    case "problem": return "bg-destructive/10 text-destructive border-destructive/20";
    case "positive": return "bg-primary/10 text-neon border-primary/20";
    case "info": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score));
  const circumference = 2 * Math.PI * 15.5;
  const strokeDash = (pct / 100) * circumference;
  const strokeColor = score >= 60 ? "hsl(var(--neon))" : score >= 30 ? "hsl(50, 90%, 50%)" : "hsl(var(--muted-foreground))";

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke={strokeColor} strokeWidth="2.5"
          strokeDasharray={`${strokeDash} ${circumference - strokeDash}`} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black text-foreground leading-none">{score}</span>
        <span className="text-[8px] text-muted-foreground leading-none">/100</span>
      </div>
    </div>
  );
}

export function LeadCard({ lead, selected = false, onToggleSelect }: LeadCardProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const score = getEffectiveScore(lead);
  const level = getEffectiveLevel(lead);
  const config = levelConfig(level);
  const microcopy = getLevelMicrocopy(level);
  const signals = getAutomationSignalsTyped(lead);
  const techs = getTechBadges(lead);
  const salesTags = getSalesTags(lead);
  const pain = getPainText(lead.dor_operacional_score);
  const summary = getLeadSummary(lead);
  const hooks = getCommercialHooks(lead);
  const scoreReasons = getScoreReasons(lead);
  const site = lead.site || lead.website;
  const phone = lead.telefone || lead.telefone_raw;

  const contactCount = [phone, lead.email, lead.whatsapp || lead.whatsapp_link, site, lead.instagram, lead.linkedin].filter(Boolean).length;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  const copySummary = () => {
    const text = buildCommercialClipboard(lead);
    navigator.clipboard.writeText(text);
    toast({ title: "Resumo comercial copiado!" });
  };

  const exportLine = () => {
    const headers = ["nome", "telefone", "email", "site", "whatsapp", "instagram", "cidade", "estado", "automation_score", "automation_level"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const row = headers.map(h => esc((lead as any)[h] || (lead as any)[h === "telefone" ? "telefone_raw" : h] || ""));
    const csv = [headers.map(esc).join(","), row.join(",")].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lead_${(lead.nome || "lead").replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Lead exportado!" });
  };

  return (
    <div className={`rounded-xl border bg-card transition-all duration-200 hover:shadow-xl ${config.glow} border-l-4 ${config.border} ${selected ? "ring-2 ring-primary border-primary" : "border-border"}`}>
      {/* ═══ 1. HEADER ═══ */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <Checkbox checked={selected} onCheckedChange={onToggleSelect} className="shrink-0 mt-1" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-[15px] leading-tight line-clamp-2">{lead.nome || "Sem nome"}</h3>
            {lead.categoria && <p className="text-[11px] text-muted-foreground mt-0.5">{lead.categoria}</p>}
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground">{[lead.cidade, lead.estado].filter(Boolean).join(", ") || "—"}</span>
            </div>
            {(lead.subnicho_origem || lead.bairro_origem) && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {lead.subnicho_origem && <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-border text-muted-foreground">{lead.subnicho_origem}</Badge>}
                {lead.bairro_origem && <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-border text-muted-foreground">{lead.bairro_origem}</Badge>}
              </div>
            )}
          </div>

          {/* ═══ 2. SCORE & LEVEL ═══ */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <ScoreRing score={score} />
            <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 ${config.bg} ${config.color} border font-bold`}>
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Badge>
            <span className="text-[9px] text-muted-foreground text-center leading-tight">{microcopy}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3">
        {/* ═══ 3. CONTACT — "Canais encontrados" ═══ */}
        {contactCount > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Phone className="h-3 w-3" /> Canais encontrados
              <Badge variant="outline" className="text-[9px] h-4 px-1 ml-1 border-border">{contactCount}</Badge>
            </p>
            <div className="text-xs space-y-1 text-muted-foreground">
              {phone && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" /> {phone}</span>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyText(phone, "Telefone")}><Copy className="h-2.5 w-2.5" /></Button>
                  </div>
                </div>
              )}
              {(lead.whatsapp || lead.whatsapp_link) && (
                <div className="flex items-center justify-between">
                  <a href={lead.whatsapp_link || `https://wa.me/${(lead.whatsapp || phone || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-neon hover:underline font-medium">
                    <MessageCircle className="h-3 w-3 shrink-0" /> {lead.whatsapp || "WhatsApp"}
                    {lead.whatsapp_confirmado && <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-primary/30 text-neon">✓</Badge>}
                  </a>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyText(lead.whatsapp || phone || "", "WhatsApp")}><Copy className="h-2.5 w-2.5" /></Button>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" /> {lead.email}</span>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyText(lead.email!, "Email")}><Copy className="h-2.5 w-2.5" /></Button>
                </div>
              )}
              {site && (
                <div className="flex items-center justify-between">
                  <a href={site.startsWith("http") ? site : `https://${site}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-neon hover:underline truncate max-w-[85%]">
                    <Globe className="h-3 w-3 shrink-0" /> <span className="truncate">{site.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                  </a>
                  <a href={site.startsWith("http") ? site : `https://${site}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0"><ExternalLink className="h-2.5 w-2.5" /></Button>
                  </a>
                </div>
              )}
              {lead.instagram && (
                <div className="flex items-center gap-1.5">
                  <Instagram className="h-3 w-3 shrink-0" />
                  <a href={lead.instagram.startsWith("http") ? lead.instagram : `https://instagram.com/${lead.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{lead.instagram}</a>
                  {lead.instagram_ativo && <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-primary/30 text-neon">ativo</Badge>}
                </div>
              )}
              {lead.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Linkedin className="h-3 w-3 shrink-0" />
                  <a href={lead.linkedin.startsWith("http") ? lead.linkedin : `https://linkedin.com/company/${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{lead.linkedin}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ 4. AUTOMATION SIGNALS ═══ */}
        {signals.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Sinais de Automação
            </p>
            <div className="flex flex-wrap gap-1">
              {signals.slice(0, expanded ? undefined : 5).map((s) => (
                <Badge key={s.label} variant="outline" className={`text-[10px] ${signalBadgeClass(s.type)}`}>
                  {s.type === "problem" ? "⚠" : s.type === "positive" ? "✓" : "ℹ"} {s.label}
                </Badge>
              ))}
              {!expanded && signals.length > 5 && (
                <Badge variant="outline" className="text-[10px] border-border text-muted-foreground cursor-pointer" onClick={() => setExpanded(true)}>
                  +{signals.length - 5} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* ═══ 5. TECH DETECTED ═══ */}
        {techs.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Cpu className="h-3 w-3" /> Tecnologias detectadas
            </p>
            <div className="flex flex-wrap gap-1">
              {techs.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px] bg-secondary/80 text-secondary-foreground border-border font-medium">{t}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 6. COMMERCIAL TAGS ═══ */}
        {salesTags.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Target className="h-3 w-3 text-neon" /> Gancho comercial detectado
            </p>
            <div className="flex flex-wrap gap-1.5">
              {salesTags.map((t) => (
                <Badge key={t.tag} className="text-[10px] bg-primary/15 text-neon border border-primary/30 font-bold px-2 py-0.5">
                  🎯 {t.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 7. EXECUTIVE SUMMARY ═══ */}
        <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
            <FileText className="h-3 w-3" /> Resumo Executivo
          </p>
          <p className="text-[12px] text-foreground/90 leading-relaxed">{summary}</p>
        </div>

        {/* Google Rating */}
        {(lead.google_nota != null || lead.google_avaliacoes != null) && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-400" />
            <span className="font-semibold">{lead.google_nota ?? "—"}</span>
            <span>({lead.google_avaliacoes ?? 0} avaliações)</span>
          </div>
        )}

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-neon transition-colors py-1 rounded-md hover:bg-primary/5"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Recolher diagnóstico</> : <><ChevronDown className="h-3 w-3" /> Ver diagnóstico completo</>}
        </button>

        {/* ═══ EXPANDED DETAIL ═══ */}
        {expanded && (
          <div className="space-y-4 border-t border-border pt-3 animate-fade-in">
            {/* Pain Score */}
            {lead.dor_operacional_score != null && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Dor Operacional</p>
                <Progress value={Math.min(100, lead.dor_operacional_score)} className="h-2" />
                <p className={`text-[11px] leading-relaxed ${pain.level === "high" ? "text-destructive" : pain.level === "medium" ? "text-yellow-400" : "text-muted-foreground"}`}>{pain.text}</p>
              </div>
            )}

            {/* Score Reasons */}
            {scoreReasons.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Motivos do Score
                </p>
                <div className="space-y-1">
                  {scoreReasons.map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-muted/30">
                      <span className="text-foreground/80">{r.label}</span>
                      <span className="font-bold text-neon">+{r.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score breakdown grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {lead.intent_score != null && <div className="flex justify-between border-b border-border/30 pb-0.5"><span className="text-muted-foreground">Intenção</span><span className="font-bold">{lead.intent_score}</span></div>}
              {lead.site_weak_score != null && <div className="flex justify-between border-b border-border/30 pb-0.5"><span className="text-muted-foreground">Site fraco</span><span className="font-bold">{lead.site_weak_score}</span></div>}
              {lead.chatbot_score != null && <div className="flex justify-between border-b border-border/30 pb-0.5"><span className="text-muted-foreground">Chatbot</span><span className="font-bold">{lead.chatbot_score}</span></div>}
              {lead.whatsapp_score != null && <div className="flex justify-between border-b border-border/30 pb-0.5"><span className="text-muted-foreground">WhatsApp</span><span className="font-bold">{lead.whatsapp_score}</span></div>}
              {lead.form_score != null && <div className="flex justify-between border-b border-border/30 pb-0.5"><span className="text-muted-foreground">Formulário</span><span className="font-bold">{lead.form_score}</span></div>}
              {lead.crm_score != null && <div className="flex justify-between border-b border-border/30 pb-0.5"><span className="text-muted-foreground">CRM</span><span className="font-bold">{lead.crm_score}</span></div>}
            </div>

            {/* Commercial Hooks */}
            {hooks.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Zap className="h-3 w-3 text-neon" /> Ganchos Comerciais Sugeridos</p>
                {hooks.map((h) => (
                  <div key={h} className="flex items-start gap-2 text-[11px] px-2.5 py-1.5 rounded-lg bg-primary/5 text-foreground/90 border border-primary/10">
                    <TrendingUp className="h-3 w-3 text-neon shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Extra contacts */}
            {lead.emails_all && lead.emails_all.length > 1 && (
              <div className="text-[11px] text-muted-foreground"><span className="font-bold">Outros emails:</span> {lead.emails_all.join(", ")}</div>
            )}
            {lead.telefones_all && lead.telefones_all.length > 1 && (
              <div className="text-[11px] text-muted-foreground"><span className="font-bold">Outros telefones:</span> {lead.telefones_all.join(", ")}</div>
            )}
          </div>
        )}

        {/* ═══ 8. ACTIONS ═══ */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(lead.whatsapp || lead.whatsapp_link || phone) && (
            <a href={lead.whatsapp_link || `https://wa.me/${(lead.whatsapp || phone || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[100px]">
              <Button variant="outline" size="sm" className="w-full text-xs h-8 border-neon text-neon hover:bg-primary hover:text-primary-foreground font-semibold">
                <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
              </Button>
            </a>
          )}
          {site && (
            <a href={site.startsWith("http") ? site : `https://${site}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[80px]">
              <Button variant="outline" size="sm" className="w-full text-xs h-8 border-border"><Globe className="h-3 w-3 mr-1" /> Site</Button>
            </a>
          )}
          <Button variant="outline" size="sm" className="text-xs h-8 border-border px-2" onClick={copySummary} title="Copiar resumo comercial">
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8 border-border px-2" onClick={exportLine} title="Exportar lead">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
