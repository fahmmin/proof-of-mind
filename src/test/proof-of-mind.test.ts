import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  deployContract,
  submitCallTx,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import pino from 'pino';

import { getConfig } from '../config.js';
import { ensureDust } from '../dust.js';
import { createProviders, type ProofOfMindProviders } from '../providers.js';
import {
  GENESIS_WALLET_SEED,
  createWallet,
  waitForSyncedWallet,
} from '../wallet.js';
import {
  CompiledProofOfMindContract,
  ledger,
  pureCircuits,
  zkConfigPath,
} from '../../contracts/index.js';
import { proofOfMindPrivateStateKey } from '../../contracts/constants.js';
import { createInitialPrivateState } from '../../contracts/witnesses.js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const PROVIDER_SECRET = new Uint8Array(32).fill(0x01);
const MODEL_FINGERPRINT = new Uint8Array(32).fill(0x02);
const ACCURACY_BPS = 9400;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

describe('Proof of Mind Contract', () => {
  let walletCtx: Awaited<ReturnType<typeof createWallet>>;
  let aliceProviders: ProofOfMindProviders;
  let contractAddress: ContractAddress;
  let expectedModelCommitment: Uint8Array;

  const config = getConfig();

  async function queryLedger(providers: ProofOfMindProviders) {
    const state =
      await providers.publicDataProvider.queryContractState(contractAddress);
    expect(state).not.toBeNull();
    return ledger(state!.data);
  }

  beforeAll(async () => {
    setNetworkId(config.networkId);

    expectedModelCommitment = pureCircuits.modelCommitment(MODEL_FINGERPRINT);

    walletCtx = await createWallet(config, GENESIS_WALLET_SEED);
    await waitForSyncedWallet(walletCtx.wallet, 600_000);
    await ensureDust(walletCtx);

    aliceProviders = createProviders(walletCtx, zkConfigPath, config, 'test');
    logger.info('Providers initialized. Ready to test!');
  });

  afterAll(async () => {
    if (walletCtx) {
      logger.info('Stopping wallet...');
      await walletCtx.wallet.stop();
    }
  });

  it('deploys the contract', async () => {
    const deployed: any = await (deployContract as any)(aliceProviders, {
      compiledContract: CompiledProofOfMindContract,
      privateStateId: proofOfMindPrivateStateKey,
      initialPrivateState: createInitialPrivateState(
        PROVIDER_SECRET,
        MODEL_FINGERPRINT,
      ),
      args: [],
    });

    contractAddress = deployed.deployTxData.public.contractAddress;
    logger.info(`Contract deployed at: ${contractAddress}`);
    expect(contractAddress).toBeDefined();
    expect(contractAddress.length).toBeGreaterThan(0);

    const state = await queryLedger(aliceProviders);
    expect(state.nextModelId).toEqual(0n);
  });

  it('registers a model with disclosed commitments only', async () => {
    await (submitCallTx as any)(aliceProviders, {
      compiledContract: CompiledProofOfMindContract,
      contractAddress,
      privateStateId: proofOfMindPrivateStateKey,
      circuitId: 'registerModel',
      args: [BigInt(ACCURACY_BPS)],
    });

    const state = await queryLedger(aliceProviders);
    expect(state.nextModelId).toEqual(1n);
    expect(state.models.member(expectedModelCommitment)).toBe(true);

    const entry = state.models.lookup(expectedModelCommitment);
    expect(entry.accuracyBps).toEqual(BigInt(ACCURACY_BPS));
    expect(entry.providerCommitment).toEqual(
      pureCircuits.providerCommitment(PROVIDER_SECRET),
    );
  });

  it('proves provider ownership without revealing secrets', async () => {
    await (submitCallTx as any)(aliceProviders, {
      compiledContract: CompiledProofOfMindContract,
      contractAddress,
      privateStateId: proofOfMindPrivateStateKey,
      circuitId: 'proveOwnership',
      args: [expectedModelCommitment],
    });

    const state = await queryLedger(aliceProviders);
    expect(state.models.member(expectedModelCommitment)).toBe(true);
  });

  it('certifies model meets a minimum accuracy threshold', async () => {
    const minThreshold = 9000n;

    await (submitCallTx as any)(aliceProviders, {
      compiledContract: CompiledProofOfMindContract,
      contractAddress,
      privateStateId: proofOfMindPrivateStateKey,
      circuitId: 'certifyModel',
      args: [expectedModelCommitment, minThreshold],
    });

    const state = await queryLedger(aliceProviders);
    expect(state.certifications.member(expectedModelCommitment)).toBe(true);
    expect(state.certifications.lookup(expectedModelCommitment)).toBe(minThreshold);
  });
});
