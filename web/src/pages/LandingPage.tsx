import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Fingerprint, Hash, SealCheck } from '@phosphor-icons/react';
import { MarketingNav } from '../components/MarketingNav';

const ease = [0.16, 1, 0.3, 1] as const;

export function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-[100dvh] bg-[var(--pom-bg)] text-[var(--pom-ink)]">
      <MarketingNav />

      <section className="relative isolate min-h-[100dvh] overflow-hidden">
        <img
          src="/images/hero-atmosphere.png"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--pom-bg)] via-[color-mix(in_srgb,var(--pom-bg)_78%,transparent)] to-[color-mix(in_srgb,var(--pom-bg)_35%,transparent)]"
          aria-hidden
        />

        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1400px] flex-col justify-center px-4 pb-16 pt-8 md:px-8 md:pt-12">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mb-4 text-sm font-medium tracking-wide text-[var(--pom-accent)] md:text-base"
          >
            Proof of Mind
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.08, ease }}
            className="max-w-[14ch] text-4xl leading-[1.05] font-medium tracking-tight md:text-5xl lg:text-6xl"
          >
            Register AI fingerprints without revealing the weights
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.16, ease }}
            className="mt-5 max-w-[42ch] text-base leading-relaxed text-[var(--pom-muted)] md:text-lg"
          >
            Commit locally, disclose only a hash and accuracy on Midnight, then prove ownership with ZK.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.24, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/app"
              className="rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-3 text-sm font-medium whitespace-nowrap text-[var(--pom-accent-ink)] transition-transform active:scale-[0.98]"
            >
              Launch app
            </Link>
            <Link
              to="/registry"
              className="rounded-[var(--pom-radius)] border border-[var(--pom-line)] bg-[color-mix(in_srgb,var(--pom-bg)_55%,transparent)] px-5 py-3 text-sm font-medium whitespace-nowrap text-[var(--pom-ink)] backdrop-blur-sm transition-transform active:scale-[0.98]"
            >
              View registry
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
            <h2 className="m-0 max-w-[18ch] text-3xl leading-tight font-medium tracking-tight md:text-4xl">
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
            className="border-l border-[var(--pom-line)] pl-6 md:pl-8"
          >
            <p className="m-0 text-sm leading-relaxed text-[var(--pom-muted)]">
              Observers learn that a provider registered a commitment at a disclosed accuracy. They
              cannot recover weights, prompts, or fingerprints from chain data alone.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[var(--pom-line)] bg-[var(--pom-bg-elevated)]">
        <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
          <h2 className="m-0 text-3xl font-medium tracking-tight md:text-4xl">How the story runs</h2>
          <ol className="mt-12 m-0 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: Fingerprint,
                title: 'Fingerprint locally',
                body: 'Hash model weights in the browser. The raw bytes never leave the witness store.',
              },
              {
                icon: Hash,
                title: 'Register the commitment',
                body: 'Publish model and provider commitments plus accuracy through registerModel.',
              },
              {
                icon: SealCheck,
                title: 'Prove and certify',
                body: 'proveOwnership authenticates the provider. certifyModel issues a threshold credential.',
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
                <h3 className="mt-4 m-0 text-xl font-medium tracking-tight">{step.title}</h3>
                <p className="mt-2 m-0 max-w-[36ch] text-sm leading-relaxed text-[var(--pom-muted)]">
                  {step.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--pom-line)]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-28">
          <div>
            <h2 className="m-0 max-w-[16ch] text-3xl font-medium tracking-tight md:text-4xl">
              Run it on preview
            </h2>
            <p className="mt-3 max-w-[48ch] text-base text-[var(--pom-muted)]">
              Connect Lace or 1AM on preview, join the pinned contract, then exercise the circuits.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex w-fit rounded-[var(--pom-radius)] bg-[var(--pom-accent)] px-5 py-3 text-sm font-medium text-[var(--pom-accent-ink)] transition-transform active:scale-[0.98]"
          >
            Open the app
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--pom-line)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-[var(--pom-muted)] md:px-8">
          <span>Proof of Mind on Midnight</span>
          <span className="mono text-xs">preview network</span>
        </div>
      </footer>
    </div>
  );
}
