import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CircleNotch, Wallet, X } from '@phosphor-icons/react';
import { networkHint, networkLabel } from '../lib/networkLabels';
import { NETWORK_ID } from '../config';

type Props = {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConnect: () => void;
};

export function ConnectWalletModal({ open, busy, onClose, onConnect }: Props) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[color-mix(in_srgb,var(--pom-bg)_80%,transparent)] p-4 backdrop-blur-sm sm:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) onClose();
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative w-full max-w-md border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-6 md:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="absolute right-4 top-4 text-[var(--pom-muted)] transition hover:text-[var(--pom-ink)] disabled:opacity-40"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
              Join the registry
            </p>
            <h2
              id="connect-title"
              className="mt-2 text-2xl font-medium tracking-tight text-[var(--pom-ink)]"
            >
              Connect your wallet
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--pom-muted)]">
              Proof of Mind uses Lace or 1AM to sign registry actions. Your model fingerprint stays
              private; only commitments and accuracy you disclose go on-chain.
            </p>

            <div className="mt-6 border border-[var(--pom-line)] bg-[color-mix(in_srgb,var(--pom-bg)_60%,transparent)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)]">
                Network
              </p>
              <p className="mt-2 text-lg font-medium text-[var(--pom-ink)]">
                {networkLabel(NETWORK_ID)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--pom-muted)]">
                {networkHint(NETWORK_ID)}
              </p>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-[var(--pom-muted)]">
              <li className="flex gap-2">
                <span className="text-[var(--pom-accent)]">01</span>
                Install Lace or 1AM with Midnight support
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--pom-accent)]">02</span>
                Unlock the extension, then approve this site
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--pom-accent)]">03</span>
                You’ll join the trust registry automatically
              </li>
            </ul>

            <button
              type="button"
              disabled={busy}
              onClick={onConnect}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-4 py-3 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
            >
              {busy ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Wallet size={16} weight="bold" />
              )}
              {busy ? 'Connecting…' : 'Connect Lace or 1AM'}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
