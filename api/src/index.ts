/**
 * Shared Proof of Mind contract API — browser (1AM / Lace) and CLI.
 */
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  ContractState,
  fromHex,
  type ContractAddress,
} from '@midnight-ntwrk/compact-runtime';

import {
  CompiledProofOfMindContract,
  ledger,
  pureCircuits,
} from '../../contracts/compiled.js';
import type { ProofOfMindPrivateState } from '../../contracts/witnesses.js';
import {
  proofOfMindPrivateStateKey,
  type ModelRegistryEntry,
  type ProofOfMindProviders,
  type DeployedProofOfMindContract,
  type RegistryState,
} from './common-types.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class ProofOfMindAPI {
  readonly contractAddress: ContractAddress;

  private constructor(
    private readonly deployedContract: DeployedProofOfMindContract,
    private readonly providers: ProofOfMindProviders,
  ) {
    this.contractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.contractAddress);
  }

  async registerModel(accuracyBps: number): Promise<void> {
    if (accuracyBps < 0 || accuracyBps > 65_535) {
      throw new Error('accuracyBps must be 0-65535');
    }
    await (this.deployedContract as any).callTx.registerModel(BigInt(accuracyBps));
  }

  async proveOwnership(targetModelCommitmentHex: string): Promise<void> {
    const h = targetModelCommitmentHex.trim().toLowerCase().replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/.test(h)) {
      throw new Error('Model commitment must be 64 hex characters.');
    }
    await (this.deployedContract as any).callTx.proveOwnership(fromHex(h));
  }

  async certifyModel(
    targetModelCommitmentHex: string,
    minAccuracyBps: number,
  ): Promise<void> {
    const h = targetModelCommitmentHex.trim().toLowerCase().replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/.test(h)) {
      throw new Error('Model commitment must be 64 hex characters.');
    }
    if (minAccuracyBps < 0 || minAccuracyBps > 65_535) {
      throw new Error('minAccuracyBps must be 0-65535');
    }
    await (this.deployedContract as any).callTx.certifyModel(
      fromHex(h),
      BigInt(minAccuracyBps),
    );
  }

  static decodeRegistryState(stateHex: string, networkId?: NetworkId): RegistryState {
    if (networkId !== undefined) {
      setNetworkId(networkId);
    }
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

  static async fetchRegistryState(
    queryUrl: string,
    contractAddress: string,
    networkId?: NetworkId,
  ): Promise<RegistryState> {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query LATEST_CONTRACT_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`,
        variables: { address: contractAddress },
      }),
    });
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((e: { message: string }) => e.message).join('; '));
    }
    const hex = payload.data?.contractAction?.state ?? null;
    if (!hex) return { modelCount: 0, entries: [] };
    return ProofOfMindAPI.decodeRegistryState(hex, networkId);
  }

  static commitmentPreviews(privateState: ProofOfMindPrivateState) {
    return {
      model: bytesToHex(pureCircuits.modelCommitment(privateState.modelFingerprint)),
      provider: bytesToHex(pureCircuits.providerCommitment(privateState.providerSecret)),
    };
  }

  static async deploy(
    providers: ProofOfMindProviders,
    privateState: ProofOfMindPrivateState,
  ): Promise<ProofOfMindAPI> {
    const deployedContract = await (deployContract as any)(providers, {
      compiledContract: CompiledProofOfMindContract,
      privateStateId: proofOfMindPrivateStateKey,
      initialPrivateState: privateState,
      args: [],
    });
    return new ProofOfMindAPI(deployedContract, providers);
  }

  static async join(
    providers: ProofOfMindProviders,
    contractAddress: ContractAddress,
    privateState: ProofOfMindPrivateState,
    compiledContract: typeof CompiledProofOfMindContract = CompiledProofOfMindContract,
  ): Promise<ProofOfMindAPI> {
    const deployedContract = await findDeployedContract(providers as any, {
      contractAddress,
      compiledContract,
      privateStateId: proofOfMindPrivateStateKey,
      initialPrivateState: privateState,
    });
    return new ProofOfMindAPI(deployedContract, providers);
  }
}

export * from './common-types.js';
