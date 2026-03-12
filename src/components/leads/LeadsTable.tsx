import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { LeadWithOrigin } from "./types";
import { getEffectiveScore, getEffectiveLevel } from "./types";

export interface FlatLead {
  id: string;
  empresa: string;
  categoria: string;
  subnicho: string;
  telefone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  score: number;
  status_oportunidade: string;
  origem: string;
  search_id: string;
  data_coleta: string;
}

function parseEndereco(raw: string): { rua: string; numero: string } {
  if (!raw) return { rua: "", numero: "" };
  const match = raw.match(/^(.+?),?\s*(\d+\s*[A-Za-z]?)$/);
  if (match) return { rua: match[1].trim(), numero: match[2].trim() };
  const numMatch = raw.match(/(\d+)/);
  if (numMatch) {
    const idx = raw.indexOf(numMatch[1]);
    return { rua: raw.substring(0, idx).replace(/,\s*$/, "").trim(), numero: numMatch[1] };
  }
  return { rua: raw, numero: "" };
}

function statusLabel(lead: LeadWithOrigin): string {
  const level = getEffectiveLevel(lead);
  if (level.includes("muito quente")) return "Quente";
  if (level.includes("quente")) return "Quente";
  if (level.includes("morno") || level.includes("méd") || level.includes("med")) return "Morno";
  return "Frio";
}

function firstString(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0] || "";
  return String(val);
}

export function flattenLead(lead: LeadWithOrigin, index: number): FlatLead {
  const { rua, numero } = parseEndereco(lead.endereco || "");
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);

  return {
    id: String(index + 1),
    empresa: lead.nome || "",
    categoria: lead.categoria || lead.nicho || "",
    subnicho: lead.subnicho_origem || "",
    telefone: firstString(lead.telefone || lead.telefone_raw),
    whatsapp: firstString(lead.whatsapp || lead.whatsapp_site),
    email: firstString(lead.email),
    website: firstString(lead.site || lead.website),
    instagram: firstString(lead.instagram),
    endereco: rua,
    numero,
    bairro: lead.bairro || lead.bairro_origem || "",
    cidade: lead.cidade || "",
    estado: lead.estado || "",
    cep: "",
    score: getEffectiveScore(lead),
    status_oportunidade: statusLabel(lead),
    origem: lead.originLabel || lead.fonte || "",
    search_id: lead.unique_source_id || lead.unique_key || "",
    data_coleta: now,
  };
}

const COLUMNS: { key: keyof FlatLead; label: string; width?: string }[] = [
  { key: "id", label: "#", width: "50px" },
  { key: "empresa", label: "Empresa", width: "200px" },
  { key: "categoria", label: "Categoria", width: "140px" },
  { key: "subnicho", label: "Subnicho", width: "140px" },
  { key: "telefone", label: "Telefone", width: "140px" },
  { key: "whatsapp", label: "WhatsApp", width: "140px" },
  { key: "email", label: "Email", width: "200px" },
  { key: "website", label: "Website", width: "200px" },
  { key: "instagram", label: "Instagram", width: "140px" },
  { key: "endereco", label: "Endereço", width: "200px" },
  { key: "numero", label: "Número", width: "80px" },
  { key: "bairro", label: "Bairro", width: "140px" },
  { key: "cidade", label: "Cidade", width: "130px" },
  { key: "estado", label: "Estado", width: "70px" },
  { key: "cep", label: "CEP", width: "100px" },
  { key: "score", label: "Score", width: "70px" },
  { key: "status_oportunidade", label: "Status", width: "100px" },
  { key: "origem", label: "Origem", width: "160px" },
  { key: "search_id", label: "Search ID", width: "140px" },
  { key: "data_coleta", label: "Data Coleta", width: "160px" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Quente: "bg-red-500/20 text-red-400 border-red-500/30",
    Morno: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Frio: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold ${colors[status] || ""}`}>
      {status}
    </Badge>
  );
}

interface LeadsTableProps {
  leads: LeadWithOrigin[];
  selectedLeads: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  dedupeKeyFn: (lead: LeadWithOrigin) => string;
}

export function LeadsTable({ leads, selectedLeads, onToggleSelect, onSelectAll, onDeselectAll, dedupeKeyFn }: LeadsTableProps) {
  const allSelected = leads.length > 0 && selectedLeads.size === leads.length;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-b border-border">
              <TableHead className="w-[40px] px-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => checked ? onSelectAll() : onDeselectAll()}
                />
              </TableHead>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-xs font-bold text-muted-foreground whitespace-nowrap px-3"
                  style={{ minWidth: col.width }}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead, i) => {
              const flat = flattenLead(lead, i);
              const key = dedupeKeyFn(lead);
              const isSelected = selectedLeads.has(key);
              return (
                <TableRow
                  key={key}
                  className={`text-xs ${isSelected ? "bg-primary/10" : "hover:bg-muted/30"}`}
                  data-state={isSelected ? "selected" : undefined}
                >
                  <TableCell className="px-2">
                    <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(key)} />
                  </TableCell>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key} className="px-3 py-2 whitespace-nowrap text-foreground">
                      {col.key === "status_oportunidade" ? (
                        <StatusBadge status={flat[col.key] as string} />
                      ) : col.key === "score" ? (
                        <span className="font-bold">{flat[col.key]}</span>
                      ) : (
                        <span className="truncate block max-w-[250px]" title={String(flat[col.key] ?? "")}>
                          {String(flat[col.key] ?? "")}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function exportLeadsCSV(leads: LeadWithOrigin[], filename?: string) {
  const BOM = "\uFEFF";
  const sep = ";";
  const headers = COLUMNS.map(c => c.label);
  
  const esc = (v: string): string => {
    if (!v) return "";
    if (v.includes(";") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const rows = leads.map((lead, i) => {
    const flat = flattenLead(lead, i);
    return COLUMNS.map(col => esc(String(flat[col.key] ?? "")));
  });

  const csv = BOM + [headers.map(esc).join(sep), ...rows.map(r => r.join(sep))].join("\r\n");

  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
  const name = filename || `fluxleads_resultado_${ts}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return leads.length;
}
