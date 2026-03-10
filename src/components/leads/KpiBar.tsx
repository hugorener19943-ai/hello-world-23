import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Mail, MessageCircle, Globe, Flame, Zap, Instagram } from "lucide-react";
import type { LeadWithOrigin, ApiResponseMeta } from "./types";
import { getEffectiveScore, getEffectiveLevel, getTechBadges } from "./types";

interface KpiBarProps {
  leads: LeadWithOrigin[];
  meta?: ApiResponseMeta;
  onFilterClick?: (filter: string) => void;
}

export function KpiBar({ leads, meta, onFilterClick }: KpiBarProps) {
  const total = meta?.total ?? leads.length;
  const totalUnicos = meta?.total_unicos ?? leads.length;
  const totalEnriquecidos = meta?.total_enriquecidos ?? leads.filter(l => l.automation_score != null || l.score_automacao != null).length;
  const comWhatsapp = meta?.total_com_whatsapp ?? leads.filter(l => l.whatsapp || l.whatsapp_link).length;
  const comEmail = meta?.total_com_email ?? leads.filter(l => l.email).length;
  const comInstagram = meta?.total_com_instagram ?? leads.filter(l => l.instagram).length;
  const semSite = meta?.total_sem_site ?? leads.filter(l => !l.site && !l.website).length;

  const quentes = leads.filter(l => { const lv = getEffectiveLevel(l); return lv.includes("quente") && !lv.includes("muito"); }).length;
  const muitoQuentes = leads.filter(l => getEffectiveLevel(l).includes("muito quente")).length;

  const wpCount = leads.filter(l => getTechBadges(l).includes("WordPress")).length;
  const wixCount = leads.filter(l => getTechBadges(l).includes("Wix")).length;
  const shopifyCount = leads.filter(l => getTechBadges(l).includes("Shopify")).length;

  const kpis = [
    { label: "Total", value: total, icon: <Users className="h-3.5 w-3.5" />, filter: "" },
    { label: "Únicos", value: totalUnicos, icon: <TrendingUp className="h-3.5 w-3.5" />, filter: "" },
    { label: "Enriquecidos", value: totalEnriquecidos, icon: <Zap className="h-3.5 w-3.5 text-neon" />, filter: "" },
    { label: "WhatsApp", value: comWhatsapp, icon: <MessageCircle className="h-3.5 w-3.5 text-neon" />, filter: "com_whatsapp" },
    { label: "Email", value: comEmail, icon: <Mail className="h-3.5 w-3.5" />, filter: "com_email" },
    { label: "Instagram", value: comInstagram, icon: <Instagram className="h-3.5 w-3.5" />, filter: "com_instagram" },
    { label: "Sem site", value: semSite, icon: <Globe className="h-3.5 w-3.5 text-destructive" />, filter: "sem_site" },
    { label: "Quentes", value: quentes, icon: <Flame className="h-3.5 w-3.5 text-orange-400" />, filter: "quente" },
    { label: "Muito Quentes", value: muitoQuentes, icon: <Flame className="h-3.5 w-3.5 text-red-400" />, filter: "muito_quente" },
  ];

  const techKpis = [
    { label: "WordPress", value: wpCount, filter: "tech_wordpress" },
    { label: "Wix", value: wixCount, filter: "tech_wix" },
    { label: "Shopify", value: shopifyCount, filter: "tech_shopify" },
  ].filter(t => t.value > 0);

  return (
    <div className="rounded-lg border border-primary/30 bg-card p-4 space-y-3">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-neon" /> Métricas da Busca
      </p>
      <div className="flex flex-wrap gap-2">
        {kpis.map((k) => (
          <button
            key={k.label}
            onClick={() => k.filter && onFilterClick?.(k.filter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${
              k.filter ? "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer" : "border-border cursor-default"
            }`}
          >
            {k.icon}
            <span className="text-foreground font-bold">{k.value}</span>
            <span className="text-muted-foreground">{k.label}</span>
          </button>
        ))}
      </div>
      {techKpis.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {techKpis.map((t) => (
            <button
              key={t.label}
              onClick={() => onFilterClick?.(t.filter)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-all"
            >
              <Zap className="h-3 w-3 text-neon" />
              <span className="text-foreground font-bold">{t.value}</span>
              <span className="text-muted-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
