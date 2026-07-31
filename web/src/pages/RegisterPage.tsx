import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Fingerprint, SealCheck } from '@phosphor-icons/react';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useProgress } from '../components/ProgressProvider';
import { useToasts } from '../components/StatusToasts';
import type { TxFlowState } from '../components/TxFlow';
import { truncHex, useProofOfMind } from '../context/ProofOfMindContext';
import {
  loadClaimDraft,
  saveClaimDraft,
  setModelLabel,
} from '../lib/modelLabels';
import { runTxFlow } from '../lib/runTxFlow';

type Props = {
  onOpenConnect: () => void;
  onTxFlow: (flow: TxFlowState | ((prev: TxFlowState) => TxFlowState)) => void;
};

export function RegisterPage({ onOpenConnect, onTxFlow }: Props) {
  const {
    connected,
    busy,
    setAccuracyPercent,
    modelPreview,
    providerPreview,
    contractAddress,
    entries,
    onRegister,
    refresh,
  } = useProofOfMind();
  const { recordRegister } = useProgress();
  const { push } = useToasts();
  const reduce = useReducedMotion();

  const initial = loadClaimDraft();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial.name);
  const [alias, setAlias] = useState(initial.alias);
  const [accuracy, setAccuracy] = useState(initial.accuracyPercent);
  const [sealed, setSealed] = useState(false);

  const ownEntry = entries.find((e) => e.modelCommitment === modelPreview);
  const clamped = Math.min(100, Math.max(0, Math.round(accuracy * 100) / 100));

  function persistDraft(next: { name?: string; alias?: string; accuracyPercent?: number }) {
    const draft = {
      name: next.name ?? name,
      alias: next.alias ?? alias,
      accuracyPercent: next.accuracyPercent ?? clamped,
    };
    saveClaimDraft(draft);
    setAccuracyPercent(String(draft.accuracyPercent));
  }

  async function handlePublish() {
    if (!connected) {
      onOpenConnect();
      return;
    }
    if (!name.trim()) {
      push({ tone: 'warn', title: 'Name your model', body: 'Add a human-readable model name first.' });
      setStep(0);
      return;
    }
    setAccuracyPercent(String(clamped));
    const ok = await runTxFlow({
      setFlow: onTxFlow,
      action: 'Publish model claim',
      successTitle: 'Claim published',
      successDetail: `${name.trim()} · ${clamped}% accuracy disclosed. Fingerprint stayed private.`,
      work: () => onRegister(clamped),
      onRefresh: refresh,
      onError: (msg) => push({ tone: 'warn', title: 'Claim didn’t publish', body: msg }),
    });
    if (ok) {
      setModelLabel(modelPreview, {
        name: name.trim(),
        alias: alias.trim() || undefined,
        accuracyPercent: clamped,
      });
      recordRegister(clamped);
      setSealed(true);
      push({
        tone: 'ok',
        title: 'Model on the registry',
        body: `${name.trim()} · ${clamped}% disclosed.`,
      });
    }
  }

  const steps = [
    {
      id: 'identity',
      title: 'Name the model',
      body: 'Buyers see this label on the public registry — not a hex string.',
    },
    {
      id: 'accuracy',
      title: 'Set disclosed accuracy',
      body: 'Slide to the percentage you are willing to publish. The fingerprint stays private.',
    },
    {
      id: 'publish',
      title: 'Publish the claim',
      body: 'Connect once, then commit. Only the hash and accuracy reach Midnight.',
    },
  ] as const;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-8 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
        Claim wizard · {String(step + 1).padStart(2, '0')} / 03
      </p>
      <h1 className="font-display mt-3 text-4xl font-medium tracking-tight md:text-5xl">
        {steps[step].title}
      </h1>
      <p className="mt-3 max-w-[52ch] text-[var(--pom-muted)]">{steps[step].body}</p>

      <div className="mt-6 flex gap-2">
        {steps.map((s, i) => (
          <span
            key={s.id}
            className={`h-1 flex-1 transition ${
              i <= step ? 'bg-[var(--pom-accent)]' : 'bg-[var(--pom-line)]'
            }`}
          />
        ))}
      </div>

      <section className="surface-day mt-10 border border-[var(--pom-day-line)] p-6 md:p-8">
        {step === 0 ? (
          <motion.div
            key="identity"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-day-muted)]">
                Model name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  persistDraft({ name: e.target.value });
                }}
                placeholder="e.g. NeuroScan v3"
                maxLength={48}
                className="mt-2 w-full rounded-[var(--pom-radius)] border border-[var(--pom-day-line)] bg-white px-4 py-3 text-[var(--pom-day-ink)] outline-none focus:border-[var(--pom-accent)]"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-day-muted)]">
                Alias (optional)
              </span>
              <input
                type="text"
                value={alias}
                onChange={(e) => {
                  setAlias(e.target.value);
                  persistDraft({ alias: e.target.value });
                }}
                placeholder="e.g. Clinical imaging benchmark"
                maxLength={64}
                className="mt-2 w-full rounded-[var(--pom-radius)] border border-[var(--pom-day-line)] bg-white px-4 py-3 text-[var(--pom-day-ink)] outline-none focus:border-[var(--pom-accent)]"
              />
              <span className="mt-2 block text-xs text-[var(--pom-day-muted)]">
                Stored in this browser only. Helps the registry read like a directory.
              </span>
            </label>
          </motion.div>
        ) : null}

        {step === 1 ? (
          <motion.div
            key="accuracy"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-end justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-day-muted)]">
                Accuracy
              </p>
              <p className="font-display text-4xl font-medium text-[var(--pom-day-ink)]">
                {clamped}
                <span className="ml-1 text-xl text-[var(--pom-day-muted)]">%</span>
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={clamped}
              onChange={(e) => {
                const next = Number(e.target.value);
                setAccuracy(next);
                persistDraft({ accuracyPercent: next });
              }}
              className="accuracy-slider mt-8"
              aria-valuetext={`${clamped} percent`}
            />
            <div className="mt-3 flex justify-between font-mono text-[10px] text-[var(--pom-day-muted)]">
              <span>0%</span>
              <span>Clinical floor often ≥ 90%</span>
              <span>100%</span>
            </div>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div
            key="publish"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <div
              className={`mx-auto inline-flex flex-col items-center rounded-[var(--pom-radius)] border border-[color-mix(in_srgb,var(--pom-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--pom-accent)_10%,white)] px-8 py-7 ${
                sealed ? 'anim-certify-stamp' : 'anim-seal-pulse'
              }`}
            >
              {sealed ? (
                <SealCheck size={36} weight="duotone" className="text-[var(--pom-accent)]" />
              ) : (
                <Fingerprint size={36} weight="duotone" className="text-[var(--pom-accent)]" />
              )}
              <p className="font-display mt-3 text-2xl font-medium text-[var(--pom-day-ink)]">
                {name.trim() || 'Untitled model'}
              </p>
              {alias.trim() ? (
                <p className="mt-1 text-sm text-[var(--pom-day-muted)]">{alias.trim()}</p>
              ) : null}
              <p className="mt-3 font-mono text-sm text-[var(--pom-accent)]">{clamped}% disclosed</p>
            </div>

            {!connected ? (
              <p className="mt-6 text-sm text-[var(--pom-day-muted)]">
                Connect Lace or 1AM to publish this claim.
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={busy || sealed}
              className="mt-6 w-full rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-3 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 disabled:opacity-55 active:scale-[0.98]"
            >
              {sealed
                ? 'Claim published'
                : connected
                  ? 'Publish model claim'
                  : 'Connect to publish'}
            </button>

            {sealed && ownEntry ? (
              <Link
                to={`/models/${encodeURIComponent(ownEntry.modelCommitment)}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--pom-accent)]"
              >
                Open model detail
                <ArrowRight size={14} weight="bold" />
              </Link>
            ) : null}
          </motion.div>
        ) : null}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
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
        {step < 2 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 0 && !name.trim()) {
                push({ tone: 'warn', title: 'Add a model name' });
                return;
              }
              setStep((s) => s + 1);
            }}
            className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-2.5 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={14} weight="bold" />
          </button>
        ) : null}
      </div>

      <AdvancedDetails label="Commitments & contract">
        <p>Model commitment: {modelPreview}</p>
        <p>Provider commitment: {providerPreview}</p>
        <p>Contract: {contractAddress}</p>
        {ownEntry ? <p>Your entry: {truncHex(ownEntry.modelCommitment, 14, 10)}</p> : null}
      </AdvancedDetails>
    </div>
  );
}
