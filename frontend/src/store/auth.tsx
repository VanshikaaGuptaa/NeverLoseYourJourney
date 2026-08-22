import React from 'react';
import { create } from 'zustand';
import api from '../api';
import type { LoginRequest, LoginResponse } from '../api';

interface AuthState {
  token: string | null;
  user: { email: string; name: string } | null;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

import { persist } from 'zustand/middleware';
import { useJourneyStore } from './journey';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (req) => {
        const { data } = await api.post<LoginResponse>('/auth/login', req);
        set({ token: data.token, user: { email: req.email, name: '' } });
        // After logging in, always try to fetch any existing draft
        useJourneyStore.getState().loadInitial();
      },
      logout: () => {
        set({ token: null, user: null });
        // Optional: clear the journey store when logging out to avoid seeing old data
      },
    }),
    { name: 'auth-storage' }
  )
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
