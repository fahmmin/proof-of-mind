import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { witnesses } from './witnesses.js';
import { Contract } from './managed/proof-of-mind/contract/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(currentDir, 'managed', 'proof-of-mind');

/** Node CLI / deploy — absolute asset path for NodeZkConfigProvider. */
export const CompiledProofOfMindContract = CompiledContract.make(
  'ProofOfMindContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/proof-of-mind/contract/index.js';
export { proofOfMindPrivateStateKey } from './constants.js';
export {
  witnesses,
  createInitialPrivateState,
  type ProofOfMindPrivateState,
} from './witnesses.js';
