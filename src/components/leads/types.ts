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
  automation_score?: number;
  automation_level?: string;
  lead_para_automacao?: boolean;

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

// Helpers

export function getEffectiveScore(lead: LeadAutomacao): number {
  return lead.automation_score ?? lead.score_automacao ?? lead.score ?? 0;
}

export function getEffectiveLevel(lead: LeadAutomacao): string {
  const score = getEffectiveScore(lead);
  if (lead.automation_level) return lead.automation_level.toLowerCase();
  if (lead.nivel_automacao) return lead.nivel_automacao.toLowerCase();
  if (lead.temperatura_lead) return lead.temperatura_lead.toLowerCase();
  if (score >= 90) return "muito quente";
  if (score >= 60) return "quente";
  if (score >= 30) return "médio";
  return "baixo";
}

export function isHotLead(lead: LeadAutomacao): boolean {
  if (lead.lead_para_automacao) return true;
  const level = getEffectiveLevel(lead);
  if (level.includes("quente")) return true;
  if (getEffectiveScore(lead) >= 60) return true;
  return false;
}

export function getAutomationSignals(lead: LeadAutomacao): string[] {
  const signals: string[] = [];
  if (lead.tem_chatbot === false || lead.chatbot_present === false) signals.push("Sem chatbot");
  if (lead.whatsapp_manual) signals.push("WhatsApp manual");
  if (lead.crm_present === false) signals.push("Sem CRM visível");
  if (lead.form_is_poor) signals.push("Formulário ruim");
  if (lead.site_uses_https === false) signals.push("Site sem HTTPS");
  if (lead.has_meta_description === false) signals.push("Sem meta description");
  if (lead.has_form === false) signals.push("Sem formulário");
  if (lead.weak_site_signals?.length) {
    for (const s of lead.weak_site_signals) {
      if (!signals.includes(s)) signals.push(s);
    }
  }
  if (lead.intent_keywords?.length) {
    for (const kw of lead.intent_keywords) {
      if (kw.toLowerCase().includes("agendamento")) signals.push("Página com agendamento");
      if (kw.toLowerCase().includes("orçamento") || kw.toLowerCase().includes("orcamento")) signals.push("Página com orçamento");
    }
  }
  return [...new Set(signals)];
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
  
  if (techs.includes("Shopify") && signals.includes("Sem chatbot")) return "Loja Shopify sem chatbot detectado.";
  if (techs.includes("Wix") && signals.includes("WhatsApp manual")) return "Site Wix com WhatsApp manual e formulário fraco.";
  if (techs.includes("WordPress") && signals.includes("Sem CRM visível")) return "Empresa com WordPress e sem CRM visível.";
  if (signals.includes("Página com agendamento") && signals.includes("Sem chatbot")) return "Página com agendamento e sem automação aparente.";
  if (lead.whatsapp && signals.length > 2) return "Lead com forte potencial para automação via WhatsApp.";
  if (signals.length > 3) return "Múltiplos sinais de necessidade de automação detectados.";
  if (getEffectiveScore(lead) >= 70) return "Lead com alto potencial de automação comercial.";
  return "Lead identificado com oportunidade de melhoria digital.";
}

export function getCommercialHooks(lead: LeadAutomacao): string[] {
  const hooks: string[] = [];
  const signals = getAutomationSignals(lead);
  
  if (signals.includes("WhatsApp manual") || lead.whatsapp) hooks.push("Venda automação de atendimento via WhatsApp");
  if (signals.includes("Sem chatbot")) hooks.push("Venda chatbot para triagem");
  if (signals.includes("Sem CRM visível")) hooks.push("Venda CRM ou funil comercial");
  if (signals.includes("Formulário ruim") || signals.includes("Sem formulário")) hooks.push("Venda landing page ou formulário melhor");
  if (lead.whatsapp_manual) hooks.push("Venda recuperação de leads");
  if (hooks.length > 0) hooks.push("Venda integração site + WhatsApp + CRM");
  
  return [...new Set(hooks)].slice(0, 6);
}
