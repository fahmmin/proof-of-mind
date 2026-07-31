import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle, CircleNotch, SealCheck, WarningCircle, X } from '@phosphor-icons/react';

export type TxPhase =
  | 'idle'
  | 'preparing'
  | 'proving'
  | 'confirming'
  | 'settling'
  | 'success'
  | 'failure';

export type TxFlowState = {
  open: boolean;
  phase: TxPhase;
  /** Domain verb, e.g. "Register model" / "Prove ownership" */
  action: string;
  successTitle?: string;
  detail?: string;
  error?: string | null;
};

type Props = {
  flow: TxFlowState;
  onClose: () => void;
};

const STEPS: { id: TxPhase; label: string }[] = [
  { id: 'preparing', label: 'Preparing' },
  { id: 'proving', label: 'Proving' },
  { id: 'confirming', label: 'Confirming' },
  { id: 'settling', label: 'Settling' },
];

function stepIndex(phase: TxPhase): number {
  if (phase === 'success' || phase === 'failure') return STEPS.length;
  const i = STEPS.findIndex((s) => s.id === phase);
  return i < 0 ? 0 : i;
}

export function TxFlow({ flow, onClose }: Props) {
  const reduce = useReducedMotion();
  const active = stepIndex(flow.phase);
  const done = flow.phase === 'success';
  const failed = flow.phase === 'failure';
  const canClose = done || failed;

  return (
    <AnimatePresence>
      {flow.open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[color-mix(in_srgb,var(--pom-bg)_80%,transparent)] p-4 backdrop-blur-sm sm:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="txflow-title"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-6 shadow-2xl md:p-8"
          >
            {canClose ? (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 text-[var(--pom-muted)] transition hover:text-[var(--pom-ink)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            ) : null}

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
              Registry transaction
            </p>
            <h2
              id="txflow-title"
              className="mt-2 text-2xl font-medium tracking-tight text-[var(--pom-ink)]"
            >
              {flow.action}
            </h2>

            {!done && !failed ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--pom-muted)]">
                Private proving can take up to a minute. Keep this tab open and approve in your
                wallet when asked.
              </p>
            ) : null}

            <ol className="mt-8 space-y-3">
              {STEPS.map((step, i) => {
                const isActive = !done && !failed && i === active;
                const isPast = done || i < active;
                return (
                  <li key={step.id} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center border text-[11px] font-mono ${
                        isPast
                          ? 'border-[color-mix(in_srgb,var(--pom-accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--pom-accent)_15%,transparent)] text-[var(--pom-accent)]'
                          : isActive
                            ? 'border-[var(--pom-accent)] text-[var(--pom-accent)]'
                            : 'border-[var(--pom-line)] text-[var(--pom-muted)]'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle size={14} weight="fill" />
                      ) : isActive ? (
                        <CircleNotch size={14} className="animate-spin" />
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        isActive || isPast ? 'text-[var(--pom-ink)]' : 'text-[var(--pom-muted)]'
                      }`}
                    >
                      {step.label}
                      {isActive && step.id === 'proving' ? (
                        <span className="ml-2 font-mono text-[11px] text-[var(--pom-muted)]">
                          ~1 min
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>

            {done ? (
              <div className="mt-8 flex flex-col items-center border border-[color-mix(in_srgb,var(--pom-accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--pom-accent)_5%,transparent)] px-4 py-8 text-center">
                <SealCheck
                  size={40}
                  weight="duotone"
                  className="text-[var(--pom-accent)] anim-seal-stamp"
                />
                <p className="mt-4 text-xl font-medium text-[var(--pom-ink)]">
                  {flow.successTitle ?? 'Done'}
                </p>
                {flow.detail ? (
                  <p className="mt-2 max-w-[32ch] text-sm text-[var(--pom-muted)]">{flow.detail}</p>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-2.5 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            ) : null}

            {failed ? (
              <div className="mt-8 border border-[color-mix(in_srgb,var(--pom-danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--pom-danger)_5%,transparent)] px-4 py-6">
                <div className="flex items-start gap-3">
                  <WarningCircle
                    size={22}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-[var(--pom-danger)]"
                  />
                  <div>
                    <p className="text-lg font-medium">Couldn’t finish</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--pom-muted)]">
                      {flow.error ?? 'Something went wrong. Try again in a moment.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2 text-sm text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)] active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const idleTxFlow = (): TxFlowState => ({
  open: false,
  phase: 'idle',
  action: '',
});
