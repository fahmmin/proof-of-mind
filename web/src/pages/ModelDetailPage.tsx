import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, SealCheck, Fingerprint } from '@phosphor-icons/react';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useProgress } from '../components/ProgressProvider';
import { useToasts } from '../components/StatusToasts';
import type { TxFlowState } from '../components/TxFlow';
import { truncHex, useProofOfMind } from '../context/ProofOfMindContext';
import { displayNameFor } from '../lib/modelLabels';
import { bpsToPercentLabel } from '../lib/progress';
import { runTxFlow } from '../lib/runTxFlow';

type Props = {
  onOpenConnect: () => void;
  onTxFlow: (flow: TxFlowState | ((prev: TxFlowState) => TxFlowState)) => void;
};

export function ModelDetailPage({ onOpenConnect, onTxFlow }: Props) {
  const { id } = useParams<{ id: string }>();
  const commitment = id ? decodeURIComponent(id) : '';
  const {
    connected,
    busy,
    entries,
    modelPreview,
    certThresholdPercent,
    setCertThresholdPercent,
    onCertify,
    onProveOwnership,
    refresh,
  } = useProofOfMind();
  const { recordCertify, recordProve } = useProgress();
  const { push } = useToasts();
  const reduce = useReducedMotion();
  const [stamped, setStamped] = useState(false);

  const entry = entries.find((e) => e.modelCommitment === commitment);
  const threshold = Number(certThresholdPercent);
  const clampedThreshold = Number.isFinite(threshold)
    ? Math.min(100, Math.max(0, threshold))
    : 90;

  if (!commitment) {
    return <Navigate to="/registry" replace />;
  }

  if (entries.length > 0 && !entry) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 md:px-8">
        <p className="text-[var(--pom-muted)]">This model isn’t on the registry (yet).</p>
        <Link to="/registry" className="mt-4 inline-flex text-[var(--pom-accent)]">
          ← Back to registry
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 md:px-8">
        <p className="text-[var(--pom-muted)]">Loading registry…</p>
      </div>
    );
  }

  const accuracy = bpsToPercentLabel(entry.accuracyBps);
  const labels = displayNameFor(entry.modelCommitment, accuracy);
  const isOwn = entry.modelCommitment === modelPreview;
  const certified = entry.certifiedThresholdBps != null;

  async function handleProve() {
    if (!connected) {
      onOpenConnect();
      return;
    }
    const ok = await runTxFlow({
      setFlow: onTxFlow,
      action: 'Prove it’s yours',
      successTitle: 'Ownership proven',
      successDetail: 'You showed control without revealing your provider secret.',
      work: () => onProveOwnership(entry!.modelCommitment),
      onRefresh: refresh,
      onError: (msg) => push({ tone: 'warn', title: 'Prove didn’t complete', body: msg }),
    });
    if (ok) {
      recordProve();
      push({ tone: 'ok', title: 'Ownership proven' });
    }
  }

  async function handleCertify() {
    if (!connected) {
      onOpenConnect();
      return;
    }
    const ok = await runTxFlow({
      setFlow: onTxFlow,
      action: 'Certify against threshold',
      successTitle: 'Threshold sealed',
      successDetail: `Certified ≥ ${clampedThreshold}% accuracy.`,
      work: () => onCertify(entry!.modelCommitment, clampedThreshold),
      onRefresh: refresh,
      onError: (msg) => push({ tone: 'warn', title: 'Certify didn’t complete', body: msg }),
    });
    if (ok) {
      recordCertify(clampedThreshold);
      setStamped(true);
      push({
        tone: 'ok',
        title: 'Model certified',
        body: `Certified ≥ ${clampedThreshold}%.`,
      });
    }
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-8 md:py-16">
      <Link
        to="/registry"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)] transition hover:text-[var(--pom-ink)]"
      >
        <ArrowLeft size={12} />
        Registry
      </Link>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
        {isOwn ? 'Your model' : 'Registry entry'}
      </p>
      <h1 className="font-display mt-2 text-4xl font-medium tracking-tight md:text-5xl">
        {labels.title}
      </h1>
      {labels.subtitle ? (
        <p className="mt-3 text-lg text-[var(--pom-muted)]">{labels.subtitle}</p>
      ) : null}

      <section className="surface-day mt-10 border border-[var(--pom-day-line)] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-day-muted)]">
              Disclosed accuracy
            </p>
            <p className="font-display mt-2 text-5xl font-medium text-[var(--pom-day-ink)]">
              {accuracy}
            </p>
          </div>

          <motion.div
            key={certified || stamped ? 'certified' : 'pending'}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${certified || stamped ? 'anim-certify-stamp' : ''} inline-flex flex-col items-center rounded-[var(--pom-radius)] border border-[color-mix(in_srgb,var(--pom-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--pom-accent)_8%,white)] px-5 py-4`}
          >
            {certified || stamped ? (
              <SealCheck size={28} weight="duotone" className="text-[var(--pom-accent)]" />
            ) : (
              <Fingerprint size={28} weight="duotone" className="text-[var(--pom-accent)]" />
            )}
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-accent)]">
              {certified
                ? `Certified ≥ ${bpsToPercentLabel(entry.certifiedThresholdBps!)}`
                : stamped
                  ? `Certified ≥ ${clampedThreshold}%`
                  : 'Uncertified'}
            </p>
          </motion.div>
        </div>
      </section>

      {isOwn ? (
        <section className="mt-10 space-y-6 border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-6 md:p-8">
          <div>
            <h2 className="font-display text-xl font-medium">Prove it’s yours</h2>
            <p className="mt-2 text-sm text-[var(--pom-muted)]">
              Show control of this claim without revealing your provider secret.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleProve()}
              className="mt-4 rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2.5 text-sm text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)] disabled:opacity-55 active:scale-[0.98]"
            >
              {connected ? 'Prove it’s yours' : 'Connect to prove'}
            </button>
          </div>

          <div className="border-t border-[var(--pom-line)] pt-6">
            <h2 className="font-display text-xl font-medium">Certify against threshold</h2>
            <p className="mt-2 text-sm text-[var(--pom-muted)]">
              Seal a credential that this claim meets at least the accuracy you set.
            </p>
            <label className="mt-4 block max-w-[280px]">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)]">
                Threshold
              </span>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={clampedThreshold}
                  onChange={(e) => setCertThresholdPercent(e.target.value)}
                  className="accuracy-slider flex-1"
                />
                <span className="font-display w-16 text-right text-xl font-medium">
                  {clampedThreshold}%
                </span>
              </div>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleCertify()}
              className="mt-5 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-4 py-2.5 text-sm font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 disabled:opacity-55 active:scale-[0.98]"
            >
              {connected ? `Certify ≥ ${clampedThreshold}%` : 'Connect to certify'}
            </button>
          </div>
        </section>
      ) : (
        <p className="mt-8 text-sm text-[var(--pom-muted)]">
          Prove and certify actions are available when this claim matches your local fingerprint.
        </p>
      )}

      <AdvancedDetails label="Technical IDs">
        <p>Model: {entry.modelCommitment}</p>
        <p>Provider: {entry.providerCommitment}</p>
        <p>Truncated: {truncHex(entry.modelCommitment)}</p>
        {entry.certifiedThresholdBps != null ? (
          <p>Certified threshold units: {entry.certifiedThresholdBps}</p>
        ) : null}
      </AdvancedDetails>
    </div>
  );
}
