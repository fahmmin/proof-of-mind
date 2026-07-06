import { useCallback, useEffect, useState } from 'react';
import {
  createConnectedSession,
  detectWallet,
  type ConnectedSession,
} from './lib/midnight';
import {
  deployContract,
  fetchRegistryState,
  getModelCommitmentPreview,
  getOrCreateSecrets,
  registerModel,
  certifyModel,
  ZK_PATH,
  type ModelRegistryEntry,
} from './lib/proof-of-mind';

const CONTRACT_STORAGE_KEY = 'proof-of-mind-contract';
const NETWORK = 'preprod';

function truncHex(hex: string, head = 10, tail = 8): string {
  return hex.length <= head + tail + 1
    ? hex
    : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export default function App() {
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [entries, setEntries] = useState<ModelRegistryEntry[]>([]);
  const [accuracyInput, setAccuracyInput] = useState('9400');
  const [certThreshold, setCertThreshold] = useState('9000');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secrets] = useState(() => getOrCreateSecrets());
  const modelPreview = getModelCommitmentPreview(secrets);

  useEffect(() => {
    const stored = localStorage.getItem(CONTRACT_STORAGE_KEY);
    if (stored) setContractAddress(stored);
  }, []);

  const refresh = useCallback(async () => {
    if (!contractAddress) return;
    const indexerUrl =
      session?.config.indexerUri ??
      'https://indexer.preprod.midnight.network/api/v4/graphql';
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

  async function onConnect() {
    setBusy(true);
    setError(null);
    try {
      const wallet = await detectWallet();
      const api = await wallet.connect(NETWORK);
      setSession(await createConnectedSession(api, ZK_PATH));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDisconnect() {
    if (session?.api?.disconnect) await session.api.disconnect();
    setSession(null);
  }

  async function onDeploy() {
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
  }

  function onJoin() {
    const addr = joinInput.trim();
    if (!/^[0-9a-fA-F]{64}$/.test(addr)) {
      setError('Contract address must be 64 hex characters.');
      return;
    }
    setContractAddress(addr);
    localStorage.setItem(CONTRACT_STORAGE_KEY, addr);
    setJoinInput('');
    setError(null);
  }

  async function onRegister() {
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
  }

  async function onCertify(modelCommitment: string) {
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
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Proof of Mind</h1>
        <p style={{ color: '#555', marginTop: 8 }}>
          ZK-verified AI model registry on Midnight — commitments on-chain, fingerprints in shadow.
        </p>
      </header>

      <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {!session ? (
          <button type="button" onClick={() => void onConnect()} disabled={busy}>
            Connect Lace / Midnight wallet
          </button>
        ) : (
          <>
            <span style={{ alignSelf: 'center', fontSize: 14 }}>
              Connected: {truncHex(session.unshieldedAddress, 14, 10)}
            </span>
            <button type="button" onClick={() => void onDisconnect()} disabled={busy}>
              Disconnect
            </button>
          </>
        )}
        {session && !contractAddress && (
          <button type="button" onClick={() => void onDeploy()} disabled={busy}>
            Deploy contract
          </button>
        )}
      </section>

      <section style={{ marginBottom: 24, padding: 16, background: '#f6f6f8', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Join existing contract</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="64-char contract address"
            style={{ flex: 1, minWidth: 280, padding: 8 }}
          />
          <button type="button" onClick={onJoin} disabled={busy}>
            Use address
          </button>
        </div>
        {contractAddress && (
          <p style={{ fontSize: 13, marginBottom: 0 }}>
            Active contract: <code>{contractAddress}</code>
          </p>
        )}
      </section>

      {session && contractAddress && (
        <>
          <section style={{ marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Register model (privacy demo)</h2>
            <p style={{ fontSize: 14, color: '#444' }}>
              Your local model fingerprint never leaves the browser. Only its hash is disclosed on-chain.
            </p>
            <dl style={{ fontSize: 13, background: '#fafafa', padding: 12, borderRadius: 6 }}>
              <dt style={{ fontWeight: 600 }}>Private (witness)</dt>
              <dd style={{ margin: '4px 0 12px', wordBreak: 'break-all' }}>
                fingerprint preview → <code>{modelPreview}</code> (hash only, not raw weights)
              </dd>
              <dt style={{ fontWeight: 600 }}>Public (disclosed)</dt>
              <dd style={{ margin: '4px 0 0' }}>model commitment, provider commitment, accuracy (bps)</dd>
            </dl>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Accuracy (basis points, e.g. 9400 = 94.00%)
              <input
                value={accuracyInput}
                onChange={(e) => setAccuracyInput(e.target.value)}
                style={{ display: 'block', marginTop: 4, padding: 8, width: 200 }}
              />
            </label>
            <button type="button" onClick={() => void onRegister()} disabled={busy}>
              Register model
            </button>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16 }}>Public registry (indexer)</h2>
            <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
              Certify threshold (bps) for credential demo
              <input
                value={certThreshold}
                onChange={(e) => setCertThreshold(e.target.value)}
                style={{ display: 'block', marginTop: 4, padding: 8, width: 200 }}
              />
            </label>
            {entries.length === 0 ? (
              <p style={{ color: '#666' }}>No models registered yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: 8 }}>Model commitment</th>
                    <th style={{ padding: 8 }}>Accuracy (bps)</th>
                    <th style={{ padding: 8 }}>Provider</th>
                    <th style={{ padding: 8 }}>Credential</th>
                    <th style={{ padding: 8 }} />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.modelCommitment} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 8, fontFamily: 'monospace' }}>
                        {truncHex(e.modelCommitment)}
                      </td>
                      <td style={{ padding: 8 }}>{e.accuracyBps}</td>
                      <td style={{ padding: 8, fontFamily: 'monospace' }}>
                        {truncHex(e.providerCommitment)}
                      </td>
                      <td style={{ padding: 8 }}>
                        {e.certifiedThresholdBps != null
                          ? `≥ ${e.certifiedThresholdBps} bps`
                          : '—'}
                      </td>
                      <td style={{ padding: 8 }}>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onCertify(e.modelCommitment)}
                        >
                          Certify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      {error && (
        <pre style={{ color: '#b00020', whiteSpace: 'pre-wrap', fontSize: 13 }}>{error}</pre>
      )}
    </div>
  );
}
