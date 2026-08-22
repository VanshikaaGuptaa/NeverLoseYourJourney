import { create } from 'zustand';
import { useEffect } from 'react';

interface NetworkState {
  online: boolean;
  setOnline: (online: boolean) => void;
}
export const useNetworkStore = create<NetworkState>((set) => ({
  online: navigator.onLine,
  setOnline: (online: boolean) => set({ online }),
}));

export const useNetworkListener = () => {
  const setOnline = useNetworkStore((s) => s.setOnline);
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setOnline]);
};
