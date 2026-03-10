import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type QuickFilter =
  | "" | "quente" | "muito_quente" | "morno" | "com_whatsapp" | "com_email" | "com_instagram"
  | "sem_site" | "sem_chatbot" | "sem_crm" | "whatsapp_manual"
  | "tech_wordpress" | "tech_wix" | "tech_shopify"
  | "intent_agendamento" | "intent_orcamento";

export type SortOption = "score" | "google_avaliacoes" | "google_nota" | "signals" | "contacts";

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: "muito_quente", label: "Muito quentes" },
  { value: "quente", label: "Quentes" },
  { value: "com_whatsapp", label: "Com WhatsApp" },
  { value: "com_email", label: "Com email" },
  { value: "sem_chatbot", label: "Sem chatbot" },
  { value: "sem_crm", label: "Sem CRM" },
  { value: "whatsapp_manual", label: "WhatsApp manual" },
  { value: "tech_wordpress", label: "WordPress" },
  { value: "tech_wix", label: "Wix" },
  { value: "tech_shopify", label: "Shopify" },
  { value: "intent_agendamento", label: "Agendamento" },
  { value: "intent_orcamento", label: "Orçamento" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "score", label: "Maior score" },
  { value: "google_avaliacoes", label: "Mais avaliações Google" },
  { value: "google_nota", label: "Maior nota Google" },
  { value: "signals", label: "Mais sinais de automação" },
  { value: "contacts", label: "Mais dados de contato" },
];

interface LeadFiltersProps {
  activeFilters: QuickFilter[];
  onToggleFilter: (filter: QuickFilter) => void;
  onClearFilters: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchName: string;
  onSearchChange: (value: string) => void;
  totalFiltered: number;
  totalLeads: number;
}

export function LeadFilters({
  activeFilters, onToggleFilter, onClearFilters,
  sortBy, onSortChange, searchName, onSearchChange,
  totalFiltered, totalLeads,
}: LeadFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {QUICK_FILTERS.map((f) => {
          const active = activeFilters.includes(f.value);
          return (
            <Button
              key={f.value}
              variant={active ? "default" : "outline"}
              size="sm"
              className={`text-[11px] h-7 ${active ? "glow-neon" : "border-border"}`}
              onClick={() => onToggleFilter(f.value)}
            >
              {f.label}
            </Button>
          );
        })}
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={onClearFilters}>
            <X className="h-3 w-3 mr-1" /> Limpar filtros
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-[200px] h-8 text-xs bg-secondary border-border">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar por nome..."
          className="max-w-[220px] h-8 text-sm bg-secondary border-border"
          value={searchName}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {totalFiltered !== totalLeads && (
          <span className="text-xs text-muted-foreground">{totalFiltered} de {totalLeads}</span>
        )}
      </div>
    </div>
  );
}
