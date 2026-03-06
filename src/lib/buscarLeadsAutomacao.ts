export interface LeadAutomacao {
  nome: string;
  telefone_raw?: string;
  email?: string;
  website?: string;
  score?: number;
  temperatura_lead?: string;
  prioridade_comercial?: string;
  canal_sugerido?: string;
  abordagem_sugerida?: string;
  tipo_automacao_indicada?: string;
  endereco?: string;
  cidade?: string;
  whatsapp?: string;
  fsq_id?: string;
}

const API_URL = "https://api.fluxleads.com.br/webhook/buscar-empresas-automacao";
const AUTH = "Bearer key_pro_123";

export async function buscarLeadsAutomacao(params: {
  query: string;
  cidade: string;
  estado: string;
  target_total: number;
}): Promise<{ total: number; leads: LeadAutomacao[] }> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: params.query,
      local: { cidade: params.cidade, estado: params.estado },
      target_total: params.target_total,
      format: "json",
    }),
  });

  const contentType = res.headers.get("content-type");
  const text = await res.text();

  console.log("API status:", res.status, "content-type:", contentType);
  console.log("Response preview:", text.substring(0, 300));

  if (!res.ok) throw new Error(`Erro API ${res.status}: ${text.substring(0, 200)}`);

  if (text.trim().startsWith("<!") || text.includes("<html")) {
    throw new Error("API retornou HTML em vez de JSON. Verifique a URL e autenticação.");
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Resposta inválida da API (não é JSON)");
  }

  console.log("Parsed data — total:", data.total, "empresas:", Array.isArray(data.empresas) ? data.empresas.length : "N/A");

  const leads: LeadAutomacao[] = Array.isArray(data.empresas) ? data.empresas : [];

  // dedupe
  const seen = new Map<string, LeadAutomacao>();
  for (const l of leads) {
    const key = l.fsq_id || `${(l.nome || "").toLowerCase()}|${(l.endereco || "").toLowerCase()}`;
    if (!seen.has(key)) seen.set(key, l);
  }

  const unique = Array.from(seen.values());
  // sort by score desc
  unique.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return { total: data.total ?? unique.length, leads: unique };
}
