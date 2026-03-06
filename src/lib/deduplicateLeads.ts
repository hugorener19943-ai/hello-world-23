import type { LeadWithOrigin } from "@/components/leads/types";

function normalizeText(value: any): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mergeLeadData(existing: LeadWithOrigin, incoming: LeadWithOrigin): LeadWithOrigin {
  const bestScore =
    (incoming.score ?? 0) > (existing.score ?? 0) ? incoming : existing;

  return {
    ...existing,
    ...incoming,
    score: Math.max(existing.score ?? 0, incoming.score ?? 0),
    temperatura_lead:
      (incoming.score ?? 0) > (existing.score ?? 0)
        ? incoming.temperatura_lead || existing.temperatura_lead
        : existing.temperatura_lead || incoming.temperatura_lead,
    prioridade_comercial:
      bestScore.prioridade_comercial || existing.prioridade_comercial || incoming.prioridade_comercial || undefined,
    canal_sugerido: existing.canal_sugerido || incoming.canal_sugerido || undefined,
    abordagem_sugerida: existing.abordagem_sugerida || incoming.abordagem_sugerida || undefined,
    tipo_automacao_indicada: existing.tipo_automacao_indicada || incoming.tipo_automacao_indicada || undefined,
    motivo_automacao: existing.motivo_automacao || incoming.motivo_automacao || undefined,
    perfil_automacao: existing.perfil_automacao || incoming.perfil_automacao || undefined,
    email: existing.email || incoming.email || undefined,
    website: existing.website || incoming.website || undefined,
    telefone_raw: existing.telefone_raw || incoming.telefone_raw || undefined,
    whatsapp: existing.whatsapp || incoming.whatsapp || undefined,
    whatsapp_link: existing.whatsapp_link || incoming.whatsapp_link || undefined,
    fsq_id: existing.fsq_id || incoming.fsq_id || undefined,
    nome: existing.nome || incoming.nome,
    endereco: existing.endereco || incoming.endereco || undefined,
    nicho: existing.nicho || incoming.nicho || undefined,
    // keep first origin
    originBlockIndex: existing.originBlockIndex,
    originLabel: existing.originLabel,
  };
}

export function deduplicateLeads(leads: LeadWithOrigin[]): LeadWithOrigin[] {
  const map = new Map<string, LeadWithOrigin>();

  for (const lead of leads) {
    const hasFsqId = lead.fsq_id && String(lead.fsq_id).trim() !== "";
    const key = hasFsqId
      ? `fsq:${String(lead.fsq_id).trim()}`
      : `fallback:${normalizeText(lead.nome)}|${normalizeText(lead.endereco)}`;

    if (!map.has(key)) {
      map.set(key, lead);
    } else {
      map.set(key, mergeLeadData(map.get(key)!, lead));
    }
  }

  return Array.from(map.values()).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
