import { useJourneyStore } from '../store/journey';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function StepUpload() {
  const { setCurrentStep, updateField, autosave } = useJourneyStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => setCurrentStep('UPLOAD'), [setCurrentStep]);

  const onNext = () => {
    const names = files ? Array.from(files).map((f) => f.name) : [];
    updateField('uploadedDocs', names);
    autosave();
    navigate('/step/5');
  };

  return (
    <div className="card">
      <h2>4️⃣ Document Upload</h2>
      <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem' }}>
          <button className="button" type="button" onClick={() => navigate('/step/3')} style={{ background: '#555' }}>← Back</button>
          <button className="button" onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}
