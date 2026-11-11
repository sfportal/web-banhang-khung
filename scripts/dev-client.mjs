#!/usr/bin/env node
// Chạy thử website của một khách trên máy: node scripts/dev-client.mjs <ma-khach>
// Dựng .build/<ma-khach>, tạo D1 cục bộ, rồi mở wrangler dev ở http://localhost:8787
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { existsSync, copyFileSync } from 'node:fs';
import { loadClient, ROOT } from './lib/client.mjs';

const slug = process.argv[2];
if (!slug) { console.error('Cách dùng: node scripts/dev-client.mjs <ma-khach>'); process.exit(1); }
const { client } = loadClient(slug);
execSync(`node scripts/build-client.mjs ${slug}`, { cwd: ROOT, stdio: 'inherit' });
const out = join(ROOT, '.build', slug);
if (existsSync(join(ROOT, '.dev.vars'))) copyFileSync(join(ROOT, '.dev.vars'), join(out, '.dev.vars'));
execSync(`npx wrangler d1 migrations apply ${client.deploy.d1_name} --local`, { cwd: out, stdio: 'inherit' });
execSync('npx wrangler dev', { cwd: out, stdio: 'inherit' });
