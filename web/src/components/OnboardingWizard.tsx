import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, EyeSlash, Fingerprint, SealCheck } from '@phosphor-icons/react';
import { useProgress } from './ProgressProvider';

type Props = {
  onComplete: () => void;
};

const STEPS = [
  {
    id: 'what',
    icon: Fingerprint,
    title: 'What Proof of Mind is',
    body: 'A clinical AI trust registry on Midnight. Labs commit model fingerprints and disclose accuracy — without publishing the weights.',
  },
  {
    id: 'private',
    icon: EyeSlash,
    title: 'What stays private',
    body: 'Your raw fingerprint bytes and provider secret stay in this browser. Observers only see commitments and the accuracy you choose to share.',
  },
  {
    id: 'do',
    icon: SealCheck,
    title: 'What you’ll do',
    body: 'Name a model, publish a claim, browse the public directory, then prove ownership or certify against a threshold.',
  },
] as const;

export function OnboardingWizard({ onComplete }: Props) {
  const { completeOnboarding, state } = useProgress();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(
    state.displayName === 'Anonymous lab' || state.displayName === 'Anonymous provider'
      ? ''
      : state.displayName,
  );
  const reduce = useReducedMotion();
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  function finish() {
    completeOnboarding(name.trim() || 'Anonymous lab');
    onComplete();
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 md:px-8 md:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--pom-accent)]">
        Orientation · {String(step + 1).padStart(2, '0')} / 03
      </p>

      <motion.div
        key={current.id}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8"
      >
        <current.icon size={36} weight="duotone" className="text-[var(--pom-accent)]" />
        <h1 className="font-display mt-6 text-4xl font-medium tracking-tight md:text-5xl">
          {current.title}
        </h1>
        <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-[var(--pom-muted)]">
          {current.body}
        </p>
      </motion.div>

      {last ? (
        <label className="mt-10 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)]">
            Lab display name (local only)
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous lab"
            maxLength={40}
            className="mt-2 w-full rounded-[var(--pom-radius)] border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] px-4 py-3 text-sm text-[var(--pom-ink)] outline-none transition focus:border-[var(--pom-accent)]"
          />
          <span className="mt-2 block text-xs text-[var(--pom-muted)]">
            Stored in this browser. Never sent to the ledger.
          </span>
        </label>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2.5 text-sm text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)] active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : null}
        {!last ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-2.5 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={14} weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-2.5 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 active:scale-[0.98]"
          >
            Enter the lab
            <ArrowRight size={14} weight="bold" />
          </button>
        )}
      </div>

      <div className="mt-12 flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`h-1 flex-1 transition ${
              i <= step ? 'bg-[var(--pom-accent)]' : 'bg-[var(--pom-line)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
