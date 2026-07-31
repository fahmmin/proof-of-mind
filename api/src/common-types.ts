import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { proofOfMindPrivateStateKey } from '../../contracts/constants.js';
import type { ProofOfMindPrivateState } from '../../contracts/witnesses.js';

export { proofOfMindPrivateStateKey };

export type ProofOfMindCircuitKeys =
  | 'registerModel'
  | 'proveOwnership'
  | 'certifyModel';
export type ProofOfMindProviders = MidnightProviders<
  ProofOfMindCircuitKeys,
  typeof proofOfMindPrivateStateKey,
  ProofOfMindPrivateState
>;
export type DeployedProofOfMindContract = FoundContract<any>;

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
