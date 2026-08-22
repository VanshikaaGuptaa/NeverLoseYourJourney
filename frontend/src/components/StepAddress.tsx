import { useForm } from 'react-hook-form';
import { useJourneyStore } from '../store/journey';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type FormValues = { address: string; city: string; zip: string };

export default function StepAddress() {
  const { formData, setCurrentStep, updateField, autosave } = useJourneyStore();
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { address: formData.address || '', city: formData.city || '', zip: formData.zip || '' },
  });
  const navigate = useNavigate();

  useEffect(() => { setCurrentStep('ADDRESS'); }, [setCurrentStep]);

  useEffect(() => {
    reset({ address: formData.address || '', city: formData.city || '', zip: formData.zip || '' });
  }, [formData.address, formData.city, formData.zip, reset]);

  useEffect(() => {
    const sub = watch((value) => {
      Object.entries(value).forEach(([k, v]) => updateField(k, v));
      autosave();
    });
    return () => sub.unsubscribe();
  }, [watch, updateField, autosave]);

  const onSubmit = () => {
    navigate('/step/3');
  };

  return (
    <div className="card">
      <h2>2️⃣ Address</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem' }}>Street</label><input className="input" {...register('address')} /></div>
        <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem' }}>City</label><input className="input" {...register('city')} /></div>
        <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem' }}>ZIP</label><input className="input" {...register('zip')} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem' }}>
          <button className="button" type="button" onClick={() => navigate('/step/1')} style={{ background: '#555' }}>← Back</button>
          <button className="button" type="submit">Next →</button>
        </div>
      </form>
    </div>
  );
}
