import { useForm } from 'react-hook-form';
import { useJourneyStore } from '../store/journey';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type FormValues = { aadhar: string; pan: string };

export default function StepIdentity() {
  const { formData, setCurrentStep, updateField, autosave } = useJourneyStore();
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { aadhar: formData.aadhar || '', pan: formData.pan || '' },
  });
  const navigate = useNavigate();

  useEffect(() => { setCurrentStep('IDENTITY'); }, [setCurrentStep]);

  useEffect(() => {
    reset({ aadhar: formData.aadhar || '', pan: formData.pan || '' });
  }, [formData.aadhar, formData.pan, reset]);

  useEffect(() => {
    const sub = watch((value) => {
      Object.entries(value).forEach(([k, v]) => updateField(k, v));
      autosave();
    });
    return () => sub.unsubscribe();
  }, [watch, updateField, autosave]);

  const onSubmit = () => {
    navigate('/step/4');
  };

  return (
    <div className="card">
      <h2>3️⃣ Identity Information</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem' }}>Aadhar No.</label><input className="input" {...register('aadhar')} /></div>
        <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem' }}>PAN No.</label><input className="input" {...register('pan')} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem' }}>
          <button className="button" type="button" onClick={() => navigate('/step/2')} style={{ background: '#555' }}>← Back</button>
          <button className="button" type="submit">Next →</button>
        </div>
      </form>
    </div>
  );
}
