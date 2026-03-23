const BASE = "https://api.fluxleads.com.br/webhook/fluxleads-export-v8";
const AUTH = "Bearer key_pro_123";

export interface Campaign {
  id: number;
  name: string;
  niche: string;
  city: string;
  state: string;
  subniches: string[];
  districts: string[];
  total_leads: number;
  status: string;
  created_at: string;
}

export interface CampaignLead {
  nome: string;
  nicho: string;
  cidade: string;
  telefone: string;
  email: string;
  website: string;
  instagram: string;
  score: number;
  whatsapp: string;
  endereco: string;
  bairro: string;
  estado: string;
  categoria: string;
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${BASE}/campaigns`, {
    headers: { Authorization: AUTH },
  });
  if (!res.ok) throw new Error(`Erro ao listar campanhas: ${res.status}`);
  const data = await res.json();
  return (data.campaigns || []) as Campaign[];
}

export async function fetchCampaignLeads(
  campaignId: number,
  page = 1,
  perPage = 1000
): Promise<{ leads: CampaignLead[]; total: number }> {
  const res = await fetch(`${BASE}/campaigns/${campaignId}/leads`, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ per_page: perPage, page }),
  });
  if (!res.ok) throw new Error(`Erro ao buscar leads: ${res.status}`);
  const data = await res.json();
  return { leads: data.leads || [], total: data.total || 0 };
}

export interface NewCampaignPayload {
  name: string;
  niche: string;
  city: string;
  state: string;
  subniches: string[];
  districts: string[];
  min_score: number;
}

export async function createCampaign(payload: NewCampaignPayload): Promise<Campaign> {
  const res = await fetch(`${BASE}/campaigns`, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ao criar campanha: ${res.status}`);
  return res.json();
}
