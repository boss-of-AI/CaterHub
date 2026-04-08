import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load the .env file from the current directory
dotenv.config({ path: join(__dirname, '.env') });

export default defineConfig({
  datasource: {
    // This will now correctly find ziyan:ziyan123@...
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});