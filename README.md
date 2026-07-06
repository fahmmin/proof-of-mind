# Proof of Mind

ZK-verified AI benchmarking on [Midnight Network](https://midnight.network). Model providers register benchmark claims using private witnesses — model fingerprints and provider secrets never touch the ledger. Only cryptographic commitments and disclosed metrics appear on-chain, creating verifiable trust without exposing weights, training data, or challenge inputs.

## Product idea

When an AI company claims "94% accuracy on medical diagnosis," buyers must trust them blindly. **Proof of Mind** is a privacy-first benchmarking registry: providers commit to a model fingerprint locally, disclose only a hash and accuracy metric on-chain, and prove ownership via ZK circuits. Buyers can later verify credential thresholds (Confidential Credentials track) without the UI surfacing raw model internals. Long-term vision: tradeable, licensable model capabilities backed by cryptographic proofs on Midnight.

## Hackathon level

| Level | Status | Deliverable |
|-------|--------|-------------|
| L1 New Moon | Ready | Compact contract, vitest, local deploy, this README |
| L2 Waxing Crescent | Scaffolded | `web/` — Lace wallet + register + indexer table |
| L3 First Quarter | Scaffolded | `certifyModel` circuit, 4 tests, GitHub Actions CI |

## Prerequisites

- **Node.js 22+**
- **Docker** (local devnet + proof server)
- **Compact compiler** 0.31.1 (`compact update 0.31.1`)
- **Yarn 1.22**

### Install Compact

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source $HOME/.local/bin/env
compact update 0.31.1
compact compile --version   # expect 0.31.1
```

## Setup (one command)

```bash
yarn setup:l1
```

This installs deps, compiles the contract, starts Docker (node + indexer), uses an existing proof server on port 6300 if present, and runs all 4 tests.

### Manual steps (run separately, no inline comments)

```bash
compact update 0.31.1
yarn install
yarn compile
yarn env:up
yarn test:local
```

If port 6300 is already in use, `yarn env:up` only starts node and indexer. Ensure a proof server is reachable at `http://127.0.0.1:6300`.

For the full stack including a new proof-server container:

```bash
yarn env:up:all
```

## Deploy to Preprod

1. Start local proof server (included in `yarn env:up`) or run `midnightntwrk/proof-server:8.0.3` on port 6300.
2. Fund a Preprod wallet via [faucet](https://faucet.preprod.midnight.network).
3. Deploy:

```bash
export WALLET_SEED="<your-funded-seed>"
yarn deploy:preprod
```

Contract address is written to `deployment.json`.

## Frontend (Level 2)

```bash
yarn sync:zk
cd web && yarn install && yarn dev
```

Open http://localhost:3000 with **Lace** (or 1AM) on **preprod**. Connect → deploy or join contract → register model → view public registry.

## Public state vs private witness

| Data | Visibility | Stored where |
|------|------------|--------------|
| Model fingerprint (weights hash) | **Private** | Browser localStorage + circuit witness |
| Provider secret | **Private** | Witness only |
| Model commitment `persistentHash(fingerprint)` | **Public** | On-chain `models` map key |
| Provider commitment | **Public** | `ModelEntry.providerCommitment` |
| Accuracy (basis points) | **Public** | `ModelEntry.accuracyBps` |
| Certification threshold | **Public** | `certifications` map (after `certifyModel`) |

**What an observer learns:** a provider registered a commitment at a disclosed accuracy, and optionally certified a minimum threshold. They **cannot** recover model weights, raw fingerprints, or off-chain test prompts from chain data alone.

## Circuits

- `registerModel(accuracyBps)` — hash witnesses, disclose commitments + metric
- `proveOwnership(modelCommitment)` — provider ZK auth
- `certifyModel(modelCommitment, minAccuracyBps)` — Confidential Credentials: prove model meets threshold

## Project structure

```
contracts/
  proof-of-mind.compact    # Compact source
  witnesses.ts             # TypeScript witness implementations
  managed/proof-of-mind/   # Compiler output (ZK keys, circuits)
src/                       # Headless wallet + vitest harness
web/                       # React + Vite frontend (Lace / DApp Connector)
```

## Screenshots (submission)

Capture after running locally:

1. **Compile** — `yarn compile` listing circuits (`registerModel`, `proveOwnership`, `certifyModel`)
2. **Tests** — `yarn test:local` with 4 passing tests
3. **Deploy** — contract address from test output or `deployment.json`

## CI

![CI](https://github.com/YOUR_ORG/proof-of-mind/actions/workflows/ci.yml/badge.svg)

GitHub Actions runs `yarn compile` + `yarn test:local` on every push.

## Roadmap (post-hackathon)

- Schnorr attestation API for third-party benchmark oracles (zk-loan pattern)
- DUST-paid benchmark runs
- Token staking for provider claims
- Buyer UI that verifies credentials without displaying exact accuracy

## License

MIT
