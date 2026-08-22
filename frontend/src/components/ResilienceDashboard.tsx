import { useAuthStore } from '../store/auth';
import { useJourneyStore } from '../store/journey';
import { useNetworkStore } from '../store/network';
import { useEffect, useState } from 'react';
import api from '../api';

export default function ResilienceDashboard() {
  const { token } = useAuthStore();
  const { currentStep, saveStatus, lastSavedAt } = useJourneyStore();
  const { online } = useNetworkStore();
  const [authState, setAuthState] = useState<'ACTIVE' | 'EXPIRED' | 'UNAUTHENTICATED'>('UNAUTHENTICATED');

  useEffect(() => {
    if (!token) {
      setAuthState('UNAUTHENTICATED');
      return;
    }
    const interval = setInterval(async () => {
      try {
        await api.get('/auth/validate');
        setAuthState('ACTIVE');
      } catch {
        setAuthState('EXPIRED');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="card" style={{ fontSize: '0.85rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Resilience Dashboard</h3>
      <p style={{ margin: '0.2rem 0' }}><strong>Auth:</strong> {authState}</p>
      <p style={{ margin: '0.2rem 0' }}><strong>Network:</strong> {online ? '🟢 ONLINE' : '🔴 OFFLINE'}</p>
      <p style={{ margin: '0.2rem 0' }}><strong>Step:</strong> {currentStep}</p>
      <p style={{ margin: '0.2rem 0' }}><strong>Autosave:</strong> {saveStatus}</p>
      <p style={{ margin: '0.2rem 0' }}><strong>Last saved:</strong> {lastSavedAt ? lastSavedAt.toLocaleTimeString() : '-'}</p>
    </div>
  );
}
