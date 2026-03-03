export interface Empresa {
  nome: string;
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
  pais?: string;
  limit?: number;
  pageSize?: number;
  onProgress?: (p: { fetched: number; target: number; percent: number }) => void;
}

export async function buscarEmpresasPaginado({
  query, cidade, estado, pais = "Brasil",
  limit = 300, pageSize = 50, onProgress,
}: BuscarParams) {
  const empresas: Empresa[] = [];
  const seen = new Set<string>();
  let offset = 0;

  const target = Math.max(1, Number(limit) || 1);
  const size = Math.min(50, Math.max(1, Number(pageSize) || 50));

  let semNovos = 0;

  onProgress?.({ fetched: 0, target, percent: 0 });

  while (empresas.length < target) {
    const res = await fetch("https://api.fluxleads.com.br/webhook/buscar-empresas", {
      method: "POST",
      headers: {
        "Authorization": "Bearer key_pro_123",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        local: { cidade, estado, pais },
        limit: target,
        pageSize: size,
        offset,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Erro API: ${res.status} ${txt}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const textResponse = await res.text();
      console.error("Expected JSON but got:", contentType, textResponse.substring(0, 200));
      if (textResponse.trim().startsWith("<!") || textResponse.includes("<html")) {
        throw new Error(`API retornou HTML em vez de JSON. Status: ${res.status}`);
      }
      throw new Error(`Formato inesperado: ${contentType}`);
    }

    const data = await res.json();
    const batch: Empresa[] = Array.isArray(data.empresas) ? data.empresas : [];
    if (batch.length === 0) break;

    const antes = empresas.length;

    for (const e of batch) {
      const key = e?.fsq_id
        ? `fsq:${e.fsq_id}`
        : `fallback:${(e?.nome || "").toLowerCase().trim()}|${(e?.endereco || "").toLowerCase().trim()}`;

      if (!seen.has(key)) {
        seen.add(key);
        empresas.push(e);
        if (empresas.length >= target) break;
      }
    }

    const added = empresas.length - antes;

    if (added === 0) {
      semNovos += 1;
      if (semNovos >= 2) break;
    } else {
      semNovos = 0;
    }

    const fetched = Math.min(empresas.length, target);
    onProgress?.({ fetched, target, percent: Math.round((fetched / target) * 100) });

    if (empresas.length >= target) break;
    offset += size;
    await new Promise((r) => setTimeout(r, 500));
  }

  return { status: "ok", cidade: `${cidade}, ${estado}, ${pais}`, nicho: query, total: empresas.length, empresas };
}
