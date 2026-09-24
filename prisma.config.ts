import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const {
  DATABASE_URL,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME,
} = process.env;

const url =
  DATABASE_URL ??
  `postgresql://${encodeURIComponent(DB_USERNAME ?? '')}:${encodeURIComponent(DB_PASSWORD ?? '')}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url,
  },
});
