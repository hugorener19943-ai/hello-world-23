import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Copy, ExternalLink, Flame, Thermometer, Snowflake } from "lucide-react";
import { buscarLeadsAutomacao, type LeadAutomacao } from "@/lib/buscarLeadsAutomacao";
import { AppLayout } from "@/components/AppLayout";

function tempColor(temp?: string) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return "bg-destructive/10 text-destructive border-destructive/30";
  if (t.includes("morno")) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
  return "bg-muted text-muted-foreground border-border";
}

function TempIcon({ temp }: { temp?: string }) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return <Flame className="h-4 w-4 text-destructive" />;
  if (t.includes("morno")) return <Thermometer className="h-4 w-4 text-yellow-600" />;
  return <Snowflake className="h-4 w-4 text-muted-foreground" />;
}

export default function LeadsAutomacao() {
  const [query, setQuery] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [targetTotal, setTargetTotal] = useState(20);
  const [leads, setLeads] = useState<LeadAutomacao[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const buscar = async () => {
    if (!query || !cidade || !estado) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLeads([]);
    setTotal(0);
    try {
      const result = await buscarLeadsAutomacao({ query, cidade, estado, target_total: targetTotal });
      setLeads(result.leads);
      setTotal(result.total);
      if (result.leads.length === 0) {
        toast({ title: "Nenhuma empresa encontrada." });
      } else {
        toast({ title: `${result.leads.length} leads encontrados` });
      }
    } catch (err: any) {
      toast({ title: "Erro na busca", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast({ title: "Telefone copiado!" });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Leads para Automação Comercial
            </CardTitle>
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
                <Input type="number" min={1} max={300} value={targetTotal} onChange={(e) => setTargetTotal(Number(e.target.value) || 20)} />
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
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Buscando empresas...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && leads.length === 0 && total === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhuma empresa encontrada.</p>
              <p className="text-sm">Preencha os campos e clique em "Buscar Leads".</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {leads.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">
                {leads.length} leads encontrados (total API: {total})
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {leads.map((lead, i) => (
                <Card key={lead.fsq_id || `${i}`} className={`border ${tempColor(lead.temperatura_lead)} transition-shadow hover:shadow-md`}>
                  <CardContent className="p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{lead.nome}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <TempIcon temp={lead.temperatura_lead} />
                        {lead.score != null && (
                          <Badge variant="secondary" className="text-xs font-bold">{lead.score}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {lead.temperatura_lead && (
                        <Badge variant="outline" className="text-[10px]">{lead.temperatura_lead}</Badge>
                      )}
                      {lead.prioridade_comercial && (
                        <Badge variant="outline" className="text-[10px]">{lead.prioridade_comercial}</Badge>
                      )}
                      {lead.canal_sugerido && (
                        <Badge variant="outline" className="text-[10px]">{lead.canal_sugerido}</Badge>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-xs space-y-1 text-muted-foreground">
                      {lead.telefone_raw && (
                        <div className="flex items-center justify-between">
                          <span>📞 {lead.telefone_raw}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => copyPhone(lead.telefone_raw!)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {lead.email && <p>✉️ {lead.email}</p>}
                      {lead.website && (
                        <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" /> {lead.website}
                        </a>
                      )}
                    </div>

                    {/* Automação */}
                    {(lead.abordagem_sugerida || lead.tipo_automacao_indicada) && (
                      <div className="border-t pt-2 space-y-1 text-[11px] text-muted-foreground">
                        {lead.abordagem_sugerida && <p><strong>Abordagem:</strong> {lead.abordagem_sugerida}</p>}
                        {lead.tipo_automacao_indicada && <p><strong>Automação:</strong> {lead.tipo_automacao_indicada}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
