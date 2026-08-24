import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function StepVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOtp } = useAuthStore();
  const state = location.state as { mobile?: string; from?: string } | null;
  const mobile = state?.mobile || '9999999999';
  const from = state?.from || '/step/1';

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<string>('OTP sent – check backend console for the code (demo).');
  const [verifying, setVerifying] = useState(false);

  const verify = async () => {
    setVerifying(true);
    setStatus('Verifying...');
    try {
      // Step 1: verify OTP code
      const { data } = await api.post<boolean>('/otp/verify', { mobile, code });
      if (data) {
        setStatus('✅ OTP verified. Logging in...');
        // Step 2: finalize login and get token, automatically register as trusted for grace period
        await loginWithOtp(mobile, true);
        navigate(from, { replace: true });
      } else {
        setStatus('❌ Invalid code');
      }
    } catch {
      setStatus('Verification error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Enter OTP</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          className="input" 
          placeholder="Enter 6-digit OTP" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
        />
        <button className="button" onClick={verify} disabled={verifying}>
          {verifying ? 'Verifying...' : 'Verify & Login'}
        </button>
      </div>
      <p className="status" style={{ marginTop: '1rem', textAlign: 'center' }}>{status}</p>
    </div>
  );
}
