import test from 'node:test';
import assert from 'node:assert/strict';
import { dueLocally, claimTick, LAZY_EVERY_MS } from '../src/lib/lazycron.js';

// D1 giả: một dòng settings, mô phỏng INSERT … ON CONFLICT DO UPDATE … WHERE value <= ngưỡng
const fakeEnv = () => {
  let value = null;
  return { DB: { prepare: () => ({ bind: (now, limit) => ({ run: async () => {
    if (value === null || Number(value) <= limit) { value = now; return { meta: { changes: 1 } }; }
    return { meta: { changes: 0 } };
  } }) }) } };
};

test('dueLocally: chỉ đến lượt sau đủ khoảng chờ', () => {
  assert.equal(dueLocally(LAZY_EVERY_MS, 0), true);
  assert.equal(dueLocally(LAZY_EVERY_MS - 1, 0), false);
});

test('claimTick: mỗi khoảng 5 phút chỉ một yêu cầu giành được lượt', async () => {
  const env = fakeEnv(); const t0 = 1_000_000_000;
  assert.equal(await claimTick(env, t0), true);
  assert.equal(await claimTick(env, t0 + 1000), false);
  assert.equal(await claimTick(env, t0 + LAZY_EVERY_MS), true);
});
