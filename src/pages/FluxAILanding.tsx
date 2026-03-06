import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, ArrowLeft, MessageCircle, User, Building2, Headphones, AlertTriangle, Phone } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5511999999999";

const STEPS = [
  { label: "Nome", icon: User },
  { label: "Negócio", icon: Building2 },
  { label: "Canais", icon: Headphones },
  { label: "Desafios", icon: AlertTriangle },
  { label: "Contato", icon: Phone },
];

const DESAFIOS = [
  "Responder mais rápido",
  "Organizar atendimento",
  "Captar mais leads",
  "Agendar clientes",
  "Vender mais",
  "Outro",
];

interface FormData {
  nome: string;
  empresa: string;
  nicho: string;
  cidade: string;
  estado: string;
  temWhatsApp: boolean | null;
  temInstagram: boolean | null;
  temSite: boolean | null;
  muitosContatos: boolean | null;
  desafio: string;
  email: string;
  telefone: string;
}

const initial: FormData = {
  nome: "",
  empresa: "",
  nicho: "",
  cidade: "",
  estado: "",
  temWhatsApp: null,
  temInstagram: null,
  temSite: null,
  muitosContatos: null,
  desafio: "",
  email: "",
  telefone: "",
};

function YesNoField({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-foreground">{label}</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={value === true ? "default" : "outline"}
          size="sm"
          className={value === true ? "glow-neon" : ""}
          onClick={() => onChange(true)}
        >
          Sim
        </Button>
        <Button
          type="button"
          variant={value === false ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(false)}
        >
          Não
        </Button>
      </div>
    </div>
  );
}

export default function FluxAILanding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validate = (): string[] => {
    const errs: string[] = [];
    if (step === 0 && !form.nome.trim()) errs.push("Nome é obrigatório");
    if (step === 1) {
      if (!form.empresa.trim()) errs.push("Empresa é obrigatória");
      if (!form.nicho.trim()) errs.push("Nicho é obrigatório");
      if (!form.cidade.trim()) errs.push("Cidade é obrigatória");
      if (!form.estado.trim()) errs.push("Estado é obrigatório");
    }
    if (step === 2) {
      if (form.temWhatsApp === null) errs.push("Informe se tem WhatsApp");
      if (form.temInstagram === null) errs.push("Informe se tem Instagram");
      if (form.temSite === null) errs.push("Informe se tem site");
      if (form.muitosContatos === null) errs.push("Informe sobre contatos");
    }
    if (step === 3 && !form.desafio) errs.push("Selecione um desafio");
    if (step === 4) {
      if (!form.email.trim()) errs.push("Email é obrigatório");
      if (!form.telefone.trim()) errs.push("Telefone é obrigatório");
    }
    return errs;
  };

  const next = () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    if (step < 4) setStep(step + 1);
    else {
      // Future: send to API
      console.log("Form submitted:", form);
      setSubmitted(true);
    }
  };

  const prev = () => {
    setErrors([]);
    if (step > 0) setStep(step - 1);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6 animate-fade-in max-w-md">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center glow-neon-strong">
              <CheckCircle2 className="h-10 w-10 text-neon" />
            </div>
            <h2 className="text-3xl font-bold font-display text-foreground">
              Diagnóstico enviado com sucesso
            </h2>
            <p className="text-muted-foreground">
              Nossa equipe irá analisar seu potencial de crescimento com automação e IA e retornar em breve.
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="glow-neon-strong mt-4">
                <MessageCircle className="h-5 w-5 mr-2" />
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Hero */}
          <div className="space-y-6 animate-fade-in">
            <Badge variant="outline" className="border-neon text-neon px-3 py-1 text-xs font-medium">
              Diagnóstico Gratuito
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight text-foreground">
              Descubra quanto sua{" "}
              <span className="text-neon" style={{ textShadow: "0 0 30px hsl(142 71% 45% / 0.4)" }}>
                empresa pode crescer
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Preencha o formulário e receba uma análise personalizada do potencial de crescimento do seu negócio com automação e IA.
            </p>
            <ul className="space-y-3">
              {[
                "Análise gratuita e sem compromisso",
                "Retorno em até 24 horas",
                "Estratégia personalizada para seu nicho",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-neon shrink-0" />
                  <span className="text-sm">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Form card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 glow-neon space-y-6 animate-fade-in">
            {/* Step indicators */}
            <div className="flex items-center justify-between gap-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = i === step;
                const done = i < step;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : active
                          ? "bg-primary/20 border-2 border-neon text-neon glow-neon"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] hidden sm:block ${active ? "text-neon font-medium" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%`, boxShadow: "var(--neon-glow)" }}
              />
            </div>

            {/* Step content */}
            <div className="min-h-[220px] animate-fade-in" key={step}>
              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-foreground">Seu Nome</h3>
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input placeholder="Digite seu nome completo" value={form.nome} onChange={(e) => set("nome", e.target.value)} className="bg-secondary border-border focus:border-neon" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-foreground">Informações do Negócio</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Input placeholder="Nome da empresa" value={form.empresa} onChange={(e) => set("empresa", e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nicho</Label>
                      <Input placeholder="ex: Odontologia" value={form.nicho} onChange={(e) => set("nicho", e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input placeholder="ex: São Paulo" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input placeholder="ex: SP" value={form.estado} onChange={(e) => set("estado", e.target.value)} className="bg-secondary border-border" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-foreground">Canais de Atendimento</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <YesNoField label="Tem WhatsApp?" value={form.temWhatsApp} onChange={(v) => set("temWhatsApp", v)} />
                    <YesNoField label="Tem Instagram?" value={form.temInstagram} onChange={(v) => set("temInstagram", v)} />
                    <YesNoField label="Tem site?" value={form.temSite} onChange={(v) => set("temSite", v)} />
                    <YesNoField label="Recebe muitos contatos por dia?" value={form.muitosContatos} onChange={(v) => set("muitosContatos", v)} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-foreground">Desafios</h3>
                  <p className="text-sm text-muted-foreground">Qual o maior desafio da sua empresa hoje?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DESAFIOS.map((d) => (
                      <Button
                        key={d}
                        type="button"
                        variant={form.desafio === d ? "default" : "outline"}
                        className={`justify-start text-left h-auto py-3 px-4 text-sm ${form.desafio === d ? "glow-neon" : ""}`}
                        onClick={() => set("desafio", d)}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-foreground">Contato</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone / WhatsApp</Label>
                      <Input placeholder="(11) 99999-0000" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} className="bg-secondary border-border" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="text-destructive text-xs space-y-1">
                {errors.map((e) => <p key={e}>• {e}</p>)}
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={prev} disabled={step === 0} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={next} className="flex-1 glow-neon">
                {step === 4 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Receber Diagnóstico
                  </>
                ) : (
                  <>
                    Próximo <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center glow-neon">
          <span className="text-primary-foreground font-bold text-sm font-display">F</span>
        </div>
        <span className="font-bold text-xl font-display text-foreground">
          Flux<span className="text-neon">AI</span>
        </span>
      </div>
      <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="border-neon text-neon hover:bg-primary hover:text-primary-foreground">
          <MessageCircle className="h-4 w-4 mr-2" />
          Falar no WhatsApp
        </Button>
      </a>
    </header>
  );
}
