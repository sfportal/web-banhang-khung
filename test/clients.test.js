import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listClients, loadClient, validateClient } from '../scripts/lib/client.mjs';
import { parseCsv, productsCsvToSql, settingsSql, slugify } from '../scripts/lib/seed.mjs';

test('mọi client.json trong clients/ hợp lệ', () => {
  for (const slug of listClients({ includeTemplate: true })) assert.doesNotThrow(() => loadClient(slug), slug);
});

test('chặn khoá API và màu sai trong client.json', () => {
  const { client } = loadClient('_mau');
  const bad = structuredClone(client);
  bad.settings = { payment: { api_key: 'x' } };
  bad.theme.primary = 'blue';
  const err = validateClient(bad, '_mau');
  assert.ok(err.some((e) => e.includes('khoá API')));
  assert.ok(err.some((e) => e.includes('theme.primary')));
});

test('đọc CSV có dấu phẩy trong ngoặc kép', () => {
  const rows = parseCsv('sku,name,benefits\nA-1,"Bột, hũ 350g","x; y"\n');
  assert.deepEqual(rows, [{ sku: 'A-1', name: 'Bột, hũ 350g', benefits: 'x; y' }]);
});

test('products.csv → INSERT products, giá dạng 159.000 và dễ vỡ "Có"', () => {
  const sql = productsCsvToSql('sku,name,subtitle,price,fragile,image,benefits\nsp-1,Cà phê rang,Gói 500g,159.000,Có,cf.webp,"Đậm; Thơm"\n');
  assert.match(sql, /'SP-1', 'ca-phe-rang-goi-500g', 'Cà phê rang'/);
  assert.match(sql, /159000/);
  assert.match(sql, /'\/assets\/img\/cf.webp'/);
  assert.match(sql, /'\["Đậm","Thơm"\]'/);
  assert.throws(() => productsCsvToSql('sku,name,price\n,Thiếu mã,1000\n'), /dòng 2/);
});

test('settings sinh từ thương hiệu', () => {
  const sql = settingsSql({ brand: { name: "O'Farm", tagline: 'Tươi mỗi ngày' } });
  assert.match(sql, /'shop'/);
  assert.match(sql, /O''Farm/);
  assert.equal(slugify('Đặc sản Đắk Lắk'), 'dac-san-dak-lak');
});
