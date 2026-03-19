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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatLead(r: any): Empresa {
  const whatsapp = r.enrich_whatsapp || r.whatsapp || "";
  const phones   = r.enrich_phones   || r.phone    || "";
  const emails   = r.enrich_emails   || r.email    || "";
  return {
    nome:          r.name          || r.business_name || "",
    telefone:      phones          || undefined,
    whatsapp:      whatsapp,
    email:         emails,
    website:       r.website       || "",
    endereco:      r.address       || "",
    cidade:        r.city          || "",
    nicho:         r.nicho         || "",
    score:         r.score         ?? "",
    whatsapp_link: whatsapp
      ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
      : "",
    fsq_id:        r.fsq_id       || r.unique_key || "",
  };
}

function dedupeKey(e: Empresa): string {
  if (e.fsq_id) return e.fsq_id;
  return `${(e.nome || "").toLowerCase()}|${(e.endereco || "").toLowerCase()}`;
}

export async function buscarEmpresas({
  query, cidade, estado, target_total = 300, subnichos, bairros, onProgress,
}: BuscarParams): Promise<{ status: string; cidade: string; nicho: string; total: number; empresas: Empresa[] }> {
  const res = await fetch(DISPATCHER_URL, {
    method: "POST",
    headers: {
      "Authorization": AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      searches: [
        {
          search_id: "search_1",
          niche: query,
          city: cidade,
          state: estado,
          target_total: Math.max(target_total, 100),
          subniches: subnichos || [],
          districts: bairros || [],
        },
      ],
      format: "json",
      max_combinations_per_search: 40,
      max_pages_per_combination: 5,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("API error:", res.status, text.substring(0, 300));
    throw new Error(`Erro API ${res.status}: ${text.substring(0, 200)}`);
  }

  if (text.trim().startsWith("<!") || text.includes("<html")) {
    throw new Error("API retornou HTML em vez de JSON. Verifique a URL e autenticação.");
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Response is not JSON:", text.substring(0, 300));
    throw new Error("API retornou resposta inválida (não é JSON)");
  }

  const rawLeads: any[] = Array.isArray(data.empresas) ? data.empresas : [];
  const apiTotal = data.total ?? rawLeads.length;

  console.log(`API returned ${rawLeads.length} leads, apiTotal=${apiTotal}`);

  const seen = new Map<string, Empresa>();
  for (const raw of rawLeads) {
    const e = formatLead(raw);
    const key = dedupeKey(e);
    if (!seen.has(key)) seen.set(key, e);
  }

  onProgress?.(seen.size, apiTotal || target_total);

  const empresas = Array.from(seen.values());
  console.log("Total fetched (deduped):", empresas.length, "apiTotal:", apiTotal);

  return {
    status: "ok",
    cidade: `${cidade}, ${estado}`,
    nicho: query,
    total: apiTotal || empresas.length,
    empresas,
  };
}

export async function exportarExcel(query: string, cidade: string, estado: string, target_total: number): Promise<void> {
  const res = await fetch(EXPORT_URL, {
    method: "POST",
    headers: {
      "Authorization": AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      searches: [
        {
          search_id: "search_1",
          niche: query,
          city: cidade,
          state: estado,
          target_total: Math.max(target_total, 100),
          subniches: [],
          districts: [],
        },
      ],
      format: "xlsx",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao exportar: ${text.substring(0, 200)}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fluxleads.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
