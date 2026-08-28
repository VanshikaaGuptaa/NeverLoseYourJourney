import React from 'react';
import { create } from 'zustand';
import api from '../api';
import type { LoginRequest, LoginResponse } from '../api';

interface AuthState {
  token: string | null;
  user: { email: string; name: string } | null;
  sessionExpired: boolean;
  webAuthnEnrolled: boolean;
  login: (req: LoginRequest, skipDeviceToken?: boolean) => Promise<void>;
  loginWithOtp: (mobile: string, email: string, rememberDevice?: boolean) => Promise<void>;
  loginWithWebAuthn: (email: string) => Promise<void>;
  promptWebAuthnRegistration: () => Promise<void>;
  handleSessionExpiry: () => void;
  logout: () => void;
  completeLogout: () => void;
}

import { persist } from 'zustand/middleware';
import { useJourneyStore } from './journey';

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      sessionExpired: false,
      webAuthnEnrolled: false,
      login: async (req, skipDeviceToken = false) => {
        const deviceToken = (!skipDeviceToken && localStorage.getItem('trusted_device_token')) || undefined;
        const { data, status, headers } = await api.post<LoginResponse>('/auth/login', { ...req, deviceToken });
        if (status === 202) {
          if (headers['x-auth-method'] === 'WEBAUTHN') {
            throw new Error('WEBAUTHN_REQUIRED');
          }
          const otp = headers['x-demo-otp'];
          if (otp) {
            console.log(`%c🚀 DEMO OTP RECEIVED: ${otp}`, 'color: #00ff00; font-weight: bold; font-size: 16px');
          }
          throw new Error('OTP_REQUIRED');
        }
        set({ token: data.token, user: { email: req.email, name: '' }, sessionExpired: false });
      },
      loginWithOtp: async (mobile: string, email: string, rememberDevice: boolean = false) => {
        const { data } = await api.post<LoginResponse>('/auth/otp-login', { mobile });
        set({ token: data.token, user: { email, name: '' }, sessionExpired: false, webAuthnEnrolled: false });
        sessionStorage.removeItem('webauthn_prompted');
        
        if (rememberDevice) {
          try {
            const res = await api.post('/auth/trusted-device/register');
            localStorage.setItem('trusted_device_token', res.data);
          } catch (e) {
            console.error('Failed to register trusted device', e);
          }
        }
      },
      promptWebAuthnRegistration: async () => {
        try {
          const { data } = await api.get<{ challenge: string }>('/auth/webauthn/challenge');
          const challengeBuffer = new TextEncoder().encode(data.challenge);
          const userId = new TextEncoder().encode('user-1234');

          const credential = await navigator.credentials.create({
            publicKey: {
              challenge: challengeBuffer,
              rp: { name: "Never Lose Your Journey", id: window.location.hostname },
              user: { id: userId, name: get().user?.email || "user", displayName: get().user?.email || "User" },
              pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
              authenticatorSelection: { userVerification: "required" },
              timeout: 60000
            }
          }) as any;

          if (credential) {
            const clientDataJSON = arrayBufferToBase64Url(credential.response.clientDataJSON);
            const credentialId = arrayBufferToBase64Url(credential.rawId);
            // We just store a mock pub key for demo because actual parsing is complex
            const publicKey = "demo-public-key"; 
            
            await api.post('/auth/webauthn/register', {
              credentialId,
              publicKey,
              clientDataJSON
            });
            set({ webAuthnEnrolled: true });
          }
        } catch (e) {
          console.error("WebAuthn Registration Failed", e);
        }
      },
      loginWithWebAuthn: async (email: string) => {
        try {
          const { data: challengeData } = await api.get<{ challenge: string }>('/auth/webauthn/challenge');
          const challengeBuffer = new TextEncoder().encode(challengeData.challenge);
          
          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge: challengeBuffer,
              rpId: window.location.hostname,
              userVerification: "required",
              timeout: 60000
            }
          }) as any;

          if (assertion) {
            const clientDataJSON = arrayBufferToBase64Url(assertion.response.clientDataJSON);
            const authenticatorData = arrayBufferToBase64Url(assertion.response.authenticatorData);
            const signature = arrayBufferToBase64Url(assertion.response.signature);
            const credentialId = arrayBufferToBase64Url(assertion.rawId);

            const { data } = await api.post<LoginResponse>('/auth/webauthn/verify', {
              credentialId,
              clientDataJSON,
              authenticatorData,
              signature,
              email
            });
            
            set({ token: data.token, user: { email, name: '' }, sessionExpired: false, webAuthnEnrolled: true });
          }
        } catch (e) {
          console.error("WebAuthn Login Failed", e);
          throw new Error('WEBAUTHN_FAILED');
        }
      },
      handleSessionExpiry: () => {
        set({ token: null, sessionExpired: true });
      },
      logout: () => {
        set({ token: null, sessionExpired: false, webAuthnEnrolled: false });
        sessionStorage.removeItem('webauthn_prompted');
      },
      completeLogout: () => {
        set({ token: null, user: null, sessionExpired: false, webAuthnEnrolled: false });
        useJourneyStore.setState({ journeyId: null, currentStep: 'PERSONAL', formData: {} });
        sessionStorage.removeItem('webauthn_prompted');
      }
    }),
    { name: 'auth-storage' }
  )
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
