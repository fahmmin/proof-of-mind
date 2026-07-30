import { Navigate, Route, Routes } from 'react-router-dom';
import { ProofOfMindProvider } from './context/ProofOfMindContext';
import { LandingPage } from './pages/LandingPage';
import { AppPage } from './pages/AppPage';
import { RegistryPage } from './pages/RegistryPage';

export default function App() {
  return (
    <ProofOfMindProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/registry" element={<RegistryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProofOfMindProvider>
  );
}
