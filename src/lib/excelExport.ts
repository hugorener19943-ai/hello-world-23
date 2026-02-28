export interface PlaceResult {
  name: string;
  address: string;
  city: string;
  categories: string;
  distance?: number;
  phone: string;
  website: string;
  ranking: string;
  score: number;
  siteStatus?: string;
  weakReasons?: string[];
  pitchAngle?: string;
  whatsappMessage?: string;
}

export function generateExcelCSV(places: PlaceResult[], query: string, city: string): string {
  const BOM = "\uFEFF";
  const sep = ";";

  const headers = [
    "#",
    "Empresa",
    "Endereço",
    "Cidade",
    "Categorias",
    "Telefone",
    "Website",
    "Status Site",
    "Score",
    "Ranking Conversão",
    "Motivos",
    "Ângulo de Abordagem",
    "Mensagem WhatsApp",
    "Distância (m)",
  ];

  const rows = places.map((p, i) => [
    String(i + 1),
    escapeCSV(p.name),
    escapeCSV(p.address),
    escapeCSV(p.city),
    escapeCSV(p.categories),
    escapeCSV(p.phone),
    escapeCSV(p.website),
    escapeCSV(p.siteStatus || ""),
    String(p.score),
    escapeCSV(p.ranking.replace(/🟢|🟡|🔴/g, "").trim()),
    escapeCSV((p.weakReasons || []).join(", ")),
    escapeCSV(p.pitchAngle || ""),
    escapeCSV(p.whatsappMessage || ""),
    p.distance ? String(p.distance) : "",
  ]);

  const csvContent = [
    headers.join(sep),
    ...rows.map((row) => row.join(sep)),
  ].join("\r\n");

  return BOM + csvContent;
}

function escapeCSV(value: string): string {
  if (!value) return "";
  // If contains separator, quotes, or newlines, wrap in quotes
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
