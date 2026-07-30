import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';

export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider<any>;
    proofProvider: { proveTx: (unprovenTx: any) => Promise<any> };
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
};

export function fromHex(hex: string): Uint8Array {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  return Uint8Array.from(h.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function createPrivateStateProvider() {
  let scope = '';
  const stateStore = new Map<string, unknown>();
  const signingKeyStore = new Map<string, unknown>();
  const key = (id: string) => `${scope}:${id}`;
  return {
    setContractAddress(address: string) {
      scope = address;
    },
    async set(id: string, state: unknown) {
      stateStore.set(key(id), state);
    },
    async get(id: string) {
      return stateStore.get(key(id)) ?? null;
    },
    async remove(id: string) {
      stateStore.delete(key(id));
    },
    async clear() {
      stateStore.clear();
    },
    async setSigningKey(addr: string, k: unknown) {
      signingKeyStore.set(addr, k);
    },
    async getSigningKey(addr: string) {
      return signingKeyStore.get(addr) ?? null;
    },
    async removeSigningKey(addr: string) {
      signingKeyStore.delete(addr);
    },
    async clearSigningKeys() {
      signingKeyStore.clear();
    },
    async exportPrivateStates(): Promise<never> {
      throw new Error('Not implemented.');
    },
    async importPrivateStates(): Promise<never> {
      throw new Error('Not implemented.');
    },
    async exportSigningKeys(): Promise<never> {
      throw new Error('Not implemented.');
    },
    async importSigningKeys(): Promise<never> {
      throw new Error('Not implemented.');
    },
  };
}

function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);
  return {
    ...base,
    async queryContractState(contractAddress: string, config?: unknown) {
      if (config) return base.queryContractState(contractAddress, config as never);
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
      const action = payload.data?.contractAction ?? null;
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
  };
}

export async function createConnectedSession(
  api: any,
  zkAssetBasePath: string,
): Promise<ConnectedSession> {
  const [config, unshieldedAddress, shieldedAddress] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    new URL(zkAssetBasePath, window.location.origin).toString(),
    window.fetch.bind(window),
  );
  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  const proofProvider = {
    async proveTx(unprovenTx: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction returned invalid result');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const result = await api.submitTransaction(txHex);
      if (typeof result === 'string' && result) return result;
      if (result?.transactionId) return result.transactionId;
      if (result?.id) return result.id;
      return txHex.slice(0, 64);
    },
  };

  return {
    api,
    config,
    providers: {
      privateStateProvider: createPrivateStateProvider(),
      publicDataProvider: createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshieldedAddress.unshieldedAddress,
  };
}

export async function pollForState(
  queryUrl: string,
  contractAddress: string,
  maxAttempts = 60,
  intervalMs = 2000,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
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
    if (res.ok) {
      const payload = await res.json();
      const state = payload.data?.contractAction?.state;
      if (state) return state;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Contract state not indexed after ${(maxAttempts * intervalMs) / 1000}s`);
}

/**
 * Midnight dApp connector v4: wallets live on `window.midnight`
 * (e.g. mnLace, 1am, or UUID keys). Prefer Lace, then 1AM, then any connectable injector.
 * Never hardcode a wallet UUID.
 */
export function listMidnightWalletApis(): any[] {
  const midnight = (window as unknown as { midnight?: Record<string, unknown> }).midnight;
  if (!midnight) return [];
  const seen = new Set<unknown>();
  const ordered: any[] = [];
  const add = (w: unknown): void => {
    if (w == null || seen.has(w)) return;
    if (typeof (w as { connect?: unknown }).connect !== 'function') return;
    seen.add(w);
    ordered.push(w);
  };
  add(midnight.mnLace);
  add(midnight['1am']);
  for (const v of Object.values(midnight)) add(v);
  return ordered;
}

export function detectWalletName(api: unknown): string {
  const midnight = (window as unknown as { midnight?: Record<string, unknown> }).midnight;
  if (!midnight || api == null) return 'Midnight wallet';
  for (const [key, value] of Object.entries(midnight)) {
    if (value === api) {
      if (key === 'mnLace') return 'Lace';
      if (key === '1am') return '1AM';
      return key;
    }
  }
  return 'Midnight wallet';
}

export async function detectWallet(timeoutMs = 5_000): Promise<any> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const apis = listMidnightWalletApis();
    if (apis.length > 0) return apis[0];
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(
    'No Midnight wallet found. Install Lace or 1AM, switch to undeployed, then refresh.',
  );
}
