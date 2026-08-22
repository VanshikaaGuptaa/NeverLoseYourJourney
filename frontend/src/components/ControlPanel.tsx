import api from '../api';
import { useState } from 'react';

export default function ControlPanel() {
  const [msg, setMsg] = useState('');

  const trigger = async (url: string, label: string) => {
    setMsg(`Calling ${label}…`);
    try {
      await api.post(url);
      setMsg(`${label} triggered`);
    } catch (e) {
      setMsg(`Error: ${label}`);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="card" style={{ fontSize: '0.85rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Control Panel</h3>
      <button className="button" style={{ display: 'block', width: '100%', marginBottom: '0.4rem', padding: '0.4rem' }} onClick={() => trigger('/control/expire-auth', 'Expire Auth')}>Expire Auth</button>
      <button className="button" style={{ display: 'block', width: '100%', marginBottom: '0.4rem', padding: '0.4rem' }} onClick={() => trigger('/control/network-failure', 'Network Fail')}>Network Fail</button>
      <button className="button" style={{ display: 'block', width: '100%', marginBottom: '0.4rem', padding: '0.4rem' }} onClick={() => trigger('/control/fail-next-autosave', 'Fail Autosave')}>Fail Autosave</button>
      <button className="button" style={{ display: 'block', width: '100%', marginBottom: '0.4rem', padding: '0.4rem' }} onClick={() => trigger('/control/reset', 'Reset Flags')}>Reset All</button>
      {msg && <p className="status" style={{ margin: '0' }}>{msg}</p>}
    </div>
  );
}
