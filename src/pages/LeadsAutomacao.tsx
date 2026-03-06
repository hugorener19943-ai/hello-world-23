import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Loader2, Copy, ExternalLink, Flame, Thermometer, Snowflake,
  Download, Phone, Mail, Globe, MessageCircle, Filter,
} from "lucide-react";
import { buscarLeadsAutomacao, type LeadAutomacao } from "@/lib/buscarLeadsAutomacao";
import { AppLayout } from "@/components/AppLayout";

const TEMP_FILTERS = ["Todos", "quente", "morno", "frio"] as const;

function tempCardClass(temp?: string) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return "border-l-4 border-l-destructive bg-destructive/5";
  if (t.includes("morno")) return "border-l-4 border-l-yellow-500 bg-yellow-500/5";
  return "border-l-4 border-l-muted-foreground/30 bg-muted/30";
}

function tempBadgeClass(temp?: string) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return "bg-destructive/15 text-destructive border-destructive/30";
  if (t.includes("morno")) return "bg-yellow-500/15 text-yellow-700 border-yellow-500/30";
  return "bg-muted text-muted-foreground border-border";
}

function TempIcon({ temp }: { temp?: string }) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return <Flame className="h-4 w-4 text-destructive" />;
  if (t.includes("morno")) return <Thermometer className="h-4 w-4 text-yellow-600" />;
  return <Snowflake className="h-4 w-4 text-muted-foreground" />;
}

