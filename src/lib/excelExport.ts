export interface PlaceResult {
  name: string;
  address: string;
  city: string;
  categories: string;
  phone: string;
  email?: string;
  website: string;
  whatsappLink?: string;
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
    "WhatsApp",
    "Email",
    "Website",
    "Endereço",
    "Cidade",
    "Nicho",
    "Score",
    "Ranking Conversão",
    "Status Site",
    "Motivos",
    "Ângulo de Abordagem",
    "Mensagem WhatsApp",
    "Link WhatsApp",
  ];

  const rows = places.map((p, i) => [
    String(i + 1),
    escapeCSV(p.name),
    escapeCSV(p.phone),
    escapeCSV(p.email || ""),
    escapeCSV(p.website),
    escapeCSV(p.address),
    escapeCSV(p.city),
    escapeCSV(p.categories),
    String(p.score),
    escapeCSV(p.ranking.replace(/🟢|🟡|🔴/g, "").trim()),
    escapeCSV(p.siteStatus || ""),
    escapeCSV((p.weakReasons || []).join(", ")),
    escapeCSV(p.pitchAngle || ""),
    escapeCSV(p.whatsappMessage || ""),
    escapeCSV(p.whatsappLink || ""),
  ]);

  const csvContent = [
    headers.join(sep),
    ...rows.map((row) => row.join(sep)),
  ].join("\r\n");

  return BOM + csvContent;
}

function escapeCSV(value: string): string {
  if (!value) return "";
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
