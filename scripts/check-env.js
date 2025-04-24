#!/usr/bin/env node

/**
 * This script checks if all required environment variables are set.
 * It's meant to be run during the build process to prevent builds with missing env vars.
 */

const requiredEnvVars = [
  'GEMINI_API_KEY',
];

const warnings = [];
const errors = [];

// Check for required environment variables
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    errors.push(`Missing required environment variable: ${envVar}`);
  }
});

// Optional but recommended environment variables
if (!process.env.NEXT_PUBLIC_APP_URL) {
  warnings.push('NEXT_PUBLIC_APP_URL is not set. Some features may not work correctly.');
}

// Print warnings and errors
if (warnings.length > 0) {
  console.warn('\n⚠️  Warnings:');
  warnings.forEach(warning => console.warn(`  - ${warning}`));
}

if (errors.length > 0) {
  console.error('\n❌ Errors:');
  errors.forEach(error => console.error(`  - ${error}`));
  console.error('\nPlease set the required environment variables and try again.');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n✅ All required environment variables are set, but there are warnings.');
} else {
  console.log('\n✅ All environment variables are properly set.');
}