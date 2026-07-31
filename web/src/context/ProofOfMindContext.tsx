import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import pino from 'pino';
import {
  ProofOfMindAPI,
  type ModelRegistryEntry,
} from '../../../api/src/index.js';
import {
  BrowserProofOfMindManager,
  friendlyError,
  getOrCreateSecrets,
} from '../lib/BrowserProofOfMindManager';
import {
  CONTRACT_ADDRESS,
  INDEXER_URL,
  NETWORK_ID,
} from '../config';

type ProofOfMindContextValue = {
  connected: boolean;
  unshieldedAddress: string | null;
  contractAddress: string;
  entries: ModelRegistryEntry[];
  accuracyInput: string;
  setAccuracyInput: (v: string) => void;
  certThreshold: string;
  setCertThreshold: (v: string) => void;
  busy: boolean;
  error: string | null;
  status: string | null;
  secrets: ReturnType<typeof getOrCreateSecrets>;
  modelPreview: string;
  providerPreview: string;
  refresh: () => Promise<void>;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onRegister: () => Promise<void>;
  onCertify: (modelCommitment: string) => Promise<void>;
  onProveOwnership: (modelCommitment: string) => Promise<void>;
};

const ProofOfMindContext = createContext<ProofOfMindContextValue | null>(null);

export function ProofOfMindProvider({ children }: { children: ReactNode }) {
  const managerRef = useRef<BrowserProofOfMindManager | null>(null);
  const [connected, setConnected] = useState(false);
  const [unshieldedAddress, setUnshieldedAddress] = useState<string | null>(null);
  const [entries, setEntries] = useState<ModelRegistryEntry[]>([]);
  const [accuracyInput, setAccuracyInput] = useState('9400');
  const [certThreshold, setCertThreshold] = useState('9000');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const secrets = useMemo(() => getOrCreateSecrets(), []);
  const previews = useMemo(() => ProofOfMindAPI.commitmentPreviews(secrets), [secrets]);

  const getManager = useCallback(() => {
    if (!managerRef.current) {
      const logger = pino({ level: 'warn', browser: { asObject: true } });
      managerRef.current = new BrowserProofOfMindManager(logger);
    }
    return managerRef.current;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const state = await ProofOfMindAPI.fetchRegistryState(
        INDEXER_URL,
        CONTRACT_ADDRESS,
        NETWORK_ID,
      );
      setEntries(state.entries);
      setError(null);
    } catch (e) {
      setError(friendlyError(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const onConnect = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const manager = getManager();
      const session = await manager.getSession();
      await manager.join(CONTRACT_ADDRESS);
      setUnshieldedAddress(session.unshieldedAddress);
      setConnected(true);
      setStatus(`Connected on ${NETWORK_ID} — joined contract via findDeployedContract`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }, [getManager]);

  const onDisconnect = useCallback(async () => {
    setBusy(true);
    try {
      await getManager().disconnect();
    } catch {
      // Wallet may already be disconnected.
    }
    setConnected(false);
    setUnshieldedAddress(null);
    setStatus('Disconnected');
    setBusy(false);
  }, [getManager]);

  const onRegister = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStatus('Proving registerModel…');
    try {
      const api = await getManager().join(CONTRACT_ADDRESS);
      await api.registerModel(Number(accuracyInput));
      setStatus('registerModel submitted. Fingerprint stayed local; accuracy disclosed.');
      await refresh();
    } catch (e) {
      setError(friendlyError(e));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, [getManager, accuracyInput, refresh]);

  const onCertify = useCallback(
    async (modelCommitment: string) => {
      setBusy(true);
      setError(null);
      setStatus('Proving certifyModel…');
      try {
        const api = await getManager().join(CONTRACT_ADDRESS);
        await api.certifyModel(modelCommitment, Number(certThreshold));
        setStatus('Model certified on-chain.');
        await refresh();
      } catch (e) {
        setError(friendlyError(e));
        setStatus(null);
      } finally {
        setBusy(false);
      }
    },
    [getManager, certThreshold, refresh],
  );

  const onProveOwnership = useCallback(
    async (modelCommitment: string) => {
      setBusy(true);
      setError(null);
      setStatus('Proving proveOwnership…');
      try {
        const api = await getManager().join(CONTRACT_ADDRESS);
        await api.proveOwnership(modelCommitment);
        setStatus('Ownership proven without revealing provider secret.');
      } catch (e) {
        setError(friendlyError(e));
        setStatus(null);
      } finally {
        setBusy(false);
      }
    },
    [getManager],
  );

  const value = useMemo(
    () => ({
      connected,
      unshieldedAddress,
      contractAddress: CONTRACT_ADDRESS,
      entries,
      accuracyInput,
      setAccuracyInput,
      certThreshold,
      setCertThreshold,
      busy,
      error,
      status,
      secrets,
      modelPreview: previews.model,
      providerPreview: previews.provider,
      refresh,
      onConnect,
      onDisconnect,
      onRegister,
      onCertify,
      onProveOwnership,
    }),
    [
      connected,
      unshieldedAddress,
      entries,
      accuracyInput,
      certThreshold,
      busy,
      error,
      status,
      secrets,
      previews,
      refresh,
      onConnect,
      onDisconnect,
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
