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
  const { token } = useAuthStore();

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

  return (
    <div className="epfo-card">
      <div className="epfo-card-header">
        <h2 className="epfo-card-title">1️⃣ Personal Details</h2>
      </div>
      <div className="epfo-card-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="epfo-form-group">
            <label>Full Name</label>
            <input className="epfo-input" {...register('name')} />
          </div>
          <div className="epfo-form-group">
            <label>Email Address</label>
            <input className="epfo-input" {...register('email')} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <button className="btn-blue" type="submit">Next →</button>
          </div>
        </form>
      </div>
    </div>
  );
}
