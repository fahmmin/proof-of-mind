/**
 * Local lab standing — retention without leaking fingerprints on-chain.
 * Wallet link stays private; this is browser-local reputation.
 */

export type LabRankId = 'prototype' | 'bench' | 'certified' | 'reference';

export type AchievementId =
  | 'first_steps'
  | 'model_registered'
  | 'ownership_proven'
  | 'credential_issued'
  | 'registry_browse'
  | 'streak_3'
  | 'streak_7'
  | 'returned_lab';

export type HistoryEvent = {
  id: string;
  at: number;
  kind:
    | 'onboarded'
    | 'connected'
    | 'register'
    | 'prove'
    | 'certify'
    | 'visit'
    | 'browse'
    | 'achievement';
  label: string;
  detail?: string;
};

export type ProgressState = {
  displayName: string;
  onboarded: boolean;
  xp: number;
  streak: number;
  lastVisitDay: string | null;
  modelsRegistered: number;
  ownershipProofs: number;
  credentialsIssued: number;
  registryVisits: number;
  achievements: AchievementId[];
  history: HistoryEvent[];
  compactMode: boolean;
  showAdvanced: boolean;
};

const STORAGE_KEY = 'proof-of-mind-progress-v2';

/** B2B lab ranks — not arcade spam. */
export const RANKS: {
  id: LabRankId;
  label: string;
  minXp: number;
  blurb: string;
}[] = [
  {
    id: 'prototype',
    label: 'Prototype',
    minXp: 0,
    blurb: 'Lab is open. No model claim on record yet.',
  },
  {
    id: 'bench',
    label: 'Bench',
    minXp: 40,
    blurb: 'A fingerprint is committed. Standing begins.',
  },
  {
    id: 'certified',
    label: 'Certified',
    minXp: 110,
    blurb: 'Ownership or threshold credential on the books.',
  },
  {
    id: 'reference',
    label: 'Reference',
    minXp: 200,
    blurb: 'Habitual return. Trusted lab presence.',
  },
];

export const ACHIEVEMENTS: {
  id: AchievementId;
  title: string;
  blurb: string;
  xp: number;
}[] = [
  { id: 'first_steps', title: 'Lab orientation', blurb: 'Finished onboarding.', xp: 15 },
  {
    id: 'model_registered',
    title: 'First claim',
    blurb: 'Published your first model claim.',
    xp: 40,
  },
  {
    id: 'ownership_proven',
    title: 'It’s yours',
    blurb: 'Proved ownership without revealing the fingerprint.',
    xp: 35,
  },
  {
    id: 'credential_issued',
    title: 'Threshold sealed',
    blurb: 'Certified a model against a threshold.',
    xp: 30,
  },
  {
    id: 'registry_browse',
    title: 'Directory watcher',
    blurb: 'Browsed the public registry three times.',
    xp: 20,
  },
  { id: 'streak_3', title: 'Three-day cadence', blurb: 'Returned three days in a row.', xp: 25 },
  { id: 'streak_7', title: 'Week in the lab', blurb: 'Seven-day return streak.', xp: 50 },
  {
    id: 'returned_lab',
    title: 'Returned lab',
    blurb: 'Came back after publishing a claim.',
    xp: 15,
  },
];

const defaultState = (): ProgressState => ({
  displayName: 'Anonymous lab',
  onboarded: false,
  xp: 0,
  streak: 0,
  lastVisitDay: null,
  modelsRegistered: 0,
  ownershipProofs: 0,
  credentialsIssued: 0,
  registryVisits: 0,
  achievements: [],
  history: [],
  compactMode: false,
  showAdvanced: false,
});

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86_400_000);
}

/** Migrate v1 progress if present. */
export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        ...defaultState(),
        ...parsed,
        history: parsed.history?.slice(0, 40) ?? [],
        registryVisits: parsed.registryVisits ?? 0,
      };
    }
    const legacy = localStorage.getItem('proof-of-mind-progress-v1');
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<ProgressState>;
      const migrated = {
        ...defaultState(),
        ...parsed,
        displayName:
          parsed.displayName === 'Anonymous provider'
            ? 'Anonymous lab'
            : (parsed.displayName ?? 'Anonymous lab'),
        history: parsed.history?.slice(0, 40) ?? [],
        registryVisits: 0,
      };
      saveProgress(migrated);
      return migrated;
    }
    return defaultState();
  } catch {
    return defaultState();
  }
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function rankForXp(xp: number) {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  const idx = RANKS.findIndex((r) => r.id === current.id);
  const next = RANKS[idx + 1] ?? null;
  const span = next ? next.minXp - current.minXp : 1;
  const into = next ? xp - current.minXp : span;
  const progress = next ? Math.min(1, into / span) : 1;
  return { current, next, progress };
}

