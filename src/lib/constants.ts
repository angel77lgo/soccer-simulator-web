export const phaseLabels: Record<string, string> = {
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter: "Quarter-finals",
  semi: "Semi-finals",
  third_place: "Third place",
  final: "Final",
};

export const phaseOrder = ["round_of_32", "round_of_16", "quarter", "semi", "third_place", "final"];

export const statusLabels: Record<string, string> = {
  pending: "Draft",
  group_stage: "Group stage",
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter: "Quarter-finals",
  semi: "Semi-finals",
  final: "Final",
  finished: "Finished",
};

export const statusMeta: Record<string, { label: string }> = {
  pending:     { label: "Draft" },
  group_stage: { label: "Group stage" },
  round_of_32: { label: "Round of 32" },
  round_of_16: { label: "Round of 16" },
  quarter:     { label: "Quarter-finals" },
  semi:        { label: "Semi-finals" },
  final:       { label: "Final" },
  finished:    { label: "Finished" },
};

export const TOTAL_STEPS = 7;
export const STORAGE_KEY_PREFIX = "wizard_tournament_";
export const SLOT_DROP_ID_PREFIX = "slot-";
export const POT_DROP_ID_PREFIX = "pot-";
