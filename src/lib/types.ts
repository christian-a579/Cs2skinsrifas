export type StatusCampanha = "ativa" | "concluida" | "em_breve";

export interface Campanha {
  id: string;
  slug: string;
  nome: string;
  valorPremio: number;
  precoTitulo: number;
  totalTitulos: number;
  titulosVendidos: number;
  status: StatusCampanha;
  dataConclusao?: string;
  imagemUrl?: string;
  displayScale?: number;
  displayOffsetY?: number;
}

export interface Ganhador {
  id: string;
  nome: string;
  premio: string;
  numeroSorte: number;
  dataPremiacao: string;
}
