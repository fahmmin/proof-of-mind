/**
 * Off-chain display names for registry models.
 * Contract stores commitments + accuracy only — human labels stay local.
 */

export type ModelLabel = {
  name: string;
  alias?: string;
  accuracyPercent?: number;
  updatedAt: number;
};

const STORAGE_KEY = 'proof-of-mind-model-labels-v1';

function loadAll(): Record<string, ModelLabel> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ModelLabel>;
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, ModelLabel>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getModelLabel(commitment: string): ModelLabel | null {
  return loadAll()[commitment] ?? null;
}

export function setModelLabel(
  commitment: string,
  patch: Pick<ModelLabel, 'name' | 'alias' | 'accuracyPercent'>,
): ModelLabel {
  const map = loadAll();
  const next: ModelLabel = {
    name: patch.name.trim() || map[commitment]?.name || 'Untitled model',
    alias: patch.alias?.trim() || map[commitment]?.alias,
    accuracyPercent: patch.accuracyPercent ?? map[commitment]?.accuracyPercent,
    updatedAt: Date.now(),
  };
  map[commitment] = next;
  saveAll(map);
  return next;
}

export function listModelLabels(): Record<string, ModelLabel> {
  return loadAll();
}

/** Human-facing title for a registry entry. */
export function displayNameFor(
  commitment: string,
  accuracyLabel?: string,
  index?: number,
): { title: string; subtitle: string | null } {
  const label = getModelLabel(commitment);
  if (label) {
    return {
      title: label.name,
      subtitle: label.alias ? label.alias : null,
    };
  }
  const n = index != null ? String(index + 1).padStart(2, '0') : null;
  return {
    title: n ? `Lab claim ${n}` : 'Unnamed claim',
    subtitle: accuracyLabel ? `Disclosed ${accuracyLabel}` : null,
  };
}

const DRAFT_KEY = 'proof-of-mind-claim-draft-v1';

export type ClaimDraft = {
  name: string;
  alias: string;
  accuracyPercent: number;
};

export function loadClaimDraft(): ClaimDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { name: '', alias: '', accuracyPercent: 94 };
    const parsed = JSON.parse(raw) as Partial<ClaimDraft>;
    return {
      name: parsed.name ?? '',
      alias: parsed.alias ?? '',
      accuracyPercent:
        typeof parsed.accuracyPercent === 'number' ? parsed.accuracyPercent : 94,
    };
  } catch {
    return { name: '', alias: '', accuracyPercent: 94 };
  }
}

export function saveClaimDraft(draft: ClaimDraft): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}
