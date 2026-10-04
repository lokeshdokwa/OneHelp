import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: isTest
    ? z.string().default('postgresql://postgres:postgres@localhost:5432/onehelp_test?schema=public')
    : z.string({ required_error: 'DATABASE_URL is required' }),
  JWT_SECRET: isTest
    ? z.string().default('test-jwt-secret-ci-fallback')
    : z.string({ required_error: 'JWT_SECRET is required' }),
  JWT_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGINS: z.string().default('*'),
  DEMO_MODE: z.string().transform((v) => v === 'true').default('true'),
});

export const env = envSchema.parse(process.env);
