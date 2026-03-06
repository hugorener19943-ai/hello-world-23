import type { LeadAutomacao } from "@/lib/buscarLeadsAutomacao";

export interface SearchBlock {
  id: string;
  query: string;
  cidade: string;
  estado: string;
  targetTotal: number;
}

export interface LeadWithOrigin extends LeadAutomacao {
  originBlockIndex: number;
  originLabel: string;
}
