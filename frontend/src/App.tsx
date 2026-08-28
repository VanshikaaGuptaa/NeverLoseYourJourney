import { useEffect, useState } from 'react';
import { useJourneyStore } from './store/journey';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import SessionRecovery from './components/SessionRecovery';
import { AuthProvider, useAuthStore } from './store/auth';
import Login from './components/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, initialLoaded }: { children: React.ReactNode, initialLoaded?: boolean }) {
  const { token, sessionExpired } = useAuthStore();
  const location = useLocation();

  if (!token) {
    if (sessionExpired) {
      return <SessionRecovery />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (initialLoaded === false) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading your journey...</div>;
  }
  
  return <>{children}</>;
}

const stepToPath: Record<string, string> = {
  PERSONAL: '/step/1',
  ADDRESS: '/step/2',
  IDENTITY: '/step/3',
  UPLOAD: '/step/4',
  REVIEW: '/step/5',
  SUBMIT: '/step/6',
};

import WebAuthnEnrollment from './components/WebAuthnEnrollment';

export default function App() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [initialLoaded, setInitialLoaded] = useState(false);
  
  useEffect(() => {
    if (token && !initialLoaded) {
      useJourneyStore.getState().loadInitial().then((step) => {
        if (step && stepToPath[step]) {
          navigate(stepToPath[step], { replace: true });
        }
        setInitialLoaded(true);
      });
    } else if (!token) {
      setInitialLoaded(false);
    }
  }, [token, navigate, initialLoaded]);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <WebAuthnEnrollment />
          <Routes>
            <Route path="/" element={<Navigate to="/step/1" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<StepVerification />} />
            {/* Protected Steps */}
            <Route path="/step/1" element={<ProtectedRoute initialLoaded={initialLoaded}><StepPersonal /></ProtectedRoute>} />
            <Route path="/step/2" element={<ProtectedRoute initialLoaded={initialLoaded}><StepAddress /></ProtectedRoute>} />
            <Route path="/step/3" element={<ProtectedRoute initialLoaded={initialLoaded}><StepIdentity /></ProtectedRoute>} />
            <Route path="/step/4" element={<ProtectedRoute initialLoaded={initialLoaded}><StepUpload /></ProtectedRoute>} />
            <Route path="/step/5" element={<ProtectedRoute initialLoaded={initialLoaded}><StepReview /></ProtectedRoute>} />
            <Route path="/step/6" element={<ProtectedRoute initialLoaded={initialLoaded}><StepSubmit /></ProtectedRoute>} />
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
