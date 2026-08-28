import axios from 'axios';
import { useAuthStore } from './store/auth';
import { useNetworkStore } from './store/network';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    useNetworkStore.getState().setOnline(true);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().handleSessionExpiry();
    }
    // Set network to offline if we get a 503/504 server error or network timeout (no response)
    if (!error.response || error.response.status === 503 || error.response.status === 504) {
      useNetworkStore.getState().setOnline(false);
    }
    return Promise.reject(error);
  }
);

export default api;

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; expiresInSeconds: number; }
export interface JourneySaveRequest { currentStep: string; formDataJson: string; }
export interface JourneySaveResponse { journeyId: number; status: string; }
export interface OtpRequest { mobile: string; }
export interface OtpResponse { mobile: string; status: string; expiresAtEpochMillis: number; }
export interface OtpVerifyRequest { mobile: string; code: string; }
export interface SubmissionRequest { journeyId: number; transactionId: string; idempotencyKey: string; }
export interface SubmissionResponse { id: number; status: string; }
