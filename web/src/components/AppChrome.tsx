import { NavLink, Link } from 'react-router-dom';
import { CircleNotch, GearSix, SignOut, Wallet } from '@phosphor-icons/react';
import { useProgress } from './ProgressProvider';

const links = [
  { to: '/home', label: 'Home' },
  { to: '/register', label: 'Claim' },
  { to: '/registry', label: 'Registry' },
  { to: '/activity', label: 'Activity' },
  { to: '/profile', label: 'Profile' },
];

type Props = {
  /** Hide chrome on marketing / onboarding */
  bare?: boolean;
  connected: boolean;
  busy: boolean;
  onOpenConnect: () => void;
  onDisconnect: () => void;
};

export function AppChrome({ bare, connected, busy, onOpenConnect, onDisconnect }: Props) {
  const { state, rank } = useProgress();

  if (bare) {
    return (
      <header className="absolute left-0 right-0 top-0 z-40">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
          <Link to="/" className="font-display text-xl font-semibold tracking-tight text-[var(--pom-ink)]">
            Proof of <span className="text-[var(--pom-accent)]">Mind</span>
          </Link>
          <Link
            to="/help"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pom-muted)] transition hover:text-[var(--pom-ink)]"
          >
            Help
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--pom-line)_80%,transparent)] bg-[color-mix(in_srgb,var(--pom-bg)_90%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <Link
          to="/home"
          className="font-display text-lg font-semibold tracking-tight text-[var(--pom-ink)]"
        >
          Proof of <span className="text-[var(--pom-accent)]">Mind</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-mono text-[12px] uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? 'text-[var(--pom-accent)]'
                    : 'text-[var(--pom-muted)] hover:text-[var(--pom-ink)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-[var(--pom-muted)] xl:inline">
            {state.displayName} · {rank.current.label}
          </span>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center border border-[var(--pom-line)] p-2 text-[var(--pom-muted)] transition hover:border-[var(--pom-muted)] hover:text-[var(--pom-ink)]"
            aria-label="Settings"
          >
            <GearSix size={16} />
          </Link>
          {connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={busy}
              className="inline-flex items-center gap-2 border border-[var(--pom-line)] bg-[var(--pom-bg-soft)] px-3 py-2 text-[12px] font-medium text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)] disabled:opacity-50 active:scale-[0.98]"
            >
              <SignOut size={14} weight="bold" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenConnect}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-3 py-2 text-[12px] font-medium text-[var(--pom-accent-ink)] transition hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
            >
              {busy ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <Wallet size={14} weight="bold" />
              )}
              Connect
            </button>
          )}
        </div>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-[color-mix(in_srgb,var(--pom-line)_60%,transparent)] px-4 py-2 lg:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] ${
                isActive ? 'text-[var(--pom-accent)]' : 'text-[var(--pom-muted)]'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
