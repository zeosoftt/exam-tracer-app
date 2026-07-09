import fs from 'node:fs';
import path from 'node:path';

export type E2eDbState = {
  ready: boolean;
  reason?: string;
};

const CACHE_FILE = path.join(__dirname, '../.cache/db-state.json');

export function readE2eDbState(): E2eDbState {
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(raw) as E2eDbState;
  } catch {
    return { ready: false, reason: 'E2E DB not initialized (run playwright with globalSetup)' };
  }
}

export function writeE2eDbState(state: E2eDbState): void {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(state));
}

export function isE2eDbReady(): boolean {
  return readE2eDbState().ready;
}
