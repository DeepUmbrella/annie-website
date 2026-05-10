import api from './api';

export function submitFeedback(payload: unknown) {
  return api.post('/feedback', payload);
}
