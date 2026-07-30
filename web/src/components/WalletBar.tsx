import { Link } from 'react-router-dom';
import { useProofOfMind, truncHex } from '../context/ProofOfMindContext';
import { NETWORK_ID } from '../lib/network';

export function WalletBar() {
  const {
    session,
    walletLabel,
    busy,
    onConnect,
    onDisconnect,
  } = useProofOfMind();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--pom-line)] pb-4">
      <span className="mono text-xs uppercase tracking-wide text-[var(--pom-muted)]">
        network {NETWORK_ID}
      </span>
      {!session ? (
        <button
          type="button"
          onClick={() => void onConnect()}
          disabled={busy}
          className="rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-4 py-2 text-sm font-medium text-[var(--pom-accent-ink)] transition-transform active:scale-[0.98]"
        >
          Connect Lace / 1AM
        </button>
      ) : (
        <>
          <span className="mono text-sm text-[var(--pom-ink)]">
            {walletLabel ?? 'Wallet'} {truncHex(session.unshieldedAddress, 12, 8)}
          </span>
          <button
            type="button"
            onClick={() => void onDisconnect()}
            disabled={busy}
            className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] bg-transparent px-4 py-2 text-sm text-[var(--pom-ink)] transition-transform active:scale-[0.98]"
          >
            Disconnect
          </button>
        </>
      )}
      <Link
        to="/registry"
        className="ml-auto text-sm text-[var(--pom-muted)] underline-offset-4 hover:text-[var(--pom-ink)] hover:underline"
      >
        Open registry
      </Link>
    </div>
  );
}
