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
  motivo_automacao?: string;
  perfil_automacao?: string;
  endereco?: string;
  cidade?: string;
  whatsapp?: string;
  whatsapp_link?: string;
  fsq_id?: string;
  nicho?: string;
}

const API_URL = "https://api.fluxleads.com.br/webhook/fluxleads-v8";
const AUTH = "Bearer key_pro_123";

export async function buscarLeadsAutomacao(params: {
  query: string;
  cidade: string;
  estado: string;
  target_total: number;
  subnichos?: string[];
  bairros?: string[];
}): Promise<{ total: number; leads: LeadAutomacao[] }> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({
      searches: [
        {
          search_id: "search_1",
          niche: params.query,
          city: params.cidade,
          state: params.estado,
          target_total: Math.max(params.target_total, 100),
          subniches: params.subnichos || [],
          districts: params.bairros || [],
        },
      ],
      format: "json",
      max_combinations_per_search: 40,
      max_pages_per_combination: 5,
    }),
  });

  const text = await res.text();
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

  const leads: LeadAutomacao[] = Array.isArray(data.empresas) ? data.empresas : [];
  return { total: data.total ?? leads.length, leads };
}
