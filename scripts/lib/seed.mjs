// Sinh dữ liệu khởi tạo (migrations/0002_seed.sql) cho khách chưa có seed.sql riêng
const q = (v) => (v === null || v === undefined || v === '' ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const j = (o) => q(JSON.stringify(o));

export const DEFAULT_AFFILIATE = {
  tiers: [
    { id: 1, name: 'Thành viên', min_sales: 0, direct: 15, l1: 2, l2: 1 },
    { id: 2, name: 'Đại sứ', min_sales: 5000000, direct: 20, l1: 2, l2: 1 },
    { id: 3, name: 'Trưởng nhóm', min_sales: 20000000, direct: 25, l1: 3, l2: 1 },
  ],
  hold_days: 7, min_withdraw: 200000, payout_days: '5 và 20 hằng tháng', cookie_days: 30, buyer_discount_pct: 5, lifetime_binding: true, auto_approve: true,
};

export function settingsSql(c) {
  const b = c.brand || {};
  const s = c.settings || {};
  const rows = {
    shop: { name: b.name, legal_name: b.legal_name || b.name, slogan: b.tagline || '', hotline: '', zalo: '', email: '', address: '', facebook: '', tiktok_shop: '', shopee_shop: '', zalo_oa: '', ...(s.shop || {}) },
    shipping: { free_threshold: 0, fragile_fee: 10000, packaging_weight: 120, fragile_padding_cm: 2, pick: 'cheapest', fallback_table: [[500, 25000], [1000, 30000], [2000, 38000]], fallback_step_500g: 5000, origin: { name: `Kho ${b.name}`, phone: '', street: '', city: '', district: '', ward: '' }, ...(s.shipping || {}) },
    payment: { online_enabled: true, cod_enabled: true, cod_max: 3000000, thuchi_base: '', expire_minutes: 1440, bank: { bank: '', account: '', holder: '' }, ...(s.payment || {}) },
    affiliate: { ...DEFAULT_AFFILIATE, ...(s.affiliate || {}) },
    seo: { title: `${b.name} · ${b.tagline || ''}`.replace(/ · $/, ''), description: c.content?.home?.lead || '', keywords: '', og_image: b.og_image || '', ga4: '', gsc_verify: '', fb_pixel: '', tiktok_pixel: '', head_extra: '', ...(s.seo || {}) },
  };
  return Object.entries(rows).map(([k, v]) => `INSERT INTO settings (key, value) VALUES (${q(k)}, ${j(v)});\n`).join('');
}

// CSV đơn giản: dòng đầu là tên cột, giá trị có dấu phẩy thì bọc trong "..."
export function parseCsv(text) {
  const rows = []; let row = [], cell = '', inQ = false;
  const t = text.replace(/^﻿/, '');
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (inQ) { if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') inQ = false; else cell += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((c) => c !== '')) rows.push(row); row = []; }
    else cell += ch;
  }
  row.push(cell); if (row.some((c) => c !== '')) rows.push(row);
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

export const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = (v) => (v === '' || v === undefined ? null : Number(String(v).replace(/[.\s]/g, '').replace(',', '.')));
const yes = (v) => /^(1|c[oó]|yes|true|x)$/i.test(String(v || '').trim());
const list = (v) => (v ? String(v).split(';').map((x) => x.trim()).filter(Boolean) : []);

// Cột products.csv: sku,name,subtitle,line,kind,price,compare_price,wholesale_price,cost,stock,image,short_desc,story,benefits,usage,ingredients,weight,badges,weight_g,length_cm,width_cm,height_cm,fragile,sort
// benefits, badges: nhiều giá trị cách nhau bằng dấu ;   fragile: Có/Không   image: tên file trong public/assets/img
export function productsCsvToSql(text) {
  const cols = ['sku', 'slug', 'name', 'subtitle', 'line', 'kind', 'price', 'compare_price', 'wholesale_price', 'cost', 'stock', 'image', 'image_bg', 'short_desc', 'story', 'benefits', 'usage', 'ingredients', 'weight', 'badges', 'personas', 'combo_items', 'seo_title', 'seo_desc', 'weight_g', 'length_cm', 'width_cm', 'height_cm', 'fragile', 'sort'];
  return parseCsv(text).map((r, i) => {
    if (!r.sku || !r.name || !num(r.price)) throw new Error(`products.csv dòng ${i + 2}: cần sku, name, price`);
    const img = r.image ? (r.image.startsWith('/') ? r.image : `/assets/img/${r.image}`) : null;
    const v = {
      sku: r.sku.toUpperCase(), slug: r.slug || slugify(`${r.name} ${r.subtitle || ''}`), name: r.name, subtitle: r.subtitle || null, line: r.line ? slugify(r.line) : 'khac', kind: r.kind || 'main',
      price: num(r.price), compare_price: num(r.compare_price), wholesale_price: num(r.wholesale_price), cost: num(r.cost), stock: num(r.stock) ?? 0,
      image: img, image_bg: img, short_desc: r.short_desc || null, story: r.story || null, benefits: JSON.stringify(list(r.benefits)), usage: r.usage || null,
      ingredients: r.ingredients || null, weight: r.weight || null, badges: JSON.stringify(list(r.badges)), personas: JSON.stringify(list(r.personas)), combo_items: null,
      seo_title: r.seo_title || null, seo_desc: r.seo_desc || r.short_desc || null, weight_g: num(r.weight_g) ?? 300, length_cm: num(r.length_cm) ?? 15, width_cm: num(r.width_cm) ?? 10,
      height_cm: num(r.height_cm) ?? 10, fragile: yes(r.fragile) ? 1 : 0, sort: num(r.sort) ?? i + 1,
    };
    return `INSERT INTO products (${cols.join(', ')}) VALUES (${cols.map((c) => q(v[c])).join(', ')});\n`;
  }).join('');
}
