import { defineConfig } from 'prisma/config';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://annie:placeholder@localhost:5432/annie_db?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: DATABASE_URL,
  },
});
