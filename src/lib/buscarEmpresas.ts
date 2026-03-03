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
}

export async function buscarEmpresas({
  query, cidade, estado, pais = "Brasil", limit = 300,
}: BuscarParams): Promise<{ status: string; cidade: string; nicho: string; total: number; empresas: Empresa[] }> {
  const res = await fetch("https://api.fluxleads.com.br/webhook/buscar-empresas", {
    method: "POST",
    headers: {
      "Authorization": "Bearer key_pro_123",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      local: { cidade, estado, pais },
      limit,
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
  const empresas: Empresa[] = Array.isArray(data.empresas) ? data.empresas : [];

  return { status: "ok", cidade: `${cidade}, ${estado}, ${pais}`, nicho: query, total: empresas.length, empresas };
}
