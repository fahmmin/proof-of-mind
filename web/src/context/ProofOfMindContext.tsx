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
import { percentToBps } from '../lib/progress';
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
  /** Accuracy as percentage string for UI (e.g. "94") */
  accuracyPercent: string;
  setAccuracyPercent: (v: string) => void;
  /** Certify threshold as percentage string for UI (e.g. "90") */
  certThresholdPercent: string;
  setCertThresholdPercent: (v: string) => void;
  busy: boolean;
  secrets: ReturnType<typeof getOrCreateSecrets>;
  modelPreview: string;
  providerPreview: string;
  refresh: () => Promise<void>;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  /** Throws friendly errors; caller drives TxFlow / toasts */
  onRegister: (accuracyOverride?: number) => Promise<void>;
  onCertify: (modelCommitment: string, thresholdOverride?: number) => Promise<void>;
  onProveOwnership: (modelCommitment: string) => Promise<void>;
};

const ProofOfMindContext = createContext<ProofOfMindContextValue | null>(null);

export function ProofOfMindProvider({ children }: { children: ReactNode }) {
  const managerRef = useRef<BrowserProofOfMindManager | null>(null);
  const [connected, setConnected] = useState(false);
  const [unshieldedAddress, setUnshieldedAddress] = useState<string | null>(null);
  const [entries, setEntries] = useState<ModelRegistryEntry[]>([]);
  const [accuracyPercent, setAccuracyPercent] = useState('94');
  const [certThresholdPercent, setCertThresholdPercent] = useState('90');
  const [busy, setBusy] = useState(false);

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
    } catch {
      // Quiet refresh failures — avoid jargon banners on every poll miss
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const onConnect = useCallback(async () => {
    setBusy(true);
    try {
      const manager = getManager();
      const session = await manager.getSession();
      await manager.join(CONTRACT_ADDRESS);
      setUnshieldedAddress(session.unshieldedAddress);
      setConnected(true);
    } catch (e) {
      throw new Error(friendlyError(e));
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
    setBusy(false);
  }, [getManager]);

  const onRegister = useCallback(
    async (accuracyOverride?: number) => {
      setBusy(true);
      try {
        const percent =
          accuracyOverride != null ? accuracyOverride : Number(accuracyPercent);
        if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
          throw new Error('Accuracy must be a percentage between 0 and 100.');
        }
        const api = await getManager().join(CONTRACT_ADDRESS);
        await api.registerModel(percentToBps(percent));
        await refresh();
      } catch (e) {
        throw new Error(friendlyError(e));
      } finally {
        setBusy(false);
      }
    },
    [getManager, accuracyPercent, refresh],
  );

  const onCertify = useCallback(
    async (modelCommitment: string, thresholdOverride?: number) => {
      setBusy(true);
      try {
        const percent =
          thresholdOverride != null ? thresholdOverride : Number(certThresholdPercent);
        if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
          throw new Error('Threshold must be a percentage between 0 and 100.');
        }
        const api = await getManager().join(CONTRACT_ADDRESS);
        await api.certifyModel(modelCommitment, percentToBps(percent));
        await refresh();
      } catch (e) {
        throw new Error(friendlyError(e));
      } finally {
        setBusy(false);
      }
    },
    [getManager, certThresholdPercent, refresh],
  );

  const onProveOwnership = useCallback(
    async (modelCommitment: string) => {
      setBusy(true);
      try {
        const api = await getManager().join(CONTRACT_ADDRESS);
        await api.proveOwnership(modelCommitment);
      } catch (e) {
        throw new Error(friendlyError(e));
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
      accuracyPercent,
      setAccuracyPercent,
      certThresholdPercent,
      setCertThresholdPercent,
      busy,
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
      accuracyPercent,
      certThresholdPercent,
      busy,
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
