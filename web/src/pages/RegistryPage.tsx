import { MarketingNav } from '../components/MarketingNav';
import { PrivacyPanel } from '../components/PrivacyPanel';
import { WalletBar } from '../components/WalletBar';
import { useProofOfMind, truncHex } from '../context/ProofOfMindContext';

export function RegistryPage() {
  const {
    connected,
    entries,
    certThreshold,
    setCertThreshold,
    busy,
    error,
    refresh,
    onCertify,
    onProveOwnership,
  } = useProofOfMind();

  return (
    <div className="min-h-[100dvh] bg-[var(--pom-bg)] text-[var(--pom-ink)]">
      <MarketingNav />
      <main className="mx-auto w-full max-w-[1100px] space-y-8 px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-3xl font-medium tracking-tight md:text-4xl">Public registry</h1>
            <p className="mt-2 max-w-[60ch] text-sm text-[var(--pom-muted)] md:text-base">
              Indexer-backed view of disclosed commitments. Private witnesses never appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={busy}
            className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2 text-sm transition-transform active:scale-[0.98]"
          >
            Refresh
          </button>
        </div>

        <WalletBar />
        <PrivacyPanel />

        <section className="space-y-4">
          <label className="block text-sm text-[var(--pom-muted)]">
            Certify threshold (bps)
            <input
              value={certThreshold}
              onChange={(e) => setCertThreshold(e.target.value)}
              className="mt-2 block w-full max-w-[220px] rounded-[var(--pom-radius)] border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] px-3 py-2 text-[var(--pom-ink)] outline-none focus:border-[var(--pom-accent)]"
            />
          </label>

          {entries.length === 0 ? (
            <p className="text-sm text-[var(--pom-muted)]">No models registered yet.</p>
          ) : (
            <div className="overflow-x-auto border border-[var(--pom-line)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[var(--pom-bg-elevated)] text-[var(--pom-muted)]">
                  <tr>
                    <th className="px-3 py-3 font-medium">Model</th>
                    <th className="px-3 py-3 font-medium">Accuracy</th>
                    <th className="px-3 py-3 font-medium">Provider</th>
                    <th className="px-3 py-3 font-medium">Credential</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.modelCommitment} className="border-t border-[var(--pom-line)]">
                      <td className="mono px-3 py-3">{truncHex(e.modelCommitment)}</td>
                      <td className="mono px-3 py-3">{e.accuracyBps}</td>
                      <td className="mono px-3 py-3">{truncHex(e.providerCommitment)}</td>
                      <td className="px-3 py-3 text-[var(--pom-muted)]">
                        {e.certifiedThresholdBps != null
                          ? `≥ ${e.certifiedThresholdBps} bps`
                          : 'none'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={!connected || busy}
                            onClick={() => void onCertify(e.modelCommitment)}
                            className="rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-3 py-1.5 text-xs font-medium text-[var(--pom-accent-ink)] transition-transform active:scale-[0.98] disabled:opacity-55"
                          >
                            Certify
                          </button>
                          <button
                            type="button"
                            disabled={!connected || busy}
                            onClick={() => void onProveOwnership(e.modelCommitment)}
                            className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-3 py-1.5 text-xs transition-transform active:scale-[0.98] disabled:opacity-55"
                          >
                            Prove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {error && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-[var(--pom-radius)] border border-[color-mix(in_srgb,var(--pom-danger)_40%,var(--pom-line))] bg-[color-mix(in_srgb,var(--pom-danger)_12%,var(--pom-bg))] p-4 text-xs text-[var(--pom-danger)]">
            {error}
          </pre>
        )}
      </main>
    </div>
  );
}
