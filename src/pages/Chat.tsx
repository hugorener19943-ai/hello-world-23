import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Loader2 } from "lucide-react";
import { buscarEmpresas, type Empresa } from "@/lib/buscarEmpresas";

const ESTADOS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

export default function Chat() {
  const [query, setQuery] = useState("clinica estetica");
  const [cidade, setCidade] = useState("Sao Jose do Rio Preto");
  const [estado, setEstado] = useState("SP");
  const [limit, setLimit] = useState(300);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ fetched: number; target: number; percent: number } | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const { toast } = useToast();

  const buscar = async () => {
    setLoading(true);
    setEmpresas([]);
    setApiTotal(0);
    setProgress({ fetched: 0, target: limit, percent: 0 });
    setPage(1);
    try {
      const result = await buscarEmpresas({
        query, cidade, estado, limit,
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
        toast({ title: "Nenhum resultado", description: "A busca não retornou empresas." });
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

  const exportCSV = () => {
    if (!empresas.length) return;
    const headers = ["ordem", "nome", "whatsapp", "email", "website", "endereco", "cidade", "nicho", "score", "whatsapp_link"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = empresas.map((e, i) => [
      i + 1, e.nome, e.whatsapp, e.email, e.website, e.endereco, e.cidade, e.nicho, e.score ?? "", e.whatsapp_link,
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Prospecção B2B</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buscar Empresas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="query">Nicho / Query</Label>
                <Input id="query" placeholder="Ex: clinica estetica" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="Ex: São Paulo" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((uf) => (<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Limite</Label>
                <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={buscar} disabled={loading} className="h-10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar empresas
              </Button>
            </div>

            {loading && progress && (
              <div className="space-y-1">
                <Progress value={progress.percent} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {progress.fetched} / {progress.target} empresas ({progress.percent}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {empresas.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">
                {apiTotal} resultados — exibindo {start + 1}–{Math.min(start + rowsPerPage, empresas.length)} de {empresas.length} únicos
              </CardTitle>
              <div className="flex items-center gap-3">
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
                  <Download className="h-4 w-4 mr-2" /> Exportar CSV ({empresas.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Nicho</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>WhatsApp Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleEmpresas.map((e, i) => (
                    <TableRow key={e.fsq_id || `${start + i}`}>
                      <TableCell>{start + i + 1}</TableCell>
                      <TableCell className="font-medium">{e.nome}</TableCell>
                      <TableCell>{e.whatsapp}</TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>
                        {e.website ? (
                          <a href={e.website} target="_blank" rel="noopener noreferrer" className="text-primary underline">{e.website}</a>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{e.endereco || "—"}</TableCell>
                      <TableCell>{e.cidade}</TableCell>
                      <TableCell>{e.nicho}</TableCell>
                      <TableCell>{e.score}</TableCell>
                      <TableCell>
                        {e.whatsapp_link ? (
                          <a href={e.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-primary underline">Abrir</a>
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
    </div>
  );
}
