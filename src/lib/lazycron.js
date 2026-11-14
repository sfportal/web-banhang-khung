// Chạy việc định kỳ theo lượt truy cập, cho khách tắt cron riêng (deploy.cron = false).
// Gói Workers Free chỉ cho 5 cron trên cả tài khoản, nên không phải shop nào cũng có cron.
import { run } from './db.js';

export const LAZY_EVERY_MS = 5 * 60 * 1000;
let lastTry = 0; // chặn sớm trong cùng một isolate, đỡ tốn truy vấn D1

// Đã đến lúc thử chưa (theo bộ nhớ của isolate)
export function dueLocally(now, last = lastTry, every = LAZY_EVERY_MS) { return now - last >= every; }

// Giành lượt chạy trong D1: chỉ một yêu cầu thắng trong mỗi khoảng 5 phút, dù có nhiều isolate.
// Khoá có tiền tố "secret:" để getSettings không trả ra trình duyệt.
export async function claimTick(env, now = Date.now(), every = LAZY_EVERY_MS) {
  const r = await run(env, `INSERT INTO settings (key, value) VALUES ('secret:cron_last', ?1)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE CAST(settings.value AS INTEGER) <= ?2`, String(now), now - every);
  return (r.meta?.changes || 0) > 0;
}

export async function lazyTick(env, tick, now = Date.now()) {
  if (!dueLocally(now)) return null;
  lastTry = now;
  if (!(await claimTick(env, now))) return null;
  return tick(env);
}
