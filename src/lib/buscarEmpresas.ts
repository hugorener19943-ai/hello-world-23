export interface Empresa {
  nome: string;
  telefone?: string;
  whatsapp: string;
  email: string;
  website: string;
  endereco: string;
  cidade: string;
  nicho: string;
  score: number | string;
  whatsapp_link: string;
  fsq_id?: string;
}

interface BuscarParams {
  query: string;
  cidade: string;
  estado: string;
  target_total?: number;
  subnichos?: string[];
  bairros?: string[];
  onProgress?: (fetched: number, target: number) => void;
}

const DISPATCHER_URL = "https://api.fluxleads.com.br/webhook/fluxleads-v8";
const EXPORT_URL     = "https://api.fluxleads.com.br/webhook/fluxleads-export-v8";
const AUTH           = "Bearer key_pro_123";

function makeSearchId(query: string, cidade: string): string {
  const base = `${query}_${cidade}`.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  return `${base}_${Date.now()}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatLead(r: any): Empresa {
  const whatsapp = r.enrich_whatsapp || r.whatsapp || "";
  const phones   = r.enrich_phones   || r.phone    || "";
  const emails   = r.enrich_emails   || r.email    || "";
  return {
    nome:         r.name          || r.business_name || "",
    telefone:     phones          || undefined,
    whatsapp:     whatsapp,
    email:        emails,
    website:      r.website       || "",
    endereco:     r.address       || "",
    cidade:       r.city          || "",
    nicho:        r.niche         || "",
    score:        r.score         ?? "",
    whatsapp_link: whatsapp
      ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
      : "",
    fsq_id:       String(r.id     || r.osm_id || ""),
  };
}

export async function buscarEmpresas({
  query,
  cidade,
  estado,
  target_total = 300,
  subnichos = [],
  bairros = [],
  onProgress,
}: BuscarParams): Promise<{ status: string; cidade: string; nicho: string; total: number; empresas: Empresa[] }> {

  const search_id = makeSearchId(query, cidade);

  const dispRes = await fetch(DISPATCHER_URL, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({
      searches: [
        {
          search_id,
          niche:      query,
          city:       cidade,
          state:      estado,
          target_total: Math.max(target_total, 50),
          subniches:  subnichos,
          districts:  bairros,
        },
      ],
      format: "json",
      max_combinations_per_search: 40,
      max_pages_per_combination:   5,
    }),
  });

  if (!dispRes.ok) {
    const txt = await dispRes.text();
    throw new Error(`Erro ao iniciar busca (${dispRes.status}): ${txt.substring(0, 200)}`);
  }

  const dispData = await dispRes.json();
  if (!dispData.ok && !dispData.inserted) {
    throw new Error("Dispatcher não confirmou a busca. Tente novamente.");
  }

  onProgress?.(0, target_total);

  const MAX_ATTEMPTS  = 36;
  const POLL_INTERVAL = 5000;
  const PAGE_SIZE     = 1000;

  let attempts    = 0;
  const seen      = new Map<string, Empresa>();

  while (attempts < MAX_ATTEMPTS) {
    await sleep(POLL_INTERVAL);
    attempts++;

    try {
      const expRes = await fetch(EXPORT_URL, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          search_id,
          page:     1,
          per_page: PAGE_SIZE,
        }),
      });

      if (!expRes.ok) continue;

      const expData = await expRes.json();
      const leads: any[] = Array.isArray(expData.leads) ? expData.leads : [];

      for (const lead of leads) {
        const key = String(lead.id || lead.osm_id || lead.lead_fingerprint || "");
        if (key && !seen.has(key)) {
          seen.set(key, formatLead(lead));
        }
      }

      onProgress?.(seen.size, target_total);
      if (seen.size >= target_total) break;

    } catch {
      // ignora erros de polling e tenta novamente
    }
  }

  const empresas = Array.from(seen.values());
  return {
    status:   "ok",
    cidade:   `${cidade}, ${estado}`,
    nicho:    query,
    total:    empresas.length,
    empresas,
  };
}

export async function exportarExcel(
  query: string,
  cidade: string,
  estado: string,
  target_total: number
): Promise<void> {
  const { empresas } = await buscarEmpresas({ query, cidade, estado, target_total });
  const headers = ["nome","telefone","whatsapp","email","website","endereco","cidade","nicho","score"];
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = empresas.map((e) => [
    e.nome, e.telefone ?? "", e.whatsapp, e.email, e.website,
    e.endereco, e.cidade, e.nicho, e.score,
  ]);
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `fluxleads_${query.replace(/\s+/g, "_")}_${cidade.replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
