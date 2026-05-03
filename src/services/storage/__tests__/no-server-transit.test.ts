// Backups must never go through any server we control.
// This test fails the build if anything under src/services/storage/
// references /api/feedback.js — that endpoint exists for the
// ManagerSubmissionForm Google Forms pipe, NOT for backup transit.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (full.endsWith('.ts') || full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

describe('storage isolation from feedback transit', () => {
  it('no file under src/services/storage references /api/feedback.js', () => {
    const storageDir = join(process.cwd(), 'src', 'services', 'storage');
    const files = walk(storageDir);
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      if (text.includes('/api/feedback') || /feedback\.js/.test(text)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
