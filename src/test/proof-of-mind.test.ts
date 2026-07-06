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
import {
  MidnightWalletProvider,
  GENESIS_WALLET_SEED,
  syncWallet,
} from '../wallet.js';
import { buildProviders, type ProofOfMindProviders } from '../providers.js';
import {
  CompiledProofOfMindContract,
  ledger,
  pureCircuits,
  zkConfigPath,
} from '../../contracts/index.js';
import { createInitialPrivateState } from '../../contracts/witnesses.js';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const ALICE_SEED = GENESIS_WALLET_SEED;
const ALICE_PRIVATE_STATE_ID = 'AliceProofOfMindState';

const PROVIDER_SECRET = new Uint8Array(32).fill(0x01);
const MODEL_FINGERPRINT = new Uint8Array(32).fill(0x02);
const ACCURACY_BPS = 9400;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

describe('Proof of Mind Contract', () => {
  let aliceWallet: MidnightWalletProvider;
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

    aliceWallet = await MidnightWalletProvider.build(
      logger,
      envConfig,
      ALICE_SEED,
    );
    await aliceWallet.start();
    await syncWallet(logger, aliceWallet.wallet, 600_000);

    aliceProviders = buildProviders(aliceWallet, zkConfigPath, config);
    logger.info('Providers initialized. Ready to test!');
  });

  afterAll(async () => {
    if (aliceWallet) {
      logger.info('Stopping Alice wallet...');
      await aliceWallet.stop();
    }
  });

  it('deploys the contract', async () => {
    const deployed: any = await (deployContract as any)(aliceProviders, {
      compiledContract: CompiledProofOfMindContract,
      privateStateId: ALICE_PRIVATE_STATE_ID,
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
      privateStateId: ALICE_PRIVATE_STATE_ID,
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
      privateStateId: ALICE_PRIVATE_STATE_ID,
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
      privateStateId: ALICE_PRIVATE_STATE_ID,
      circuitId: 'certifyModel',
      args: [expectedModelCommitment, minThreshold],
    });

    const state = await queryLedger(aliceProviders);
    expect(state.certifications.member(expectedModelCommitment)).toBe(true);
    expect(state.certifications.lookup(expectedModelCommitment)).toBe(minThreshold);
  });
});
