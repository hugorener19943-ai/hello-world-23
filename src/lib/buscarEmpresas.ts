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
  onProgress?: (fetched: number, target: number) => void;
}

const PAGE_SIZE = 50;
const API_URL = "https://api.fluxleads.com.br/webhook/buscar-empresas";
const AUTH = "Bearer key_pro_123";

function dedupeKey(e: Empresa): string {
  if (e.fsq_id) return e.fsq_id;
  return `${(e.nome || "").toLowerCase()}|${(e.endereco || "").toLowerCase()}`;
}

export async function buscarEmpresas({
  query, cidade, estado, target_total = 300, onProgress,
}: BuscarParams): Promise<{ status: string; cidade: string; nicho: string; total: number; empresas: Empresa[] }> {
  const seen = new Map<string, Empresa>();
  let apiTotal = 0;
  let offset = 0;
  let keepGoing = true;

  while (keepGoing && offset < target_total) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        local: { cidade, estado, pais: "Brasil" },
        target_total,
        format: "json",
        pageSize: PAGE_SIZE,
        offset,
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("API error:", res.status, text.substring(0, 300));
      throw new Error(`Erro API ${res.status}: ${text.substring(0, 200)}`);
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Response is not JSON:", text.substring(0, 300));
      throw new Error("API retornou resposta inválida (não é JSON)");
    }

    if (data.total != null) apiTotal = data.total;
    const batch: Empresa[] = Array.isArray(data.empresas) ? data.empresas : [];

    console.log(`Batch offset=${offset}: got ${batch.length}, apiTotal=${apiTotal}`);

    for (const e of batch) {
      const key = dedupeKey(e);
      if (!seen.has(key)) seen.set(key, e);
    }

    onProgress?.(seen.size, apiTotal || target_total);

    if (batch.length < PAGE_SIZE) {
      keepGoing = false;
    } else {
      offset += PAGE_SIZE;
      await new Promise(r => setTimeout(r, 150));
    }
  }

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
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      local: { cidade, estado, pais: "Brasil" },
      target_total,
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
