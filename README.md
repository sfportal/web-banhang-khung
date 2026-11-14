# Bộ khung website bán hàng (nhiều khách)

Một mã nguồn chung, mỗi khách một website và cơ sở dữ liệu riêng. Tách từ website DaLa 1.7.1 (`sfportal/web-dala-banhang`).

- **Công nghệ**: Astro 7 (SSR) trên Cloudflare Workers, cơ sở dữ liệu Cloudflare D1, deploy bằng GitHub Actions.
- **Tích hợp**: thanh toán SePay (VietQR), giao hàng Goship, OTP eSMS (Zalo/SMS) đều đi qua hệ thống Thu-Chi bằng **một API key** cho mỗi khách. Website không giữ token Goship hay khoá eSMS. Có COD và bảng phí giao hàng dự phòng.
- **Tính năng**: cửa hàng có combo, flash sale; tài khoản khách bằng SĐT, OTP; điểm tích luỹ; CTV 3 tầng với ví hoa hồng và rút tiền; Admin đơn đa kênh, CRM, CSM, lô QR, bài viết, SEO, analytics, phân quyền, quản lý phiên bản.

## Cách tổ chức

```
src/, public/, migrations/   mã chung cho mọi khách (sửa ở đây là mọi khách nhận khi deploy)
clients/<ma-khach>/
  client.json                thương hiệu, màu, ngành, tính năng bật tắt, nội dung trang, thông số deploy
  products.csv               danh sách sản phẩm (hoặc seed.sql nếu cần dữ liệu đầy đủ như DaLa)
  public/assets/img/         logo, ảnh sản phẩm, ảnh chia sẻ
  overrides/                 file riêng của khách, đè lên file cùng đường dẫn trong mã chung
clients/_mau/                khách mẫu: mẫu để tạo khách mới, CI build thử ở mỗi PR
clients/dala/                DaLa: dùng seed.sql và 3 trang riêng trong overrides/
scripts/                     build-client, dev-client, deploy-client, new-client, check-clients
docs/                        quy ước làm việc và quy trình dựng web cho khách mới
.build/<ma-khach>/           thư mục dựng tạm (không commit)
```

`scripts/build-client.mjs <ma-khach>` chép mã chung vào `.build/<ma-khach>/`, đè phần riêng của khách, sinh `src/client.config.js`, `migrations/0002_seed.sql`, `wrangler.jsonc`, rồi build. Mã chung đọc cấu hình qua `src/client.js` (`BRAND`, `CLIENT`, `CONTENT`, `FEATURES`, `THEME_CSS`).

## Thêm một khách mới

```bash
npm ci
npm run client:new -- an-phat "An Phát Organic" fmcg   # tạo clients/an-phat từ khách mẫu
# sửa clients/an-phat/client.json, products.csv, thêm ảnh vào clients/an-phat/public/assets/img
npm run client:check                                   # kiểm tra cấu hình
npm run client:dev -- an-phat                          # chạy thử ở http://localhost:8787
```

Ngành (`industry`): `fmcg`, `me-be`, `my-pham`, `vat-tu-nong-nghiep`, `dich-vu-nong-nghiep`. Quy trình đầy đủ: [docs/quy-trinh-khach-moi.md](docs/quy-trinh-khach-moi.md).

Khi xong, đặt `deploy.enabled: true` và mở PR. Gộp vào `main` thì khách được deploy. `deploy.d1_id` để trống thì lần deploy đầu tự tạo D1 theo `deploy.d1_name`.

Gói Workers Free chỉ cho 5 cron trên cả tài khoản Cloudflare. Khi hết suất, đặt `deploy.cron: false` cho khách mới: shop không đăng ký cron riêng, các việc định kỳ (đồng bộ thanh toán, huỷ đơn quá hạn, nhả hoa hồng) chạy theo lượt truy cập, tối đa 5 phút một lần.

**Không ghi khoá API, mật khẩu vào `client.json`** (công cụ kiểm tra sẽ báo lỗi). Khách tự nhập API key Thu-Chi trong Admin → Cài đặt → Kết nối hệ thống Thu-Chi.

### Mức chỉnh riêng cho từng khách

| Mức | Ví dụ | Sửa ở đâu |
| --- | --- | --- |
| Nội dung, cài đặt | giá, banner, chính sách, hoa hồng | Admin của khách, hoặc `client.json` |
| Giao diện, trang riêng | trang chủ khác hẳn, thêm trang Đại lý | `clients/<ma-khach>/overrides/` |
| Tính năng mới | đặt lịch, báo giá sỉ | mã chung, bật tắt bằng `features` trong `client.json` |

Một yêu cầu riêng được 2–3 khách cần thì đưa vào mã chung. Khi sửa mã chung, kiểm tra các file `overrides/` của khách còn khớp.

