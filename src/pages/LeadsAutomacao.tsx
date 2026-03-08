import { useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Download, Filter, Plus, Zap, PanelLeftOpen, PanelLeftClose, Flame, CheckSquare, MapPin, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchBlockCard } from "@/components/leads/SearchBlockCard";
import { TemplateSelector } from "@/components/leads/TemplateSelector";
import { ResearchFlux } from "@/components/ResearchFlux";
import { FluxMaps } from "@/components/FluxMaps";
import { LeadCard } from "@/components/leads/LeadCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { SearchBlock, LeadWithOrigin } from "@/components/leads/types";
import type { FluxTemplate } from "@/lib/fluxTemplates";
import type { LeadAutomacao } from "@/lib/buscarLeadsAutomacao";
import { deduplicateLeads } from "@/lib/deduplicateLeads";

const API_URL = "https://api.fluxleads.com.br/webhook/buscar-empresas-automacao";
const AUTH = "Bearer key_pro_123";
const MAX_BLOCKS = 5;
const TEMP_FILTERS = ["Todos", "quente", "morno", "frio"] as const;
const PAGE_SIZE = 50;

let blockIdCounter = 0;
function newBlock(): SearchBlock {
  return { id: `b${++blockIdCounter}`, query: "", subnichos: [], cidade: "", estado: "", bairros: [], targetTotal: 100 };
}

function dedupeKey(e: LeadAutomacao): string {
  if (e.fsq_id) return e.fsq_id;
  return `${(e.nome || "").toLowerCase()}|${(e.endereco || "").toLowerCase()}`;
}

interface FetchResult {
  leads: LeadAutomacao[];
  reason?: "api_limit" | "no_more_pages" | "all_fetched";
  pagesScanned: number;
}

