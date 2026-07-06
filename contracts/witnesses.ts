import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';

export type ProofOfMindPrivateState = {
  providerSecret: Uint8Array;
  modelFingerprint: Uint8Array;
};

export const witnesses = {
  providerSecret: (context: WitnessContext<ProofOfMindPrivateState>) =>
    [context.privateState, context.privateState.providerSecret] as const,
  modelFingerprint: (context: WitnessContext<ProofOfMindPrivateState>) =>
    [context.privateState, context.privateState.modelFingerprint] as const,
};

export function createInitialPrivateState(
  providerSecret: Uint8Array,
  modelFingerprint: Uint8Array,
): ProofOfMindPrivateState {
  return { providerSecret, modelFingerprint };
}
