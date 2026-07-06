import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import pino from 'pino';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getConfig } from './config.js';
import { MidnightWalletProvider, syncWallet } from './wallet.js';
import { buildProviders } from './providers.js';
import {
  CompiledProofOfMindContract,
  zkConfigPath,
} from '../contracts/index.js';
import { createInitialPrivateState } from '../contracts/witnesses.js';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

const PRIVATE_STATE_ID = 'ProofOfMindDeployState';
const PROVIDER_SECRET = new Uint8Array(32).fill(0x0a);
const MODEL_FINGERPRINT = new Uint8Array(32).fill(0x0b);

async function main() {
  const seed = process.env['WALLET_SEED'];
  if (!seed) {
    throw new Error(
      'Set WALLET_SEED to a funded preprod wallet seed before deploying.',
    );
  }

  const config = getConfig();
  setNetworkId(config.networkId);

  const envConfig: EnvironmentConfiguration = {
    walletNetworkId: config.networkId,
    networkId: config.networkId,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  const wallet = await MidnightWalletProvider.build(logger, envConfig, seed);
  await wallet.start();
  await syncWallet(logger, wallet.wallet, 600_000);

  const providers = buildProviders(wallet, zkConfigPath, config, 'deploy');

  logger.info('Deploying Proof of Mind contract to preprod...');
  const deployed: any = await (deployContract as any)(providers, {
    compiledContract: CompiledProofOfMindContract,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: createInitialPrivateState(
      PROVIDER_SECRET,
      MODEL_FINGERPRINT,
    ),
    args: [],
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  logger.info(`Contract deployed at: ${contractAddress}`);

  const deploymentRecord = {
    network: config.networkId,
    contractAddress,
    deployedAt: new Date().toISOString(),
  };

  const outPath = resolve(process.cwd(), 'deployment.json');
  writeFileSync(outPath, JSON.stringify(deploymentRecord, null, 2));
  logger.info(`Wrote ${outPath}`);

  await wallet.stop();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
