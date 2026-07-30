# Proof of Mind — hackathon roadmap & reference

Level 1 submission details: [`SUBMISSION.md`](SUBMISSION.md). Official stage requirements: [`hackathon-stages.md`](hackathon-stages.md).

## Hackathon levels (this repo)

| Level | Status | Deliverable |
|-------|--------|-------------|
| L1 New Moon | Done | Compact contract, vitest, undeployed deploy, README |
| L2 Waxing Crescent | Done | Multi-page `web/` - landing, app, registry, Lace/1AM, circuits |
| L3 First Quarter | Scaffolded | `certifyModel`, 4+ tests, GitHub Actions CI |

## Level 2 — frontend (Waxing Crescent)

```bash
yarn web:dev
```

Open http://localhost:3000 with **Lace** or **1AM** on **undeployed**. Connect → deploy or join → register / prove / certify.

Key paths:

- `web/src/pages/LandingPage.tsx` - storyline landing + Motion
- `web/src/pages/AppPage.tsx` - wallet, deploy/join, registerModel, proveOwnership
- `web/src/pages/RegistryPage.tsx` - indexer registry + privacy panel + certifyModel
- `web/src/lib/midnight.ts` - Lace/1AM detect via `window.midnight`
- `web/public/zk/proof-of-mind/` - synced ZK assets (`yarn sync:zk`)

## Preprod deploy (after L1)

1. Start proof server on port 6300 (`yarn env:up:all` or Docker `midnightntwrk/proof-server:8.0.3`).
2. Fund wallet: https://faucet.preprod.midnight.network
3. Deploy:

```bash
export MIDNIGHT_NETWORK=preprod
export WALLET_SEED="your seed or 24-word mnemonic"
yarn deploy
```

On undeployed, genesis wallet is used by default (no faucet). Custom seeds: `USE_CUSTOM_WALLET=1`.

## Level 3 — CI

![CI](https://github.com/fahmmin/proof-of-mind/actions/workflows/ci.yml/badge.svg)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — `yarn compile` + `yarn test:local` on push.

## Product direction (L3+ / post-hackathon)

**Confidential Credentials framing (Level 3 idea list):** prove a model meets a benchmark threshold without disclosing exact score, weights, or test data.

**North star (post-hackathon):**

- Schnorr attestation API for third-party benchmark oracles (zk-loan pattern)
- DUST-paid benchmark runs
- Token staking for provider claims
- Tradeable, licensable model capabilities on Midnight

## Full project layout

```
contracts/          # Compact + managed/ ZK artifacts
src/                # Headless wallet, deploy, vitest (L1)
web/                # React + Vite frontend (L2)
.github/workflows/  # CI (L3)
docs/screenshots/   # L1 submission captures
```
