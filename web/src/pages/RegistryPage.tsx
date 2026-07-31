import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SealCheck, Fingerprint, ArrowRight } from '@phosphor-icons/react';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useProgress } from '../components/ProgressProvider';
import { useProofOfMind } from '../context/ProofOfMindContext';
import { displayNameFor } from '../lib/modelLabels';
import { bpsToPercentLabel } from '../lib/progress';

export function RegistryPage() {
  const { entries, busy, contractAddress, refresh, modelPreview } = useProofOfMind();
  const { recordRegistryBrowse, state } = useProgress();

  useEffect(() => {
    recordRegistryBrowse();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount
  }, []);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
            Public directory
          </p>
          <h1 className="font-display mt-2 text-4xl font-medium tracking-tight md:text-5xl">
            Model registry
          </h1>
          <p className="mt-3 max-w-[56ch] text-[var(--pom-muted)]">
            Human-readable claims and certified thresholds. Technical IDs stay behind Advanced.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={busy}
          className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2 text-sm transition hover:border-[var(--pom-muted)] active:scale-[0.98]"
        >
          Refresh
        </button>
      </div>

      {entries.length === 0 ? (
        <section className="surface-day mt-12 border border-[var(--pom-day-line)] p-8 md:p-10">
          <Fingerprint size={32} weight="duotone" className="text-[var(--pom-accent)]" />
          <h2 className="font-display mt-4 text-2xl font-medium text-[var(--pom-day-ink)]">
            No models on record yet
          </h2>
          <p className="mt-3 max-w-[48ch] text-sm text-[var(--pom-day-muted)]">
            The public directory is empty. Be the first lab to publish a claim — name, accuracy
            percent, private fingerprint.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-4 py-2.5 text-sm font-medium text-[var(--pom-accent-ink)]"
          >
            Publish a claim
            <ArrowRight size={14} weight="bold" />
          </Link>
        </section>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {entries.map((entry, i) => {
            const accuracy = bpsToPercentLabel(entry.accuracyBps);
            const labels = displayNameFor(entry.modelCommitment, accuracy, i);
            const isOwn = entry.modelCommitment === modelPreview;
            const delayClass =
              i < 4 ? `anim-registry-fade-delay-${i + 1}` : 'anim-registry-fade-delay-4';

            return (
              <li
                key={entry.modelCommitment}
                className={`anim-registry-fade ${delayClass} border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-5 transition hover:border-[color-mix(in_srgb,var(--pom-accent)_40%,transparent)] md:p-6`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-accent)]">
                      {isOwn ? 'Your claim' : `Claim ${String(i + 1).padStart(2, '0')}`}
                    </p>
                    <h2 className="font-display mt-2 text-xl font-medium tracking-tight text-[var(--pom-ink)]">
                      {labels.title}
                    </h2>
                    {labels.subtitle ? (
                      <p className="mt-1 text-sm text-[var(--pom-muted)]">{labels.subtitle}</p>
                    ) : null}
                  </div>
                  {entry.certifiedThresholdBps != null ? (
                    <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[var(--pom-accent)]">
                      <SealCheck size={14} weight="fill" />
                      Certified
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-[11px] text-[var(--pom-muted)]">
                      Uncertified
                    </span>
                  )}
                </div>

                <p className="font-display mt-5 text-3xl font-medium tracking-tight text-[var(--pom-ink)]">
                  {accuracy}
                </p>
                <p className="mt-1 text-sm text-[var(--pom-muted)]">Disclosed accuracy</p>

                {entry.certifiedThresholdBps != null ? (
                  <p className="mt-3 text-xs text-[var(--pom-muted)]">
                    Certified ≥ {bpsToPercentLabel(entry.certifiedThresholdBps)}
                  </p>
                ) : null}

                <Link
                  to={`/models/${encodeURIComponent(entry.modelCommitment)}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--pom-accent)] transition hover:opacity-80"
                >
                  View detail
                  <ArrowRight size={14} weight="bold" />
                </Link>

                {state.showAdvanced ? (
                  <AdvancedDetails label="Technical IDs">
                    <p>Model: {entry.modelCommitment}</p>
                    <p>Provider: {entry.providerCommitment}</p>
                  </AdvancedDetails>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 font-mono text-[11px] text-[var(--pom-muted)]">
        {entries.length} model{entries.length === 1 ? '' : 's'} registered
      </p>

      <AdvancedDetails label="Registry contract">
        <p>Contract: {contractAddress}</p>
      </AdvancedDetails>
    </div>
  );
}
