export const phaseLabels: Record<string, string> = {
  round_of_32: "Treintaidosavos",
  round_of_16: "Octavos",
  quarter: "Cuartos",
  semi: "Semifinales",
  third_place: "Tercer puesto",
  final: "Final",
};

export const phaseOrder = ["round_of_32", "round_of_16", "quarter", "semi", "third_place", "final"];

export const statusLabels: Record<string, string> = {
  pending: "Borrador",
  group_stage: "Fase de grupos",
  round_of_32: "Treintaidosavos",
  round_of_16: "Octavos",
  quarter: "Cuartos",
  semi: "Semifinales",
  final: "Final",
  finished: "Finalizado",
};

export const statusMeta: Record<string, { label: string }> = {
  pending:     { label: "Borrador" },
  group_stage: { label: "Fase de grupos" },
  round_of_32: { label: "Treintaidosavos" },
  round_of_16: { label: "Octavos" },
  quarter:     { label: "Cuartos" },
  semi:        { label: "Semifinales" },
  final:       { label: "Final" },
  finished:    { label: "Finalizado" },
};

export const TOTAL_STEPS = 7;
export const STORAGE_KEY_PREFIX = "wizard_tournament_";
export const SLOT_DROP_ID_PREFIX = "slot-";
export const POT_DROP_ID_PREFIX = "pot-";
