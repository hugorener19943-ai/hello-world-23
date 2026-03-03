import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Loader2 } from "lucide-react";

interface Empresa {
  nome: string;
  whatsapp: string;
  email: string;
  website: string;
  endereco: string;
  cidade: string;
  nicho: string;
  score: number | string;
  whatsapp_link: string;
}

export default function Chat() {
  const [query, setQuery] = useState("clinica estetica");
  const [cidade, setCidade] = useState("Sao Jose do Rio Preto, SP, Brasil");
  const [limit, setLimit] = useState(50);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const buscar = async () => {
    setLoading(true);
    setEmpresas([]);
    try {
      const res = await fetch(
        "https://unmeaning-hawthorny-kinley.ngrok-free.dev/webhook/buscar-empresas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, cidade, limit }),
        }
      );

      // Lê como texto primeiro (evita erro de JSON duplicado)
      const raw = await res.text();

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      if (!res.ok) {
        const msg =
          typeof data === "string"
            ? data
            : (data?.message || data?.hint || `Erro ${res.status}`);
        throw new Error(msg);
      }

      console.log("RESPOSTA N8N:", data);

      // Extrai lista de empresas
      const list: Empresa[] = Array.isArray(data?.empresas)
        ? data.empresas
        : [];

      setEmpresas(list);

      if (list.length === 0) {
        toast({ title: "Nenhum resultado", description: "A busca não retornou empresas." });
      } else {
        toast({ title: `${list.length} empresas encontradas` });
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
    a.download = "leads.csv";
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="query">Nicho</Label>
                <Input id="query" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limite</Label>
                <Input id="limit" type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
              </div>
              <Button onClick={buscar} disabled={loading} className="h-10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar empresas
              </Button>
            </div>
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
                          <a href={e.website} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            {e.website}
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{e.endereco || "—"}</TableCell>
                      <TableCell>{e.cidade}</TableCell>
                      <TableCell>{e.nicho}</TableCell>
                      <TableCell>{e.score}</TableCell>
                      <TableCell>
                        {e.whatsapp_link ? (
                          <a href={e.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            Abrir
                          </a>
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
