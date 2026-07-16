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

  // AWS S3 Configuration (with development fallbacks to prevent startup crashes)
  AWS_REGION: getEnvVar('AWS_REGION', 'us-east-1'),
  AWS_ACCESS_KEY_ID: getEnvVar('AWS_ACCESS_KEY_ID', 'dev_access_key'),
  AWS_SECRET_ACCESS_KEY: getEnvVar('AWS_SECRET_ACCESS_KEY', 'dev_secret_key'),
  AWS_S3_BUCKET: getEnvVar('AWS_S3_BUCKET', 'dev-resume-bucket'),
  
  // Groq Configuration (with development fallback to prevent startup crashes)
  GROQ_API_KEY: getEnvVar('GROQ_API_KEY', 'mock_groq_key'),
};
