import { WizardState } from "@/types";
import {
  STORAGE_KEY_PREFIX,
  SLOT_DROP_ID_PREFIX,
} from "@/lib/constants";

export function normalizeText(text: string | undefined): string {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getStorageKey(name: string): string {
  return `${STORAGE_KEY_PREFIX}my-torneo-${normalizeName(name)}`;
}

export function saveWizardState(name: string, state: WizardState): void {
  if (!name.trim()) return;
  try {
    localStorage.setItem(getStorageKey(name), JSON.stringify(state));
  } catch (e) {
    console.error("Error saving wizard state:", e);
  }
}

export function loadWizardState(name: string): WizardState | null {
  if (!name.trim()) return null;
  try {
    const stored = localStorage.getItem(getStorageKey(name));
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Error loading wizard state:", e);
    return null;
  }
}

export function clearWizardState(name: string): void {
  if (!name.trim()) return;
  try {
    localStorage.removeItem(getStorageKey(name));
  } catch (e) {
    console.error("Error clearing wizard state:", e);
  }
}

export function parseSlotId(id: string): { gIndex: number; sIndex: number } | null {
  if (!id.startsWith(SLOT_DROP_ID_PREFIX)) return null;
  const rest = id.slice(SLOT_DROP_ID_PREFIX.length);
  const parts = rest.split("-");
  if (parts.length !== 2) return null;
  const gIndex = parseInt(parts[0], 10);
  const sIndex = parseInt(parts[1], 10);
  if (Number.isNaN(gIndex) || Number.isNaN(sIndex)) return null;
  return { gIndex, sIndex };
}
