import api, { buildApiUrl } from './api';

export function getChatSessions() {
  return api.get('/chat/sessions');
}

export function createChatSession(payload: { title: string }) {
  return api.post('/chat/sessions', payload);
}

export function buildChatStreamUrl(sessionId: string): string {
  return buildApiUrl(`/chat/${sessionId}/stream`);
}
