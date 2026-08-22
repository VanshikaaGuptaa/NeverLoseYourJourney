import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJourneyStore } from '../store/journey';
import { useNetworkListener } from '../store/network';

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStep } = useJourneyStore();
  // Navigation is now handled smoothly by React Router and App.tsx boot sequence

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useNetworkListener();

  return (
    <div className="container">
      <header className="card">
        <h1>Never Lose Your Journey</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
