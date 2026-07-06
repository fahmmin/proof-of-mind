import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { witnesses } from './witnesses.js';

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/proof-of-mind/contract/index.js';
import { Contract } from './managed/proof-of-mind/contract/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(currentDir, 'managed', 'proof-of-mind');

export const CompiledProofOfMindContract = CompiledContract.make(
  'ProofOfMindContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);
