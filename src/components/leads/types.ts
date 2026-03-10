export interface SearchBlock {
  id: string;
  query: string;
  subnichos: string[];
  cidade: string;
  estado: string;
  bairros: string[];
  targetTotal: number;
}

/** Full lead from the enriched API */
export interface LeadAutomacao {
  // Basic
  nome: string;
  telefone?: string;
  telefone_raw?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  categoria?: string;
  fonte?: string;
  query_origem?: string;
  subnicho_origem?: string;
  bairro_origem?: string;
  google_nota?: number;
  google_avaliacoes?: number;

  // Contact
  site?: string;
  email?: string;
  emails_all?: string[];
  telefones_all?: string[];
  whatsapp?: string;
  whatsapp_link?: string;
  whatsapp_site?: string;
  whatsapp_links_all?: string[];
  whatsapp_confirmado?: boolean;
  instagram?: string;
  instagram_all?: string[];
  instagram_ativo?: boolean;
  linkedin?: string;
  linkedin_all?: string[];
  contact_url?: string;
  contact_url_resolved?: string;

  // Automation signals
  tem_chatbot?: boolean;
  chatbot_present?: boolean;
  crm_present?: boolean;
  crm_detected_keywords?: string[];
  whatsapp_manual?: boolean;
  form_is_poor?: boolean;
  has_form?: boolean;
  form_count?: number;
  input_count?: number;
  has_script?: boolean;
  has_css?: boolean;
  has_title?: boolean;
  has_meta_description?: boolean;
  site_uses_https?: boolean;
  weak_site_signals?: string[];
  intent_keywords?: string[];
  intent_keyword_count?: number;

  // Tech
  site_platform?: string;
  site_builder?: string;
  site_tech_stack?: string[];
  tech_detection?: Record<string, boolean>;

  // Commercial segments
  segment_wordpress_sem_automacao?: boolean;
  segment_wix_com_whatsapp_manual?: boolean;
  segment_shopify_sem_chatbot?: boolean;
  automation_sales_tags?: string[];

  // Scoring
  intent_score?: number;
  site_weak_score?: number;
  chatbot_score?: number;
  whatsapp_score?: number;
  form_score?: number;
  crm_score?: number;
  dor_operacional_score?: number;
  maturidade_score?: number;
  commercial_hook_score?: number;
  automation_score?: number;
  automation_level?: string;
  lead_para_automacao?: boolean;

  // API-returned reasons/hooks
  score_reasons?: string[];
  commercial_hooks?: string[];

  // Misc
  unique_key?: string;
  unique_source_id?: string;
  score_automacao?: number;
  nivel_automacao?: string;
  lead_qualificado?: boolean;
  cache_hit?: boolean;

  // Legacy compat
  score?: number;
  temperatura_lead?: string;
  prioridade_comercial?: string;
  canal_sugerido?: string;
  abordagem_sugerida?: string;
  tipo_automacao_indicada?: string;
  motivo_automacao?: string;
  perfil_automacao?: string;
  website?: string;
  telefone_raw_legacy?: string;
  whatsapp_link_legacy?: string;
  fsq_id?: string;
  nicho?: string;
}

export interface LeadWithOrigin extends LeadAutomacao {
  originBlockIndex: number;
  originLabel: string;
}

/** API response summary */
export interface ApiResponseMeta {
  status?: string;
  total?: number;
  total_unicos?: number;
  total_enriquecidos?: number;
  total_qualificados?: number;
  total_com_email?: number;
  total_com_whatsapp?: number;
  total_com_instagram?: number;
  total_sem_site?: number;
  preview_count?: number;
}

// ─── Helpers ────────────────────────────────────────────

export function getEffectiveScore(lead: LeadAutomacao): number {
  return lead.automation_score ?? lead.score_automacao ?? lead.score ?? 0;
}

export function getEffectiveLevel(lead: LeadAutomacao): string {
  const score = getEffectiveScore(lead);
  if (lead.automation_level) return lead.automation_level.toLowerCase();
  if (lead.nivel_automacao) return lead.nivel_automacao.toLowerCase();
  if (lead.temperatura_lead) return lead.temperatura_lead.toLowerCase();
  if (score >= 90) return "muito quente";
  if (score >= 45) return "quente";
  if (score >= 25) return "morno";
  return "baixo";
}

export function getLevelMicrocopy(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("muito quente")) return "Alta prioridade comercial";
  if (l.includes("quente")) return "Boa oportunidade";
  if (l.includes("morno") || l.includes("méd") || l.includes("med")) return "Estrutura intermediária";
  return "Baixo potencial imediato";
}

export function isHotLead(lead: LeadAutomacao): boolean {
  if (lead.lead_para_automacao) return true;
  if (getEffectiveScore(lead) >= 8) return true;
  if ((lead.dor_operacional_score ?? 0) >= 8) return true;
  const level = getEffectiveLevel(lead);
  if (level.includes("quente") || level.includes("morno")) return true;
  return false;
}

export type SignalType = "problem" | "info" | "positive";

export interface AutomationSignal {
  label: string;
  type: SignalType;
}

