import {
  createUnprovenDeployTx,
  submitCallTxAsync,
  submitTxAsync,
} from '@midnight-ntwrk/midnight-js-contracts';
import { ContractState, sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import {
  CompiledProofOfMindContract,
  ledger,
  pureCircuits,
} from './contract.js';
import {
  createInitialPrivateState,
  type ProofOfMindPrivateState,
} from '@contracts/witnesses.js';
import type { ConnectedSession } from './midnight';
import { fromHex, pollForState } from './midnight';

const PRIVATE_STATE_ID = 'proofOfMindPrivateState';
const SECRET_STORAGE_KEY = 'proof-of-mind-secrets';
export const ZK_PATH = '/zk/proof-of-mind';

export type ModelRegistryEntry = {
  modelCommitment: string;
  accuracyBps: number;
  providerCommitment: string;
  certifiedThresholdBps: number | null;
};

export type RegistryState = {
  modelCount: number;
  entries: ModelRegistryEntry[];
};

function makeCompiledContract() {
  return CompiledProofOfMindContract as any;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getOrCreateSecrets(): ProofOfMindPrivateState {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as {
      providerSecret: number[];
      modelFingerprint: number[];
    };
    return createInitialPrivateState(
      new Uint8Array(parsed.providerSecret),
      new Uint8Array(parsed.modelFingerprint),
    );
  }
  const providerSecret = crypto.getRandomValues(new Uint8Array(32));
  const modelFingerprint = crypto.getRandomValues(new Uint8Array(32));
  localStorage.setItem(
    SECRET_STORAGE_KEY,
    JSON.stringify({
      providerSecret: Array.from(providerSecret),
      modelFingerprint: Array.from(modelFingerprint),
    }),
  );
  return createInitialPrivateState(providerSecret, modelFingerprint);
}

export function getModelCommitmentPreview(secrets: ProofOfMindPrivateState): string {
  return bytesToHex(pureCircuits.modelCommitment(secrets.modelFingerprint));
}

export async function deployContract(session: ConnectedSession): Promise<string> {
  const initialPrivateState = getOrCreateSecrets();
  const deployTxData = await (createUnprovenDeployTx as any)(
    {
      zkConfigProvider: session.providers.zkConfigProvider,
      walletProvider: session.providers.walletProvider,
    },
    {
      compiledContract: makeCompiledContract(),
      args: [],
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState,
      signingKey: sampleSigningKey(),
    },
  );
  const contractAddress = deployTxData.public.contractAddress;
  await (submitTxAsync as any)(session.providers, {
    unprovenTx: deployTxData.private.unprovenTx,
  });
  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, initialPrivateState);
  await session.providers.privateStateProvider.setSigningKey(
    contractAddress,
    deployTxData.private.signingKey,
  );
  return contractAddress;
}

export async function registerModel(
  session: ConnectedSession,
  contractAddress: string,
  accuracyBps: number,
) {
  await (submitCallTxAsync as any)(session.providers, {
    compiledContract: makeCompiledContract(),
    contractAddress,
    circuitId: 'registerModel',
    args: [BigInt(accuracyBps)],
    privateStateId: PRIVATE_STATE_ID,
  });
}

export async function certifyModel(
  session: ConnectedSession,
  contractAddress: string,
  modelCommitmentHex: string,
  minAccuracyBps: number,
) {
  await (submitCallTxAsync as any)(session.providers, {
    compiledContract: makeCompiledContract(),
    contractAddress,
    circuitId: 'certifyModel',
    args: [fromHex(modelCommitmentHex), BigInt(minAccuracyBps)],
    privateStateId: PRIVATE_STATE_ID,
  });
}

export function decodeRegistryState(stateHex: string): RegistryState {
  const contractState = ContractState.deserialize(fromHex(stateHex));
  const l = ledger(contractState.data);
  const entries: ModelRegistryEntry[] = [];

  for (const [key, entry] of l.models) {
    const modelCommitment = bytesToHex(key);
    const certified = l.certifications.member(key)
      ? Number(l.certifications.lookup(key))
      : null;

    entries.push({
      modelCommitment,
      accuracyBps: Number(entry.accuracyBps),
      providerCommitment: bytesToHex(entry.providerCommitment),
      certifiedThresholdBps: certified,
    });
  }

  return {
    modelCount: Number(l.nextModelId as unknown as bigint),
    entries,
  };
}

export async function fetchRegistryState(
  queryUrl: string,
  contractAddress: string,
): Promise<RegistryState> {
  const hex = await pollForState(queryUrl, contractAddress);
  return decodeRegistryState(hex);
}
