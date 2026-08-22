import { useForm } from 'react-hook-form';
import { useJourneyStore } from '../store/journey';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';

type FormValues = { name: string; email: string };

export default function StepPersonal() {
  const { formData, setCurrentStep, updateField, autosave } = useJourneyStore();
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { name: formData.name || '', email: formData.email || '' },
  });
  const navigate = useNavigate();
  const { login, token } = useAuthStore();

  useEffect(() => { setCurrentStep('PERSONAL'); }, [setCurrentStep]);

  useEffect(() => {
    reset({ name: formData.name || '', email: formData.email || '' });
  }, [formData.name, formData.email, reset]);

  useEffect(() => {
    const sub = watch((value) => {
      Object.entries(value).forEach(([k, v]) => updateField(k, v));
      autosave();
    });
    return () => sub.unsubscribe();
  }, [watch, updateField, autosave]);

  const onSubmit = () => {
    navigate('/step/2');
  };

  const handleDemoLogin = async () => {
    await login({ email: 'user@example.com', password: 'password' });
  };

  return (
    <div className="card">
      {!token && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,200,0,0.1)', borderRadius: '8px' }}>
          <p>⚠️ You are not authenticated. Data won't be saved on the server.</p>
          <button type="button" className="button" onClick={handleDemoLogin}>Login (Demo User)</button>
        </div>
      )}
      <h2>1️⃣ Personal Details</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
          <input className="input" {...register('name')} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input className="input" {...register('email')} />
        </div>
        <button className="button" type="submit">Next →</button>
      </form>
    </div>
  );
}
