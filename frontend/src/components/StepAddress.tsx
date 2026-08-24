import { useForm } from 'react-hook-form';
import { useJourneyStore } from '../store/journey';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type FormValues = { street: string; city: string };

export default function StepAddress() {
  const { formData, setCurrentStep, updateField, autosave } = useJourneyStore();
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { street: formData.street || '', city: formData.city || '' },
  });
  const navigate = useNavigate();

  useEffect(() => { setCurrentStep('ADDRESS'); }, [setCurrentStep]);

  useEffect(() => {
    reset({ street: formData.street || '', city: formData.city || '' });
  }, [formData.street, formData.city, reset]);

  useEffect(() => {
    const sub = watch((value) => {
      Object.entries(value).forEach(([k, v]) => updateField(k, v));
      autosave();
    });
    return () => sub.unsubscribe();
  }, [watch, updateField, autosave]);

  const onSubmit = () => navigate('/step/3');

  return (
    <div className="epfo-card">
      <div className="epfo-card-header">
        <h2 className="epfo-card-title">2️⃣ Address Details</h2>
      </div>
      <div className="epfo-card-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="epfo-form-group">
            <label>Street Address</label>
            <input className="epfo-input" {...register('street')} />
          </div>
          <div className="epfo-form-group">
            <label>City</label>
            <input className="epfo-input" {...register('city')} />
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="btn-blue" type="button" onClick={() => navigate('/step/1')}>← Back</button>
            <button className="btn-green" type="submit">Next →</button>
          </div>
        </form>
      </div>
    </div>
  );
}
