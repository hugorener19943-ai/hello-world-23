import { useState, useMemo, useCallback, useRef } from "react";
import { getMetroCities, hasMetroExpansion, type MetroCity } from "@/lib/cidadesMetropolitanas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Download, Plus, Zap, PanelLeftOpen, PanelLeftClose, Flame, CheckSquare, MapPin, CheckCircle2, X, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchBlockCard } from "@/components/leads/SearchBlockCard";
import { SearchSummary } from "@/components/leads/SearchSummary";
import { TemplateSelector } from "@/components/leads/TemplateSelector";
import { ResearchFlux } from "@/components/ResearchFlux";
import { FluxMaps } from "@/components/FluxMaps";
import { LeadCard } from "@/components/leads/LeadCard";
import { LeadsTable, exportLeadsCSV } from "@/components/leads/LeadsTable";
import { KpiBar } from "@/components/leads/KpiBar";
import { LeadFilters, type QuickFilter, type SortOption } from "@/components/leads/LeadFilters";
import { LoadingSteps } from "@/components/leads/LoadingSteps";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { SearchBlock, LeadWithOrigin, LeadAutomacao, ApiResponseMeta, ViewMode } from "@/components/leads/types";
import { getEffectiveScore, getEffectiveLevel, getAutomationSignals, getTechBadges, isHotLead, filterByViewMode, commercialSort } from "@/components/leads/types";
import type { FluxTemplate } from "@/lib/fluxTemplates";

const API_URL = "https://api.fluxleads.com.br/webhook/fluxleads-v8";
const AUTH = "Bearer key_pro_123";
const MAX_BLOCKS = 5;
const PAGE_SIZE = 50;

let blockIdCounter = 0;
function newBlock(): SearchBlock {
  return { id: `b${++blockIdCounter}`, query: "", subnichos: [], cidade: "", estado: "", bairros: [], targetTotal: 500 };
}

function dedupeKey(e: LeadAutomacao): string {
  if (e.unique_key) return e.unique_key;
  if (e.fsq_id) return e.fsq_id;
  if (e.unique_source_id) return e.unique_source_id;
  return `${(e.nome || "").toLowerCase()}|${(e.endereco || "").toLowerCase()}`;
}

function toStr(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  return String(val);
}

function normalizeLeadFields(e: any): LeadAutomacao {
  const whatsapp = toStr(e.enrich_whatsapp || e.whatsapp);
  const phones = toStr(e.enrich_phones || e.phone || e.telefone || e.telefone_raw);
  const emails = toStr(e.enrich_emails || e.email);
  return {
    ...e,
    nome: toStr(e.name || e.business_name || e.nome),
    telefone: phones || undefined,
    telefone_raw: phones || undefined,
    whatsapp: whatsapp,
    whatsapp_link: whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : "",
    email: emails,
    site: toStr(e.website || e.site),
    website: toStr(e.website || e.site),
    endereco: toStr(e.address || e.endereco),
    cidade: toStr(e.city || e.cidade),
    instagram: toStr(e.instagram),
    linkedin: toStr(e.linkedin),
    score: e.automation_score ?? e.score_automacao ?? e.score ?? 0,
  };
}

// Blacklist of generic business names that are never relevant to niche searches
const IRRELEVANT_NAMES = [
  "bradesco", "itau", "itaú", "santander", "caixa economica", "caixa econômica",
  "banco do brasil", "nubank", "inter", "procon", "detran", "poupatempo",
  "correios", "receita federal", "inss", "sesc", "senac", "senai", "sebrae",
  "lotérica", "loterica", "cartório", "cartorio",
];

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function buildKeywords(blocks: SearchBlock[]): string[] {
  const keywords: string[] = [];
  for (const b of blocks) {
    if (b.query) {
      // Split compound niches like "clínica médica" into individual words too
      const parts = normalize(b.query).split(/[\s,;/]+/).filter(w => w.length > 2);
      keywords.push(normalize(b.query), ...parts);
    }
    for (const s of b.subnichos || []) {
      const parts = normalize(s).split(/[\s,;/]+/).filter(w => w.length > 2);
      keywords.push(normalize(s), ...parts);
    }
  }
  return [...new Set(keywords)];
}

