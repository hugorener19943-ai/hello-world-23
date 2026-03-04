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

  console.log("API response:", { status: res.status, total: data?.empresas?.length });
  const empresas: Empresa[] = Array.isArray(data.empresas) ? data.empresas : [];

  return { status: "ok", cidade: `${cidade}, ${estado}, ${pais}`, nicho: query, total: empresas.length, empresas };
}
