#!/usr/bin/env node
// Tạo thư mục khách mới từ khách mẫu: node scripts/new-client.mjs <ma-khach> "<Tên thương hiệu>" [nganh]
// Ngành: fmcg | me-be | my-pham | vat-tu-nong-nghiep | dich-vu-nong-nghiep
import { existsSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, INDUSTRIES } from './lib/client.mjs';

const [slug, name, industry = 'fmcg'] = process.argv.slice(2);
if (!slug || !name) { console.error('Cách dùng: node scripts/new-client.mjs <ma-khach> "<Tên thương hiệu>" [nganh]'); process.exit(1); }
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) { console.error('Mã khách chỉ gồm chữ thường không dấu, số và dấu -'); process.exit(1); }
if (!INDUSTRIES.includes(industry)) { console.error(`Ngành phải là: ${INDUSTRIES.join(', ')}`); process.exit(1); }
const dir = join(ROOT, 'clients', slug);
if (existsSync(dir)) { console.error(`Đã có clients/${slug}`); process.exit(1); }
cpSync(join(ROOT, 'clients/_mau'), dir, { recursive: true });
const c = JSON.parse(readFileSync(join(dir, 'client.json'), 'utf8'));
c.slug = slug; c.industry = industry;
c.brand.name = name; c.brand.legal_name = name;
c.deploy = { ...c.deploy, worker: `shop-${slug}`, d1_name: `shop-${slug}`, d1_id: '', site_url: '', enabled: false, note: '' };
c.content.catalog_title = `Sản phẩm của ${name}`;
writeFileSync(join(dir, 'client.json'), JSON.stringify(c, null, 2) + '\n');
console.log(`Đã tạo clients/${slug}. Tiếp theo: sửa client.json, products.csv, thêm ảnh vào clients/${slug}/public/assets/img, rồi chạy npm run client:build ${slug}`);
