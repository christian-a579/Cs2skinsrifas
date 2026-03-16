import type { Campanha, Ganhador } from "./types";

export const campanhasMock: Campanha[] = [
  {
    id: "1",
    slug: "sir-bloody-loudmouth-darryl-the-professionals",
    nome: "Sir Bloody Loudmouth Darryl | The Professionals",
    valorPremio: 552.85,
    precoTitulo: 5.5,
    totalTitulos: 100,
    titulosVendidos: 30,
    status: "ativa",
    imagemUrl: "/skins/placeholder.jpg",
  },
  {
    id: "2",
    slug: "m4a1-s-player-two",
    nome: "M4A1-S | Player Two",
    valorPremio: 320,
    precoTitulo: 4,
    totalTitulos: 80,
    titulosVendidos: 45,
    status: "ativa",
  },
  {
    id: "3",
    slug: "ak-47-the-oligarch",
    nome: "AK-47 | The Oligarch",
    valorPremio: 280,
    precoTitulo: 3.5,
    totalTitulos: 80,
    titulosVendidos: 80,
    status: "concluida",
    dataConclusao: "11/03/2026 às 11:47",
  },
  {
    id: "4",
    slug: "awp-crakow",
    nome: "AWP | Crakow!",
    valorPremio: 190,
    precoTitulo: 2.5,
    totalTitulos: 76,
    titulosVendidos: 76,
    status: "concluida",
    dataConclusao: "11/03/2026 às 11:31",
  },
];

export const ganhadoresMock: Ganhador[] = [
  {
    id: "1",
    nome: "Henrique Samuel Gomes Paim",
    premio: "AK-47 | The Oligarch",
    numeroSorte: 53,
    dataPremiacao: "11/03/26",
  },
  {
    id: "2",
    nome: "Matheus Schaefer",
    premio: "AWP | Crakow!",
    numeroSorte: 59,
    dataPremiacao: "11/03/26",
  },
  {
    id: "3",
    nome: "Eduardo Vieira",
    premio: "M4A4 | Temukau",
    numeroSorte: 20,
    dataPremiacao: "11/03/26",
  },
];
