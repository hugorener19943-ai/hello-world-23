import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Loader2, ExternalLink } from "lucide-react";
import { buscarEmpresas, exportarExcel, type Empresa } from "@/lib/buscarEmpresas";
import { AppLayout } from "@/components/AppLayout";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [targetTotal, setTargetTotal] = useState(300);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ fetched: number; target: number; percent: number } | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const { toast } = useToast();

  const buscar = async () => {
    if (!query || !cidade || !estado) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    setEmpresas([]);
    setApiTotal(0);
    setProgress({ fetched: 0, target: targetTotal, percent: 0 });
    setPage(1);
    try {
      const result = await buscarEmpresas({
        query, cidade, estado, target_total: targetTotal,
        onProgress: (fetched, target) => {
          setProgress({
            fetched,
            target,
            percent: Math.min(100, Math.round((fetched / target) * 100)),
          });
        },
      });
      setEmpresas(result.empresas);
      setApiTotal(result.total);

      if (result.empresas.length === 0) {
        toast({ title: "Nenhuma empresa encontrada." });
      } else {
        toast({ title: `${result.total} empresas encontradas (${result.empresas.length} únicos)` });
      }
    } catch (err: any) {
      toast({ title: "Erro na busca", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportarExcel(query, cidade, estado, targetTotal);
      toast({ title: "Download iniciado", description: "fluxleads.xlsx" });
    } catch (err: any) {
      toast({ title: "Erro ao exportar", description: err.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const exportCSV = () => {
    if (!empresas.length) return;
    const headers = ["#", "nome", "telefone", "whatsapp", "email", "website", "endereco", "cidade", "nicho", "score", "whatsapp_link"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = empresas.map((e, i) => [
      i + 1, e.nome, e.telefone ?? "", e.whatsapp, e.email, e.website, e.endereco, e.cidade, e.nicho, e.score ?? "", e.whatsapp_link,
    ]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
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
  };

  const totalPages = Math.ceil(empresas.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const visibleEmpresas = empresas.slice(start, start + rowsPerPage);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Buscar Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="query">Nicho</Label>
                <Input id="query" placeholder="ex: clínica médica, dentista, restaurante" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="ex: São Paulo" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" placeholder="ex: SP" value={estado} onChange={(e) => setEstado(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetTotal">Quantidade</Label>
                <Input id="targetTotal" type="number" min={1} max={1000} value={targetTotal} onChange={(e) => setTargetTotal(Number(e.target.value) || 300)} />
              </div>
              <Button onClick={buscar} disabled={loading} className="h-10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar Empresas
              </Button>
            </div>

            {loading && progress && (
              <div className="space-y-1 pt-2">
                <Progress value={progress.percent} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Buscando empresas... {progress.fetched} / {progress.target} ({progress.percent}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty state */}
        {!loading && empresas.length === 0 && apiTotal === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhuma empresa encontrada.</p>
              <p className="text-sm">Preencha os campos acima e clique em "Buscar Empresas".</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {empresas.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-lg">
                {apiTotal} resultados — {start + 1}–{Math.min(start + rowsPerPage, empresas.length)} de {empresas.length} únicos
              </CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Por página:</Label>
                  <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-2" /> CSV ({empresas.length})
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExportExcel} disabled={exporting}>
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Exportar Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleEmpresas.map((e, i) => (
                    <TableRow key={e.fsq_id || `${start + i}`}>
                      <TableCell className="text-muted-foreground">{start + i + 1}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{e.nome}</TableCell>
                      <TableCell>{e.telefone || "—"}</TableCell>
                      <TableCell>{e.whatsapp || "—"}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{e.email || "—"}</TableCell>
                      <TableCell>
                        {e.website ? (
                          <a href={e.website.startsWith("http") ? e.website : `https://${e.website}`} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate block max-w-[150px]">
                            {e.website}
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">{e.endereco || "—"}</TableCell>
                      <TableCell>{e.cidade || "—"}</TableCell>
                      <TableCell>{e.score ?? "—"}</TableCell>
                      <TableCell>
                        {e.whatsapp ? (
                          <a
                            href={`https://wa.me/${e.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" /> WhatsApp
                            </Button>
                          </a>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
