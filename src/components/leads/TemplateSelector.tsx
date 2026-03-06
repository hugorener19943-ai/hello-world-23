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

export function TemplateSelector({ onApplyTemplate }: Props) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const { toast } = useToast();

  const handleApply = (template: FluxTemplate) => {
    onApplyTemplate(template);
    setOpen(false);
    toast({ title: `Template "${template.nome}" aplicado!`, description: `${template.buscas.length} buscas carregadas` });
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      let template: FluxTemplate;

      if (parsed.maps_flux_templates && Array.isArray(parsed.maps_flux_templates)) {
        template = parsed.maps_flux_templates[0];
      } else if (parsed.nome && Array.isArray(parsed.buscas)) {
        template = parsed;
      } else {
        throw new Error("Formato inválido");
      }

      if (!template.buscas?.length) throw new Error("Nenhuma busca encontrada no JSON");

      handleApply(template);
      setJsonInput("");
    } catch (err: any) {
      toast({
        title: "Erro ao importar JSON",
        description: err.message || "Verifique o formato do JSON",
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
            {FLUX_TEMPLATES.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors bg-card"
                onClick={() => handleApply(t)}
              >
                <div>
                  <p className="font-semibold text-foreground">{t.nome}</p>
                  {t.descricao && <p className="text-sm text-muted-foreground">{t.descricao}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{t.buscas.length} buscas</p>
                </div>
                <Button size="sm" variant="ghost" className="text-primary">
                  Usar
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="importar" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Cole o JSON com o template de buscas. Formatos aceitos: <code className="text-primary">maps_flux_templates</code> ou objeto direto com <code className="text-primary">nome</code> e <code className="text-primary">buscas</code>.
            </p>
            <Textarea
              placeholder='{"nome": "...", "buscas": [{"query": "...", "cidade": "...", "estado": "..."}]}'
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
