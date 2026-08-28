import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';

export default function WebAuthnEnrollment() {
  const { token, webAuthnEnrolled, promptWebAuthnRegistration } = useAuthStore();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log('WebAuthnEnrollment check:', { token: !!token, webAuthnEnrolled, prompted: sessionStorage.getItem('webauthn_prompted') });

  useEffect(() => {
    // Only show if user is logged in, not enrolled, and we haven't shown it yet in this session
    if (token && !webAuthnEnrolled && !sessionStorage.getItem('webauthn_prompted')) {
      // Delay prompt slightly so it doesn't jar the user immediately after login
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [token, webAuthnEnrolled]);

  const handleEnroll = async () => {
    setLoading(true);
    await promptWebAuthnRegistration();
    setLoading(false);
    setShow(false);
    sessionStorage.setItem('webauthn_prompted', 'true');
  };

  const handleSkip = () => {
    setShow(false);
    sessionStorage.setItem('webauthn_prompted', 'true');
  };

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', margin: '20px' }}>
        <h3 style={{ marginTop: 0, color: '#1976d2' }}>Enable quick secure recovery?</h3>
        <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '20px' }}>
          Use your device's built-in verification (like Fingerprint, Face ID, or Windows Hello) to securely resume your application if your session expires.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="button" 
            onClick={handleEnroll} 
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', background: '#1976d2', color: 'white', border: 'none' }}
          >
            {loading ? 'Enrolling...' : 'Enable'}
          </button>
          <button 
            className="button" 
            onClick={handleSkip} 
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', background: '#f5f5f5', color: '#555', border: '1px solid #ddd' }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
