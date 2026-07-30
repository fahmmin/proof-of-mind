import { EyeSlash, LockKey, ShieldCheck } from '@phosphor-icons/react';
import { useProofOfMind, truncHex } from '../context/ProofOfMindContext';

export function PrivacyPanel() {
  const { modelPreview, secrets } = useProofOfMind();
  const fingerprintHint = Array.from(secrets.modelFingerprint.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return (
    <section className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-5 md:p-6">
      <h2 className="m-0 text-lg font-medium tracking-tight text-[var(--pom-ink)]">
        Privacy split
      </h2>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[var(--pom-muted)]">
        Fingerprints and provider secrets stay in browser witnesses. The ledger only sees
        commitments and the accuracy you choose to disclose.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--pom-ink)]">
            <LockKey size={18} weight="bold" aria-hidden />
            Private (witness)
          </div>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-[var(--pom-muted)]">
            <li className="flex gap-2">
              <EyeSlash size={16} className="mt-0.5 shrink-0" aria-hidden />
              Model fingerprint bytes (local only, preview {fingerprintHint}…)
            </li>
            <li className="flex gap-2">
              <EyeSlash size={16} className="mt-0.5 shrink-0" aria-hidden />
              Provider secret used to bind ownership proofs
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--pom-ink)]">
            <ShieldCheck size={18} weight="bold" aria-hidden />
            Public (on-chain)
          </div>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-[var(--pom-muted)]">
            <li>
              Model commitment{' '}
              <code className="mono break-all text-[var(--pom-ink)]">
                {truncHex(modelPreview, 14, 10)}
              </code>
            </li>
            <li>Provider commitment hash</li>
            <li>Disclosed accuracy in basis points</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
