import { create } from 'zustand';
import api from '../api';
import type { JourneySaveRequest, JourneySaveResponse } from '../api';

export type StepKey =
  | 'PERSONAL' | 'ADDRESS' | 'IDENTITY' | 'UPLOAD' | 'REVIEW' | 'SUBMIT';

interface JourneyState {
  journeyId: number | null;
  currentStep: StepKey;
  formData: Record<string, any>;
  saveStatus: 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';
  lastSavedAt: Date | null;
  setCurrentStep: (step: StepKey) => void;
  updateField: (field: string, value: any) => void;
  autosave: () => Promise<void>;
  loadInitial: () => Promise<StepKey | void>;
}

export const useJourneyStore = create<JourneyState>((set, get) => {
  let saveTimeout: any = null;

  const performSave = async () => {
    const { currentStep, formData } = get();
    set({ saveStatus: 'SAVING' });
    try {
      const payload: JourneySaveRequest = {
        currentStep,
        formDataJson: JSON.stringify(formData),
      };
      const { data } = await api.post<JourneySaveResponse>('/journey/save', payload);
      set({ journeyId: data.journeyId, saveStatus: 'SAVED', lastSavedAt: new Date() });
    } catch (e) {
      console.error(e);
      set({ saveStatus: 'ERROR' });
    }
  };

  return {
    journeyId: null,
    currentStep: 'PERSONAL',
    formData: {},
    saveStatus: 'IDLE',
    lastSavedAt: null,
    setCurrentStep: (step) => set({ currentStep: step }),
    updateField: (field, value) =>
      set((s) => ({ formData: { ...s.formData, [field]: value } })),
    autosave: async () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => performSave(), 800);
    },
    loadInitial: async () => {
      try {
        const { data } = await api.get<any>('/journey/latest');
        if (data) {
          const parsed = data.formDataJson ? JSON.parse(data.formDataJson) : {};
          set({
            journeyId: data.id ?? null,
            currentStep: data.currentStep ?? 'PERSONAL',
            formData: parsed,
          });
          return data.currentStep as StepKey;
        } else {
          set({ journeyId: null, currentStep: 'PERSONAL', formData: {} });
          return 'PERSONAL';
        }
      } catch (e) {
        console.warn('No existing draft loaded, keeping local state', e);
        return get().currentStep;
      }
    },
  };
});
