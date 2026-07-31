import { Link } from 'react-router-dom';
import { ArrowRight, Fire, Flask } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';
import { useProofOfMind } from '../context/ProofOfMindContext';
import { displayNameFor } from '../lib/modelLabels';
import { bpsToPercentLabel } from '../lib/progress';

type Props = {
  onOpenConnect: () => void;
};

export function HomePage({ onOpenConnect }: Props) {
  const { state, rank } = useProgress();
  const { connected, entries, modelPreview } = useProofOfMind();
  const pct = Math.round(rank.progress * 100);

  const ownEntry = entries.find((e) => e.modelCommitment === modelPreview);
  const hasClaim = state.modelsRegistered > 0 || Boolean(ownEntry);
  const hasCert =
    state.credentialsIssued > 0 ||
    (ownEntry != null && ownEntry.certifiedThresholdBps != null);
  const hasProve = state.ownershipProofs > 0;

  let nextTitle = 'Publish a model claim';
  let nextBody =
    'Name your model, set accuracy as a percentage, and commit the fingerprint privately on Midnight.';
  let nextPrimary = { to: '/register', label: 'Register claim' };
  let nextSecondary = { to: '/registry', label: 'Browse registry' };

  if (hasClaim && !hasProve && ownEntry) {
    nextTitle = 'Prove it’s yours';
    nextBody =
      'Show control of your registered claim without revealing the fingerprint or provider secret.';
    nextPrimary = {
      to: `/models/${encodeURIComponent(ownEntry.modelCommitment)}`,
      label: 'Prove ownership',
    };
    nextSecondary = { to: '/registry', label: 'Browse registry' };
  } else if (hasClaim && !hasCert && ownEntry) {
    nextTitle = 'Certify against a threshold';
    nextBody = 'Seal a Certified ≥ X% credential on your claim so buyers see clinical confidence.';
    nextPrimary = {
      to: `/models/${encodeURIComponent(ownEntry.modelCommitment)}`,
      label: 'Certify model',
    };
    nextSecondary = { to: '/registry', label: 'Browse registry' };
  } else if (hasClaim) {
    nextTitle = 'Your standing is live';
    nextBody = 'Browse the public directory, publish another claim, or return tomorrow to keep cadence.';
    nextPrimary = { to: '/registry', label: 'Open registry' };
    nextSecondary = { to: '/register', label: 'New claim' };
  }

  const recentOwn = ownEntry
    ? displayNameFor(ownEntry.modelCommitment, bpsToPercentLabel(ownEntry.accuracyBps))
    : null;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
        Your standing
      </p>
      <h1 className="font-display mt-3 text-4xl font-medium tracking-tight md:text-5xl">
        {state.displayName}
      </h1>
      <p className="mt-3 max-w-[48ch] text-[var(--pom-muted)]">{rank.current.blurb}</p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-5 md:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)]">
                Lab rank
              </p>
              <p className="font-display mt-1 text-2xl font-medium text-[var(--pom-accent)]">
                {rank.current.label}
              </p>
            </div>
            <p className="font-mono text-sm text-[var(--pom-muted)]">{state.xp} XP</p>
          </div>
          <div className="mt-5 h-2 w-full bg-[var(--pom-bg-soft)]">
            <div
              className="h-full bg-[var(--pom-accent)] transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[11px] text-[var(--pom-muted)]">
            {rank.next
              ? `${rank.next.minXp - state.xp} XP to ${rank.next.label}`
              : 'Reference lab — top of the board'}
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--pom-muted)]">
            Prototype → Bench → Certified → Reference
          </p>
        </div>

        <div className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-5">
          <div className="flex items-center gap-2 text-[var(--pom-accent)]">
            <Fire size={20} weight="duotone" />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]">Streak</p>
          </div>
          <p className="font-display mt-3 text-4xl font-medium tracking-tight">
            {state.streak}
            <span className="ml-2 text-lg text-[var(--pom-muted)]">
              day{state.streak === 1 ? '' : 's'}
            </span>
          </p>
          <p className="mt-2 text-xs text-[var(--pom-muted)]">Return tomorrow to keep cadence.</p>
        </div>
      </div>

      {recentOwn && ownEntry ? (
        <section className="surface-day mt-8 border border-[var(--pom-day-line)] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-accent)]">
                Your model
              </p>
              <p className="font-display mt-1 text-xl font-medium text-[var(--pom-day-ink)]">
                {recentOwn.title}
              </p>
              <p className="mt-1 text-sm text-[var(--pom-day-muted)]">
                {bpsToPercentLabel(ownEntry.accuracyBps)} disclosed
                {ownEntry.certifiedThresholdBps != null
                  ? ` · Certified ≥ ${bpsToPercentLabel(ownEntry.certifiedThresholdBps)}`
                  : ''}
              </p>
            </div>
            <Link
              to={`/models/${encodeURIComponent(ownEntry.modelCommitment)}`}
              className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] border border-[var(--pom-day-line)] px-4 py-2 text-sm text-[var(--pom-day-ink)] transition hover:border-[var(--pom-accent)]"
            >
              Open detail
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-12 border border-[color-mix(in_srgb,var(--pom-accent)_30%,transparent)] bg-[var(--pom-bg-elevated)] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-accent)]">
              Next action
            </p>
            <h2 className="font-display mt-2 text-2xl font-medium tracking-tight md:text-3xl">
              {nextTitle}
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-[var(--pom-muted)]">
              {nextBody}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-[var(--pom-muted)]">
              <Flask size={14} className="text-[var(--pom-accent)]" />
              {entries.length} model{entries.length === 1 ? '' : 's'} on the public registry
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!connected ? (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2.5 text-sm text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)] active:scale-[0.98]"
              >
                Connect first
              </button>
            ) : null}
            <Link
              to={nextPrimary.to}
              className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-4 py-2.5 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 active:scale-[0.98]"
            >
              {nextPrimary.label}
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              to={nextSecondary.to}
              className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2.5 text-sm text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)] active:scale-[0.98]"
            >
              {nextSecondary.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
