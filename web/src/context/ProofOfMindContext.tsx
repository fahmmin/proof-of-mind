import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createConnectedSession,
  detectWallet,
  detectWalletName,
  type ConnectedSession,
} from '../lib/midnight';
import {
  certifyModel,
  deployContract,
  fetchRegistryState,
  getModelCommitmentPreview,
  getOrCreateSecrets,
  proveOwnership,
  registerModel,
  ZK_PATH,
  type ModelRegistryEntry,
} from '../lib/proof-of-mind';
import { LOCAL_INDEXER, NETWORK_ID } from '../lib/network';
import type { ProofOfMindPrivateState } from '@contracts/witnesses.js';

const CONTRACT_STORAGE_KEY = 'proof-of-mind-contract';

type ProofOfMindContextValue = {
  session: ConnectedSession | null;
  walletLabel: string | null;
  contractAddress: string | null;
  joinInput: string;
  setJoinInput: (v: string) => void;
  entries: ModelRegistryEntry[];
  accuracyInput: string;
  setAccuracyInput: (v: string) => void;
  certThreshold: string;
  setCertThreshold: (v: string) => void;
  busy: boolean;
  error: string | null;
  setError: (v: string | null) => void;
  secrets: ProofOfMindPrivateState;
  modelPreview: string;
  refresh: () => Promise<void>;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onDeploy: () => Promise<void>;
  onJoin: () => void;
  onRegister: () => Promise<void>;
  onCertify: (modelCommitment: string) => Promise<void>;
  onProveOwnership: (modelCommitment: string) => Promise<void>;
};

const ProofOfMindContext = createContext<ProofOfMindContextValue | null>(null);

export function ProofOfMindProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [walletLabel, setWalletLabel] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [entries, setEntries] = useState<ModelRegistryEntry[]>([]);
  const [accuracyInput, setAccuracyInput] = useState('9400');
  const [certThreshold, setCertThreshold] = useState('9000');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secrets] = useState(() => getOrCreateSecrets());
  const modelPreview = useMemo(() => getModelCommitmentPreview(secrets), [secrets]);

  useEffect(() => {
    const stored = localStorage.getItem(CONTRACT_STORAGE_KEY);
    if (stored) setContractAddress(stored);
  }, []);

  const refresh = useCallback(async () => {
    if (!contractAddress) return;
    const indexerUrl = session?.config.indexerUri ?? LOCAL_INDEXER;
    try {
      const state = await fetchRegistryState(indexerUrl, contractAddress);
      setEntries(state.entries);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, [contractAddress, session]);

  useEffect(() => {
    void refresh();
    if (!contractAddress) return;
    const interval = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(interval);
  }, [refresh, contractAddress]);

  const onConnect = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const wallet = await detectWallet();
      const api = await wallet.connect(NETWORK_ID);
      setWalletLabel(detectWalletName(wallet));
      setSession(await createConnectedSession(api, ZK_PATH));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const onDisconnect = useCallback(async () => {
    try {
      if (session?.api?.disconnect) await session.api.disconnect();
    } catch {
      // Wallet may already be disconnected.
    }
    setSession(null);
    setWalletLabel(null);
  }, [session]);

  const onDeploy = useCallback(async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const addr = await deployContract(session);
      setContractAddress(addr);
      localStorage.setItem(CONTRACT_STORAGE_KEY, addr);
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }, [session, refresh]);

  const onJoin = useCallback(() => {
    const addr = joinInput.trim();
    if (!/^[0-9a-fA-F]{64}$/.test(addr)) {
      setError('Contract address must be 64 hex characters.');
      return;
    }
    setContractAddress(addr);
    localStorage.setItem(CONTRACT_STORAGE_KEY, addr);
    setJoinInput('');
    setError(null);
  }, [joinInput]);

  const onRegister = useCallback(async () => {
    if (!session || !contractAddress) return;
    setBusy(true);
    setError(null);
    try {
      await registerModel(session, contractAddress, Number(accuracyInput));
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }, [session, contractAddress, accuracyInput, refresh]);

  const onCertify = useCallback(
    async (modelCommitment: string) => {
      if (!session || !contractAddress) return;
      setBusy(true);
      setError(null);
      try {
        await certifyModel(
          session,
          contractAddress,
          modelCommitment,
          Number(certThreshold),
        );
        await refresh();
      } catch (e) {
        setError(String(e));
      } finally {
        setBusy(false);
      }
    },
    [session, contractAddress, certThreshold, refresh],
  );

  const onProveOwnership = useCallback(
    async (modelCommitment: string) => {
      if (!session || !contractAddress) return;
      setBusy(true);
      setError(null);
      try {
        await proveOwnership(session, contractAddress, modelCommitment);
        await refresh();
      } catch (e) {
        setError(String(e));
      } finally {
        setBusy(false);
      }
    },
    [session, contractAddress, refresh],
  );

  const value = useMemo(
    () => ({
      session,
      walletLabel,
      contractAddress,
      joinInput,
      setJoinInput,
      entries,
      accuracyInput,
      setAccuracyInput,
      certThreshold,
      setCertThreshold,
      busy,
      error,
      setError,
      secrets,
      modelPreview,
      refresh,
      onConnect,
      onDisconnect,
      onDeploy,
      onJoin,
      onRegister,
      onCertify,
      onProveOwnership,
    }),
    [
      session,
      walletLabel,
      contractAddress,
      joinInput,
      entries,
      accuracyInput,
      certThreshold,
      busy,
      error,
      secrets,
      modelPreview,
      refresh,
      onConnect,
      onDisconnect,
      onDeploy,
      onJoin,
      onRegister,
      onCertify,
      onProveOwnership,
    ],
  );

  return (
    <ProofOfMindContext.Provider value={value}>{children}</ProofOfMindContext.Provider>
  );
}

export function useProofOfMind(): ProofOfMindContextValue {
  const ctx = useContext(ProofOfMindContext);
  if (!ctx) throw new Error('useProofOfMind must be used within ProofOfMindProvider');
  return ctx;
}

export function truncHex(hex: string, head = 10, tail = 8): string {
  return hex.length <= head + tail + 1
    ? hex
    : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}
