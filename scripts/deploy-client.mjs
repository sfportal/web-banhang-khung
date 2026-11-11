#!/usr/bin/env node
// Deploy website của một khách lên Cloudflare: node scripts/deploy-client.mjs <ma-khach>
// Cần biến môi trường CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (GitHub Actions đã có sẵn trong Secrets).
// Các bước: tạo D1 nếu chưa có → build → áp migration → deploy Worker → đặt secret (nếu có).
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { loadClient, ROOT } from './lib/client.mjs';

const slug = process.argv[2];
if (!slug) { console.error('Cách dùng: node scripts/deploy-client.mjs <ma-khach>'); process.exit(1); }
if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) { console.error('Thiếu CLOUDFLARE_API_TOKEN hoặc CLOUDFLARE_ACCOUNT_ID'); process.exit(1); }
const { client, dir } = loadClient(slug);
const d = client.deploy;
const sh = (cmd, cwd = ROOT, input) => execSync(cmd, { cwd, input, stdio: input ? ['pipe', 'inherit', 'inherit'] : 'inherit' });
const cap = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString();

// 1. Cơ sở dữ liệu D1: dùng ID trong client.json, không có thì tìm theo tên, không thấy thì tạo mới
let id = d.d1_id;
if (!id) {
  const list = JSON.parse(cap('npx wrangler d1 list --json'));
  id = list.find((x) => x.name === d.d1_name)?.uuid;
  if (!id) {
    console.log(`Tạo D1 ${d.d1_name}…`);
    const outTxt = cap(`npx wrangler d1 create ${d.d1_name}`);
    id = (outTxt.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/) || [])[0];
    if (!id) throw new Error('Không đọc được ID D1 vừa tạo:\n' + outTxt);
  }
  // Ghi lại ID để lần sau dùng (workflow sẽ đưa thay đổi này vào nhật ký, cần commit tay nếu chạy trên máy)
  const file = join(dir, 'client.json');
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  raw.deploy.d1_id = id;
  writeFileSync(file, JSON.stringify(raw, null, 2) + '\n');
  console.log(`D1 ${d.d1_name} = ${id} (đã ghi vào clients/${slug}/client.json)`);
}

// 2. Build với ID mới nhất
sh(`node scripts/build-client.mjs ${slug}`);
const out = join(ROOT, '.build', slug);

// 3. Migration rồi deploy
sh(`npx wrangler d1 migrations apply ${d.d1_name} --remote`, out);
sh('npx wrangler deploy', out);

// 4. Secret của Worker: ADMIN_PASSWORD_<MAKHACH> riêng từng khách, không có thì dùng ADMIN_PASSWORD chung
const key = slug.toUpperCase().replace(/-/g, '_');
for (const name of ['ADMIN_PASSWORD', 'APP_SECRET']) {
  const v = process.env[`${name}_${key}`] || process.env[name];
  if (v) sh(`npx wrangler secret put ${name}`, out, v); else console.log(`Bỏ qua ${name}`);
}
console.log(`Đã deploy ${client.brand.name} (${d.worker})${d.site_url ? ' → ' + d.site_url : ''}`);
