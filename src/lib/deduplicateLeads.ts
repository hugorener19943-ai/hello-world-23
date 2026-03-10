import type { LeadWithOrigin } from "@/components/leads/types";

function normalizeText(value: any): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function deduplicateLeads(leads: LeadWithOrigin[]): LeadWithOrigin[] {
  const map = new Map<string, LeadWithOrigin>();

  for (const lead of leads) {
    const hasUniqueKey = lead.unique_key && String(lead.unique_key).trim() !== "";
    const hasFsqId = lead.fsq_id && String(lead.fsq_id).trim() !== "";
    const key = hasUniqueKey
      ? `uk:${String(lead.unique_key).trim()}`
      : hasFsqId
      ? `fsq:${String(lead.fsq_id).trim()}`
      : `fallback:${normalizeText(lead.nome)}|${normalizeText(lead.endereco)}`;

    if (!map.has(key)) {
      map.set(key, lead);
    } else {
      const existing = map.get(key)!;
      const score = (v: LeadWithOrigin) => v.automation_score ?? v.score_automacao ?? v.score ?? 0;
      const merged: LeadWithOrigin = {
        ...existing,
        ...lead,
        score: Math.max(score(existing), score(lead)),
        originBlockIndex: existing.originBlockIndex,
        originLabel: existing.originLabel,
        email: existing.email || lead.email,
        whatsapp: existing.whatsapp || lead.whatsapp,
        site: existing.site || lead.site,
        website: existing.website || lead.website,
        instagram: existing.instagram || lead.instagram,
        linkedin: existing.linkedin || lead.linkedin,
      };
      map.set(key, merged);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const score = (v: LeadWithOrigin) => v.automation_score ?? v.score_automacao ?? v.score ?? 0;
    return score(b) - score(a);
  });
}