export function getAutomationSignals(lead: LeadAutomacao): string[] {
  return getAutomationSignalsTyped(lead).map(s => s.label);
}

export function getAutomationSignalsTyped(lead: LeadAutomacao): AutomationSignal[] {
  const signals: AutomationSignal[] = [];
  if (lead.tem_chatbot === false || lead.chatbot_present === false) signals.push({ label: "Sem chatbot", type: "problem" });
  if (lead.whatsapp_manual) signals.push({ label: "WhatsApp manual", type: "problem" });
  if (lead.crm_present === false) signals.push({ label: "Sem CRM visível", type: "problem" });
  if (lead.form_is_poor) signals.push({ label: "Formulário ruim", type: "problem" });
  if (lead.site_uses_https === false) signals.push({ label: "Site sem HTTPS", type: "problem" });
  if (lead.has_meta_description === false) signals.push({ label: "Sem meta description", type: "problem" });
  if (lead.has_form === false) signals.push({ label: "Sem formulário", type: "problem" });

  // Positive signals
  if (lead.instagram_ativo) signals.push({ label: "Instagram ativo", type: "positive" });
  if (lead.whatsapp_confirmado) signals.push({ label: "WhatsApp confirmado", type: "positive" });
  if (lead.contact_url || lead.contact_url_resolved) signals.push({ label: "Contato detectado", type: "info" });

  if (lead.weak_site_signals?.length) {
    for (const s of lead.weak_site_signals) {
      if (!signals.some(x => x.label === s)) signals.push({ label: s, type: "problem" });
    }
  }
  if (lead.intent_keywords?.length) {
    for (const kw of lead.intent_keywords) {
      if (kw.toLowerCase().includes("agendamento") && !signals.some(x => x.label.includes("agendamento")))
        signals.push({ label: "Página com agendamento", type: "info" });
      if ((kw.toLowerCase().includes("orçamento") || kw.toLowerCase().includes("orcamento")) && !signals.some(x => x.label.includes("orçamento")))
        signals.push({ label: "Página com orçamento", type: "info" });
    }
  }

  return signals;
}

export function getTechBadges(lead: LeadAutomacao): string[] {
  const techs: string[] = [];
  const platform = (lead.site_platform || "").toLowerCase();
  const builder = (lead.site_builder || "").toLowerCase();
  const stack = lead.site_tech_stack || [];
  const detection = lead.tech_detection || {};

  const knownTechs = [
    "WordPress", "Elementor", "WooCommerce", "Wix", "Shopify", "Webflow",
    "Hubspot", "RD Station", "ActiveCampaign", "LeadLovers"
  ];

  for (const tech of knownTechs) {
    const lower = tech.toLowerCase();
    if (platform.includes(lower) || builder.includes(lower) ||
        stack.some(s => s.toLowerCase().includes(lower)) ||
        detection[tech] || detection[lower]) {
      techs.push(tech);
    }
  }
  return techs;
}

export function getSalesTags(lead: LeadAutomacao): { tag: string; label: string }[] {
  const tags: { tag: string; label: string }[] = [];
  if (lead.segment_wordpress_sem_automacao) tags.push({ tag: "wordpress_sem_automacao", label: "WordPress sem automação" });
  if (lead.segment_wix_com_whatsapp_manual) tags.push({ tag: "wix_com_whatsapp_manual", label: "Wix com WhatsApp manual" });
  if (lead.segment_shopify_sem_chatbot) tags.push({ tag: "shopify_sem_chatbot", label: "Shopify sem chatbot" });
  if (lead.automation_sales_tags?.length) {
    for (const t of lead.automation_sales_tags) {
      if (!tags.some(x => x.tag === t)) tags.push({ tag: t, label: t.replace(/_/g, " ") });
    }
  }
  return tags;
}

export function getPainText(score?: number): { text: string; level: "high" | "medium" | "low" } {
  const s = score ?? 0;
  if (s >= 70) return { text: "Alta dor operacional: sinais de atendimento manual e baixa estrutura digital.", level: "high" };
  if (s >= 40) return { text: "Há oportunidades claras de automação e melhoria de conversão.", level: "medium" };
  return { text: "Estrutura digital mais madura, menor urgência de automação.", level: "low" };
}

