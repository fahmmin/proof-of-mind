import { Link } from 'react-router-dom';
import { Trophy } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';
import { ACHIEVEMENTS } from '../lib/progress';

export function ProfilePage() {
  const { state, rank } = useProgress();

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
            Profile
          </p>
          <h1 className="font-display mt-2 text-4xl font-medium tracking-tight">{state.displayName}</h1>
          <p className="mt-3 text-[var(--pom-muted)]">
            {rank.current.label} · {state.xp} XP · {state.streak}-day streak
          </p>
        </div>
        <Link
          to="/settings"
          className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] px-4 py-2 text-sm text-[var(--pom-ink)] transition hover:border-[var(--pom-muted)]"
        >
          Settings
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Models registered', value: state.modelsRegistered },
          { label: 'Ownership proofs', value: state.ownershipProofs },
          { label: 'Credentials', value: state.credentialsIssued },
          { label: 'Achievements', value: state.achievements.length },
        ].map((stat) => (
          <div key={stat.label} className="border border-[var(--pom-line)] bg-[var(--pom-bg-elevated)] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--pom-muted)]">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-medium text-[var(--pom-accent)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Trophy size={22} weight="duotone" className="text-[var(--pom-accent)]" />
          <h2 className="font-display text-2xl font-medium">Achievements</h2>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = state.achievements.includes(ach.id);
            return (
              <li
                key={ach.id}
                className={`border p-5 ${
                  unlocked
                    ? 'border-[color-mix(in_srgb,var(--pom-accent)_35%,transparent)] bg-[var(--pom-bg-elevated)]'
                    : 'border-[var(--pom-line)] bg-[var(--pom-bg)] opacity-55'
                }`}
              >
                <p className="text-lg font-medium">{ach.title}</p>
                <p className="mt-2 text-sm text-[var(--pom-muted)]">{ach.blurb}</p>
                <p className="mt-3 font-mono text-[11px] text-[var(--pom-muted)]">
                  {unlocked ? 'Unlocked' : 'Locked'} · +{ach.xp} XP
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
