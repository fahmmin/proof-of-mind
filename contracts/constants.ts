/** Shared across deploy, CLI, tests, and browser — must stay in sync. */
export const proofOfMindPrivateStateKey = 'proofOfMindPrivateState' as const;
export type ProofOfMindPrivateStateId = typeof proofOfMindPrivateStateKey;
