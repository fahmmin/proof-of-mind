import { Link } from 'react-router-dom';
import { ShieldCheck, LockKey, Broadcast, Warning, Question } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';

export function HelpPage() {
  const { state } = useProgress();
  const enterTo = state.onboarded ? '/home' : '/onboarding';

  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8 md:py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
        Help & privacy
      </p>
      <h1 className="font-display mt-3 text-4xl font-medium tracking-tight md:text-5xl">
        How the lab keeps fingerprints private
      </h1>
      <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--pom-muted)]">
        Proof of Mind is an AI trust registry on Midnight. You commit fingerprints so buyers can
        verify accuracy claims — without publishing model weights.
      </p>

      <div className="mt-14 space-y-10">
        <div className="border-t border-[var(--pom-line)] pt-8">
          <div className="flex items-start gap-4">
            <LockKey size={24} className="mt-1 shrink-0 text-[var(--pom-accent)]" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-medium">What stays private</h2>
              <ul className="mt-3 space-y-2 text-[var(--pom-muted)]">
                <li>Your model fingerprint bytes (kept in this browser)</li>
                <li>Your provider secret used for ownership proofs</li>
                <li>Any raw link between wallet identity and fingerprint material</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--pom-line)] pt-8">
          <div className="flex items-start gap-4">
            <Broadcast
              size={24}
              className="mt-1 shrink-0 text-[var(--pom-accent)]"
              weight="duotone"
            />
            <div>
              <h2 className="font-display text-xl font-medium">What stays public</h2>
              <ul className="mt-3 space-y-2 text-[var(--pom-muted)]">
                <li>Model and provider commitments (hashes)</li>
                <li>Disclosed accuracy you choose to publish</li>
                <li>Whether a model has been certified against a threshold</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--pom-line)] pt-8">
          <div className="flex items-start gap-4">
            <ShieldCheck
              size={24}
              className="mt-1 shrink-0 text-[var(--pom-accent)]"
              weight="duotone"
            />
            <div>
              <h2 className="font-display text-xl font-medium">What you can do</h2>
              <ul className="mt-3 space-y-2 text-[var(--pom-muted)]">
                <li>
                  <span className="text-[var(--pom-ink)]">Publish model claim</span> — name a model,
                  disclose accuracy %, commit fingerprint
                </li>
                <li>
                  <span className="text-[var(--pom-ink)]">Prove it’s yours</span> — show control
                  without revealing secrets
                </li>
                <li>
                  <span className="text-[var(--pom-ink)]">Certify against threshold</span> — seal
                  Certified ≥ X%
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--pom-line)] pt-8">
          <div className="flex items-start gap-4">
            <Question
              size={24}
              className="mt-1 shrink-0 text-[var(--pom-accent)]"
              weight="duotone"
            />
            <div>
              <h2 className="font-display text-xl font-medium">Wallets & waiting</h2>
              <ul className="mt-3 space-y-2 text-[var(--pom-muted)]">
                <li>Use Lace or 1AM set to the same network shown in Settings</li>
                <li>Proving can take up to a minute — keep the tab open</li>
                <li>Approve prompts in your wallet when they appear</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-[color-mix(in_srgb,var(--pom-danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--pom-danger)_5%,transparent)] p-6">
          <div className="flex items-start gap-3">
            <Warning size={22} className="mt-0.5 shrink-0 text-[var(--pom-danger)]" weight="fill" />
            <p className="text-sm leading-relaxed text-[var(--pom-ink)]">
              Observers can see that a commitment was registered at a disclosed accuracy. They cannot
              recover weights or fingerprints from registry data alone.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          to={enterTo}
          className="inline-flex rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-3 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 active:scale-[0.98]"
        >
          {state.onboarded ? 'Back to home' : 'Start orientation'}
        </Link>
        <Link
          to="/registry"
          className="inline-flex rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-5 py-3 text-sm text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)]"
        >
          Browse registry
        </Link>
      </div>
    </div>
  );
}
