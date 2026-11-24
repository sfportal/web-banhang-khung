import test from 'node:test';
import assert from 'node:assert/strict';
import { affectedClients } from '../scripts/lib/affected.mjs';

const ON = ['bellion', 'ati', 'nong-san-xanh'];

test('chỉ đổi thư mục một khách thì chỉ deploy khách đó', () => {
  assert.deepEqual(affectedClients(['clients/ati/client.json', 'clients/ati/products.csv'], ON), ['ati']);
  assert.deepEqual(affectedClients(['clients/ati/x', 'clients/bellion/y'], ON), ['bellion', 'ati']);
});

test('khách chưa bật deploy thì không deploy', () => {
  assert.deepEqual(affectedClients(['clients/dala/client.json', 'clients/_mau/products.csv'], ON), []);
});

test('đổi mã chung thì deploy mọi khách đang bật', () => {
  assert.deepEqual(affectedClients(['clients/ati/client.json', 'src/lib/orders.js'], ON), ON);
  assert.deepEqual(affectedClients(['package.json'], ON), ON);
  assert.deepEqual(affectedClients(['.github/workflows/deploy.yml'], ON), ON);
});

test('chỉ đổi tài liệu, kiểm thử thì không deploy', () => {
  assert.deepEqual(affectedClients(['README.md', 'CHANGELOG.md', 'docs/quy-uoc.md', 'test/eta.test.js', '.github/workflows/ci.yml'], ON), []);
});
