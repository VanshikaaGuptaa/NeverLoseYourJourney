import { useState, useEffect } from 'react';
import { useJourneyStore } from '../store/journey';
import api from '../api';
import type { OtpRequest, OtpVerifyRequest } from '../api';
import { useNavigate } from 'react-router-dom';

export default function StepVerification() {
  const { setCurrentStep } = useJourneyStore();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('9999999999');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => setCurrentStep('VERIFICATION'), [setCurrentStep]);

  const requestOtp = async () => {
    setStatus('Sending OTP...');
    try {
      await api.post<OtpRequest>('/otp/request', { mobile });
      setSent(true);
      setStatus('OTP sent – check backend console for the code (demo).');
    } catch (e) {
      setStatus('Failed to send OTP');
    }
  };

  const verify = async () => {
    setStatus('Verifying...');
    try {
      const { data } = await api.post<OtpVerifyRequest>('/otp/verify', { mobile, code });
      if (data) {
        setVerified(true);
        setStatus('✅ OTP verified');
        setTimeout(() => navigate('/step/7'), 1000);
      } else {
        setStatus('❌ Invalid code');
      }
    } catch {
      setStatus('Verification error');
    }
  };

  return (
    <div className="card">
      <h2>6️⃣ OTP Verification</h2>
      {!sent ? (
        <button className="button" onClick={requestOtp}>Request OTP</button>
      ) : (
        <>
          <input className="input" placeholder="Enter OTP" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="button" style={{ marginTop: '0.5rem' }} onClick={verify}>Verify</button>
        </>
      )}
      <p className="status" style={{ marginTop: '1rem' }}>{status}</p>
    </div>
  );
}
