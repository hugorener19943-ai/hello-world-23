import type { LeadAutomacao } from "@/lib/buscarLeadsAutomacao";

export interface SearchBlock {
  id: string;
  query: string;
  subnichos: string[];
  cidade: string;
  estado: string;
  bairros: string[];
  targetTotal: number;
}

export interface LeadWithOrigin extends LeadAutomacao {
  originBlockIndex: number;
  originLabel: string;
}
