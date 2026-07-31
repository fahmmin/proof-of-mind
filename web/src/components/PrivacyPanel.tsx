/**
 * Privacy panel kept for Advanced/Help reuse — not mounted on every screen.
 */
export function PrivacyPanel() {
  return (
    <aside className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-5 text-sm leading-relaxed text-[var(--pom-muted)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-accent)]">
        Privacy summary
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>Fingerprint bytes stay in this browser</li>
        <li>Provider secret never leaves private state</li>
        <li>Public: commitments + disclosed accuracy %</li>
      </ul>
      <p className="mt-4 text-xs">
        Full detail lives on the{' '}
        <a href="/help" className="text-[var(--pom-accent)]">
          Help
        </a>{' '}
        page.
      </p>
    </aside>
  );
}