async function fetchBlock(block: SearchBlock): Promise<FetchResult> {
  const seen = new Map<string, LeadAutomacao>();
  let pagesScanned = 0;
  let reason: FetchResult["reason"] = "all_fetched";

  // Use subnichos as search queries if available, otherwise fall back to query
  const queries = block.subnichos && block.subnichos.length > 0 ? block.subnichos : [block.query];
  const bairroList = block.bairros.length > 0 ? block.bairros : [undefined];

  for (const searchQuery of queries) {
  for (const bairro of bairroList) {
    let offset = 0;
    let keepGoing = true;

    while (keepGoing && seen.size < block.targetTotal) {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          local: { cidade: block.cidade, estado: block.estado, bairro: bairro || undefined },
          target_total: block.targetTotal,
          format: "json",
          pageSize: PAGE_SIZE,
          offset,
        }),
      });

      const contentType = res.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        if (text.trim().startsWith("<!") || text.includes("<html")) {
          throw new Error(`API retornou HTML em vez de JSON. Status: ${res.status}.`);
        }
        throw new Error(`Formato inesperado da resposta: ${contentType}`);
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro API ${res.status}: ${text.substring(0, 200)}`);
      }

      const data = await res.json();
      const batch: LeadAutomacao[] = Array.isArray(data.empresas) ? data.empresas : [];
      pagesScanned++;

      for (const e of batch) {
        const key = dedupeKey(e);
        if (!seen.has(key)) seen.set(key, e);
      }

      if (batch.length < PAGE_SIZE) {
        reason = "no_more_pages";
        keepGoing = false;
      } else if (seen.size >= block.targetTotal) {
        reason = "all_fetched";
        keepGoing = false;
      } else {
        offset += PAGE_SIZE;
        await new Promise(r => setTimeout(r, 150));
      }
    }

    if (seen.size >= block.targetTotal) break;
  }

  if (seen.size < block.targetTotal && reason === "all_fetched") {
    reason = "api_limit";
  }

  return { leads: Array.from(seen.values()), reason, pagesScanned };
}

export default function LeadsAutomacao() {
  const [blocks, setBlocks] = useState<SearchBlock[]>([newBlock()]);
  const [leads, setLeads] = useState<LeadWithOrigin[]>([]);
  const [loading, setLoading] = useState(false);
  const [blockStatuses, setBlockStatuses] = useState<Record<string, "idle" | "loading" | "done" | "error">>({});
  const [blockResults, setBlockResults] = useState<Record<string, { found: number; requested: number; message?: string }>>({}); 
  const [tempFilter, setTempFilter] = useState("Todos");
  const [searchName, setSearchName] = useState("");
  const [showResearch, setShowResearch] = useState(true);
  const [onlyHotLeads, setOnlyHotLeads] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [sidebarTab, setSidebarTab] = useState<string>("research");
  const [pendingAction, setPendingAction] = useState<{ type: "niche"; term: string } | { type: "location"; cidade: string; estado: string; bairro?: string } | null>(null);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    blockIndex: number; query: string; cidade: string; estado: string; bairros: string[]; targetTotal: number;
  } | null>(null);
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
          ? [...updated[blockIndex].bairros, action.bairro].slice(0, 4)
          : updated[blockIndex].bairros;
        updated[blockIndex] = {
          ...updated[blockIndex],
          cidade: action.cidade,
          estado: action.estado,
          bairros: newBairros,
        };
      }
      return updated;
    });
    setActiveBlockIndex(blockIndex);
    setPendingAction(null);
    if (action.type === "niche") {
      setSidebarTab("maps");
    }
  }, []);

  const handleSelectNiche = useCallback((niche: string, subnicho: string) => {
    setSelectedNiche(niche);
    const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
    setBlocks((prev) => {
      const updated = [...prev];
      const block = updated[targetIndex];
      const currentSubnichos = block.subnichos || [];
      if (currentSubnichos.length < 5 && !currentSubnichos.includes(subnicho)) {
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
    const newBairros = bairro && !existing.includes(bairro) ? [...existing, bairro].slice(0, 4) : existing;
    setBlocks((prev) => {
      const updated = [...prev];
      updated[targetIndex] = { ...updated[targetIndex], cidade, estado, bairros: newBairros };
      return updated;
    });
    setConfirmDialog({
      blockIndex: targetIndex,
      query: currentBlock?.query || "",
      cidade,
      estado,
      bairros: newBairros,
      targetTotal: currentBlock?.targetTotal || 100,
    });
  }, [blocks, activeBlockIndex]);

  const handleSelectMultipleBairros = useCallback((cidade: string, estado: string, bairros: string[]) => {
    const targetIndex = Math.min(activeBlockIndex, blocks.length - 1);
    const currentBlock = blocks[targetIndex];
    setBlocks((prev) => {
      const updated = [...prev];
      updated[targetIndex] = { ...updated[targetIndex], cidade, estado, bairros: bairros.slice(0, 4) };
      return updated;
    });
    setConfirmDialog({
      blockIndex: targetIndex,
      query: currentBlock?.query || "",
      cidade,
      estado,
      bairros: bairros.slice(0, 4),
      targetTotal: currentBlock?.targetTotal || 100,
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
    // Advance to next block
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
    setBlockResults({});
    setTempFilter("Todos");
    setSearchName("");

    const statuses: Record<string, "idle" | "loading" | "done" | "error"> = {};
    valid.forEach((b) => (statuses[b.id] = "loading"));
    setBlockStatuses({ ...statuses });

    const allLeads: LeadWithOrigin[] = [];
    const errors: string[] = [];

    const blockResultsMap: Record<string, { found: number; requested: number; message?: string }> = {};

    const results = await Promise.allSettled(
      valid.map(async (block, idx) => {
        try {
          const result = await fetchBlock(block);
          statuses[block.id] = "done";
          setBlockStatuses({ ...statuses });
          const found = result.leads.length;
          const requested = block.targetTotal;
          let message: string | undefined;
          if (found === 0) {
            message = "Nenhum resultado encontrado para este nicho/local.";
          } else if (found < requested) {
            const reasonText = result.reason === "no_more_pages"
              ? `A API retornou apenas ${found} empresas — não existem mais resultados para "${block.query}" em ${block.cidade}${block.bairros.length ? ` (${block.bairros.join(", ")})` : ""}. Tente remover bairros ou ampliar o nicho.`
              : `Foram encontradas ${found} de ${requested} empresas solicitadas. A região/nicho tem poucas empresas cadastradas.`;
            message = reasonText;
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

    let unique = deduplicateLeads(allLeads);
    if (onlyHotLeads) {
      unique = unique.filter((l) => (l.temperatura_lead || "").toLowerCase().includes("quente"));
    }
    // Sort by score descending for better results
    unique.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    setLeads(unique);
    setSelectedLeads(new Set());
    setLoading(false);

    if (errors.length) toast({ title: "Algumas buscas falharam", description: errors.join("; "), variant: "destructive" });
    else if (unique.length === 0) toast({ title: onlyHotLeads ? "Nenhum lead quente encontrado." : "Nenhuma empresa encontrada." });
    else toast({ title: `${unique.length} empresas encontradas${onlyHotLeads ? " (apenas quentes)" : ""}` });
  };

  const filtered = useMemo(() => {
    let list = leads;
    if (tempFilter !== "Todos") list = list.filter((l) => (l.temperatura_lead || "").toLowerCase().includes(tempFilter));
    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      list = list.filter((l) => (l.nome || "").toLowerCase().includes(q));
    }
    return list;
  }, [leads, tempFilter, searchName]);

  const tempCounts = useMemo(() => {
    const c = { quente: 0, morno: 0, frio: 0 };
    for (const l of leads) {
      const t = (l.temperatura_lead || "").toLowerCase();
      if (t.includes("quente")) c.quente++;
      else if (t.includes("morno")) c.morno++;
      else c.frio++;
    }
    return c;
  }, [leads]);

  const toggleLeadSelection = useCallback((id: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedLeads(new Set(filtered.map((l) => l.fsq_id || `${l.nome}|${l.endereco}`)));
  }, [filtered]);

  const deselectAll = useCallback(() => {
    setSelectedLeads(new Set());
  }, []);

  const exportCSV = (onlySelected: boolean = false) => {
    const toExport = onlySelected
      ? filtered.filter((l) => selectedLeads.has(l.fsq_id || `${l.nome}|${l.endereco}`))
      : leads;
    if (!toExport.length) {
      toast({ title: "Nenhum lead para exportar", variant: "destructive" });
      return;
    }
    const headers = ["nome", "telefone_raw", "email", "website", "score", "temperatura_lead", "prioridade_comercial", "canal_sugerido", "tipo_automacao_indicada", "abordagem_sugerida", "originLabel"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = toExport.map((l) => headers.map((h) => esc((l as any)[h])));
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${onlySelected ? "selecionados" : "todos"}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado!", description: `${toExport.length} leads` });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Block Picker Dialog */}
      <Dialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {pendingAction?.type === "niche" ? (
                <>
                  <Zap className="h-5 w-5 text-primary" />
                  Aplicar nicho em qual busca?
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 text-primary" />
                  Aplicar local em qual busca?
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {pendingAction && blocks.map((block, i) => (
              <button
                key={block.id}
                onClick={() => applyToBlock(i, pendingAction)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/30 hover:bg-primary/15 hover:border-primary/50 transition-all text-left"
              >
                <span className="text-sm font-bold text-primary">Busca {i + 1}</span>
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {block.query && `${block.query}`}
                  {block.query && block.cidade && " — "}
                  {block.cidade && `${block.cidade}/${block.estado}`}
                  {block.bairros.length > 0 && ` (${block.bairros.join(", ")})`}
                  {!block.query && !block.cidade && "Vazio"}
                </span>
                {pendingAction.type === "niche" && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {block.query ? "Substituir" : "Preencher"}
                  </Badge>
                )}
                {pendingAction.type === "location" && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {block.cidade ? "Substituir" : "Preencher"}
                  </Badge>
                )}
              </button>
            ))}
            {blocks.length < MAX_BLOCKS && pendingAction && (
              <button
                onClick={() => {
                  const nb = newBlock();
                  setBlocks((prev) => [...prev, nb]);
                  setTimeout(() => applyToBlock(blocks.length, pendingAction), 0);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-all text-sm font-semibold"
              >
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
                  <Input
                    value={confirmDialog.cidade}
                    onChange={(e) => setConfirmDialog((prev) => prev ? { ...prev, cidade: e.target.value } : null)}
                    className="h-9 bg-secondary border-border"
                    placeholder="ex: São Paulo"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Estado</span>
                  <Input
                    value={confirmDialog.estado}
                    onChange={(e) => setConfirmDialog((prev) => prev ? { ...prev, estado: e.target.value } : null)}
                    className="h-9 bg-secondary border-border w-24"
                    placeholder="ex: SP"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Bairros <span className="text-[10px] font-normal">(até 4, opcional)</span></span>
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
                  <Select
                    value={String(confirmDialog.targetTotal)}
                    onValueChange={(v) => setConfirmDialog((prev) => prev ? { ...prev, targetTotal: Number(v) } : null)}
                  >
                    <SelectTrigger className="w-[130px] h-9 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[20, 50, 100, 200, 300, 400].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} leads</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDialog(null)}>
                  Editar
                </Button>
                <Button className="flex-1 glow-neon" onClick={handleConfirmBlock}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
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
              <TabsTrigger value="research" className="text-xs font-bold gap-1">
                <Zap className="h-3.5 w-3.5" /> Research
              </TabsTrigger>
              <TabsTrigger value="maps" className="text-xs font-bold gap-1">
                <MapPin className="h-3.5 w-3.5" /> Flux Maps
              </TabsTrigger>
            </TabsList>
            <TabsContent value="research" className="flex-1 overflow-hidden mt-0">
              <ResearchFlux onSelectNiche={handleSelectNiche} />
            </TabsContent>
            <TabsContent value="maps" className="flex-1 overflow-hidden mt-0">
              <FluxMaps onSelectLocation={handleSelectLocation} onSelectMultipleBairros={handleSelectMultipleBairros} selectedNiche={selectedNiche} />
            </TabsContent>
          </Tabs>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="relative w-full flex items-center justify-center px-6 py-4 border-b border-primary/20 overflow-hidden">
          {/* Neon glow background */}
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
            <span className="text-xl hidden sm:inline font-black px-3 py-1 rounded-md bg-[hsl(0_0%_5%)]" style={{ color: 'hsl(142, 71%, 55%)' }}>— Leads com Potencial de Automação</span>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-[1100px] mx-auto w-full">
          {/* Search blocks */}
          <Card className="border border-primary/50 bg-[hsl(0_0%_7%)] glow-neon-strong">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2 font-display text-white">
                <Search className="h-7 w-7 text-neon" />
                Buscar Empresas com Potencial de Automação
              </CardTitle>
              <CardDescription className="text-lg text-white/60">Adicione até {MAX_BLOCKS} buscas diferentes e execute todas de uma vez</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {blocks.map((block, i) => (
                <SearchBlockCard
                  key={block.id}
                  block={block}
                  index={i}
                  canRemove={blocks.length > 1}
                  status={blockStatuses[block.id] || "idle"}
                  result={blockResults[block.id]}
                  onChange={updateBlock}
                  onRemove={removeBlock}
                />
              ))}
              <div className="flex flex-wrap gap-3">
                {blocks.length < MAX_BLOCKS && (
                  <Button variant="outline" size="sm" onClick={addBlock} className="bg-background text-foreground border-border hover:bg-secondary">
                    <Plus className="h-4 w-4 mr-1" /> Adicionar busca
                  </Button>
                )}
                <TemplateSelector onApplyTemplate={applyTemplate} />
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-destructive/30 bg-destructive/10">
                  <Checkbox
                    id="onlyHot"
                    checked={onlyHotLeads}
                    onCheckedChange={(checked) => setOnlyHotLeads(!!checked)}
                    className="border-destructive data-[state=checked]:bg-destructive"
                  />
                  <label htmlFor="onlyHot" className="text-sm font-medium text-destructive cursor-pointer flex items-center gap-1">
                    <Flame className="h-4 w-4" /> Apenas Quentes
                  </label>
                </div>
                <Button onClick={buscar} disabled={loading} className="glow-neon">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar Empresas
                </Button>
              </div>
            </CardContent>
          </Card>

        {/* Loading */}
        {loading && (
          <Card className="border-border bg-card">
            <CardContent className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-neon" />
              <p className="text-muted-foreground font-medium">Buscando empresas...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && leads.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="py-16 text-center text-muted-foreground">
              <Search className="h-14 w-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma empresa encontrada.</p>
              <p className="text-sm mt-1">Preencha os blocos acima e clique em "Buscar Empresas".</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {leads.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-foreground">{leads.length} empresas encontradas</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-destructive border-destructive/30">🔥 {tempCounts.quente}</Badge>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">🌡 {tempCounts.morno}</Badge>
                  <Badge variant="outline" className="text-muted-foreground">❄️ {tempCounts.frio}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedLeads.size > 0 && (
                  <Button variant="default" size="sm" onClick={() => exportCSV(true)} className="bg-destructive hover:bg-destructive/90">
                    <Download className="h-4 w-4 mr-2" /> Exportar Selecionados ({selectedLeads.size})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => exportCSV(false)} className="border-neon text-neon hover:bg-primary hover:text-primary-foreground">
                  <Download className="h-4 w-4 mr-2" /> Exportar Todos ({leads.length})
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>Selecionar Todos</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAll}>Limpar</Button>
                {selectedLeads.size > 0 && <span className="text-xs text-neon font-semibold">{selectedLeads.size} selecionados</span>}
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
              {TEMP_FILTERS.map((f) => (
                <Button
                  key={f}
                  variant={tempFilter === f ? "default" : "outline"}
                  size="sm"
                  className={`text-xs h-8 ${tempFilter === f ? "glow-neon" : "border-border"}`}
                  onClick={() => setTempFilter(f)}
                >
                  {f === "Todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
              <Input
                placeholder="Buscar por nome..."
                className="max-w-[220px] h-8 text-sm bg-secondary border-border"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              {filtered.length !== leads.length && (
                <span className="text-xs text-muted-foreground">{filtered.length} de {leads.length}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((lead, i) => {
                const id = lead.fsq_id || `${lead.nome}|${lead.endereco}`;
                return (
                  <LeadCard
                    key={id}
                    lead={lead}
                    selected={selectedLeads.has(id)}
                    onToggleSelect={() => toggleLeadSelection(id)}
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
