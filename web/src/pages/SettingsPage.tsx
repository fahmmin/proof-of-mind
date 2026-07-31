import { useState } from 'react';
import { useProgress } from '../components/ProgressProvider';
import { networkLabel } from '../lib/networkLabels';
import { NETWORK_ID, CONTRACT_ADDRESS } from '../config';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useToasts } from '../components/StatusToasts';

export function SettingsPage() {
  const { state, updateSettings, resetLocalData } = useProgress();
  const { push } = useToasts();
  const [name, setName] = useState(state.displayName);

  function saveName() {
    updateSettings({ displayName: name.trim() || 'Anonymous lab' });
    push({ tone: 'ok', title: 'Display name saved' });
  }

  function handleReset() {
    if (!window.confirm('Reset local standing, achievements, and preferences on this device?')) {
      return;
    }
    resetLocalData();
    setName('Anonymous lab');
    push({
      tone: 'info',
      title: 'Local data cleared',
      body: 'Orientation will restart next visit.',
    });
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-4xl font-medium tracking-tight">Settings</h1>
      <p className="mt-3 text-[var(--pom-muted)]">Preferences stay in this browser.</p>

      <section className="mt-10 space-y-8">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)]">
            Lab display name
          </span>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="min-w-0 flex-1 rounded-[var(--pom-radius)] border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] px-4 py-3 text-sm text-[var(--pom-ink)] outline-none focus:border-[var(--pom-accent)]"
            />
            <button
              type="button"
              onClick={saveName}
              className="shrink-0 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-4 py-2 text-sm font-medium text-[var(--pom-accent-ink)]"
            >
              Save
            </button>
          </div>
        </label>

        <label className="flex cursor-pointer items-start justify-between gap-4 border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] px-4 py-4">
          <span>
            <span className="block text-sm font-medium text-[var(--pom-ink)]">Compact mode</span>
            <span className="mt-1 block text-xs text-[var(--pom-muted)]">
              Tighter spacing for smaller screens.
            </span>
          </span>
          <input
            type="checkbox"
            checked={state.compactMode}
            onChange={(e) => updateSettings({ compactMode: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--pom-accent)]"
          />
        </label>

        <label className="flex cursor-pointer items-start justify-between gap-4 border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] px-4 py-4">
          <span>
            <span className="block text-sm font-medium text-[var(--pom-ink)]">
              Show advanced details
            </span>
            <span className="mt-1 block text-xs text-[var(--pom-muted)]">
              Reveal contract addresses and commitment hashes where they appear.
            </span>
          </span>
          <input
            type="checkbox"
            checked={state.showAdvanced}
            onChange={(e) => updateSettings({ showAdvanced: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--pom-accent)]"
          />
        </label>

        <div className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)]">
            Network
          </p>
          <p className="mt-2 text-xl font-medium">{networkLabel(NETWORK_ID)}</p>
        </div>

        <AdvancedDetails label="Deployment details">
          <p>Network id: {NETWORK_ID}</p>
          <p>Contract: {CONTRACT_ADDRESS}</p>
        </AdvancedDetails>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-[var(--pom-radius)] border border-[color-mix(in_srgb,var(--pom-danger)_40%,transparent)] px-4 py-2.5 text-sm text-[var(--pom-danger)] transition hover:bg-[color-mix(in_srgb,var(--pom-danger)_10%,transparent)]"
        >
          Reset local data
        </button>
      </section>
    </div>
  );
}
