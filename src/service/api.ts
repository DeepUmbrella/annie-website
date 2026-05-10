import axios, { AxiosHeaders } from 'axios';

const API_PREFIX = '/api/v1';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

const apiOrigin = trimTrailingSlash((import.meta.env.VITE_API_URL as string | undefined) || '');

export const apiBaseUrl = `${apiOrigin}${API_PREFIX}`;

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (!token) return config;

  const headers = AxiosHeaders.from(config.headers);
  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;
  return config;
});

export default api;
