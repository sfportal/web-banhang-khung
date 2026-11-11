// Cấu hình của khách đang được build. Mặc định là khách mẫu; scripts/build-client.mjs ghi đè
// src/client.config.js bằng clients/<ma-khach>/client.json trong thư mục dựng .build/<ma-khach>.
import cfg from './client.config.js';

export const CLIENT = cfg;
export const BRAND = cfg.brand?.name || 'Cửa hàng';
export const SLUG = String(cfg.slug || 'shop').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'shop';
export const FEATURES = { affiliate: true, loyalty: true, flash_sale: true, lot_qr: true, blog: true, otp: true, ...(cfg.features || {}) };
export const CONTENT = cfg.content || {};
export const THEME = cfg.theme || {};

// Màu thương hiệu → biến CSS dùng chung cho store.css và admin.css
const CSS_VARS = { primary: '--green', primary_dark: '--green-d', primary_light: '--green-l', accent: '--sun', accent_dark: '--sun-d', accent_light: '--sun-l', background: '--cream', ink: '--ink' };
export const THEME_CSS = Object.entries(CSS_VARS)
  .filter(([k]) => /^#[0-9a-f]{3,8}$/i.test(THEME[k] || ''))
  .map(([k, v]) => `${v}:${THEME[k]}`).join(';');
