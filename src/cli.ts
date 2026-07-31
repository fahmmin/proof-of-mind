import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import { ProofOfMindAPI } from '../api/src/node.js';
import { CompiledProofOfMindContract } from '../contracts/index.js';
import { getConfig } from './config.js';
import { ensureDust } from './dust.js';
import { createProviders } from './providers.js';
import {
  createWallet,
  resolveDeploySeed,
  unshieldedToken,
  waitForSyncedWallet,
} from './wallet.js';
import { createInitialPrivateState } from '../contracts/witnesses.js';
import { zkConfigPath } from '../contracts/index.js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const PROVIDER_STORE_SUFFIX = 'deploy';
const DEFAULT_PROVIDER_SECRET = new Uint8Array(32).fill(0x0a);
const DEFAULT_MODEL_FINGERPRINT = new Uint8Array(32).fill(0x0b);

type DeploymentRecord = {
  network: string;
  contractAddress: string;
  deployedAt: string;
};

function loadDeployment(): DeploymentRecord {
  const path = resolve(process.cwd(), 'deployment.json');
  if (!existsSync(path)) {
    throw new Error('No deployment.json found. Run yarn deploy first.');
  }
  return JSON.parse(readFileSync(path, 'utf8')) as DeploymentRecord;
}

function truncHex(hex: string, head = 10, tail = 8): string {
  return hex.length <= head + tail + 1 ? hex : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

async function main() {
  const deployment = loadDeployment();
  if (!process.env['MIDNIGHT_NETWORK']) {
    process.env['MIDNIGHT_NETWORK'] =
      deployment.network === 'undeployed' ? 'local' : deployment.network;
  }

  const config = getConfig();
  const seed = resolveDeploySeed(config.networkId);
  setNetworkId(config.networkId);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                 Proof of Mind CLI                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`  Contract: ${deployment.contractAddress}`);
  console.log(`  Network:  ${config.networkId}\n`);

  if (
    deployment.network !== config.networkId &&
    !(deployment.network === 'undeployed' && config.networkId === 'undeployed')
  ) {
    console.error(
      `  deployment.json is for "${deployment.network}" but MIDNIGHT_NETWORK is "${config.networkId}".`,
    );
    console.error(`  Run: MIDNIGHT_NETWORK=${deployment.network} yarn cli\n`);
    process.exit(1);
  }

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet(config, seed);

    console.log('  Syncing with network...');
    console.log('  ℹ  This may take several minutes depending on network size.');
    console.log('     RPC disconnection messages during sync are normal and can be safely ignored.\n');

    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
    }, 5000);

    await waitForSyncedWallet(walletCtx.wallet, 600_000);
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');

    const state = await walletCtx.wallet.waitForSyncedState();
    const tNight = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    const dust = state.dust.balance(new Date());
    console.log(`  Balance: ${tNight.toLocaleString()} tNight`);
    console.log(`  DUST:    ${dust.toLocaleString()}\n`);

    if (tNight === 0n && config.networkId !== 'undeployed' && config.faucet) {
      console.log('  ⚠ Wallet has no tNight. Fund it from the faucet to send transactions:');
      console.log(`     ${config.faucet}`);
      console.log(`     Wallet: ${walletCtx.unshieldedKeystore.getBech32Address()}\n`);
    }

    await ensureDust(walletCtx);

    console.log('  Joining contract via findDeployedContract...');
    const providers = createProviders(walletCtx, zkConfigPath, config, PROVIDER_STORE_SUFFIX);
    const privateState = createInitialPrivateState(
      DEFAULT_PROVIDER_SECRET,
      DEFAULT_MODEL_FINGERPRINT,
    );
    const api = await ProofOfMindAPI.join(
      providers,
      deployment.contractAddress,
      privateState,
      CompiledProofOfMindContract,
    );
    const previews = ProofOfMindAPI.commitmentPreviews(privateState);

    console.log('  ✅ Connected!\n');
    console.log(`  Local model commitment:    ${truncHex(previews.model, 14, 10)}`);
    console.log(`  Local provider commitment: ${truncHex(previews.provider, 14, 10)}\n`);

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Register model');
      console.log('  2. List models (on-chain)');
      console.log('  3. Prove ownership');
      console.log('  4. Certify model');
      console.log('  5. Show local commitment previews');
      console.log('  6. Check wallet balance');
      console.log('  7. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const bpsStr = await rl.question('  Accuracy (basis points, 0-65535): ');
          const accuracyBps = Number(bpsStr);
          if (!Number.isInteger(accuracyBps) || accuracyBps < 0 || accuracyBps > 65_535) {
            console.log('\n  ❌ Invalid accuracy.\n');
            break;
          }
          console.log('\n  Submitting registerModel (this may take 30-60 seconds)...');
          try {
            await api.registerModel(accuracyBps);
            console.log(`\n  ✅ Model registered at ${accuracyBps} bps\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }

        case '2': {
          console.log('\n  Reading registry from indexer...');
          try {
            const registry = await ProofOfMindAPI.fetchRegistryState(
              config.indexer,
              deployment.contractAddress,
            );
            if (registry.entries.length === 0) {
              console.log('\n  📋 No models registered yet.\n');
              break;
            }
            console.log(
              `\n  📋 ${registry.entries.length} model(s), next id: ${registry.modelCount}\n`,
            );
            registry.entries.forEach((entry, i) => {
              console.log(`  ${i + 1}. model:    ${entry.modelCommitment}`);
              console.log(`     accuracy: ${entry.accuracyBps} bps`);
              console.log(`     provider: ${entry.providerCommitment}`);
              console.log(
                `     certified: ${
                  entry.certifiedThresholdBps != null
                    ? `≥ ${entry.certifiedThresholdBps} bps`
                    : 'none'
                }\n`,
              );
            });
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }

        case '3': {
          const hex =
            (await rl.question('  Model commitment (64 hex chars): ')).trim() ||
            previews.model;
          console.log('\n  Submitting proveOwnership (this may take 30-60 seconds)...');
          try {
            await api.proveOwnership(hex);
            console.log('\n  ✅ Ownership proven (provider secret not disclosed)\n');
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }

        case '4': {
          const hex =
            (await rl.question('  Model commitment (64 hex chars): ')).trim() ||
            previews.model;
          const thresholdStr = await rl.question('  Min accuracy threshold (bps): ');
          const minAccuracyBps = Number(thresholdStr);
          if (!Number.isInteger(minAccuracyBps) || minAccuracyBps < 0 || minAccuracyBps > 65_535) {
            console.log('\n  ❌ Invalid threshold.\n');
            break;
          }
          console.log('\n  Submitting certifyModel (this may take 30-60 seconds)...');
          try {
            await api.certifyModel(hex, minAccuracyBps);
            console.log(`\n  ✅ Model certified at ≥ ${minAccuracyBps} bps\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }

        case '5': {
          console.log('\n  Local witness previews (not on-chain until you register):');
          console.log(`  Model commitment:    ${previews.model}`);
          console.log(`  Provider commitment: ${previews.provider}\n`);
          break;
        }

        case '6': {
          const current = await walletCtx.wallet.waitForSyncedState();
          const currentTNight =
            current.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const currentDust = current.dust.balance(new Date());
          console.log(`\n  tNight: ${currentTNight.toLocaleString()}`);
          console.log(`  DUST:   ${currentDust.toLocaleString()}\n`);
          break;
        }

        case '7':
          running = false;
          console.log('\n  👋 Goodbye!\n');
          break;

        default:
          console.log('\n  ❌ Invalid choice. Please enter 1-7.\n');
      }
    }

    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
