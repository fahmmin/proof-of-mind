import { MarketingNav } from '../components/MarketingNav';
import { PrivacyPanel } from '../components/PrivacyPanel';
import { WalletBar } from '../components/WalletBar';
import { useProofOfMind, truncHex } from '../context/ProofOfMindContext';

export function AppPage() {
  const {
    connected,
    contractAddress,
    accuracyInput,
    setAccuracyInput,
    busy,
    error,
    status,
    modelPreview,
    onRegister,
    onProveOwnership,
    entries,
  } = useProofOfMind();

  const ownEntry = entries.find((e) => e.modelCommitment === modelPreview);

  return (
    <div className="min-h-[100dvh] bg-[var(--pom-bg)] text-[var(--pom-ink)]">
      <MarketingNav />
      <main className="mx-auto w-full max-w-[1100px] space-y-8 px-4 py-8 md:px-8 md:py-10">
        <div>
          <h1 className="m-0 text-3xl font-medium tracking-tight md:text-4xl">Operator console</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-[var(--pom-muted)] md:text-base">
            Connect Lace or 1AM on preview, then register models and prove ownership against the
            pinned contract.
          </p>
        </div>

        <WalletBar />

        <section className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-5 md:p-6">
          <h2 className="m-0 text-base font-medium">Contract</h2>
          <p className="mono mt-3 break-all text-xs text-[var(--pom-ink)]">{contractAddress}</p>
        </section>

        <PrivacyPanel />

        {status && (
          <p className="mono text-xs text-[var(--pom-accent)]">{status}</p>
        )}

        {connected && (
          <section className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-5 md:p-6">
            <h2 className="m-0 text-base font-medium">registerModel</h2>
            <p className="mt-1 text-sm text-[var(--pom-muted)]">
              Discloses commitment{' '}
              <code className="mono text-[var(--pom-ink)]">{truncHex(modelPreview, 12, 8)}</code>{' '}
              and accuracy. Fingerprint stays private.
            </p>
            <label className="mt-4 block text-sm text-[var(--pom-muted)]">
              Accuracy (basis points)
              <input
                value={accuracyInput}
                onChange={(e) => setAccuracyInput(e.target.value)}
                className="mt-2 block w-full max-w-[220px] rounded-[var(--pom-radius)] border border-[var(--pom-line)] bg-[var(--pom-bg)] px-3 py-2 text-[var(--pom-ink)] outline-none focus:border-[var(--pom-accent)]"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onRegister()}
                disabled={busy}
                className="rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-4 py-2 text-sm font-medium text-[var(--pom-accent-ink)] transition-transform active:scale-[0.98]"
              >
                Register model
              </button>
              {ownEntry && (
                <button
                  type="button"
                  onClick={() => void onProveOwnership(ownEntry.modelCommitment)}
                  disabled={busy}
                  className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2 text-sm transition-transform active:scale-[0.98]"
                >
                  Prove ownership
                </button>
              )}
            </div>
          </section>
        )}

        {error && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-[var(--pom-radius)] border border-[color-mix(in_srgb,var(--pom-danger)_40%,var(--pom-line))] bg-[color-mix(in_srgb,var(--pom-danger)_12%,var(--pom-bg))] p-4 text-xs text-[var(--pom-danger)]">
            {error}
          </pre>
        )}
      </main>
    </div>
  );
}
