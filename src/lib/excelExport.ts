export interface PlaceResult {
  nome: string;
  whatsapp: string;
  email: string;
  website: string;
  endereco: string;
  cidade: string;
  nicho: string;
  score: number;
  whatsapp_link: string;
  site_status?: string;
  weak_reasons?: string[];
  pitch_angle?: string;
  whatsapp_message?: string;
  ranking?: string;
}

export function generateExcelCSV(places: PlaceResult[], query: string, city: string): string {
  const BOM = "\uFEFF";
  const sep = ";";

  const headers = [
    "#", "Empresa", "WhatsApp", "Email", "Website", "Endereço",
    "Cidade", "Nicho", "Score", "Status Site", "Ranking",
    "Motivos", "Pitch", "Mensagem WhatsApp", "Link WhatsApp",
  ];

  const rows = places.map((p, i) => [
    String(i + 1),
    esc(p.nome),
    esc(p.whatsapp),
    esc(p.email),
    esc(p.website),
    esc(p.endereco),
    esc(p.cidade),
    esc(p.nicho),
    String(p.score ?? ""),
    esc(p.site_status || ""),
    esc(p.ranking || ""),
    esc((p.weak_reasons || []).join(", ")),
    esc(p.pitch_angle || ""),
    esc(p.whatsapp_message || ""),
    esc(p.whatsapp_link || ""),
  ]);

  return BOM + [headers.join(sep), ...rows.map((r) => r.join(sep))].join("\r\n");
}

function esc(value: string): string {
  if (!value) return "";
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