## Chạy và kiểm thử

```bash
npm test                         # hoa hồng, ví, phí giao hàng, điểm, OTP, ETA, changelog
npm run client:check
npm run client:build -- _mau     # build thử một khách
```

## Triển khai (CI/CD)

- **CI** (`.github/workflows/ci.yml`) ở mỗi PR: kiểm thử, kiểm tra `client.json` mọi khách, build và chạy migration trên D1 trống cho từng khách.
- **Deploy** (`.github/workflows/deploy.yml`):
  - Gộp vào `main`: deploy lần lượt các khách có `deploy.enabled: true`. Một khách lỗi thì dừng, các khách sau giữ bản cũ.
  - Chạy tay: Actions → Deploy → Run workflow, nhập mã khách hoặc `all`.
  - Mỗi khách: tạo D1 nếu chưa có, áp migration, deploy Worker, đặt secret.

Cài một lần trong GitHub → Settings:
1. **Secrets and variables → Actions**: `CLOUDFLARE_API_TOKEN` (mẫu "Edit Cloudflare Workers" + quyền D1 Edit), `CLOUDFLARE_ACCOUNT_ID`. Không bắt buộc: `ADMIN_PASSWORD_<MAKHACH>`, `APP_SECRET_<MAKHACH>` (ví dụ `ADMIN_PASSWORD_AN_PHAT`), hoặc `ADMIN_PASSWORD` dùng chung.
2. **Environments → production → Required reviewers**: thêm chủ dự án để mọi lần deploy phải được duyệt.

Mật khẩu admin mặc định khi chưa đặt secret: `<makhach>12345` (mã khách bỏ dấu -), đổi ngay sau lần đăng nhập đầu.

Quay lại bản trước: Cloudflare Dashboard → Workers → `<worker>` → Deployments → Rollback (chỉ đổi mã, không hoàn tác migration).

### Kết nối Thu-Chi cho từng khách

1. Trong Thu-Chi, thêm tài khoản ngân hàng SePay, tài khoản Goship và eSMS của khách.
2. Tạo một API key riêng cho khách, chỉ cho xem đúng các tài khoản của khách đó, cấp quyền Tạo yêu cầu thanh toán, Goship, Xác minh SĐT.
3. Khách (hoặc người phụ trách) nhập địa chỉ Thu-Chi và API key trong Admin của website → Cài đặt → Kết nối hệ thống Thu-Chi → "Lưu & kiểm tra".

Website cùng tài khoản Cloudflare với Thu-Chi gọi qua service binding `THUCHI` (`deploy.thuchi_service`), tránh lỗi 1042 khi Worker gọi `*.workers.dev` của Worker khác.

## Quy tắc nghiệp vụ chính

- **Doanh số tính hoa hồng**: tiền hàng sau khi trừ giảm giá theo tỷ lệ, không tính phí ship. Món nào tắt "Tính hoa hồng" sẽ bị loại.
- **Ghi nhận CTV cho đơn**, theo thứ tự ưu tiên: mã CTV nhập lúc thanh toán (khách được giảm %), link `?ref=` (lưu 30 ngày), khách đã gắn với CTV từ trước (gắn trọn đời).
- **Vòng đời hoa hồng**: *chờ* khi đơn được thanh toán (QR) hoặc khi đặt COD; *khả dụng* sau `hold_days` ngày kể từ khi đơn hoàn tất; huỷ nếu đơn huỷ hoặc hoàn hàng.
- **CTV tự mua**: mặc định tính hoa hồng trực tiếp, không cộng giảm giá mã CTV; đổi trong Cài đặt → Cộng tác viên.
- **Hạng CTV**: xét theo doanh số trực tiếp, lấy mức cao hơn giữa tháng này và tháng trước.
- **Flash sale**: phần vượt suất hoặc vượt giới hạn mỗi đơn tính giá thường. Đơn huỷ được trả lại suất và tồn kho.
- **Combo**: tồn kho tính theo thành phần. Sản phẩm loại `addon` chỉ bán kèm sản phẩm khác.
- **Đơn QR chưa thanh toán**: tự huỷ sau `expire_minutes` phút.

## Cấu trúc mã chung

```
src/client.js     cấu hình khách đang build (BRAND, CLIENT, CONTENT, FEATURES, THEME_CSS)
src/lib/          commission.js, catalog.js, orders.js, shipping.js, integrations.js, payment.js, otp.js, loyalty.js, eta.js, db.js, content.js
src/server/       api.js (API công khai, /api/aff/*, /api/admin/*), account.js
src/pages/        trang cửa hàng, ctv.astro, admin.astro
public/assets/    css, js (store, checkout, order, ctv, admin)
migrations/       0001_init … 0007; 0002_seed được thay theo từng khách khi build
test/             kiểm thử node:test
```
