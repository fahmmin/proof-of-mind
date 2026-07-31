import { NavLink } from 'react-router-dom';
import { useProgress } from './ProgressProvider';

export function MarketingNav() {
  const { state } = useProgress();
  const enterTo = state.onboarded ? '/home' : '/onboarding';

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: enterTo, label: 'Enter', end: false },
    { to: '/registry', label: 'Registry', end: false },
    { to: '/help', label: 'Help', end: false },
  ];

  return (
    <header className="relative z-20 mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-8">
      <NavLink to="/" className="font-medium tracking-tight text-[var(--pom-ink)]">
        Proof of Mind
      </NavLink>
      <nav className="flex items-center gap-1 md:gap-2" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              [
                'rounded-[var(--pom-radius)] px-3 py-2 text-sm transition-opacity',
                isActive
                  ? 'bg-[var(--pom-bg-soft)] text-[var(--pom-ink)]'
                  : 'text-[var(--pom-muted)] hover:text-[var(--pom-ink)]',
              ].join(' ')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
