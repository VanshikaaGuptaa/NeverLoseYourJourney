import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/step/1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.message === 'OTP_REQUIRED') {
        navigate('/verify-otp', { state: { email, mobile: '9999999999', from } });
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="epfo-login-container">
      <div className="epfo-login-left">
        <div className="epfo-login-left-header">Dear BWMI Members !!</div>
        <div className="epfo-login-left-body">
          <ul style={{ paddingLeft: '20px', color: '#1976d2' }}>
            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#1976d2' }}>Offline Resilience</a><br/><span style={{ color: '#666', fontSize: '0.8rem' }}>Continue your multi-step journey seamlessly even when the network drops.</span></li>
            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#1976d2' }}>Auto-Save Functionality</a><br/><span style={{ color: '#666', fontSize: '0.8rem' }}>Never lose your progress. All form data is automatically saved locally.</span></li>
            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#1976d2' }}>Session Recovery</a><br/><span style={{ color: '#666', fontSize: '0.8rem' }}>Recover your active session effortlessly after an accidental browser close.</span></li>
            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: '#1976d2' }}>Smart OTP Authentication</a><br/><span style={{ color: '#666', fontSize: '0.8rem' }}>Enjoy a frictionless login experience. Our system remembers your trusted device securely, so you won't be forced to re-enter your OTP again and again if you reconnect during your grace period.</span></li>
          </ul>
          <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
          <h4 style={{ color: '#d32f2f' }}>📢 New Feature Release</h4>
          <p>The new offline sync engine has been successfully deployed to production.</p>
          <p>Your data is now queued and synchronized automatically when you come back online, ensuring zero data loss during network interruptions.</p>
        </div>
      </div>
      <div className="epfo-login-right">
        <div className="epfo-login-card">
          <div className="epfo-login-card-header">Login</div>
          <div className="epfo-login-card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>UID</label>
                <input 
                  type="text" 
                  className="epfo-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Password</label>
                <input 
                  type="password" 
                  className="epfo-input" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="epfo-login-btn" disabled={loading}>
                {loading ? 'Sign in...' : 'Sign in'}
              </button>
              <button type="button" className="epfo-login-btn-blue" disabled={loading}>
                Reset
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85rem' }}>
                <a href="#" style={{ color: '#d32f2f' }}>Forgot Password ?</a>
              </div>
              <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.75rem', color: '#666', background: '#f5f5f5', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
                💡 <strong>Demo Mode:</strong> You do not need to register using any links. Simply enter any made-up UID and password to automatically create an account and log in!
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
