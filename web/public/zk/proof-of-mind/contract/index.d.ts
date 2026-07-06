import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  providerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  modelFingerprint(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerModel(context: __compactRuntime.CircuitContext<PS>,
                accuracyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveOwnership(context: __compactRuntime.CircuitContext<PS>,
                 targetModelCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  certifyModel(context: __compactRuntime.CircuitContext<PS>,
               targetModelCommitment_0: Uint8Array,
               minAccuracyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerModel(context: __compactRuntime.CircuitContext<PS>,
                accuracyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveOwnership(context: __compactRuntime.CircuitContext<PS>,
                 targetModelCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  certifyModel(context: __compactRuntime.CircuitContext<PS>,
               targetModelCommitment_0: Uint8Array,
               minAccuracyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  providerCommitment(sk_0: Uint8Array): Uint8Array;
  modelCommitment(fp_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  providerCommitment(context: __compactRuntime.CircuitContext<PS>,
                     sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  modelCommitment(context: __compactRuntime.CircuitContext<PS>, fp_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  registerModel(context: __compactRuntime.CircuitContext<PS>,
                accuracyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveOwnership(context: __compactRuntime.CircuitContext<PS>,
                 targetModelCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  certifyModel(context: __compactRuntime.CircuitContext<PS>,
               targetModelCommitment_0: Uint8Array,
               minAccuracyBps_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  models: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { accuracyBps: bigint,
                                 providerCommitment: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { accuracyBps: bigint, providerCommitment: Uint8Array }]>
  };
  readonly nextModelId: bigint;
  certifications: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
