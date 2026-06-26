import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createTournament, getTeams, getTemplates } from "@/lib/api";
import { Team, Template, WizardState, TeamLocation } from "@/types";
import {
  STORAGE_KEY_PREFIX,
  TOTAL_STEPS,
  SLOT_DROP_ID_PREFIX,
  POT_DROP_ID_PREFIX,
} from "@/lib/constants";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

function normalizeText(text: string | undefined): string {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getStorageKey(name: string): string {
  return `${STORAGE_KEY_PREFIX}my-torneo-${normalizeName(name)}`;
}

function saveWizardState(name: string, state: WizardState): void {
  if (!name.trim()) return;
  try {
    localStorage.setItem(getStorageKey(name), JSON.stringify(state));
  } catch (e) {
    console.error("Error saving wizard state:", e);
  }
}

function loadWizardState(name: string): WizardState | null {
  if (!name.trim()) return null;
  try {
    const stored = localStorage.getItem(getStorageKey(name));
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Error loading wizard state:", e);
    return null;
  }
}

function clearWizardState(name: string): void {
  if (!name.trim()) return;
  try {
    localStorage.removeItem(getStorageKey(name));
  } catch (e) {
    console.error("Error clearing wizard state:", e);
  }
}

function parseSlotId(id: string): { gIndex: number; sIndex: number } | null {
  if (!id.startsWith(SLOT_DROP_ID_PREFIX)) return null;
  const rest = id.slice(SLOT_DROP_ID_PREFIX.length);
  const parts = rest.split("-");
  if (parts.length !== 2) return null;
  const gIndex = parseInt(parts[0], 10);
  const sIndex = parseInt(parts[1], 10);
  if (Number.isNaN(gIndex) || Number.isNaN(sIndex)) return null;
  return { gIndex, sIndex };
}

export function useWizardState() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const [participantSearchQueries, setParticipantSearchQueries] = useState<Record<string, string>>({});
  const [repechajeSearchQuery, setRepechajeSearchQuery] = useState("");

  // Step 1 – General info
  const [name, setName] = useState("");
  const [type, setType] = useState<"official" | "custom">("official");
  const [subType, setSubType] = useState("");
  const [teamsCount, setTeamsCount] = useState<number | "">(32);
  const [customQuotas, setCustomQuotas] = useState<Record<string, number | "">>({
    UEFA: 10, CONMEBOL: 6, CONCACAF: 4, CAF: 6, AFC: 5, OFC: 1,
  });

  // Step 2 – Hosts
  const [hostIds, setHostIds] = useState<string[]>([]);

  // Step 3 – Participants (base quotas minus hosts)
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // Step 4 – Repechaje (free-for-all for non-UEFA teams)
  const [repechajeTeamIds, setRepechajeTeamIds] = useState<string[]>([]);

  // Step 5 - Sorteo
  const [drawMode, setDrawMode] = useState<"auto" | "manual">("auto");
  const [manualGroups, setManualGroups] = useState<Record<number, string[]>>({});
  const [activeDragTeamId, setActiveDragTeamId] = useState<string | null>(null);
  const [shakingSlotId, setShakingSlotId] = useState<string | null>(null);
  const [shakeCounter, setShakeCounter] = useState(0);
  const [dropError, setDropError] = useState<string | null>(null);

  const [isHydrated, setIsHydrated] = useState(false);
  const prevHostIdsRef = useRef<string[]>([]);
  const prevCustomQuotasRef = useRef<Record<string, number | "">>(customQuotas);
  const prevTypeSubTypeRef = useRef<string>("");
  const prevNameRef = useRef<string>("");

  // ─── Derived: base quotas from template or custom ───
  const baseQuotas: Record<string, number> = useMemo(() => {
    if (type === "official" && subType && templates[subType]) {
      return templates[subType].quotas;
    }
    const normalized: Record<string, number> = {};
    for (const key in customQuotas) {
      normalized[key] = Number(customQuotas[key]) || 0;
    }
    return normalized;
  }, [type, subType, templates, customQuotas]);

  const totalTeamsExpected: number = useMemo(() => {
    if (type === "official" && subType && templates[subType]) {
      return templates[subType].teamsCount;
    }
    return Number(teamsCount) || 0;
  }, [type, subType, templates, teamsCount]);

  // ─── Derived: host confederation breakdown ───
  const hostTeams = useMemo(() =>
    availableTeams.filter(t => hostIds.includes(t.id)),
    [availableTeams, hostIds]);

  const hostsByConfed = useMemo(() => {
    const map: Record<string, number> = {};
    hostTeams.forEach(t => {
      const c = t.confederation?.code || "";
      map[c] = (map[c] || 0) + 1;
    });
    return map;
  }, [hostTeams]);

  // ─── Derived: effective base quotas after host deductions ───
  const isWorldCup = type === "official" && subType === "world_cup";

  const { effectiveQuotas, freedSlots } = useMemo(() => {
    const result: Record<string, number> = { ...baseQuotas };
    let baseFreed = totalTeamsExpected - Object.values(baseQuotas).reduce((a, b) => a + b, 0);
    if (baseFreed < 0) baseFreed = 0;

    // In World Cup, the playoff ALWAYS yields exactly `baseFreed` spots (2 spots).
    // The hosts simply consume their confederation's direct slots.
    for (const [confed, count] of Object.entries(hostsByConfed)) {
      result[confed] = Math.max(0, (result[confed] || 0) - count);
    }

    // Si no es el mundial, baseFreed es 0.
    return { effectiveQuotas: result, freedSlots: isWorldCup ? baseFreed : 0 };
  }, [baseQuotas, hostsByConfed, isWorldCup, totalTeamsExpected]);

  // Remaining base slots still to be selected per confed
  const getSelectedCountPerConfed = (confedCode: string) =>
    selectedTeamIds.filter(id => {
      const t = availableTeams.find(t => t.id === id);
      return t?.confederation?.code === confedCode;
    }).length;

  // Group teams by confederation for participant display (excluding hosts and repechaje)
  const teamsByConfed = useMemo(() => {
    const map: Record<string, Team[]> = {};
    availableTeams.forEach(team => {
      if (hostIds.includes(team.id)) return; // hosts already locked in
      const c = team.confederation?.code || "";
      const q = normalizeText(participantSearchQueries[c] || "");
      const matchesSearch =
        !q ||
        normalizeText(team.name).includes(q) ||
        normalizeText(team.fifaCode).includes(q);
      if (!matchesSearch) return;
      if (!map[c]) map[c] = [];
      map[c].push(team);
    });
    return map;
  }, [availableTeams, participantSearchQueries, hostIds]);

  // Teams available for host selection
  const hostCandidates = useMemo(() => {
    const q = normalizeText(hostSearchQuery);
    return availableTeams.filter(t =>
      normalizeText(t.name).includes(q) ||
      normalizeText(t.fifaCode).includes(q)
    );
  }, [availableTeams, hostSearchQuery]);

  // Teams available for repechaje (non-UEFA, not hosts, not in selectedTeamIds)
  const repechajeCandidates = useMemo(() =>
    availableTeams.filter(t => {
      if (t.confederation?.code === "UEFA") return false;
      if (hostIds.includes(t.id)) return false;
      if (selectedTeamIds.includes(t.id)) return false;
      if (repechajeSearchQuery) {
        const q = normalizeText(repechajeSearchQuery);
        return normalizeText(t.name).includes(q) ||
          normalizeText(t.fifaCode).includes(q);
      }
      return true;
    }),
    [availableTeams, hostIds, selectedTeamIds, repechajeSearchQuery]);

  // ─── Effects ───
  useEffect(() => {
    getTemplates().then(setTemplates);
    getTeams().then(setAvailableTeams);
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem(STORAGE_KEY_PREFIX + "last_name");
    if (storedName) {
      const savedState = loadWizardState(storedName);
      if (savedState) {
        setStep(savedState.step);
        setName(savedState.name);
        setType(savedState.type);
        setSubType(savedState.subType);
        setTeamsCount(savedState.teamsCount);
        setCustomQuotas(savedState.customQuotas);
        setHostIds(savedState.hostIds);
        setSelectedTeamIds(savedState.selectedTeamIds);
        setRepechajeTeamIds(savedState.repechajeTeamIds);
        setDrawMode(savedState.drawMode);
        setManualGroups(savedState.manualGroups);
        // Initialize refs with loaded values so we don't trigger clear effect
        prevHostIdsRef.current = savedState.hostIds;
        prevCustomQuotasRef.current = savedState.customQuotas;
        prevTypeSubTypeRef.current = `${savedState.type}::${savedState.subType}`;
        prevNameRef.current = savedState.name;
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (Object.keys(templates).length > 0 && !subType) {
      setSubType(Object.keys(templates)[0]);
    }
  }, [templates, isHydrated, subType]);

  useEffect(() => {
    if (!isHydrated) return;
    const currentKey = `${type}::${subType}`;
    if (currentKey !== prevTypeSubTypeRef.current) {
      if (type === "official" && subType && templates[subType]) {
        setTeamsCount(templates[subType].teamsCount);
      }
      // Always clear dependent selections when switching type/subType
      setSelectedTeamIds([]);
      setRepechajeTeamIds([]);
      setHostIds([]);
      setManualGroups({});
      prevHostIdsRef.current = [];
      prevCustomQuotasRef.current = customQuotas;
      prevTypeSubTypeRef.current = currentKey;
    }
  }, [type, subType, templates, isHydrated, customQuotas]);

  // Clear selections when quotas/hosts shift (only when user actually changes them)
  useEffect(() => {
    if (!isHydrated) return;
    const hostIdsChanged =
      prevHostIdsRef.current.length !== hostIds.length ||
      prevHostIdsRef.current.some((id, i) => id !== hostIds[i]);
    const quotasChanged =
      JSON.stringify(prevCustomQuotasRef.current) !== JSON.stringify(customQuotas);

    if (hostIdsChanged || quotasChanged) {
      setSelectedTeamIds([]);
      setRepechajeTeamIds([]);
      prevHostIdsRef.current = hostIds;
      prevCustomQuotasRef.current = customQuotas;
    }
  }, [hostIds, customQuotas, isHydrated]);

  // Auto-clear repechajeTeamIds when there are no repechaje slots (custom or non-world-cup)
  useEffect(() => {
    if (!isHydrated) return;
    if (freedSlots === 0 && repechajeTeamIds.length > 0) {
      setRepechajeTeamIds([]);
    }
  }, [freedSlots, isHydrated, repechajeTeamIds.length]);

  // Cleanup error timer on unmount
  const errorTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const state: WizardState = {
      step,
      name,
      type,
      subType,
      teamsCount,
      customQuotas,
      hostIds,
      selectedTeamIds,
      repechajeTeamIds,
      drawMode,
      manualGroups,
    };
    const timeoutId = setTimeout(() => {
      if (!name.trim()) return;

      // Clean up old key if name changed
      if (prevNameRef.current && prevNameRef.current !== name) {
        const oldKey = getStorageKey(prevNameRef.current);
        if (oldKey !== getStorageKey(name)) {
          try {
            localStorage.removeItem(oldKey);
          } catch { }
        }
      }
      prevNameRef.current = name;

      localStorage.setItem(STORAGE_KEY_PREFIX + "last_name", name);
      saveWizardState(name, state);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [step, name, type, subType, teamsCount, customQuotas, hostIds, selectedTeamIds, repechajeTeamIds, drawMode, manualGroups, isHydrated]);

  // ─── Derived: Sorteo Pots ───
  const numGroups = Math.max(1, Math.floor(totalTeamsExpected / 4));

  const pots = useMemo(() => {
    const allIds = [...hostIds, ...selectedTeamIds, ...repechajeTeamIds];
    const teams = allIds.map(id => availableTeams.find(t => t.id === id)).filter(Boolean) as Team[];

    // Sort hosts first (Pot 1), then the rest by FIFA ranking
    const sorted = [...teams].sort((a, b) => {
      const aIsHost = hostIds.includes(a.id);
      const bIsHost = hostIds.includes(b.id);
      if (aIsHost && !bIsHost) return -1;
      if (!aIsHost && bIsHost) return 1;
      return (a.fifaRanking || 9999) - (b.fifaRanking || 9999);
    });

    const result: Team[][] = [[], [], [], []];
    for (let i = 0; i < sorted.length; i++) {
      const potIndex = Math.floor(i / numGroups);
      if (potIndex < 4) {
        result[potIndex].push(sorted[i]);
      }
    }
    return result;
  }, [hostIds, selectedTeamIds, repechajeTeamIds, availableTeams, numGroups]);

  // Teams already assigned in manual groups
  const assignedTeamIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(manualGroups).forEach(group => {
      group.forEach(id => {
        if (id !== "") ids.add(id);
      });
    });
    return ids;
  }, [manualGroups]);

  // ─── DnD helpers ───
  const getTeamPotIndex = (teamId: string): number => {
    for (let p = 0; p < pots.length; p++) {
      if (pots[p].some(t => t.id === teamId)) return p;
    }
    return -1;
  };

  const findTeamLocation = (teamId: string): TeamLocation | null => {
    for (let g = 0; g < numGroups; g++) {
      const group = manualGroups[g] || [];
      for (let s = 0; s < 4; s++) {
        if (group[s] === teamId) {
          return { type: "group", gIndex: g, sIndex: s };
        }
      }
    }
    const potIndex = getTeamPotIndex(teamId);
    if (potIndex !== -1) return { type: "pot", potIndex };
    return null;
  };

  const getAssignedGroupName = (teamId: string): string | undefined => {
    for (let g = 0; g < numGroups; g++) {
      const group = manualGroups[g] || [];
      if (group.some(id => id === teamId)) {
        return `Grupo ${String.fromCharCode(65 + g)}`;
      }
    }
    return undefined;
  };

  const triggerShake = (slotId: string, message?: string) => {
    setShakingSlotId(slotId);
    setShakeCounter(k => k + 1);
    if (message) {
      setDropError(message);
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
      }
      errorTimerRef.current = window.setTimeout(() => {
        setDropError(null);
        errorTimerRef.current = null;
      }, 5000);
    }
    window.setTimeout(() => {
      setShakingSlotId(prev => (prev === slotId ? null : prev));
    }, 500);
  };

  const validateSlotDrop = (
    gIndex: number,
    teamId: string
  ): { ok: boolean; reason?: string } => {
    const teamPot = getTeamPotIndex(teamId);
    if (teamPot === -1) return { ok: false, reason: "Equipo no encontrado en ningún bombo" };

    const group = manualGroups[gIndex] || [];
    for (let s = 0; s < 4; s++) {
      const otherId = group[s];
      if (!otherId || otherId === teamId) continue;
      const otherPot = getTeamPotIndex(otherId);
      if (otherPot === teamPot) {
        return {
          ok: false,
          reason: `El ${getAssignedGroupName(otherId)} ya tiene un equipo del Bombo ${teamPot + 1}`,
        };
      }
    }
    return { ok: true };
  };

  const getTeamConfed = (teamId: string): string | undefined =>
    availableTeams.find(t => t.id === teamId)?.confederation?.code;

  const validateConfederationRule = (
    gIndex: number,
    teamId: string
  ): { ok: boolean; reason?: string } => {
    if (!isWorldCup) return { ok: true };

    const teamConfed = getTeamConfed(teamId);
    if (!teamConfed) return { ok: true };

    const maxAllowed = teamConfed === 'UEFA' ? 2 : 1;
    const group = manualGroups[gIndex] || [];
    const sameConfed = group
      .filter(id => id && id !== teamId)
      .map(id => ({ id, confed: getTeamConfed(id) }))
      .filter(({ confed }) => confed === teamConfed);

    if (sameConfed.length >= maxAllowed) {
      const groupName = String.fromCharCode(65 + gIndex);
      const sameNames = sameConfed
        .map(({ id }) => availableTeams.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      if (maxAllowed === 2) {
        return {
          ok: false,
          reason: `El Grupo ${groupName} ya tiene ${maxAllowed} equipos ${teamConfed} (${sameNames}). Máximo UEFA: 2.`,
        };
      }
      return {
        ok: false,
        reason: `El Grupo ${groupName} ya tiene un equipo de ${teamConfed} (${sameNames}). Máximo: 1.`,
      };
    }
    return { ok: true };
  };

  const getSlotInvalidity = (
    gIndex: number,
    sIndex: number,
    teamId: string
  ): { invalid: boolean; reason?: "occupied" | "pot" | "confed" } => {
    const existingTeamId = manualGroups[gIndex]?.[sIndex] || "";
    if (existingTeamId && existingTeamId !== teamId) {
      return { invalid: true, reason: "occupied" };
    }
    if (!validateSlotDrop(gIndex, teamId).ok) {
      return { invalid: true, reason: "pot" };
    }
    if (!validateConfederationRule(gIndex, teamId).ok) {
      return { invalid: true, reason: "confed" };
    }
    return { invalid: false };
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragTeamId(String(event.active.id));
    setDropError(null);
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  };

  const handleDragCancel = () => {
    setActiveDragTeamId(null);
    setDropError(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragTeamId(null);
    const { active, over } = event;
    if (!over) return;

    const teamId = String(active.id);
    const overId = String(over.id);
    const sourceLocation = findTeamLocation(teamId);

    // Case 1: Drop on a group slot
    if (overId.startsWith(SLOT_DROP_ID_PREFIX)) {
      const parsed = parseSlotId(overId);
      if (!parsed) return;
      const { gIndex, sIndex } = parsed;

      // Reject if slot is occupied by another team
      const existingTeamId = manualGroups[gIndex]?.[sIndex] || "";
      if (existingTeamId && existingTeamId !== teamId) {
        triggerShake(overId, "Este slot ya está ocupado. Quita el equipo primero.");
        return;
      }

      // Validate pot-uniqueness for the group
      const validation = validateSlotDrop(gIndex, teamId);
      if (!validation.ok) {
        triggerShake(overId, validation.reason);
        return;
      }

      // Validate World Cup confederation rule
      const confedValidation = validateConfederationRule(gIndex, teamId);
      if (!confedValidation.ok) {
        triggerShake(overId, confedValidation.reason);
        return;
      }

      // Apply: clear source, set target
      setManualGroups(prev => {
        const newGroups: Record<number, string[]> = { ...prev };

        if (sourceLocation?.type === "group") {
          if (!newGroups[sourceLocation.gIndex]) newGroups[sourceLocation.gIndex] = ["", "", "", ""];
          newGroups[sourceLocation.gIndex] = [...newGroups[sourceLocation.gIndex]];
          newGroups[sourceLocation.gIndex][sourceLocation.sIndex] = "";
        }

        if (!newGroups[gIndex]) newGroups[gIndex] = ["", "", "", ""];
        newGroups[gIndex] = [...newGroups[gIndex]];
        newGroups[gIndex][sIndex] = teamId;
        return newGroups;
      });
      setDropError(null);
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      return;
    }

    // Case 2: Drop on a pot (unassign)
    if (overId.startsWith(POT_DROP_ID_PREFIX)) {
      if (sourceLocation?.type === "group") {
        setManualGroups(prev => {
          const newGroups: Record<number, string[]> = { ...prev };
          if (newGroups[sourceLocation.gIndex]) {
            newGroups[sourceLocation.gIndex] = [...newGroups[sourceLocation.gIndex]];
            newGroups[sourceLocation.gIndex][sourceLocation.sIndex] = "";
          }
          return newGroups;
        });
        setDropError(null);
        if (errorTimerRef.current !== null) {
          window.clearTimeout(errorTimerRef.current);
          errorTimerRef.current = null;
        }
      }
    }
  };

  const removeFromGroup = (gIndex: number, sIndex: number) => {
    setManualGroups(prev => {
      const newGroups: Record<number, string[]> = { ...prev };
      if (newGroups[gIndex]) {
        newGroups[gIndex] = [...newGroups[gIndex]];
        newGroups[gIndex][sIndex] = "";
      }
      return newGroups;
    });
    setDropError(null);
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  };

  const activeDragTeam = useMemo(() => {
    if (!activeDragTeamId) return null;
    return availableTeams.find(t => t.id === activeDragTeamId) || null;
  }, [activeDragTeamId, availableTeams]);

  // ─── Handlers ───
  const toggleHost = (teamId: string) => {
    if (hostIds.includes(teamId)) {
      setHostIds(hostIds.filter(id => id !== teamId));
    } else {
      setHostIds([...hostIds, teamId]);
    }
  };

  const toggleParticipant = (teamId: string, confedCode: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId));
    } else {
      const count = getSelectedCountPerConfed(confedCode);
      const limit = effectiveQuotas[confedCode] || 0;
      if (count < limit) setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  const toggleRepechaje = (teamId: string) => {
    if (repechajeTeamIds.includes(teamId)) {
      setRepechajeTeamIds(repechajeTeamIds.filter(id => id !== teamId));
    } else {
      if (repechajeTeamIds.length < freedSlots) {
        setRepechajeTeamIds([...repechajeTeamIds, teamId]);
      }
    }
  };

  const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const randomizeConfederation = (confedCode: string) => {
    const quota = effectiveQuotas[confedCode] || 0;
    if (quota <= 0) return;

    const otherConfedSelected = selectedTeamIds.filter(id => {
      const t = availableTeams.find(t => t.id === id);
      return t?.confederation?.code !== confedCode;
    });

    const candidates = availableTeams.filter(t => {
      if (t.confederation?.code !== confedCode) return false;
      if (hostIds.includes(t.id)) return false;
      return true;
    });

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, quota);

    setSelectedTeamIds([...otherConfedSelected, ...picks.map(t => t.id)]);
  };

  // Validations
  const isStep1Valid = name.trim().length > 0;
  const customQuotasSum = Object.values(customQuotas).reduce<number>((a, c) => a + (Number(c) || 0), 0);
  const isCustomQuotaValid = type === "custom" ? customQuotasSum === (Number(teamsCount) || 0) : true;
  const isStep2Valid = true;

  const isAllQuotasMet = Object.entries(effectiveQuotas).every(
    ([code, quota]) => getSelectedCountPerConfed(code) === quota
  );
  const isStep3Valid = isCustomQuotaValid && isAllQuotasMet;

  // Step 4 is valid if we picked exactly `freedSlots` teams in repechaje
  const isStep4Valid = useMemo(() => {
    if (repechajeTeamIds.length !== freedSlots) return false;
    if (freedSlots === 0) return true;

    // Check max winners per confederation
    const repechajeTeams = repechajeTeamIds.map(id => availableTeams.find(t => t.id === id)).filter(Boolean) as Team[];
    const counts: Record<string, number> = {};
    repechajeTeams.forEach(t => {
      const c = t.confederation?.code || "UNKNOWN";
      counts[c] = (counts[c] || 0) + 1;
    });

    const hostConfeds = Object.keys(hostsByConfed);
    for (const [confed, count] of Object.entries(counts)) {
      const isHostConfed = hostConfeds.includes(confed);
      const limit = isHostConfed ? 2 : 1;
      if (count > limit) return false;
    }
    return true;
  }, [repechajeTeamIds, freedSlots, availableTeams, hostsByConfed]);

  const isStep5Valid = drawMode === "auto" || assignedTeamIds.size === totalTeamsExpected;

  const isCreatingRef = useRef(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setIsCreating(true);

    try {
      const finalParticipants = [...selectedTeamIds, ...repechajeTeamIds];
      const totalSelected = hostIds.length + finalParticipants.length;

      if (totalSelected !== totalTeamsExpected) {
        alert(
          `No se puede crear el torneo: se esperan ${totalTeamsExpected} equipos en total, pero hay ${totalSelected} (${hostIds.length} anfitriones + ${finalParticipants.length} participantes). Vuelve al paso 3 y completa las selecciones.`
        );
        return;
      }

      if (type === "custom" && !isCustomQuotaValid) {
        alert(
          `La suma de las plazas por confederación (${customQuotasSum}) no coincide con el total de equipos (${Number(teamsCount) || 0}). Vuelve al paso 1 y corrige los valores.`
        );
        return;
      }

      if (!isStep3Valid) {
        alert("Las selecciones de participantes no cumplen con los cupos. Vuelve al paso 3.");
        return;
      }

      if (drawMode === "manual" && !isStep5Valid) {
        alert("El sorteo manual no está completo. Asigna todos los equipos a los grupos.");
        return;
      }

      let groupsArray = undefined;
      if (drawMode === "manual") {
        groupsArray = [];
        for (let i = 0; i < numGroups; i++) {
          const g = manualGroups[i] || [];
          groupsArray.push(g.filter(id => id !== ""));
        }
      }

      const newTournament = await createTournament({
        name,
        type,
        subType: type === "official" ? subType : undefined,
        teamsCount: totalTeamsExpected,
        hostIds: hostIds,
        teamIds: finalParticipants,
        customQuotas: type === "custom" ? Object.fromEntries(Object.entries(customQuotas).map(([k, v]) => [k, Number(v) || 0])) : undefined,
        groups: groupsArray,
      });
      clearWizardState(name);
      localStorage.removeItem(STORAGE_KEY_PREFIX + "last_name");
      router.push(`/tournaments/${newTournament.id}`);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error("Error creating tournament:", err);
      const message = err?.response?.data?.message || err?.message || "Error desconocido al crear el torneo.";
      alert(`Error: ${message}`);
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  };

  return {
    step,
    setStep,
    name,
    setName,
    type,
    setType,
    subType,
    setSubType,
    teamsCount,
    setTeamsCount,
    customQuotas,
    setCustomQuotas,
    hostIds,
    setHostIds,
    selectedTeamIds,
    setSelectedTeamIds,
    repechajeTeamIds,
    setRepechajeTeamIds,
    drawMode,
    setDrawMode,
    manualGroups,
    setManualGroups,
    templates,
    availableTeams,
    hostSearchQuery,
    setHostSearchQuery,
    participantSearchQueries,
    setParticipantSearchQueries,
    repechajeSearchQuery,
    setRepechajeSearchQuery,
    numGroups,
    pots,
    assignedTeamIds,
    activeDragTeamId,
    activeDragTeam,
    shakingSlotId,
    shakeCounter,
    dropError,
    setDropError,
    effectiveQuotas,
    freedSlots,
    hostsByConfed,
    hostCandidates,
    repechajeCandidates,
    teamsByConfed,
    isWorldCup,
    totalTeamsExpected,
    customQuotasSum,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isStep5Valid,
    isCustomQuotaValid,
    isCreating,
    toggleHost,
    toggleParticipant,
    toggleRepechaje,
    handleNext,
    handlePrev,
    randomizeConfederation,
    handleCreate,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    removeFromGroup,
    getSlotInvalidity,
    getAssignedGroupName,
    getSelectedCountPerConfed,
  };
}
