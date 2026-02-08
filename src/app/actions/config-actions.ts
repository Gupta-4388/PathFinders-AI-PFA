'use server';

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Checks if Adzuna API credentials are configured in the environment.
 * Only returns a boolean to avoid exposing keys to the client.
 */
export async function isAdzunaConfigured() {
  return !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY);
}

/**
 * Stores Adzuna API credentials securely in the .env file.
 * This ensures they are only available on the server and not exposed to the client.
 */
export async function saveAdzunaConfig(appId: string, apiKey: string) {
  const envPath = path.join(process.cwd(), '.env');
  let content = '';
  
  try {
    content = await fs.readFile(envPath, 'utf8');
  } catch (e) {
    // .env might not exist yet
  }

  const lines = content.split('\n');
  // Remove existing entries to avoid duplicates and filter out empty lines
  const filtered = lines.filter(l => 
    !l.startsWith('ADZUNA_APP_ID=') && 
    !l.startsWith('ADZUNA_API_KEY=') && 
    l.trim() !== ''
  );
  
  filtered.push(`ADZUNA_APP_ID=${appId}`);
  filtered.push(`ADZUNA_API_KEY=${apiKey}`);

  await fs.writeFile(envPath, filtered.join('\n'), 'utf8');
  
  // Update process.env for immediate access in the current server-side session
  process.env.ADZUNA_APP_ID = appId;
  process.env.ADZUNA_API_KEY = apiKey;
  
  return { success: true };
}
