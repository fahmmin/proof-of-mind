import type { ReactNode } from 'react';
import { useProgress } from './ProgressProvider';

type Props = {
  children: ReactNode;
  /** Optional label when expanded */
  label?: string;
};

/**
 * Developer / auditor details. Only renders when Settings → Show advanced is on.
 */
export function AdvancedDetails({ children, label = 'Advanced details' }: Props) {
  const { state } = useProgress();
  if (!state.showAdvanced) return null;

  return (
    <details className="mt-6 border border-[color-mix(in_srgb,var(--pom-line)_80%,transparent)] bg-[color-mix(in_srgb,var(--pom-bg)_40%,transparent)] open:border-[color-mix(in_srgb,var(--pom-muted)_40%,transparent)]">
      <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)] transition hover:text-[var(--pom-ink)]">
        {label}
      </summary>
      <div className="space-y-2 border-t border-[var(--pom-line)] px-4 py-4 font-mono text-[11px] leading-relaxed break-all text-[var(--pom-muted)]">
        {children}
      </div>
    </details>
  );
}
