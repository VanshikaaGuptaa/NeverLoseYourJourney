import React from 'react';
import { create } from 'zustand';
import api from '../api';
import type { LoginRequest, LoginResponse } from '../api';

interface AuthState {
  token: string | null;
  user: { email: string; name: string } | null;
  login: (req: LoginRequest) => Promise<void>;
  loginWithOtp: (mobile: string, rememberDevice?: boolean) => Promise<void>;
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
        // Automatically inject the trusted device token from localStorage if it exists
        const deviceToken = localStorage.getItem('trusted_device_token') || undefined;
        const { data, status, headers } = await api.post<LoginResponse>('/auth/login', { ...req, deviceToken });
        if (status === 202) {
          const otp = headers['x-demo-otp'];
          if (otp) {
            console.log(`%c🚀 DEMO OTP RECEIVED: ${otp}`, 'color: #00ff00; font-weight: bold; font-size: 16px');
          }
          throw new Error('OTP_REQUIRED');
        }
        set({ token: data.token, user: { email: req.email, name: '' } });
        useJourneyStore.getState().loadInitial();
      },
      loginWithOtp: async (mobile: string, rememberDevice: boolean = false) => {
        const { data } = await api.post<LoginResponse>('/auth/otp-login', { mobile });
        set({ token: data.token, user: { email: 'verified', name: '' } });
        
        // If user gave consent to remember this device (or grace period is automatic), register it with the backend
        if (rememberDevice) {
          try {
            const res = await api.post('/auth/trusted-device/register');
            localStorage.setItem('trusted_device_token', res.data);
          } catch (e) {
            console.error('Failed to register trusted device', e);
          }
        }
        
        useJourneyStore.getState().loadInitial();
      },
      logout: () => {
        set({ token: null, user: null });
        // Let the backend device token persist so they can login smoothly again, unless they explicitly revoke it.
      },
    }),
    { name: 'auth-storage' }
  )
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
