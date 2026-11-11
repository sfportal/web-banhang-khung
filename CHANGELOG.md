# Nhật ký cập nhật

Bộ khung dùng chung cho mọi khách. Gộp vào `main` thì GitHub Actions deploy lại các khách có `deploy.enabled = true`. Khi tăng `version` trong `package.json` và thêm mục ở đây, lần deploy đó tự tạo bản phát hành `v<phiên bản>` trên GitHub.
Quy ước: tính năng mới tăng số giữa (0.1.0 → 0.2.0), sửa lỗi tăng số cuối (0.1.0 → 0.1.1).

## 0.1.1 – 11/11/2026
- Deploy: đọc secret riêng từng khách bằng tên cụ thể, bỏ cách lấy toàn bộ secrets khiến lần chạy Deploy bị chặn ("action_required").

## 0.1.0 – 11/11/2026
- Tách bộ khung từ website DaLa 1.7.1: cửa hàng, combo, flash sale, tài khoản SĐT và OTP, điểm tích luỹ, CTV 3 tầng với ví hoa hồng, Admin CRM/CSM, analytics, SEO, quản lý phiên bản.
- Thanh toán SePay, giao hàng Goship, OTP eSMS đều đi qua hệ thống Thu-Chi bằng một API key, như DaLa 1.7.
- Mỗi khách là một thư mục `clients/<ma-khach>/`: `client.json` (thương hiệu, màu, ngành, tính năng bật tắt, nội dung, thông số deploy), `products.csv` hoặc `seed.sql`, ảnh, và `overrides/` cho trang riêng.
- Tên thương hiệu, tiền tố mã đơn, cookie, mật khẩu admin mặc định, bộ nội dung bán hàng CTV, màu giao diện lấy từ `client.json` thay vì viết cứng.
- Trang chủ, câu chuyện, chính sách, danh mục dùng chung đọc nội dung từ cấu hình. DaLa giữ nguyên trang riêng qua `clients/dala/overrides/`.
- Công cụ: `client:new`, `client:check`, `client:build`, `client:dev`, `client:deploy`; GitHub Actions build thử mọi khách ở mỗi PR và deploy theo từng khách khi gộp vào `main`, có cổng duyệt `production`.
