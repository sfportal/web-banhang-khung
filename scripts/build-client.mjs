#!/usr/bin/env node
// Dựng website cho một khách: node scripts/build-client.mjs <ma-khach> [--no-build]
// 1. Chép mã chung (src, public, migrations…) vào .build/<ma-khach>/
// 2. Đè lên bằng clients/<ma-khach>/public và clients/<ma-khach>/overrides (file riêng của khách)
// 3. Sinh src/client.config.js, migrations/0002_seed.sql, wrangler.jsonc, astro.config.mjs
// 4. Chạy astro build trong thư mục đó (trừ khi có --no-build)
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, cpSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { loadClient, ROOT } from './lib/client.mjs';
import { productsCsvToSql, settingsSql } from './lib/seed.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
if (!slug) { console.error('Cách dùng: node scripts/build-client.mjs <ma-khach> [--no-build]'); process.exit(1); }
const noBuild = args.includes('--no-build');

const { client, dir } = loadClient(slug);
const out = join(ROOT, '.build', slug);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1. Mã chung
for (const p of ['src', 'public', 'migrations', 'scripts', 'package.json', 'CHANGELOG.md']) cpSync(join(ROOT, p), join(out, p), { recursive: true });
symlinkSync(join(ROOT, 'node_modules'), join(out, 'node_modules'), 'dir');

// 2. Phần riêng của khách
if (existsSync(join(dir, 'public'))) cpSync(join(dir, 'public'), join(out, 'public'), { recursive: true });
if (existsSync(join(dir, 'overrides'))) cpSync(join(dir, 'overrides'), out, { recursive: true });

// 3. Tệp sinh ra
writeFileSync(join(out, 'src/client.config.js'), `// Tự sinh từ clients/${slug}/client.json, không sửa tay.\nexport default ${JSON.stringify(client, null, 2)};\n`);

const seedFile = join(dir, 'seed.sql');
let seed;
if (existsSync(seedFile)) seed = readFileSync(seedFile, 'utf8');
else {
  seed = `-- Tự sinh từ clients/${slug}/client.json${existsSync(join(dir, 'products.csv')) ? ' và products.csv' : ''}\n` + settingsSql(client);
  if (existsSync(join(dir, 'products.csv'))) seed += productsCsvToSql(readFileSync(join(dir, 'products.csv'), 'utf8'));
}
writeFileSync(join(out, 'migrations/0002_seed.sql'), seed);

const d = client.deploy;
const wrangler = {
  name: d.worker,
  main: './src/worker.js',
  compatibility_date: '2026-11-01',
  compatibility_flags: ['nodejs_compat'],
  assets: { directory: './dist/client', binding: 'ASSETS' },
  d1_databases: [{ binding: 'DB', database_name: d.d1_name, database_id: d.d1_id || '00000000-0000-0000-0000-000000000000', migrations_dir: 'migrations' }],
  ...(d.thuchi_service ? { services: [{ binding: 'THUCHI', service: d.thuchi_service }] } : {}),
  triggers: { crons: ['*/5 * * * *'] },
  vars: { SITE_URL: d.site_url || '', CLIENT_SLUG: slug },
  ...(d.routes?.length ? { routes: d.routes } : {}),
};
writeFileSync(join(out, 'wrangler.jsonc'), `// Tự sinh bởi scripts/build-client.mjs cho khách ${slug}\n` + JSON.stringify(wrangler, null, 2) + '\n');
const astroCfg = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8').replace(/site: '[^']*'/, `site: '${d.site_url || 'https://example.com'}'`);
writeFileSync(join(out, 'astro.config.mjs'), astroCfg);

console.log(`Đã chuẩn bị .build/${slug} (${client.brand.name})`);
if (!noBuild) {
  execSync('npm run build', { cwd: out, stdio: 'inherit', env: { ...process.env, CLIENT_SLUG: slug } });
  console.log(`Build xong: .build/${slug}/dist`);
}
