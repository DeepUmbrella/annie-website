import api from './api';

export function getBlogPosts() {
  return api.get('/blog/posts');
}

export function getBlogPost(slug: string) {
  return api.get(`/blog/posts/${slug}`);
}
