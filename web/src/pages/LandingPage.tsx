import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Fingerprint, SealCheck, ChartLineUp } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';

const ease = [0.16, 1, 0.3, 1] as const;

export function LandingPage() {
  const reduce = useReducedMotion();
  const { state } = useProgress();
  const enterTo = state.onboarded ? '/home' : '/onboarding';

  return (
    <div>
      <section className="relative isolate min-h-[100dvh] overflow-hidden">
        <img
          src="/images/hero-atmosphere.png"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--pom-bg)] via-[color-mix(in_srgb,var(--pom-bg)_82%,transparent)] to-[color-mix(in_srgb,var(--pom-bg)_40%,transparent)]"
          aria-hidden
        />
        <div className="hero-lattice absolute inset-0 -z-10 opacity-60" aria-hidden />

        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1400px] flex-col justify-center px-4 pb-16 pt-24 md:px-8 md:pt-12">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-display mb-5 text-3xl font-semibold tracking-tight text-[var(--pom-ink)] md:text-4xl"
          >
            Proof of <span className="text-[var(--pom-accent)]">Mind</span>
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.08, ease }}
            className="font-display max-w-[16ch] text-4xl leading-[1.08] font-medium tracking-tight md:text-5xl lg:text-6xl"
          >
            Clinical confidence for AI accuracy claims
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.16, ease }}
            className="mt-5 max-w-[42ch] text-base leading-relaxed text-[var(--pom-muted)] md:text-lg"
          >
            Labs register AI fingerprints privately and publish verifiable accuracy — weights stay
            local, trust goes on Midnight.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.24, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to={enterTo}
              className="rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-3 text-sm font-medium whitespace-nowrap text-[var(--pom-accent-ink)] transition-transform active:scale-[0.98]"
            >
              {state.onboarded ? 'Open lab' : 'Enter the lab'}
            </Link>
            <Link
              to="/registry"
              className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] bg-[color-mix(in_srgb,var(--pom-bg)_55%,transparent)] px-5 py-3 text-sm font-medium whitespace-nowrap text-[var(--pom-ink)] backdrop-blur-sm transition-transform active:scale-[0.98]"
            >
              Browse registry
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[var(--pom-line)]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-8 md:py-28">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease }}
          >
            <h2 className="font-display m-0 max-w-[18ch] text-3xl leading-tight font-medium tracking-tight md:text-4xl">
              Buyers should not have to trust a slide deck
            </h2>
            <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-[var(--pom-muted)]">
              When a lab claims 94% medical accuracy, the fingerprint that backs that claim usually
              never leaves their cluster. Proof of Mind turns that claim into a public commitment
              while the raw model stays private.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : 0.08, ease }}
            className="flex items-center border-l border-[var(--pom-line)] pl-6 md:pl-8"
          >
            <div className="anim-seal-pulse inline-flex flex-col items-start rounded-[var(--pom-radius)] border border-[color-mix(in_srgb,var(--pom-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--pom-accent)_8%,transparent)] px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--pom-accent)]">
                Commitment seal
              </p>
              <p className="font-display mt-2 text-2xl font-medium text-[var(--pom-ink)]">
                Certified ≥ 90%
              </p>
              <p className="mt-1 text-sm text-[var(--pom-muted)]">Threshold credential · private proof</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[var(--pom-line)] bg-[var(--pom-bg-elevated)]">
        <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
          <h2 className="font-display m-0 text-3xl font-medium tracking-tight md:text-4xl">
            How the lab works
          </h2>
          <ol className="mt-12 m-0 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: Fingerprint,
                title: 'Register a claim',
                body: 'Name your model, set accuracy as a percentage, and publish only the commitment.',
              },
              {
                icon: ChartLineUp,
                title: 'Public registry',
                body: 'Browse human-readable claims — aliases and certified thresholds, not raw hex.',
              },
              {
                icon: SealCheck,
                title: 'Prove & certify',
                body: 'Prove it’s yours privately, then seal a Certified ≥ X% credential.',
              },
            ].map((step, i) => (
              <motion.li
                key={step.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.07, ease }}
                className="min-w-0"
              >
                <step.icon size={28} weight="duotone" className="text-[var(--pom-accent)]" aria-hidden />
                <h3 className="font-display mt-4 m-0 text-xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 m-0 max-w-[36ch] text-sm leading-relaxed text-[var(--pom-muted)]">
                  {step.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="surface-day border-t border-[var(--pom-day-line)]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-28">
          <div>
            <h2 className="font-display m-0 max-w-[16ch] text-3xl font-medium tracking-tight md:text-4xl">
              Prototype → Bench → Certified → Reference
            </h2>
            <p className="pom-muted mt-3 max-w-[48ch] text-base">
              Climb lab ranks by publishing claims, proving ownership, and returning — quiet
              standing, not arcade spam.
            </p>
          </div>
          <Link
            to={enterTo}
            className="inline-flex w-fit rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-3 text-sm font-medium text-[var(--pom-accent-ink)] transition-transform active:scale-[0.98]"
          >
            {state.onboarded ? 'Open lab' : 'Start orientation'}
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--pom-line)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-[var(--pom-muted)] md:px-8">
          <span>Proof of Mind on Midnight</span>
          <Link to="/help" className="hover:text-[var(--pom-ink)]">
            Help & privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