function ScoreBar({ score }: { score?: number }) {
  const val = score ?? 0;
  const max = 200;
  const pct = Math.min(100, Math.round((val / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs font-bold text-foreground min-w-[2rem] text-right">{val}</span>
    </div>
  );
}

export default function LeadsAutomacao() {
  const [query, setQuery] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [targetTotal, setTargetTotal] = useState(20);
  const [leads, setLeads] = useState<LeadAutomacao[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tempFilter, setTempFilter] = useState<string>("Todos");
  const [searchName, setSearchName] = useState("");
  const { toast } = useToast();

  const buscar = async () => {
    if (!query || !cidade || !estado) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLeads([]);
    setTotal(0);
    setTempFilter("Todos");
    setSearchName("");
    try {
      const result = await buscarLeadsAutomacao({ query, cidade, estado, target_total: targetTotal });
      setLeads(result.leads);
      setTotal(result.total);
      if (result.leads.length === 0) {
        toast({ title: "Nenhuma empresa encontrada." });
      } else {
        toast({ title: `${result.leads.length} empresas encontradas com potencial de automação` });
      }
    } catch (err: any) {
      toast({ title: "Erro na busca", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = leads;
    if (tempFilter !== "Todos") {
      list = list.filter((l) => (l.temperatura_lead || "").toLowerCase().includes(tempFilter));
    }
    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      list = list.filter((l) => (l.nome || "").toLowerCase().includes(q));
    }
    return list;
  }, [leads, tempFilter, searchName]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  const exportCSV = () => {
    if (!leads.length) return;
    const headers = ["nome", "telefone_raw", "email", "website", "score", "temperatura_lead", "prioridade_comercial", "canal_sugerido", "tipo_automacao_indicada", "abordagem_sugerida"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = leads.map((l) => headers.map((h) => esc((l as any)[h])));
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `leads_${query.replace(/\s+/g, "_")}_${cidade.replace(/\s+/g, "_")}_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado!", description: `${leads.length} leads` });
  };

  const tempCounts = useMemo(() => {
    const counts = { quente: 0, morno: 0, frio: 0 };
    for (const l of leads) {
      const t = (l.temperatura_lead || "").toLowerCase();
      if (t.includes("quente")) counts.quente++;
      else if (t.includes("morno")) counts.morno++;
      else counts.frio++;
    }
    return counts;
  }, [leads]);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* Hero */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">FluxLeads</h1>
          <p className="text-muted-foreground">Prospecção Inteligente de Empresas</p>
          <p className="text-sm text-muted-foreground">Encontre empresas com alto potencial para automação comercial e atendimento.</p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Buscar Leads
            </CardTitle>
            <CardDescription>Informe o nicho e localização para encontrar empresas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label>Nicho</Label>
                <Input placeholder="ex: clínica odontológica" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input placeholder="ex: São Paulo" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input placeholder="ex: SP" value={estado} onChange={(e) => setEstado(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Select value={String(targetTotal)} onValueChange={(v) => setTargetTotal(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100, 200].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} leads</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={buscar} disabled={loading} className="h-10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar Leads
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Buscando empresas com potencial de automação...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && leads.length === 0 && total === 0 && (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Search className="h-14 w-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma empresa encontrada.</p>
              <p className="text-sm mt-1">Preencha os campos acima e clique em "Buscar Leads".</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {leads.length > 0 && (
          <>
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {leads.length} empresas encontradas com potencial de automação
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-destructive border-destructive/30">🔥 {tempCounts.quente}</Badge>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-500/30">🌡 {tempCounts.morno}</Badge>
                  <Badge variant="outline" className="text-muted-foreground">❄️ {tempCounts.frio}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" /> Exportar CSV ({leads.length})
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1.5">
                {TEMP_FILTERS.map((f) => (
                  <Button
                    key={f}
                    variant={tempFilter === f ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setTempFilter(f)}
                  >
                    {f === "Todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Buscar por nome..."
                className="max-w-[220px] h-8 text-sm"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              {filtered.length !== leads.length && (
                <span className="text-xs text-muted-foreground">{filtered.length} de {leads.length}</span>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((lead, i) => (
                <Card key={lead.fsq_id || `${i}`} className={`${tempCardClass(lead.temperatura_lead)} transition-shadow hover:shadow-lg`}>
                  <CardContent className="p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{lead.nome}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TempIcon temp={lead.temperatura_lead} />
                      </div>
                    </div>

                    {/* Score bar */}
                    <ScoreBar score={lead.score} />

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {lead.temperatura_lead && (
                        <Badge variant="outline" className={`text-[10px] ${tempBadgeClass(lead.temperatura_lead)}`}>{lead.temperatura_lead}</Badge>
                      )}
                      {lead.prioridade_comercial && (
                        <Badge variant="outline" className="text-[10px]">{lead.prioridade_comercial}</Badge>
                      )}
                      {lead.canal_sugerido && (
                        <Badge variant="outline" className="text-[10px]">{lead.canal_sugerido}</Badge>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="text-xs space-y-1.5 text-muted-foreground">
                      {lead.telefone_raw && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {lead.telefone_raw}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => copyText(lead.telefone_raw!, "Telefone")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <a href={`https://wa.me/${lead.telefone_raw.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-green-600 hover:text-green-700">
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" /> {lead.email}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => copyText(lead.email!, "Email")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {lead.website && (
                        <div className="flex items-center justify-between">
                          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline truncate">
                            <Globe className="h-3 w-3 shrink-0" /> {lead.website}
                          </a>
                          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-6 px-1.5">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Automação details */}
                    {(lead.abordagem_sugerida || lead.tipo_automacao_indicada) && (
                      <div className="border-t border-border pt-2.5 space-y-1.5 text-[11px] text-muted-foreground">
                        {lead.tipo_automacao_indicada && (
                          <p><span className="font-semibold text-foreground">Automação:</span> {lead.tipo_automacao_indicada}</p>
                        )}
                        {lead.abordagem_sugerida && (
                          <p><span className="font-semibold text-foreground">Abordagem:</span> {lead.abordagem_sugerida}</p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      {lead.telefone_raw && (
                        <a href={`https://wa.me/${lead.telefone_raw.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs h-8">
                            <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                          </Button>
                        </a>
                      )}
                      {lead.website && (
                        <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs h-8">
                            <Globe className="h-3 w-3 mr-1" /> Website
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum lead corresponde aos filtros.</p>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
