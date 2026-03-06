import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookTemplate, Upload, Zap, Search } from "lucide-react";
import { FLUX_TEMPLATES, type FluxTemplate } from "@/lib/fluxTemplates";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface Props {
  onApplyTemplate: (template: FluxTemplate) => void;
}

function parseImportedJSON(jsonString: string): FluxTemplate[] {
  const parsed = JSON.parse(jsonString);

  let rawTemplates: any[] = [];

  if (parsed?.templates && Array.isArray(parsed.templates)) {
    rawTemplates = parsed.templates;
  } else if (parsed?.maps_flux_templates && Array.isArray(parsed.maps_flux_templates)) {
    rawTemplates = parsed.maps_flux_templates;
  } else if (parsed?.nome && Array.isArray(parsed?.buscas)) {
    rawTemplates = [parsed];
  } else {
    throw new Error("JSON inválido. Verifique a estrutura do template.");
  }

  if (rawTemplates.length === 0) {
    throw new Error("JSON inválido. Verifique a estrutura do template.");
  }

  return rawTemplates
    .filter((t: any) => t?.nome && Array.isArray(t?.buscas) && t.buscas.length > 0)
    .map((t: any) => ({
      nome: t.nome,
      descricao: t.descricao || undefined,
      buscas: t.buscas.slice(0, 5).map((b: any) => ({
        query: typeof b?.query === "string" ? b.query : "",
        cidade: typeof b?.cidade === "string" ? b.cidade : "",
        estado: typeof b?.estado === "string" ? b.estado : "",
        bairro: typeof b?.bairro === "string" ? b.bairro : undefined,
        quantidade: typeof b?.quantidade === "number" ? b.quantidade : undefined,
        targetTotal: typeof b?.quantidade === "number" ? b.quantidade : (typeof b?.targetTotal === "number" ? b.targetTotal : undefined),
      })),
    }));
}

export function TemplateSelector({ onApplyTemplate }: Props) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [importedTemplates, setImportedTemplates] = useState<FluxTemplate[]>([]);
  const { toast } = useToast();

  const allTemplates = useMemo(() => {
    return [...(Array.isArray(FLUX_TEMPLATES) ? FLUX_TEMPLATES : []), ...importedTemplates];
  }, [importedTemplates]);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return allTemplates;
    const q = searchQuery.toLowerCase();
    return allTemplates.filter((t) => t.nome.toLowerCase().includes(q) || t.descricao?.toLowerCase().includes(q));
  }, [allTemplates, searchQuery]);

  const handleApply = (template: FluxTemplate) => {
    if (!template || !Array.isArray(template.buscas)) return;
    onApplyTemplate(template);
    setOpen(false);
    toast({ title: `Template "${template.nome}" aplicado!`, description: `${template.buscas.length} buscas carregadas` });
  };

  const handleImportJSON = () => {
    try {
      const templates = parseImportedJSON(jsonInput);
      if (templates.length === 0) {
        throw new Error("Nenhum template válido encontrado no JSON.");
      }
      setImportedTemplates((prev) => [...prev, ...templates]);
      setJsonInput("");
      toast({ title: `${templates.length} template(s) importado(s)!`, description: "Disponíveis na aba Biblioteca." });
    } catch (err: any) {
      toast({
        title: "Erro ao importar",
        description: err?.message || "JSON inválido. Verifique a estrutura do template.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
          <BookTemplate className="h-4 w-4 mr-1" /> Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Templates de Busca
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="biblioteca" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="w-full">
            <TabsTrigger value="biblioteca" className="flex-1">
              <BookTemplate className="h-4 w-4 mr-1" /> Biblioteca ({allTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="importar" className="flex-1">
              <Upload className="h-4 w-4 mr-1" /> Importar JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biblioteca" className="flex-1 flex flex-col min-h-0 mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-secondary border-border"
              />
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1">
              {filteredTemplates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum template encontrado.</p>
              )}
              {filteredTemplates.map((t, i) => (
                <div
                  key={`${t.nome}-${i}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors bg-card"
                  onClick={() => handleApply(t)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{t.nome}</p>
                    {t.descricao && <p className="text-sm text-muted-foreground truncate">{t.descricao}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{Array.isArray(t.buscas) ? t.buscas.length : 0} buscas</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary shrink-0 ml-2">
                    Usar
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="importar" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Cole o JSON no formato: <code className="text-primary">{`{"templates": [{"nome": "...", "buscas": [...]}]}`}</code>
            </p>
            <Textarea
              placeholder='{"templates": [{"nome": "...", "buscas": [{"query": "...", "cidade": "...", "estado": "...", "quantidade": 80}]}]}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
            <Button onClick={handleImportJSON} disabled={!jsonInput.trim()} className="w-full">
              <Upload className="h-4 w-4 mr-2" /> Importar e Aplicar
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
