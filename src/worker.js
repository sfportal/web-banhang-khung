// Điểm vào Worker: Astro xử lý HTTP, thêm cron đồng bộ thanh toán SePay, nhả hoa hồng, huỷ đơn quá hạn.
// Khách tắt cron riêng (CRON_MODE = "lazy") thì các việc này chạy theo lượt truy cập, tối đa 5 phút một lần.
import { handle } from '@astrojs/cloudflare/handler';
import { cronTick } from './lib/orders.js';
import { lazyTick } from './lib/lazycron.js';

export default {
  async fetch(request, env, ctx) {
    if (env.CRON_MODE === 'lazy') ctx.waitUntil(lazyTick(env, cronTick).then((r) => r && console.log('cron (lazy)', JSON.stringify(r))).catch((e) => console.error('cron (lazy)', e)));
    return handle(request, env, ctx);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(cronTick(env).then((r) => console.log('cron', JSON.stringify(r))).catch((e) => console.error('cron', e)));
  },
};
