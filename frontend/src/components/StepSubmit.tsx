import { useJourneyStore } from '../store/journey';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { SubmissionRequest } from '../api';

export default function StepSubmit() {
  const { setCurrentStep, journeyId } = useJourneyStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('Ready to submit');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [txId] = useState(() => `tx-${Math.random().toString(36).substr(2, 9)}`);
  const [idemKey] = useState(() => `idem-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => setCurrentStep('SUBMIT'), [setCurrentStep]);

  const submit = async () => {
    if (!journeyId) {
      setStatus('No journey to submit');
      return;
    }
    const payload: SubmissionRequest = {
      journeyId,
      transactionId: txId,
      idempotencyKey: idemKey,
    };
    setStatus('Submitting…');
    try {
      const { data } = await api.post<SubmissionRequest>('/submission', payload);
      setSubmitted(true);
      setStatus(`✅ Submission status: ${data.status}`);
    } catch (e) {
      setStatus('⚠️ Submission failed – in a real app, we would queue this and retry.');
    }
  };

  return (
    <div className="card">
      <h2>6️⃣ Submit Application</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem' }}>
        <button className="button" type="button" onClick={() => navigate('/step/5')} disabled={submitted} style={{ background: '#555' }}>← Back</button>
        <button className="button" onClick={submit} disabled={submitted}>Submit</button>
      </div>
      <p className="status" style={{ marginTop: '1rem' }}>{status}</p>
    </div>
  );
}
