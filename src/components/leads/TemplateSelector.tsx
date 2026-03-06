import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookTemplate, Upload, Zap } from "lucide-react";
import { FLUX_TEMPLATES, type FluxTemplate } from "@/lib/fluxTemplates";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onApplyTemplate: (template: FluxTemplate) => void;
}

function parseImportedJSON(jsonString: string): FluxTemplate {
  const parsed = JSON.parse(jsonString);

  let rawTemplate: any = null;

  if (parsed?.templates && Array.isArray(parsed.templates) && parsed.templates.length > 0) {
    rawTemplate = parsed.templates[0];
  } else if (parsed?.maps_flux_templates && Array.isArray(parsed.maps_flux_templates) && parsed.maps_flux_templates.length > 0) {
    rawTemplate = parsed.maps_flux_templates[0];
  } else if (parsed?.nome && Array.isArray(parsed?.buscas)) {
    rawTemplate = parsed;
  }

  if (!rawTemplate || typeof rawTemplate.nome !== "string") {
    throw new Error("JSON inválido. Verifique a estrutura do template.");
  }

  if (!Array.isArray(rawTemplate.buscas) || rawTemplate.buscas.length === 0) {
    throw new Error("JSON inválido. Verifique a estrutura do template.");
  }

  const buscas = rawTemplate.buscas.slice(0, 5).map((b: any) => ({
    query: typeof b?.query === "string" ? b.query : "",
    cidade: typeof b?.cidade === "string" ? b.cidade : "",
    estado: typeof b?.estado === "string" ? b.estado : "",
    bairro: typeof b?.bairro === "string" ? b.bairro : undefined,
    targetTotal: typeof b?.quantidade === "number" ? b.quantidade : (typeof b?.targetTotal === "number" ? b.targetTotal : undefined),
  }));

  return {
    nome: rawTemplate.nome,
    descricao: rawTemplate.descricao || undefined,
    buscas,
  };
}

export function TemplateSelector({ onApplyTemplate }: Props) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const { toast } = useToast();

  const handleApply = (template: FluxTemplate) => {
    if (!template || !Array.isArray(template.buscas)) return;
    onApplyTemplate(template);
    setOpen(false);
    toast({ title: `Template "${template.nome}" aplicado!`, description: `${template.buscas.length} buscas carregadas` });
  };

  const handleImportJSON = () => {
    try {
      const template = parseImportedJSON(jsonInput);
      handleApply(template);
      setJsonInput("");
    } catch (err: any) {
      toast({
        title: "Erro ao importar",
        description: err?.message || "JSON inválido. Verifique a estrutura do template.",
        variant: "destructive",
      });
    }
  };

  const templates = Array.isArray(FLUX_TEMPLATES) ? FLUX_TEMPLATES : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
          <BookTemplate className="h-4 w-4 mr-1" /> Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Templates de Busca
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="biblioteca" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="biblioteca" className="flex-1">
              <BookTemplate className="h-4 w-4 mr-1" /> Biblioteca
            </TabsTrigger>
            <TabsTrigger value="importar" className="flex-1">
              <Upload className="h-4 w-4 mr-1" /> Importar JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biblioteca" className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
            {templates.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors bg-card"
                onClick={() => handleApply(t)}
              >
                <div>
                  <p className="font-semibold text-foreground">{t.nome}</p>
                  {t.descricao && <p className="text-sm text-muted-foreground">{t.descricao}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{Array.isArray(t.buscas) ? t.buscas.length : 0} buscas</p>
                </div>
                <Button size="sm" variant="ghost" className="text-primary">
                  Usar
                </Button>
              </div>
            ))}
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