function filterByRelevance(leads: LeadWithOrigin[], blocks: SearchBlock[]): LeadWithOrigin[] {
  const keywords = buildKeywords(blocks);
  if (keywords.length === 0) return leads;

  return leads.filter((lead) => {
    const name = normalize(toStr(lead.nome));
    const nicho = normalize(toStr(lead.nicho));
    const category = normalize(toStr((lead as any).category || (lead as any).categoria));
    const combined = `${name} ${nicho} ${category}`;

    // Reject blacklisted names
    if (IRRELEVANT_NAMES.some(bl => name.includes(bl))) return false;

    // Accept if any keyword matches name, nicho, or category
    return keywords.some(kw => combined.includes(kw));
  });
}

interface FetchResult {
  leads: LeadAutomacao[];
  meta?: ApiResponseMeta;
  reason?: "api_limit" | "no_more_pages" | "all_fetched";
  pagesScanned: number;
}

async function fetchBlock(block: SearchBlock): Promise<FetchResult> {
  const seen = new Map<string, LeadAutomacao>();
  let reason: FetchResult["reason"] = "all_fetched";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({
      niche:            block.query,
      city:             block.cidade,
      state:            block.estado,
      subniches:        block.subnichos || [],
      districts:        block.bairros   || [],
      max_combinations: Math.min(500, Math.max(10, block.targetTotal)),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro API ${res.status}: ${text.substring(0, 200)}`);
  }

  const data = await res.json();
  const search_id: string = data.search_id;
  if (!search_id) throw new Error("Dispatcher não retornou search_id.");

  const EXPORT_URL    = "https://api.fluxleads.com.br/webhook/fluxleads-export-v8";
  const MAX_ATTEMPTS  = 36;
  const POLL_INTERVAL = 5000;
  const PAGE_SIZE     = 1000;
  let attempts        = 0;

  while (attempts < MAX_ATTEMPTS) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    attempts++;

    try {
      const expRes = await fetch(EXPORT_URL, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({ search_id, page: 1, per_page: PAGE_SIZE }),
      });

      if (!expRes.ok) continue;

      const expData = await expRes.json();
      const batch: LeadAutomacao[] = Array.isArray(expData.leads)
        ? expData.leads.map(normalizeLeadFields)
        : [];

      for (const e of batch) {
        const key = dedupeKey(e);
        if (!seen.has(key)) seen.set(key, e);
      }

      if (seen.size >= block.targetTotal) break;

    } catch {
      // ignora e tenta novamente
    }
  }

  const leads = Array.from(seen.values());
  if (leads.length === 0) reason = "no_more_pages";
  else if (leads.length < block.targetTotal) reason = "api_limit";

  return { leads, meta: undefined, reason, pagesScanned: attempts };
}

function deduplicateLeads(leads: LeadWithOrigin[]): LeadWithOrigin[] {
  const map = new Map<string, LeadWithOrigin>();
  for (const lead of leads) {
    const key = dedupeKey(lead);
    if (!map.has(key)) {
      map.set(key, lead);
    } else {
      const existing = map.get(key)!;
      // Merge: keep higher score
      const merged = { ...existing, ...lead };
      merged.score = Math.max(getEffectiveScore(existing), getEffectiveScore(lead));
      merged.originBlockIndex = existing.originBlockIndex;
      merged.originLabel = existing.originLabel;
      map.set(key, merged);
    }
  }
  return Array.from(map.values()).sort((a, b) => getEffectiveScore(b) - getEffectiveScore(a));
}

export default function LeadsAutomacao() {
  const [blocks, setBlocks] = useState<SearchBlock[]>([newBlock()]);
  const [leads, setLeads] = useState<LeadWithOrigin[]>([]);
  const [apiMeta, setApiMeta] = useState<ApiResponseMeta | undefined>();
  const [loading, setLoading] = useState(false);
  const [blockStatuses, setBlockStatuses] = useState<Record<string, "idle" | "loading" | "done" | "error">>({});
  const [blockResults, setBlockResults] = useState<Record<string, { found: number; requested: number; message?: string }>>({}); 
  const [searchName, setSearchName] = useState("");
  const [showResearch, setShowResearch] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("todos");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [sidebarTab, setSidebarTab] = useState<string>("research");
  const [pendingAction, setPendingAction] = useState<{ type: "niche"; term: string } | { type: "location"; cidade: string; estado: string; bairro?: string } | null>(null);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    blockIndex: number; query: string; cidade: string; estado: string; bairros: string[]; targetTotal: number;
  } | null>(null);
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const { toast } = useToast();

  const updateBlock = useCallback((id: string, field: keyof SearchBlock, value: string | number) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }, []);

  const applyToBlock = useCallback((blockIndex: number, action: NonNullable<typeof pendingAction>) => {
    setBlocks((prev) => {
      const updated = [...prev];
      if (blockIndex >= updated.length) return updated;
      if (action.type === "niche") {
        updated[blockIndex] = { ...updated[blockIndex], query: action.term };
      } else {
        const newBairros = action.bairro && !updated[blockIndex].bairros.includes(action.bairro)
          ? [...updated[blockIndex].bairros, action.bairro].slice(0, 8)
          : updated[blockIndex].bairros;
        updated[blockIndex] = { ...updated[blockIndex], cidade: action.cidade, estado: action.estado, bairros: newBairros };
      }
      return updated;
    });
    setActiveBlockIndex(blockIndex);
    setPendingAction(null);
    if (action.type === "niche") setSidebarTab("maps");
  }, []);

  const handleSelectNiche = useCallback((niche: string, subnicho: string) => {
    setSelectedNiche(niche);
    const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
    setBlocks((prev) => {
      const updated = [...prev];
      const block = updated[targetIndex];
      const currentSubnichos = block.subnichos || [];
      if (currentSubnichos.length < 10 && !currentSubnichos.includes(subnicho)) {
        updated[targetIndex] = { ...block, query: niche, subnichos: [...currentSubnichos, subnicho] };
      }
      return updated;
    });
    toast({ title: `${niche} → Subnicho: ${subnicho}`, description: `Busca ${targetIndex + 1}` });
  }, [blocks.length, activeBlockIndex, toast]);

  const handleSelectLocation = useCallback((cidade: string, estado: string, bairro?: string) => {
    const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
    const currentBlock = blocks[targetIndex];
    const existing = currentBlock?.bairros || [];
    const newBairros = bairro && !existing.includes(bairro) ? [...existing, bairro].slice(0, 8) : existing;
    setBlocks((prev) => {
      const updated = [...prev];
      updated[targetIndex] = { ...updated[targetIndex], cidade, estado, bairros: newBairros };
      return updated;
    });
    setConfirmDialog({
      blockIndex: targetIndex, query: currentBlock?.query || "", cidade, estado, bairros: newBairros, targetTotal: currentBlock?.targetTotal || 100,
    });
  }, [blocks, activeBlockIndex]);

  const handleSelectMultipleBairros = useCallback((cidade: string, estado: string, bairros: string[]) => {
    const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
    const currentBlock = blocks[targetIndex];
    setBlocks((prev) => {
      const updated = [...prev];
      updated[targetIndex] = { ...updated[targetIndex], cidade, estado, bairros: bairros.slice(0, 8) };
      return updated;
    });
    setConfirmDialog({
      blockIndex: targetIndex, query: currentBlock?.query || "", cidade, estado, bairros: bairros.slice(0, 8), targetTotal: currentBlock?.targetTotal || 100,
    });
  }, [blocks, activeBlockIndex]);

  const handleConfirmBlock = useCallback(() => {
    if (!confirmDialog) return;
    const { blockIndex, targetTotal, cidade, estado, bairros, query } = confirmDialog;
    setBlocks((prev) => {
      const updated = [...prev];
      updated[blockIndex] = { ...updated[blockIndex], query, cidade, estado, bairros, targetTotal };
      return updated;
    });
    setConfirmDialog(null);
    const nextIndex = blockIndex + 1;
    if (nextIndex < blocks.length) {
      setActiveBlockIndex(nextIndex);
      setSidebarTab("research");
      toast({ title: `Agora preenchendo Busca ${nextIndex + 1}` });
    } else if (nextIndex < MAX_BLOCKS) {
      setBlocks((prev) => [...prev, newBlock()]);
      setActiveBlockIndex(nextIndex);
      setSidebarTab("research");
      toast({ title: `Busca ${nextIndex + 1} criada automaticamente` });
    } else {
      toast({ title: "Todas as buscas preenchidas! 🚀" });
    }
  }, [confirmDialog, blocks.length, toast]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addBlock = useCallback(() => {
    setBlocks((prev) => (prev.length < MAX_BLOCKS ? [...prev, newBlock()] : prev));
  }, []);

  const applyTemplate = useCallback((template: FluxTemplate) => {
    if (!template || !Array.isArray(template.buscas) || template.buscas.length === 0) {
      toast({ title: "Template inválido", variant: "destructive" });
      return;
    }
    const newBlocks = template.buscas.slice(0, MAX_BLOCKS).map((b: any) => ({
      ...newBlock(),
      query: b?.query || "",
      cidade: b?.cidade || "",
      estado: b?.estado || "",
      bairros: Array.isArray(b?.bairros) ? b.bairros : b?.bairro ? [b.bairro] : [],
      targetTotal: b?.targetTotal || b?.quantidade || 100,
    }));
    setBlocks(newBlocks.length > 0 ? newBlocks : [newBlock()]);
    setLeads([]);
  }, [toast]);

  const buscar = async () => {
    const valid = blocks.filter((b) => b.query && b.cidade && b.estado);
    if (valid.length === 0) {
      toast({ title: "Preencha pelo menos um bloco completo", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLeads([]);
    setApiMeta(undefined);
    setBlockResults({});
    setSearchName("");
    setQuickFilters([]);

    const statuses: Record<string, "idle" | "loading" | "done" | "error"> = {};
    valid.forEach((b) => (statuses[b.id] = "loading"));
    setBlockStatuses({ ...statuses });

    const allLeads: LeadWithOrigin[] = [];
    const errors: string[] = [];
    const blockResultsMap: Record<string, { found: number; requested: number; message?: string }> = {};
    let combinedMeta: ApiResponseMeta | undefined;

    const results = await Promise.allSettled(
      valid.map(async (block, idx) => {
        try {
          const result = await fetchBlock(block);
          statuses[block.id] = "done";
          setBlockStatuses({ ...statuses });
          if (result.meta && !combinedMeta) combinedMeta = result.meta;
          const found = result.leads.length;
          const requested = block.targetTotal;
          let message: string | undefined;
          if (found === 0) {
            message = "Nenhum resultado encontrado para este nicho/local.";
          } else if (found < requested) {
            message = result.reason === "no_more_pages"
              ? `A API retornou apenas ${found} empresas — não existem mais resultados para "${block.query}" em ${block.cidade}${block.bairros.length ? ` (${block.bairros.join(", ")})` : ""}. Tente remover bairros ou ampliar o nicho.`
              : `Foram encontradas ${found} de ${requested} empresas solicitadas. A região/nicho tem poucas empresas cadastradas.`;
          }
          blockResultsMap[block.id] = { found, requested, message };
          setBlockResults({ ...blockResultsMap });
          return { empresas: result.leads, index: idx, label: `Busca ${idx + 1}: ${block.query}` };
        } catch (err: any) {
          statuses[block.id] = "error";
          setBlockStatuses({ ...statuses });
          blockResultsMap[block.id] = { found: 0, requested: block.targetTotal, message: err.message || "Erro desconhecido" };
          setBlockResults({ ...blockResultsMap });
          throw err;
        }
      })
    );

    results.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        const { empresas, label } = r.value;
        empresas.forEach((e: LeadAutomacao) => allLeads.push({ ...e, originBlockIndex: idx, originLabel: label }));
      } else {
        errors.push(`Busca ${idx + 1}: ${r.reason?.message || "Erro desconhecido"}`);
      }
    });

    // Filter out leads irrelevant to the searched niche/subnichos
    const relevantLeads = filterByRelevance(allLeads, valid);

    let unique = deduplicateLeads(relevantLeads);
    unique = commercialSort(unique);
    setLeads(unique);
    setApiMeta(combinedMeta);
    setSelectedLeads(new Set());
    setLoading(false);

    if (errors.length) toast({ title: "Algumas buscas falharam", description: errors.join("; "), variant: "destructive" });
    else if (unique.length === 0) toast({ title: "Nenhuma empresa encontrada com os critérios atuais.", description: "Tente adicionar mais subnichos, remover bairros ou aumentar o raio da busca.", variant: "destructive" });
    else {
      const qualificados = unique.filter(l => getEffectiveScore(l) >= 60).length;
      toast({ title: "Busca concluída com sucesso!", description: `Empresas encontradas: ${unique.length} · Leads qualificados: ${qualificados}` });
    }
  };

  // Apply view mode filter first, then quick filters
  const filtered = useMemo(() => {
    let list = filterByViewMode(leads, viewMode);

    for (const f of quickFilters) {
      switch (f) {
        case "morno": list = list.filter(l => getEffectiveLevel(l) === "morno"); break;
        case "quente": list = list.filter(l => { const lv = getEffectiveLevel(l); return lv.includes("quente"); }); break;
        case "muito_quente": list = list.filter(l => getEffectiveLevel(l).includes("muito quente")); break;
        case "com_whatsapp": list = list.filter(l => l.whatsapp || l.whatsapp_link); break;
        case "com_email": list = list.filter(l => l.email); break;
        case "com_instagram": list = list.filter(l => l.instagram); break;
        case "sem_site": list = list.filter(l => !l.site && !l.website); break;
        case "sem_chatbot": list = list.filter(l => l.tem_chatbot === false || l.chatbot_present === false); break;
        case "sem_crm": list = list.filter(l => l.crm_present === false); break;
        case "whatsapp_manual": list = list.filter(l => l.whatsapp_manual === true); break;
        case "tech_wordpress": list = list.filter(l => getTechBadges(l).includes("WordPress")); break;
        case "tech_wix": list = list.filter(l => getTechBadges(l).includes("Wix")); break;
        case "tech_shopify": list = list.filter(l => getTechBadges(l).includes("Shopify")); break;
        case "intent_agendamento": list = list.filter(l => l.intent_keywords?.some(k => k.toLowerCase().includes("agendamento"))); break;
        case "intent_orcamento": list = list.filter(l => l.intent_keywords?.some(k => k.toLowerCase().includes("orçamento") || k.toLowerCase().includes("orcamento"))); break;
      }
    }

    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      list = list.filter((l) => (l.nome || "").toLowerCase().includes(q));
    }

    const sorted = [...list];
    switch (sortBy) {
      case "score": return commercialSort(sorted as LeadWithOrigin[]);
      case "google_avaliacoes": sorted.sort((a, b) => (b.google_avaliacoes ?? 0) - (a.google_avaliacoes ?? 0)); break;
      case "google_nota": sorted.sort((a, b) => (b.google_nota ?? 0) - (a.google_nota ?? 0)); break;
      case "signals": sorted.sort((a, b) => getAutomationSignals(b).length - getAutomationSignals(a).length); break;
      case "contacts": sorted.sort((a, b) => {
        const count = (l: LeadAutomacao) => [l.email, l.whatsapp, l.site || l.website, l.instagram, l.linkedin, l.telefone || l.telefone_raw].filter(Boolean).length;
        return count(b) - count(a);
      }); break;
    }
    return sorted;
  }, [leads, viewMode, quickFilters, searchName, sortBy]);

  const toggleQuickFilter = useCallback((filter: QuickFilter) => {
    setQuickFilters((prev) => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  }, []);

  const handleKpiFilterClick = useCallback((filter: string) => {
    toggleQuickFilter(filter as QuickFilter);
  }, [toggleQuickFilter]);

  const toggleLeadSelection = useCallback((id: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedLeads(new Set(filtered.map((l) => dedupeKey(l))));
  }, [filtered]);

  const deselectAll = useCallback(() => setSelectedLeads(new Set()), []);

  const exportData = async (onlySelected: boolean) => {
    const toExport = onlySelected
      ? filtered.filter((l) => selectedLeads.has(dedupeKey(l)))
      : leads;
    if (!toExport.length) {
      toast({ title: "Nenhum lead para exportar", variant: "destructive" });
      return;
    }
    try {
      const count = await exportLeadsCSV(toExport);
      toast({ title: "Excel exportado!", description: `${count} leads exportados com sucesso.` });
    } catch (err: any) {
      console.error("Export error:", err);
      toast({ title: "Erro na exportação", description: err.message || "Erro desconhecido", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Block Picker Dialog */}
      <Dialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {pendingAction?.type === "niche" ? (
                <><Zap className="h-5 w-5 text-primary" /> Aplicar nicho em qual busca?</>
              ) : (
                <><MapPin className="h-5 w-5 text-primary" /> Aplicar local em qual busca?</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {pendingAction && blocks.map((block, i) => (
              <button key={block.id} onClick={() => applyToBlock(i, pendingAction)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/30 hover:bg-primary/15 hover:border-primary/50 transition-all text-left">
                <span className="text-sm font-bold text-primary">Busca {i + 1}</span>
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {block.query && `${block.query}`}{block.query && block.cidade && " — "}{block.cidade && `${block.cidade}/${block.estado}`}
                  {block.bairros.length > 0 && ` (${block.bairros.join(", ")})`}{!block.query && !block.cidade && "Vazio"}
                </span>
              </button>
            ))}
            {blocks.length < MAX_BLOCKS && pendingAction && (
              <button onClick={() => { const nb = newBlock(); setBlocks((prev) => [...prev, nb]); setTimeout(() => applyToBlock(blocks.length, pendingAction!), 0); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-all text-sm font-semibold">
                <Plus className="h-4 w-4" /> Nova busca
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Confirmar Busca {confirmDialog ? confirmDialog.blockIndex + 1 : ""}
            </DialogTitle>
          </DialogHeader>
          {confirmDialog && (
            <div className="space-y-4 pt-2">
              <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Nicho</span>
                  <span className="text-sm font-semibold text-foreground">{confirmDialog.query || "—"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Cidade</span>
                  <Input value={confirmDialog.cidade} onChange={(e) => setConfirmDialog((prev) => prev ? { ...prev, cidade: e.target.value } : null)} className="h-9 bg-secondary border-border" placeholder="ex: São Paulo" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Estado</span>
                  <Input value={confirmDialog.estado} onChange={(e) => setConfirmDialog((prev) => prev ? { ...prev, estado: e.target.value } : null)} className="h-9 bg-secondary border-border w-24" placeholder="ex: SP" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Bairros <span className="text-[10px] font-normal">(até 8, opcional)</span></span>
                  <div className="flex flex-wrap gap-1.5">
                    {confirmDialog.bairros.map((b) => (
                      <Badge key={b} className="bg-primary text-primary-foreground gap-1 pr-1 text-xs">
                        {b}
                        <button onClick={() => setConfirmDialog((prev) => prev ? { ...prev, bairros: prev.bairros.filter(x => x !== b) } : null)} className="ml-0.5 hover:bg-primary-foreground/20 rounded-full p-0.5">×</button>
                      </Badge>
                    ))}
                    {confirmDialog.bairros.length === 0 && <span className="text-xs text-muted-foreground">Nenhum selecionado</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Quantidade de Leads</span>
                  <Select value={String(confirmDialog.targetTotal)} onValueChange={(v) => setConfirmDialog((prev) => prev ? { ...prev, targetTotal: Number(v) } : null)}>
                    <SelectTrigger className="w-[130px] h-9 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[20, 50, 100, 200, 300, 400].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} leads</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDialog(null)}>Editar</Button>
                <Button className="flex-1 glow-neon" onClick={handleConfirmBlock}><CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Research Flux - Toggleable Panel */}
      {showResearch && (
        <aside className="flex flex-col w-[380px] lg:w-[480px] xl:w-[520px] border-2 border-primary bg-[hsl(0_0%_3%)] shrink-0 h-screen sticky top-0 glow-neon-strong">
          <div className="px-5 py-4 border-b border-primary/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-destructive text-xl">⚡</span>
              <span className="text-destructive font-extrabold text-lg">Flux Painel</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setShowResearch(false)}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-3 grid grid-cols-2">
              <TabsTrigger value="research" className="text-xs font-bold gap-1"><Zap className="h-3.5 w-3.5" /> Research</TabsTrigger>
              <TabsTrigger value="maps" className="text-xs font-bold gap-1"><MapPin className="h-3.5 w-3.5" /> Flux Maps</TabsTrigger>
            </TabsList>
            <TabsContent value="research" className="flex-1 overflow-hidden mt-0">
              <ResearchFlux onSelectNiche={handleSelectNiche} onConfirmSubnichos={(limit?: number) => {
                const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
                if (limit && limit > 0) {
                  setBlocks((prev) => { const updated = [...prev]; updated[targetIndex] = { ...updated[targetIndex], targetTotal: limit }; return updated; });
                }
                setTimeout(() => setSidebarTab("maps"), 0);
              }} />
            </TabsContent>
            <TabsContent value="maps" className="flex-1 overflow-hidden mt-0 flex flex-col">
              <div className="px-4 py-3 border-b border-border/30">
                <p className="text-xs text-white/70">Explore empresas diretamente pelo mapa. Clique em uma região e descubra empresas com alto potencial de automação.</p>
              </div>
              <FluxMaps onSelectLocation={handleSelectLocation} onSelectMultipleBairros={handleSelectMultipleBairros} onSelectCity={(cidade, estado) => {
                const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
                setBlocks((prev) => { const updated = [...prev]; updated[targetIndex] = { ...updated[targetIndex], cidade, estado }; return updated; });
              }} onToggleBairro={(cidade, estado, bairro, selected) => {
                const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
                setBlocks((prev) => {
                  const updated = [...prev];
                  const block = updated[targetIndex];
                  const currentBairros = block.bairros || [];
                  if (selected) {
                    if (!currentBairros.includes(bairro) && currentBairros.length < 8) updated[targetIndex] = { ...block, cidade, estado, bairros: [...currentBairros, bairro] };
                  } else {
                    updated[targetIndex] = { ...block, bairros: currentBairros.filter(b => b !== bairro) };
                  }
                  return updated;
                });
              }} selectedNiche={selectedNiche} />
            </TabsContent>
          </Tabs>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="relative w-full flex items-center justify-center px-6 py-4 border-b border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent glow-neon-strong" />
          <div className="relative flex items-center gap-4">
            {!showResearch && (
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-primary" onClick={() => setShowResearch(true)}>
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center glow-neon">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-2xl font-display text-foreground tracking-tight">
                Flux<span className="text-neon">AI</span>
              </span>
            </div>
            <span className="text-xl hidden sm:inline font-black px-3 py-1 rounded-md bg-[hsl(0_0%_5%)]" style={{ color: 'hsl(142, 71%, 55%)' }}>— Inteligência Comercial</span>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-[1100px] mx-auto w-full">
          {/* Search blocks */}
          <Card className="border border-primary/50 bg-[hsl(0_0%_7%)] glow-neon-strong">
            <CardHeader className="pb-4">
               <CardTitle className="text-2xl flex items-center gap-2 font-display text-primary">
                <Search className="h-7 w-7 text-primary" />
                Encontre Empresas com Alto Potencial de Automação
              </CardTitle>
              <CardDescription className="text-sm text-white/80">
                Descubra empresas com baixa maturidade digital, atendimento manual e grande oportunidade para automação e vendas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {blocks.map((block, i) => (
                <SearchBlockCard key={block.id} block={block} index={i} canRemove={blocks.length > 1} status={blockStatuses[block.id] || "idle"} result={blockResults[block.id]} onChange={updateBlock} onRemove={removeBlock} />
              ))}
              <SearchSummary blocks={blocks} />
              <div className="flex flex-wrap gap-3">
                {blocks.length < MAX_BLOCKS && (
                  <Button variant="outline" size="sm" onClick={addBlock} className="bg-background text-foreground border-border hover:bg-secondary">
                    <Plus className="h-4 w-4 mr-1" /> Adicionar busca
                  </Button>
                )}
                <TemplateSelector onApplyTemplate={applyTemplate} />
                <div className="flex items-center gap-1 px-3 py-2 rounded-md border border-primary/30 bg-primary/5">
                  <Flame className="h-4 w-4 text-primary shrink-0" />
                  <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                    <SelectTrigger className="h-8 w-[180px] text-xs border-0 bg-transparent font-semibold text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Leads</SelectItem>
                      <SelectItem value="prioritarios">Leads Prioritários</SelectItem>
                      <SelectItem value="muito_quentes">Somente Muito Quentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-auto">
                  <div className="flex items-center gap-3">
                    <Button onClick={buscar} disabled={loading} className="glow-neon">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      Iniciar Busca de Leads
                    </Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10" title="Limpar buscas" onClick={() => { setBlocks([newBlock()]); setLeads([]); setBlockStatuses({}); setBlockResults({}); setApiMeta(undefined); }}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-white/50 max-w-[340px] text-right">O sistema combina nicho, subnichos e localização para encontrar empresas com maior potencial comercial.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading */}
          {loading && <LoadingSteps />}

          {/* Empty */}
          {!loading && leads.length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="py-16 text-center">
                <Search className="h-14 w-14 mx-auto mb-4 opacity-20 text-muted-foreground" />
                <p className="text-2xl font-semibold font-display text-white">Ranking de Oportunidades Comerciais</p>
                <p className="text-lg mt-2 text-white/80">Preencha os blocos acima e clique em "Iniciar Busca de Leads" para encontrar leads com sinais reais de necessidade de automação.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
                  {[
                    "Prospecção inteligente baseada em dados reais de mercado",
                    "Identifique negócios que ainda operam com processos manuais",
                    "Encontre oportunidades comerciais antes dos seus concorrentes",
                  ].map((t) => (
                    <Badge key={t} variant="outline" className="text-neon border-primary/30 text-sm">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {leads.length > 0 && (
            <>
              {/* Stats Summary */}
              {(() => {
                const muitoQuentes = leads.filter(l => getEffectiveLevel(l).includes("muito quente")).length;
                const quentes = leads.filter(l => { const lv = getEffectiveLevel(l); return lv.includes("quente") && !lv.includes("muito"); }).length;
                const mornos = leads.filter(l => getEffectiveLevel(l) === "morno").length;
                const baixos = leads.length - muitoQuentes - quentes - mornos;
                const prioritarios = leads.filter(isHotLead).length;
                return (
                  <div className="rounded-lg border border-primary/30 bg-card p-4 space-y-2">
                    <p className="text-sm font-bold text-foreground">{leads.length} Leads encontrados — <span className="text-primary">{filtered.length} exibidos</span></p>
                    <div className="flex flex-wrap gap-3 text-xs font-medium">
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-primary" /> Prioritários: <strong>{prioritarios}</strong></span>
                      <span className="flex items-center gap-1">🔥 Muito Quentes: <strong>{muitoQuentes}</strong></span>
                      <span className="flex items-center gap-1">🟠 Quentes: <strong>{quentes}</strong></span>
                      <span className="flex items-center gap-1">🟡 Mornos: <strong>{mornos}</strong></span>
                      <span className="flex items-center gap-1">⚪ Baixo: <strong>{baixos}</strong></span>
                    </div>
                  </div>
                );
              })()}

              {/* KPI Bar */}
              <KpiBar leads={leads} meta={apiMeta} onFilterClick={handleKpiFilterClick} />

              {/* Metro Expansion Suggestion */}
              {(() => {
                const hasShortfall = Object.values(blockResults).some(r => r.found < r.requested);
                const searchedCities = blocks.filter(b => b.cidade && b.estado);
                if (!hasShortfall || searchedCities.length === 0) return null;
                const firstCity = searchedCities[0];
                const metroCities = getMetroCities(firstCity.cidade, firstCity.estado);
                if (metroCities.length === 0) return null;
                const alreadySearched = new Set(blocks.map(b => b.cidade.toLowerCase().trim()));
                const available = metroCities.filter(m => !alreadySearched.has(m.cidade.toLowerCase()));
                if (available.length === 0) return null;
                return (
                  <Card className="border-yellow-500/40 bg-yellow-500/5">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="space-y-2 flex-1">
                          <p className="text-sm font-semibold text-yellow-500">
                            Expandir para região metropolitana de {firstCity.cidade}?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Resultados abaixo do esperado. Adicione cidades próximas para aumentar o volume de leads.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {available.slice(0, 6).map((city) => (
                              <Button
                                key={city.cidade}
                                variant="outline"
                                size="sm"
                                className={`h-7 text-xs gap-1 ${
                                  city.potencial === "alto"
                                    ? "border-primary/50 text-primary hover:bg-primary/15"
                                    : "border-border text-muted-foreground hover:bg-muted"
                                }`}
                                onClick={() => {
                                  if (blocks.length < MAX_BLOCKS) {
                                    const nb = newBlock();
                                    nb.query = firstCity.query || blocks[0]?.query || "";
                                    nb.cidade = city.cidade;
                                    nb.estado = city.estado;
                                    nb.targetTotal = firstCity.targetTotal || 100;
                                    nb.subnichos = [...(firstCity.subnichos || [])];
                                    setBlocks(prev => [...prev, nb]);
                                    toast({ title: `${city.cidade}/${city.estado} adicionada como nova busca` });
                                  } else {
                                    toast({ title: "Máximo de buscas atingido", variant: "destructive" });
                                  }
                                }}
                              >
                                <Plus className="h-3 w-3" />
                                {city.cidade}
                                {city.potencial === "alto" && <Flame className="h-3 w-3 text-destructive" />}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  {selectedLeads.size > 0 && <span className="text-xs text-neon font-semibold">{selectedLeads.size} selecionados</span>}
                </div>
                <div className="flex gap-2">
                  {selectedLeads.size > 0 && (
                    <Button variant="default" size="sm" onClick={() => exportData(true)} className="bg-destructive hover:bg-destructive/90">
                      <Download className="h-4 w-4 mr-2" /> Exportar Excel ({selectedLeads.size})
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => exportData(false)} className="border-neon text-neon hover:bg-primary hover:text-primary-foreground">
                    <Download className="h-4 w-4 mr-2" /> Exportar Excel ({leads.length})
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <LeadFilters
                activeFilters={quickFilters}
                onToggleFilter={toggleQuickFilter}
                onClearFilters={() => setQuickFilters([])}
                sortBy={sortBy}
                onSortChange={setSortBy}
                searchName={searchName}
                onSearchChange={setSearchName}
                totalFiltered={filtered.length}
                totalLeads={leads.length}
              />

              {/* Lead Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((lead) => {
                  const key = dedupeKey(lead);
                  return (
                    <LeadCard
                      key={key}
                      lead={lead}
                      selected={selectedLeads.has(key)}
                      onToggleSelect={() => toggleLeadSelection(key)}
                    />
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum lead corresponde aos filtros.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
