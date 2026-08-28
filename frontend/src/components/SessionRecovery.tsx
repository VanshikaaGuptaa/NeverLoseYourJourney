import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useJourneyStore } from '../store/journey';
import { useNavigate } from 'react-router-dom';

const stepIndexMap: Record<string, number> = {
  PERSONAL: 1,
  ADDRESS: 2,
  IDENTITY: 3,
  UPLOAD: 4,
  REVIEW: 5,
  SUBMIT: 6,
};

export default function SessionRecovery() {
  const { user, loginWithWebAuthn, completeLogout, sessionExpired } = useAuthStore();
  const { currentStep } = useJourneyStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyAndResume = async () => {
    setLoading(true);
    try {
      await loginWithWebAuthn(user?.email || 'verified');
      // On success, it sets token and sessionExpired to false, triggering App.tsx to redirect
    } catch (e) {
      alert("Verification failed or cancelled.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpFallback = async () => {
    try {
      await useAuthStore.getState().login({ email: user?.email || '' } as any, true);
    } catch (e: any) {
      if (e.message === 'OTP_REQUIRED') {
        navigate('/verify-otp', { state: { email: user?.email, mobile: '9999999999', from: '/step/' + stepIndexMap[currentStep] } });
      } else {
        alert("Could not request OTP. Please login again.");
      }
    }
  };

  const handleCancel = () => {
    completeLogout();
    navigate('/login');
  };

  const stepNumber = stepIndexMap[currentStep] || 1;

  if (!sessionExpired) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#d32f2f' }}>
          <span>🔒</span> Session expired
        </h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Your session ended to protect your account.</p>
        
        <div style={{ textAlign: 'left', background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <div style={{ color: '#2e7d32', fontWeight: 'bold', marginBottom: '0.5rem' }}>✓ Your application is safely saved</div>
          <div style={{ color: '#2e7d32', fontWeight: 'bold', marginBottom: '1rem' }}>✓ You can continue from where you stopped</div>
          
          <div style={{ fontSize: '0.9rem', color: '#555' }}>
            You were on:<br/>
            <strong>Step {stepNumber} of 6</strong>
          </div>
        </div>

        <button 
          className="button" 
          onClick={handleVerifyAndResume} 
          disabled={loading}
          style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem', marginBottom: '0.5rem', background: '#1976d2', color: 'white' }}
        >
          {loading ? 'Verifying...' : 'Verify & Resume'}
        </button>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '2rem' }}>
          Use your device's secure verification to continue quickly.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #ddd', marginBottom: '1.5rem' }} />
        
        <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>Other options</p>
        
        <button 
          className="button" 
          onClick={handleOtpFallback} 
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', background: '#fff', color: '#1976d2', border: '1px solid #1976d2' }}
        >
          Verify using OTP
        </button>

        <button 
          className="button" 
          onClick={handleCancel} 
          style={{ width: '100%', padding: '0.6rem', background: 'transparent', color: '#d32f2f', border: 'none' }}
        >
          Cancel and Logout
        </button>
      </div>
    </div>
  );
}
