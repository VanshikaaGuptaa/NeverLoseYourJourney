import { useJourneyStore } from '../store/journey';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function StepReview() {
  const { setCurrentStep, formData } = useJourneyStore();
  const navigate = useNavigate();

  useEffect(() => setCurrentStep('REVIEW'), [setCurrentStep]);

  return (
    <div className="card">
      <h2>5️⃣ Review</h2>
      <div style={{ background: 'var(--color-background)', padding: '1.5rem', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <strong style={{ color: 'var(--color-muted)' }}>Name</strong> <span>{formData.name || 'N/A'}</span>
          <strong style={{ color: 'var(--color-muted)' }}>Email</strong> <span>{formData.email || 'N/A'}</span>
          <strong style={{ color: 'var(--color-muted)' }}>Mobile</strong> <span>{formData.mobile || 'N/A'}</span>
        </div>

        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>Address Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <strong style={{ color: 'var(--color-muted)' }}>Street</strong> <span>{formData.address || 'N/A'}</span>
          <strong style={{ color: 'var(--color-muted)' }}>City</strong> <span>{formData.city || 'N/A'}</span>
          <strong style={{ color: 'var(--color-muted)' }}>ZIP Code</strong> <span>{formData.zip || 'N/A'}</span>
        </div>

        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>Identity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <strong style={{ color: 'var(--color-muted)' }}>Aadhar</strong> <span>{formData.aadhar || 'N/A'}</span>
          <strong style={{ color: 'var(--color-muted)' }}>PAN</strong> <span>{formData.pan || 'N/A'}</span>
        </div>

        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>Documents</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
          <strong style={{ color: 'var(--color-muted)' }}>Uploaded</strong> 
          <span>
            {formData.uploadedDocs && formData.uploadedDocs.length > 0 
              ? formData.uploadedDocs.join(', ') 
              : 'None'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem' }}>
        <button className="button" type="button" onClick={() => navigate('/step/4')} style={{ background: '#555' }}>← Back</button>
        <button className="button" onClick={() => navigate('/step/6')}>Proceed to Submit →</button>
      </div>
    </div>
  );
}
