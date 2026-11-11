# Quy ước làm việc trong repo khung

Dành cho người và Claude sửa repo này.

## Chung
- Trả lời, viết tài liệu bằng tiếng Việt, câu ngắn, rõ.
- PR sửa lỗi: Claude tự merge sau khi CI xanh. PR tính năng: chủ dự án tự merge.
- Không nhập hay giữ hộ khoá API, mật khẩu của khách. Không ghi chúng vào `client.json` hay commit. Khách tự nhập trong Admin.
- Tài liệu và dữ liệu mẫu chỉ dùng dữ liệu giả, không dùng CCCD, MST, số tài khoản thật.
- Website DaLa đang chạy từ repo `sfportal/web-dala-banhang`. Repo này không deploy DaLa (`clients/dala/client.json` có `deploy.enabled: false`) cho tới khi chủ dự án quyết định chuyển.

## Mã chung và phần riêng của khách
- Mã chung ở `src/`, `public/`, `migrations/`. Mỗi khách ở `clients/<ma-khach>/` (xem README).
- Không viết cứng tên thương hiệu, màu, nội dung riêng của một khách vào mã chung. Dùng `BRAND`, `CLIENT`, `CONTENT`, `FEATURES` từ `src/client.js`. JS phía trình duyệt dùng `window.DALA.brand` (cửa hàng) hoặc `window.SHOP_BRAND` (admin).
- Trang riêng của một khách đặt ở `clients/<ma-khach>/overrides/` với cùng đường dẫn như trong mã chung.
- Tính năng chỉ một số khách dùng: viết trong mã chung, bật tắt bằng `features` trong `client.json`.
- Migration mới đánh số tiếp (`0008_...`). Không sửa migration đã có. `0002_seed.sql` là chỗ giữ, bị thay bằng dữ liệu của từng khách khi build.

## Trước khi mở PR
```bash
npm test
npm run client:check
npm run client:build -- _mau
npm run client:build -- <khách bị ảnh hưởng>
```
- Thay đổi mã chung: build thử ít nhất `_mau` và `dala`. Nếu đụng file mà khách nào có bản riêng trong `overrides/`, kiểm tra file đó.
- Tăng `version` trong `package.json` và thêm mục `## x.y.z – ngày` vào `CHANGELOG.md` (CI kiểm tra). Tính năng tăng số giữa, sửa lỗi tăng số cuối.