export function getLeadSummary(lead: LeadAutomacao): string {
  const techs = getTechBadges(lead);
  const signals = getAutomationSignals(lead);
  const score = getEffectiveScore(lead);
  const parts: string[] = [];

  // Platform-specific
  if (techs.includes("Shopify") && signals.includes("Sem chatbot")) {
    parts.push("Loja com tecnologia Shopify e ausência de chatbot, indicando potencial para automação de atendimento e conversão.");
  } else if (techs.includes("Wix") && (signals.includes("WhatsApp manual") || signals.includes("Formulário ruim"))) {
    parts.push("Site em Wix com WhatsApp manual e formulário fraco, bom candidato para automação de captura.");
  } else if (techs.includes("WordPress") && (signals.includes("Sem CRM visível") || signals.includes("Sem chatbot"))) {
    parts.push("Site em WordPress com baixa maturidade operacional, bom candidato para CRM, automação e melhoria de captura.");
  } else if (signals.includes("Página com agendamento") && signals.includes("Sem chatbot")) {
    parts.push("Lead com oportunidade clara para chatbot e funil comercial. Há intenção de contato/agendamento e baixa evidência de automação.");
  } else {
    // Generic summary based on signals
    const problems: string[] = [];
    if (signals.includes("WhatsApp manual") || lead.whatsapp) problems.push("usa WhatsApp manual");
    if (signals.includes("Sem CRM visível")) problems.push("não apresenta CRM visível");
    if (signals.includes("Sem chatbot")) problems.push("sem chatbot detectado");
    if (signals.includes("Formulário ruim") || signals.includes("Sem formulário")) problems.push("possui sinais de estrutura digital fraca");

    if (problems.length >= 2) {
      parts.push(`Empresa com forte potencial para automação. ${problems.slice(0, 3).map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p).join(", ")}.`);
    } else if (score >= 70) {
      parts.push("Lead com alto potencial de automação comercial. Múltiplos sinais de oportunidade detectados.");
    } else if (signals.length > 0) {
      parts.push("Lead identificado com oportunidade de melhoria digital e potencial de automação.");
    } else {
      parts.push("Lead mapeado com dados básicos. Análise de estrutura digital disponível.");
    }
  }

  return parts[0];
}

export interface ScoreReason {
  label: string;
  points: number;
}

export function getScoreReasons(lead: LeadAutomacao): ScoreReason[] {
  const reasons: ScoreReason[] = [];
  if (lead.chatbot_score != null && lead.chatbot_score > 0) reasons.push({ label: "Sem chatbot", points: lead.chatbot_score });
  else if (lead.tem_chatbot === false || lead.chatbot_present === false) reasons.push({ label: "Sem chatbot", points: 20 });

  if (lead.whatsapp_score != null && lead.whatsapp_score > 0) reasons.push({ label: "WhatsApp manual", points: lead.whatsapp_score });
  else if (lead.whatsapp_manual) reasons.push({ label: "WhatsApp manual", points: 15 });

  if (lead.crm_score != null && lead.crm_score > 0) reasons.push({ label: "Sem CRM visível", points: lead.crm_score });
  else if (lead.crm_present === false) reasons.push({ label: "Sem CRM visível", points: 20 });

  if (lead.form_score != null && lead.form_score > 0) reasons.push({ label: "Formulário ruim", points: lead.form_score });
  else if (lead.form_is_poor) reasons.push({ label: "Formulário ruim", points: 15 });

  if (lead.intent_score != null && lead.intent_score > 0) reasons.push({ label: "Palavras de intenção detectadas", points: lead.intent_score });
  else if (lead.intent_keywords?.length) reasons.push({ label: "Palavras de intenção detectadas", points: 20 });

  if (lead.site_weak_score != null && lead.site_weak_score > 0) reasons.push({ label: "Site fraco / sinais negativos", points: lead.site_weak_score });

  return reasons.sort((a, b) => b.points - a.points);
}

export function getCommercialHooks(lead: LeadAutomacao): string[] {
  const hooks: string[] = [];
  const signals = getAutomationSignals(lead);

  if (signals.includes("WhatsApp manual") || lead.whatsapp) hooks.push("Oferecer automação de atendimento via WhatsApp");
  if (signals.includes("Sem chatbot")) hooks.push("Oferecer chatbot para triagem e qualificação");
  if (signals.includes("Sem CRM visível")) hooks.push("Oferecer CRM e funil comercial");
  if (signals.includes("Formulário ruim") || signals.includes("Sem formulário")) hooks.push("Oferecer landing page com captação melhor");
  if (lead.whatsapp_manual) hooks.push("Oferecer recuperação de leads");
  if (hooks.length > 0) hooks.push("Oferecer integração WhatsApp + CRM + automação");

  return [...new Set(hooks)].slice(0, 6);
}

export function buildCommercialClipboard(lead: LeadAutomacao): string {
  const score = getEffectiveScore(lead);
  const level = getEffectiveLevel(lead);
  const summary = getLeadSummary(lead);
  const hooks = getCommercialHooks(lead);
  const site = lead.site || lead.website || "";

  const lines = [
    `📊 ${lead.nome || "Lead"} — Score: ${score}/100 (${level})`,
    `📍 ${[lead.cidade, lead.estado].filter(Boolean).join("/")}${lead.categoria ? ` • ${lead.categoria}` : ""}`,
    "",
    `💡 ${summary}`,
    "",
  ];

  if (lead.whatsapp || lead.telefone || lead.telefone_raw) lines.push(`📞 ${lead.whatsapp || lead.telefone || lead.telefone_raw}`);
  if (lead.email) lines.push(`📧 ${lead.email}`);
  if (site) lines.push(`🌐 ${site}`);

  if (hooks.length > 0) {
    lines.push("", "🎯 Oportunidades:");
    hooks.forEach(h => lines.push(`  • ${h}`));
  }

  return lines.join("\n");
}
