import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useJourneyStore } from '../store/journey';
import { useNetworkListener } from '../store/network';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { token, user, logout } = useAuthStore();
  const { currentStep } = useJourneyStore();
  useNetworkListener();

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '50px' }}>
      <header className="epfo-header">
        <div className="epfo-header-left">
          <div className="epfo-logo">
            <span style={{ fontSize: '12px' }}>BWMI</span>
          </div>
          <div>
            <h1 className="epfo-title">BUILD WHAT MOVES INDIA</h1>
            <p className="epfo-subtitle">MINISTRY OF CREATIVE CODING, GOVERNMENT OF DEVELOPERS</p>
          </div>
        </div>
        <div className="epfo-header-right">
          {token && (
            <div className="epfo-user-badge">
              👤 UID: 1234567890<br/>
              {user?.email || 'VANSHIKA GUPTA'}
            </div>
          )}
          <div className="epfo-font-btns">
            <button>A-</button>
            <button>A</button>
            <button>A+</button>
          </div>
          <button 
            onClick={() => setShowHelp(true)} 
            style={{ background: '#00bcd4', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ❓ How to use
          </button>
          {token && (
            <button className="epfo-logout" onClick={logout}>
              ➔ Logout
            </button>
          )}
        </div>
      </header>
      
      <nav className="epfo-navbar">
        <a className="epfo-navbar-item" href="#">🏠 Home</a>
        <a className="epfo-navbar-item" href="#">👁 View</a>
        <a className="epfo-navbar-item" href="#">⚙ Manage</a>
        <a className="epfo-navbar-item" href="#">👤 Account</a>
        <a className="epfo-navbar-item" href="#">🌍 Online Services</a>
        <a className="epfo-navbar-item" href="#">📈 PMVBRY</a>
      </nav>

      {token && (
        <div className="epfo-progress">
          {[
            { id: 'PERSONAL', label: 'Personal', icon: '👤' },
            { id: 'ADDRESS', label: 'Address', icon: '📍' },
            { id: 'IDENTITY', label: 'Identity', icon: '🆔' },
            { id: 'UPLOAD', label: 'Upload', icon: '📎' },
            { id: 'REVIEW', label: 'Review', icon: '👁' },
            { id: 'SUBMIT', label: 'Submit', icon: '✓' }
          ].map((step, index) => {
            const stepOrder = ['PERSONAL', 'ADDRESS', 'IDENTITY', 'UPLOAD', 'REVIEW', 'SUBMIT'];
            const currentIndex = stepOrder.indexOf(currentStep);
            
            let statusClass = '';
            if (index < currentIndex) statusClass = 'active-green'; // Completed
            else if (index === currentIndex) statusClass = 'active-blue'; // Current
            
            return (
              <div className="epfo-progress-step" key={step.id}>
                <div className={`epfo-progress-icon ${statusClass}`}>
                  {index < currentIndex ? '✓' : step.icon}
                </div>
                <div className={`epfo-progress-label ${statusClass}`}>{step.label}</div>
              </div>
            );
          })}
        </div>
      )}

      <main style={{ flex: 1, padding: '20px' }}>
        {children}
      </main>

      <footer className="epfo-footer">
        <div>Fri 21, August 2026 (CPV 1.0.25)</div>
        <div>📞 Contact Us</div>
      </footer>

      {showHelp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <h2 style={{ marginTop: 0, color: '#00695C', borderBottom: '2px solid #00695C', paddingBottom: '10px' }}>📘 Testing Guide & Features</h2>
            
            <h4 style={{ color: '#d32f2f' }}>1. Secure Biometric Authentication</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              <strong>Login:</strong> Enter any UID and password to automatically register. You will be prompted for an OTP.<br/>
              <strong>Check Console:</strong> Press <code>F12</code> to open your Browser DevTools Console. The demo OTP will be printed in green text!<br/>
              <strong>Passkey Enrollment:</strong> After verifying, you are prompted to enroll your device's biometric Passkey (Fingerprint/FaceID).<br/>
              <strong>Seamless Recovery:</strong> If your session expires (try the <em>Expire Auth</em> button), you can instantly resume exactly where you left off by verifying your fingerprint—no more annoying OTPs!<br/>
            </p>

            <h4 style={{ color: '#00bcd4' }}>2. Control Panel Simulator</h4>
            <ul style={{ fontSize: '0.9rem', lineHeight: '1.5', paddingLeft: '20px' }}>
              <li><strong>Expire Auth:</strong> Instantly invalidates your session token. If you click this, any backend request will fail and prompt you to log back in (saving your place).</li>
              <li><strong>Network Fail:</strong> Simulates a lost internet connection. Notice how you can still navigate and type in forms offline!</li>
              <li><strong>Fail Autosave:</strong> Forces the next auto-save attempt to fail. The system will queue your changes and retry automatically.</li>
              <li><strong>Reset All:</strong> Restores your connection and clears the simulation failures.</li>
            </ul>

            <h4 style={{ color: '#2e7d32' }}>3. The Resilience Dashboard</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              Located in the bottom right, this dashboard provides real-time telemetry. Watch the status indicators change from Green to Red when you use the Control Panel, and observe the auto-save queue managing your data!
            </p>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button 
                onClick={() => setShowHelp(false)}
                style={{ background: '#00796B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
