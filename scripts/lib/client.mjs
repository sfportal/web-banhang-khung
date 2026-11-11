// Đọc và kiểm tra clients/<ma-khach>/client.json
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const INDUSTRIES = ['fmcg', 'me-be', 'my-pham', 'vat-tu-nong-nghiep', 'dich-vu-nong-nghiep'];

export function listClients({ includeTemplate = false } = {}) {
  return readdirSync(join(ROOT, 'clients'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(ROOT, 'clients', e.name, 'client.json')))
    .map((e) => e.name)
    .filter((n) => includeTemplate || !n.startsWith('_'));
}

export function validateClient(c, slug) {
  const err = [];
  const need = (cond, msg) => { if (!cond) err.push(msg); };
  need(c.slug === slug, `slug trong client.json phải là "${slug}"`);
  need(/^[a-z0-9_][a-z0-9-]*$/.test(slug), 'mã khách chỉ gồm chữ thường không dấu, số và dấu -');
  need(c.brand?.name, 'thiếu brand.name');
  need(INDUSTRIES.includes(c.industry), `industry phải là một trong: ${INDUSTRIES.join(', ')}`);
  need(c.deploy?.worker && /^[a-z0-9-]{1,63}$/.test(c.deploy.worker), 'deploy.worker phải có, gồm chữ thường, số, dấu -');
  need(c.deploy?.d1_name, 'thiếu deploy.d1_name');
  need(!c.brand?.order_prefix || /^[A-Z]{1,4}$/.test(c.brand.order_prefix), 'brand.order_prefix gồm 1–4 chữ in hoa');
  for (const [k, v] of Object.entries(c.theme || {})) need(/^#[0-9a-fA-F]{3,8}$/.test(v), `theme.${k} phải là mã màu dạng #rrggbb`);
  const secretLike = JSON.stringify(c).match(/"(api_key|secret|password|token)"\s*:/i);
  need(!secretLike, 'client.json không được chứa khoá API hay mật khẩu (khách tự nhập trong Admin)');
  return err;
}

export function loadClient(slug) {
  const dir = join(ROOT, 'clients', slug);
  const file = join(dir, 'client.json');
  if (!existsSync(file)) throw new Error(`Không thấy ${file}`);
  const client = JSON.parse(readFileSync(file, 'utf8'));
  const err = validateClient(client, slug);
  if (err.length) throw new Error(`clients/${slug}/client.json chưa hợp lệ:\n- ${err.join('\n- ')}`);
  return { client, dir };
}
