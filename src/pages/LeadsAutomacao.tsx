import { useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Download, Filter, Plus, Zap, PanelLeftOpen, PanelLeftClose, Flame, CheckSquare, MapPin } from "lucide-react";
import { SearchBlockCard } from "@/components/leads/SearchBlockCard";
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

let blockIdCounter = 0;
function newBlock(): SearchBlock {
  return { id: `b${++blockIdCounter}`, query: "", cidade: "", estado: "", bairro: "", targetTotal: 20 };
}

async function fetchBlock(block: SearchBlock): Promise<LeadAutomacao[]> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: block.query,
      local: { cidade: block.cidade, estado: block.estado, bairro: block.bairro || undefined },
      target_total: block.targetTotal,
      format: "json",
    }),
  });

  const contentType = res.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const text = await res.text();
    console.error("Expected JSON but got:", contentType);
    console.error("Response preview:", text.substring(0, 200));

    if (text.trim().startsWith("<!") || text.includes("<html")) {
      throw new Error(
        `API retornou HTML em vez de JSON. Status: ${res.status}. Verifique autenticação ou rate limiting.`
      );
    }
    throw new Error(`Formato inesperado da resposta: ${contentType}`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro API ${res.status}: ${text.substring(0, 200)}`);
  }

  const data = await res.json();
  return Array.isArray(data.empresas) ? data.empresas : [];
}

export default function LeadsAutomacao() {
  const [blocks, setBlocks] = useState<SearchBlock[]>([newBlock()]);
  const [leads, setLeads] = useState<LeadWithOrigin[]>([]);
  const [loading, setLoading] = useState(false);
  const [blockStatuses, setBlockStatuses] = useState<Record<string, "idle" | "loading" | "done" | "error">>({});
  const [tempFilter, setTempFilter] = useState("Todos");
  const [searchName, setSearchName] = useState("");
  const [showResearch, setShowResearch] = useState(true);
  const [onlyHotLeads, setOnlyHotLeads] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [sidebarTab, setSidebarTab] = useState<string>("research");
  const [pendingAction, setPendingAction] = useState<{ type: "niche"; term: string } | { type: "location"; cidade: string; estado: string; bairro?: string } | null>(null);
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
        updated[blockIndex] = {
          ...updated[blockIndex],
          cidade: action.cidade,
          estado: action.estado,
          bairro: action.bairro || updated[blockIndex].bairro,
        };
      }
      return updated;
    });
    setPendingAction(null);
  }, []);

  const handleSelectNiche = useCallback((term: string) => {
    setSelectedNiche(term);
    setBlocks((prev) => {
      if (prev.length === 1) {
        return [{ ...prev[0], query: term }];
      }
      return prev;
    });
    if (blocks.length > 1) {
      setPendingAction({ type: "niche", term });
    }
    setSidebarTab("maps");
  }, [blocks.length]);

  const handleSelectLocation = useCallback((cidade: string, estado: string, bairro?: string) => {
    if (blocks.length === 1) {
      setBlocks((prev) => [{ ...prev[0], cidade, estado, bairro: bairro || prev[0].bairro }]);
    } else {
      setPendingAction({ type: "location", cidade, estado, bairro });
    }
  }, [blocks.length]);

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
      bairro: b?.bairro || "",
      targetTotal: b?.targetTotal || b?.quantidade || 20,
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
    setTempFilter("Todos");
    setSearchName("");

    const statuses: Record<string, "idle" | "loading" | "done" | "error"> = {};
    valid.forEach((b) => (statuses[b.id] = "loading"));
    setBlockStatuses({ ...statuses });

    const allLeads: LeadWithOrigin[] = [];
    const errors: string[] = [];

    const results = await Promise.allSettled(
      valid.map(async (block, idx) => {
        try {
          const empresas = await fetchBlock(block);
          statuses[block.id] = "done";
          setBlockStatuses({ ...statuses });
          return { empresas, index: idx, label: `Busca ${idx + 1}: ${block.query}` };
        } catch (err: any) {
          statuses[block.id] = "error";
          setBlockStatuses({ ...statuses });
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
      {/* Research Flux - Toggleable Panel */}
      {showResearch && (
        <aside className="flex flex-col w-[320px] lg:w-[400px] border-2 border-primary bg-[hsl(0_0%_3%)] shrink-0 h-screen sticky top-0 glow-neon-strong">
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
              <FluxMaps onSelectLocation={handleSelectLocation} selectedNiche={selectedNiche} />
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
