# Nhật ký cập nhật

Bộ khung dùng chung cho mọi khách. Gộp vào `main` thì GitHub Actions deploy lại các khách có `deploy.enabled = true`. Khi tăng `version` trong `package.json` và thêm mục ở đây, lần deploy đó tự tạo bản phát hành `v<phiên bản>` trên GitHub.
Quy ước: tính năng mới tăng số giữa (0.1.0 → 0.2.0), sửa lỗi tăng số cuối (0.1.0 → 0.1.1).

## 0.4.1 – 26/11/2026
- Bật deploy cho khách Nông Xanh Tây Nguyên (bản chạy thử trên workers.dev).

## 0.4.0 – 26/11/2026
- Thêm khách Nông Xanh Tây Nguyên (vật tư nông nghiệp): 39 sản phẩm phân bón, thuốc BVTV của Hàn Việt, Map Pacific, Sumitomo, Ngân Anh. Chưa bật deploy, chờ chủ cửa hàng duyệt.
- Giá "Liên hệ": sản phẩm có `price = 0` trong `products.csv` hiện nhãn Liên hệ thay cho giá, có nút "Nhận báo giá" sang trang Liên hệ (điền sẵn tên sản phẩm), không thêm vào giỏ được, server chặn đặt online. Chủ đề liên hệ mới "Báo giá sản phẩm".
- Trang Sản phẩm: lọc theo nhãn (`content.catalog_tag_filters`), ẩn nút lọc không có sản phẩm (`content.hide_empty_filters`), câu dẫn và ghi chú cuối trang lấy từ `content.catalog_lead`, `content.catalog_note`.
- Trang chi tiết: tên tab và dòng lưu ý cuối tab thành phần lấy từ `content.pdp_story_tab`, `content.pdp_ing_tab`, `content.pdp_note`; dòng "mã QR lô hàng" chỉ hiện khi bật `lot_qr` hoặc có lô.
- Ẩn mục menu theo khách bằng `content.nav_off` (ví dụ `["combo"]`), tiêu đề trang 404 lấy từ `content.not_found_title`.
- Khách cũ không đặt các khoá mới thì giữ nguyên câu chữ như trước.

## 0.3.1 – 24/11/2026
- `products.csv`: cột `image` nhận URL `https://…` (ảnh lấy thẳng từ sàn), thêm cột `shopee_url` để hiện nút "Cũng có trên Shopee".
- ATI: thay 2 sản phẩm giữ chỗ bằng Nước gừng Ginger Shot và Bột rau củ Staywell lấy từ Shopee (migration riêng của khách `1001_ati_san_pham_staywell.sql` cho D1 đang chạy).

## 0.3.0 – 24/11/2026
- Deploy độc lập từng khách: gộp vào `main` chỉ deploy khách có file trong `clients/<ma-khach>/` thay đổi. Đổi mã chung thì deploy mọi khách đang bật, chỉ đổi tài liệu thì không deploy.
- Mỗi khách một job và một khoá deploy riêng: khách này lỗi hay đang chờ duyệt không chặn khách khác.
- Thêm khách ATI (Asia Trading Investment Corporation), bản chạy thử.
- Gỡ khách Nông Sản Xanh (đã xoá D1 `shop-nong-san-xanh`) và D1 `shop-mau` để có chỗ cho ATI trên gói Free.

## 0.2.0 – 14/11/2026
- Cron tuỳ chọn cho từng khách: đặt `deploy.cron: false` trong `client.json` thì shop không đăng ký cron riêng. Đồng bộ thanh toán, huỷ đơn quá hạn, nhả hoa hồng chạy theo lượt truy cập, tối đa 5 phút một lần. Dùng khi tài khoản Cloudflare gói Free đã hết 5 cron.
- Thêm khách mẫu Nông Sản Xanh (tắt cron riêng).

## 0.1.1 – 11/11/2026
- Deploy: đọc secret riêng từng khách bằng tên cụ thể, bỏ cách lấy toàn bộ secrets khiến lần chạy Deploy bị chặn ("action_required").

## 0.1.0 – 11/11/2026
- Tách bộ khung từ website DaLa 1.7.1: cửa hàng, combo, flash sale, tài khoản SĐT và OTP, điểm tích luỹ, CTV 3 tầng với ví hoa hồng, Admin CRM/CSM, analytics, SEO, quản lý phiên bản.
- Thanh toán SePay, giao hàng Goship, OTP eSMS đều đi qua hệ thống Thu-Chi bằng một API key, như DaLa 1.7.
- Mỗi khách là một thư mục `clients/<ma-khach>/`: `client.json` (thương hiệu, màu, ngành, tính năng bật tắt, nội dung, thông số deploy), `products.csv` hoặc `seed.sql`, ảnh, và `overrides/` cho trang riêng.
- Tên thương hiệu, tiền tố mã đơn, cookie, mật khẩu admin mặc định, bộ nội dung bán hàng CTV, màu giao diện lấy từ `client.json` thay vì viết cứng.
- Trang chủ, câu chuyện, chính sách, danh mục dùng chung đọc nội dung từ cấu hình. DaLa giữ nguyên trang riêng qua `clients/dala/overrides/`.
- Công cụ: `client:new`, `client:check`, `client:build`, `client:dev`, `client:deploy`; GitHub Actions build thử mọi khách ở mỗi PR và deploy theo từng khách khi gộp vào `main`, có cổng duyệt `production`.
