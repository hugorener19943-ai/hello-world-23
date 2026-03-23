import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Download, ArrowLeft, Loader2, MapPin, Calendar, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCampaigns, fetchCampaignLeads, createCampaign, type Campaign, type CampaignLead, type NewCampaignPayload } from "@/lib/campaignsApi";

const LEADS_PER_PAGE = 1000;

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function exportLeadsToCSV(leads: CampaignLead[], campaignName: string) {
  const BOM = "\uFEFF";
  const sep = ";";
  const headers = ["Nome", "Nicho", "Cidade", "Estado", "Telefone", "WhatsApp", "Email", "Website", "Instagram", "Score", "Endereço", "Bairro"];
  const esc = (v: string) => {
    if (!v) return "";
    if (v.includes(";") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const rows = leads.map(l => [
    esc(l.nome || ""), esc(l.nicho || l.categoria || ""), esc(l.cidade || ""), esc(l.estado || ""),
    esc(l.telefone || ""), esc(l.whatsapp || ""), esc(l.email || ""), esc(l.website || ""),
    esc(l.instagram || ""), String(l.score ?? ""), esc(l.endereco || ""), esc(l.bairro || ""),
  ]);
  const csv = BOM + [headers.join(sep), ...rows.map(r => r.join(sep))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${campaignName.replace(/\s+/g, "_")}_leads.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── New Campaign Modal ───
function NewCampaignModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NewCampaignPayload>({ name: "", niche: "", city: "", state: "", subniches: [], districts: [], min_score: 0 });
  const [subnichosInput, setSubnichosInput] = useState("");

  const handleCreate = async () => {
    if (!form.niche || !form.city || !form.state) {
      toast({ title: "Preencha nicho, cidade e estado", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const subniches = subnichosInput.split(",").map(s => s.trim()).filter(Boolean);
      const payload = { ...form, subniches, name: form.name || `${form.niche} — ${form.city}, ${form.state}` };
      await createCampaign(payload);
      toast({ title: "Campanha criada com sucesso!" });
      onCreated();
      onClose();
    } catch (e: any) {
      toast({ title: "Erro ao criar campanha", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova Campanha</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Nome (opcional)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input placeholder="Nicho *" value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Cidade *" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <Input placeholder="Estado (sigla) *" maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
          </div>
          <Input placeholder="Subnichos (separados por vírgula)" value={subnichosInput} onChange={e => setSubnichosInput(e.target.value)} />
          <Input placeholder="Bairros (separados por vírgula)" value={form.districts.join(", ")} onChange={e => setForm(f => ({ ...f, districts: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} />
          <Input placeholder="Score mínimo (0)" type="number" value={form.min_score || ""} onChange={e => setForm(f => ({ ...f, min_score: Number(e.target.value) || 0 }))} />
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            Criar Campanha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Campaign Detail ───
function CampaignDetail({ campaign, onBack }: { campaign: Campaign; onBack: () => void }) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<CampaignLead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / LEADS_PER_PAGE));

  useEffect(() => {
    setLoading(true);
    fetchCampaignLeads(campaign.id, page, LEADS_PER_PAGE)
      .then(data => { setLeads(data.leads); setTotal(data.total); })
      .catch(e => toast({ title: "Erro", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [campaign.id, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>
        <h2 className="text-lg font-bold text-foreground">{campaign.name}</h2>
        <Badge variant="outline" className="text-xs">{campaign.city}, {campaign.state}</Badge>
        <Badge className="text-xs">{total.toLocaleString("pt-BR")} leads</Badge>
        <Button variant="outline" size="sm" onClick={() => { exportLeadsToCSV(leads, campaign.name); toast({ title: `${leads.length} leads exportados` }); }}>
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  {["#", "Nome", "Nicho", "Cidade", "Telefone", "Email", "Website", "Instagram", "Score"].map(h => (
                    <TableHead key={h} className="text-xs font-bold text-muted-foreground whitespace-nowrap px-3">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead, i) => (
                  <TableRow key={i} className="text-xs hover:bg-muted/30">
                    <TableCell className="px-3">{(page - 1) * LEADS_PER_PAGE + i + 1}</TableCell>
                    <TableCell className="px-3 font-medium truncate max-w-[200px]">{lead.nome}</TableCell>
                    <TableCell className="px-3">{lead.nicho || lead.categoria}</TableCell>
                    <TableCell className="px-3">{lead.cidade}</TableCell>
                    <TableCell className="px-3">{lead.telefone || lead.whatsapp}</TableCell>
                    <TableCell className="px-3 truncate max-w-[180px]">{lead.email}</TableCell>
                    <TableCell className="px-3 truncate max-w-[180px]">{lead.website}</TableCell>
                    <TableCell className="px-3">{lead.instagram}</TableCell>
                    <TableCell className="px-3 font-bold">{lead.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───
export default function Campanhas() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showNew, setShowNew] = useState(false);

  const loadCampaigns = () => {
    setLoading(true);
    fetchCampaigns()
      .then(c => setCampaigns(c.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())))
      .catch(e => toast({ title: "Erro", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCampaigns(); }, []);

  const cities = useMemo(() => [...new Set(campaigns.map(c => c.city))].sort(), [campaigns]);
  const states = useMemo(() => [...new Set(campaigns.map(c => c.state))].sort(), [campaigns]);

  const filtered = useMemo(() => {
    return campaigns.filter(c => {
      if (filterCity && c.city !== filterCity) return false;
      if (filterState && c.state !== filterState) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.niche.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
      }
      return true;
    });
  }, [campaigns, search, filterCity, filterState]);

  if (selectedCampaign) {
    return (
      <div className="dark min-h-screen bg-background p-4 md:p-8">
        <CampaignDetail campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Campanhas</h1>
            <p className="text-sm text-muted-foreground">{campaigns.length} campanhas • {campaigns.reduce((s, c) => s + c.total_leads, 0).toLocaleString("pt-BR")} leads total</p>
          </div>
          <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1" /> Nova Campanha</Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, nicho ou cidade..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterCity} onValueChange={v => setFilterCity(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Cidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas cidades</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterState} onValueChange={v => setFilterState(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[100px]"><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Nenhuma campanha encontrada</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <Card
                key={c.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedCampaign(c)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-semibold leading-tight">{c.name}</CardTitle>
                    <Badge className="text-[10px] shrink-0 ml-2">{c.total_leads.toLocaleString("pt-BR")} leads</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.city}, {c.state}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" /> {c.niche}
                    {c.subniches.length > 0 && <span className="text-muted-foreground/60"> • {c.subniches.slice(0, 3).join(", ")}{c.subniches.length > 3 ? ` +${c.subniches.length - 3}` : ""}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {formatDate(c.created_at)}
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <Badge variant="outline" className={`text-[10px] ${c.status === "done" ? "border-primary/40 text-primary" : "border-yellow-500/40 text-yellow-400"}`}>
                      {c.status === "done" ? "Concluída" : c.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <NewCampaignModal open={showNew} onClose={() => setShowNew(false)} onCreated={loadCampaigns} />
    </div>
  );
}
