#!/usr/bin/env node
// Kiểm tra mọi clients/*/client.json (kể cả khách mẫu) và in danh sách khách cho GitHub Actions.
// node scripts/check-clients.mjs            → kiểm tra, in bảng
// node scripts/check-clients.mjs --matrix   → in JSON danh sách khách (kể cả _mau) để build thử
// node scripts/check-clients.mjs --deploy   → in JSON danh sách khách có deploy.enabled = true
import { listClients, loadClient } from './lib/client.mjs';

const all = listClients({ includeTemplate: true });
let bad = 0;
const rows = all.map((slug) => {
  try { const { client } = loadClient(slug); return { slug, ok: true, client }; } catch (e) { bad++; return { slug, ok: false, error: e.message }; }
});
if (process.argv.includes('--matrix')) { console.log(JSON.stringify(rows.filter((r) => r.ok).map((r) => r.slug))); process.exit(bad ? 1 : 0); }
if (process.argv.includes('--deploy')) { console.log(JSON.stringify(rows.filter((r) => r.ok && r.client.deploy?.enabled).map((r) => r.slug))); process.exit(bad ? 1 : 0); }
for (const r of rows) console.log(r.ok ? `✓ ${r.slug.padEnd(16)} ${r.client.brand.name} · ${r.client.industry} · ${r.client.deploy.enabled ? 'đang deploy' : 'chưa deploy'}` : `✗ ${r.slug}\n${r.error}`);
process.exit(bad ? 1 : 0);
