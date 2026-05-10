import api from './api';

export function login(payload: { email: string; password: string }) {
  return api.post('/auth/login', payload);
}

export function register(payload: { username: string; email: string; password: string }) {
  return api.post('/auth/register', payload);
}

export function getCurrentUser() {
  return api.get('/auth/me');
}

export function updateProfile(payload: { displayName?: string; bio?: string }) {
  return api.put('/auth/profile', payload);
}