function pushHistory(
  state: ProgressState,
  kind: HistoryEvent['kind'],
  label: string,
  detail?: string,
): ProgressState {
  const event: HistoryEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    kind,
    label,
    detail,
  };
  return { ...state, history: [event, ...state.history].slice(0, 40) };
}

function unlock(state: ProgressState, id: AchievementId): ProgressState {
  if (state.achievements.includes(id)) return state;
  const meta = ACHIEVEMENTS.find((a) => a.id === id);
  if (!meta) return state;
  let next = {
    ...state,
    achievements: [...state.achievements, id],
    xp: state.xp + meta.xp,
  };
  next = pushHistory(next, 'achievement', meta.title, meta.blurb);
  return next;
}

/** Call on app mount — maintains daily streak. */
export function recordVisit(state: ProgressState): ProgressState {
  const today = todayKey();
  if (state.lastVisitDay === today) return state;

  let streak = 1;
  if (state.lastVisitDay) {
    const diff = dayDiff(state.lastVisitDay, today);
    streak = diff === 1 ? state.streak + 1 : 1;
  }

  let next: ProgressState = {
    ...state,
    streak,
    lastVisitDay: today,
    xp: state.xp + 2,
  };
  next = pushHistory(next, 'visit', 'Returned to the lab', `Day streak: ${streak}`);

  if (streak >= 3) next = unlock(next, 'streak_3');
  if (streak >= 7) next = unlock(next, 'streak_7');
  if (state.modelsRegistered > 0) next = unlock(next, 'returned_lab');

  return next;
}

export function completeOnboarding(state: ProgressState, displayName: string): ProgressState {
  let next: ProgressState = {
    ...state,
    displayName: displayName.trim() || state.displayName,
    onboarded: true,
    xp: state.xp + 10,
  };
  next = pushHistory(next, 'onboarded', 'Orientation complete', next.displayName);
  next = unlock(next, 'first_steps');
  return next;
}

export function recordConnect(state: ProgressState): ProgressState {
  let next = { ...state, xp: state.xp + 8 };
  next = pushHistory(next, 'connected', 'Joined the lab', 'Session linked');
  return next;
}

export function recordRegister(state: ProgressState, accuracyPercent: number): ProgressState {
  let next: ProgressState = {
    ...state,
    modelsRegistered: state.modelsRegistered + 1,
    xp: state.xp + 30,
  };
  next = pushHistory(
    next,
    'register',
    'Model claim published',
    `Disclosed accuracy ${accuracyPercent}%`,
  );
  next = unlock(next, 'model_registered');
  return next;
}

export function recordProve(state: ProgressState): ProgressState {
  let next: ProgressState = {
    ...state,
    ownershipProofs: state.ownershipProofs + 1,
    xp: state.xp + 25,
  };
  next = pushHistory(next, 'prove', 'Ownership proven', 'Control shown without revealing secrets');
  next = unlock(next, 'ownership_proven');
  return next;
}

export function recordCertify(state: ProgressState, thresholdPercent: number): ProgressState {
  let next: ProgressState = {
    ...state,
    credentialsIssued: state.credentialsIssued + 1,
    xp: state.xp + 20,
  };
  next = pushHistory(
    next,
    'certify',
    'Threshold certified',
    `Certified ≥ ${thresholdPercent}%`,
  );
  next = unlock(next, 'credential_issued');
  return next;
}

export function recordRegistryBrowse(state: ProgressState): ProgressState {
  const visits = state.registryVisits + 1;
  let next: ProgressState = {
    ...state,
    registryVisits: visits,
    xp: state.xp + 3,
  };
  if (visits === 1) {
    next = pushHistory(next, 'browse', 'Opened the registry', 'Public directory');
  }
  if (visits >= 3) next = unlock(next, 'registry_browse');
  return next;
}

export function updateSettings(
  state: ProgressState,
  patch: Partial<Pick<ProgressState, 'displayName' | 'compactMode' | 'showAdvanced'>>,
): ProgressState {
  return { ...state, ...patch };
}

export function resetProgress(): ProgressState {
  const fresh = defaultState();
  saveProgress(fresh);
  return fresh;
}

/** Convert UI percentage (e.g. 94) to integer accuracy units for the API. */
export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}

/** Convert on-chain accuracy units to a display percentage string. */
export function bpsToPercentLabel(bps: number): string {
  const pct = bps / 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2)}%`;
}

export function bpsToPercentNumber(bps: number): number {
  return bps / 100;
}
