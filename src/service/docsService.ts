import api from './api';

export function searchDocs(query: string) {
  return api.get('/docs/search', { params: { q: query } });
}
