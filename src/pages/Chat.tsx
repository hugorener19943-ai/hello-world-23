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
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ fetched: number; target: number; percent: number } | null>(null);
  const { toast } = useToast();

  const buscar = async () => {
    setLoading(true);
    setEmpresas([]);
    setProgress(null);
    try {
      const result = await buscarEmpresas({ query, cidade, estado, limit });
      setEmpresas(result.empresas);

      if (result.empresas.length === 0) {
        toast({ title: "Nenhum resultado", description: "A busca não retornou empresas." });
      } else {
        toast({ title: `${result.empresas.length} empresas encontradas` });
      }
    } catch (err: any) {
      toast({ title: "Erro na busca", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
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
    a.download = `leads_${query.replace(/\s+/g, "_")}_${cidade.replace(/\s+/g, "_")}_${estado}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{empresas.length} resultados</CardTitle>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
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
                  {empresas.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
