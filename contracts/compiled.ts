import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { witnesses } from './witnesses.js';
import { Contract } from './managed/proof-of-mind/contract/index.js';

/** Browser — relative asset path resolved by FetchZkConfigProvider. */
export const CompiledProofOfMindContract = CompiledContract.make(
  'ProofOfMindContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets('./managed/proof-of-mind'),
);

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/proof-of-mind/contract/index.js';
