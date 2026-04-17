export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  meilisearch: {
    url: process.env.MEILISEARCH_URL || 'http://localhost:7700',
    masterKey: process.env.MEILISEARCH_MASTER_KEY,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  annie: {
    apiUrl: process.env.ANNIE_API_URL,
    apiKey: process.env.ANNIE_API_KEY,
  },
});
