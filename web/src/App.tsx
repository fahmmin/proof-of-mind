import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppChrome } from './components/AppChrome';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { ProgressProvider, useProgress } from './components/ProgressProvider';
import { RequireOnboarded } from './components/RequireOnboarded';
import { ToastProvider, useToasts } from './components/StatusToasts';
import { idleTxFlow, TxFlow, type TxFlowState } from './components/TxFlow';
import { ProofOfMindProvider, useProofOfMind } from './context/ProofOfMindContext';
import { networkLabel } from './lib/networkLabels';
import { NETWORK_ID } from './config';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { RegistryPage } from './pages/RegistryPage';
import { ModelDetailPage } from './pages/ModelDetailPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

function AppShell() {
  const location = useLocation();
  const { state, recordConnect } = useProgress();
  const { push } = useToasts();
  const { connected, busy, unshieldedAddress, onConnect, onDisconnect } = useProofOfMind();

  const [connectOpen, setConnectOpen] = useState(false);
  const [txFlow, setTxFlow] = useState<TxFlowState>(idleTxFlow);
  const [connectBusy, setConnectBusy] = useState(false);

  const bareChrome =
    location.pathname === '/' || location.pathname === '/onboarding';

  useEffect(() => {
    document.documentElement.classList.toggle('compact', state.compactMode);
  }, [state.compactMode]);

  async function handleConnect() {
    setConnectBusy(true);
    try {
      await onConnect();
      setConnectOpen(false);
      recordConnect();
      push({
        tone: 'ok',
        title: 'You’re in the lab',
        body: `Connected on ${networkLabel(NETWORK_ID)}.`,
      });
    } catch (e) {
      push({
        tone: 'warn',
        title: 'Couldn’t connect',
        body: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setConnectBusy(false);
    }
  }

  async function handleDisconnect() {
    try {
      await onDisconnect();
      push({ tone: 'info', title: 'Left the lab' });
    } catch {
      // ignore
    }
  }

  const shellBusy = busy || connectBusy;

  return (
    <div className="min-h-[100dvh] bg-[var(--pom-bg)] text-[var(--pom-ink)]">
      <AppChrome
        bare={bareChrome}
        connected={connected}
        busy={shellBusy}
        onOpenConnect={() => setConnectOpen(true)}
        onDisconnect={() => void handleDisconnect()}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/home"
          element={
            <RequireOnboarded>
              <HomePage onOpenConnect={() => setConnectOpen(true)} />
            </RequireOnboarded>
          }
        />
        <Route
          path="/register"
          element={
            <RequireOnboarded>
              <RegisterPage
                onOpenConnect={() => setConnectOpen(true)}
                onTxFlow={setTxFlow}
              />
            </RequireOnboarded>
          }
        />
        <Route path="/registry" element={<RegistryPage />} />
        <Route
          path="/models/:id"
          element={
            <ModelDetailPage
              onOpenConnect={() => setConnectOpen(true)}
              onTxFlow={setTxFlow}
            />
          }
        />
        <Route
          path="/activity"
          element={
            <RequireOnboarded>
              <ActivityPage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireOnboarded>
              <ProfilePage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireOnboarded>
              <SettingsPage />
            </RequireOnboarded>
          }
        />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/app" element={<Navigate to="/home" replace />} />
        <Route path="/privacy" element={<Navigate to="/help" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!bareChrome ? (
        <footer className="border-t border-[var(--pom-line)] py-8 text-center text-[11px] text-[var(--pom-muted)]">
          Proof of Mind — AI trust registry on Midnight
          {state.showAdvanced && unshieldedAddress ? (
            <span className="mt-2 block font-mono opacity-70">
              Session {unshieldedAddress.slice(0, 8)}…{unshieldedAddress.slice(-4)}
            </span>
          ) : null}
        </footer>
      ) : null}

      <ConnectWalletModal
        open={connectOpen}
        busy={connectBusy}
        onClose={() => setConnectOpen(false)}
        onConnect={() => void handleConnect()}
      />
      <TxFlow flow={txFlow} onClose={() => setTxFlow(idleTxFlow())} />
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <ToastProvider>
        <ProofOfMindProvider>
          <AppShell />
        </ProofOfMindProvider>
      </ToastProvider>
    </ProgressProvider>
  );
}
