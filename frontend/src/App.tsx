import { useEffect } from 'react';
import { useJourneyStore } from './store/journey';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import StepPersonal from './components/StepPersonal';
import StepAddress from './components/StepAddress';
import StepIdentity from './components/StepIdentity';
import StepUpload from './components/StepUpload';
import StepReview from './components/StepReview';
import StepVerification from './components/StepVerification';
import StepSubmit from './components/StepSubmit';
import ResilienceDashboard from './components/ResilienceDashboard';
import ControlPanel from './components/ControlPanel';
import { AuthProvider } from './store/auth';

// Shared TanStack Query client for the whole app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main application entry point.
 * - AuthProvider wraps the app for mock authentication.
 * - QueryClientProvider supplies React‑Query.
 * - Layout provides a consistent header & container.
 * - Routes define each wizard step.
 * - ResilienceDashboard & ControlPanel are always visible.
 */
import Login from './components/Login';
import { useAuthStore } from './store/auth';
import { useLocation } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

import { useNavigate } from 'react-router-dom';

const stepToPath: Record<string, string> = {
  PERSONAL: '/step/1',
  ADDRESS: '/step/2',
  IDENTITY: '/step/3',
  UPLOAD: '/step/4',
  REVIEW: '/step/5',
  SUBMIT: '/step/6',
};

export default function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Run exactly once on mount, using getState to avoid subscribing to store changes
    useJourneyStore.getState().loadInitial().then((step) => {
      if (step && stepToPath[step]) {
        navigate(stepToPath[step], { replace: true });
      }
    });
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/step/1" replace />} />
            <Route path="/login" element={<Login />} />
            {/* Protected Steps */}
            <Route path="/step/1" element={<ProtectedRoute><StepPersonal /></ProtectedRoute>} />
            <Route path="/step/2" element={<ProtectedRoute><StepAddress /></ProtectedRoute>} />
            <Route path="/step/3" element={<ProtectedRoute><StepIdentity /></ProtectedRoute>} />
            <Route path="/step/4" element={<ProtectedRoute><StepUpload /></ProtectedRoute>} />
            <Route path="/step/5" element={<ProtectedRoute><StepReview /></ProtectedRoute>} />
            <Route path="/step/6" element={<ProtectedRoute><StepSubmit /></ProtectedRoute>} />
          </Routes>
          
          <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1000 }}>
            <ControlPanel />
            <ResilienceDashboard />
          </div>
        </Layout>
      </QueryClientProvider>
    </AuthProvider>
  );
}
