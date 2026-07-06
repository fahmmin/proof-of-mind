import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { witnesses } from '@contracts/witnesses.js';

export {
  Contract,
  ledger,
  pureCircuits,
} from '@contracts/managed/proof-of-mind/contract/index.js';
import { Contract } from '@contracts/managed/proof-of-mind/contract/index.js';

export const ZK_ASSET_PATH = '/zk/proof-of-mind';

export const CompiledProofOfMindContract = CompiledContract.make(
  'ProofOfMindContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(ZK_ASSET_PATH),
);
