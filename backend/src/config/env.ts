import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const getEnvVar = (name: string, fallback?: string): string => {
  const value = process.env[name] || fallback;
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is missing. Please check your .env configuration.`);
  }
  return value;
};

export const env = {
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  
  // Rate Limiting Config
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutes
  RATE_LIMIT_MAX: parseInt(getEnvVar('RATE_LIMIT_MAX', '100'), 10),
  
  AUTH_RATE_LIMIT_WINDOW_MS: parseInt(getEnvVar('AUTH_RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutes
  AUTH_RATE_LIMIT_MAX: parseInt(getEnvVar('AUTH_RATE_LIMIT_MAX', '15'), 10),
};
