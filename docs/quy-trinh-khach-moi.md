# Quy trình dựng website cho khách mới

Từ phiếu thông tin của khách đến bản chạy thử và PR. Claude làm theo các bước này khi được đưa phiếu.

## Đầu vào
- Phiếu thông tin (Google Sheet hoặc file): Thương hiệu, Sản phẩm, Combo, Khách hàng mục tiêu, Chính sách, Vận hành, Tính năng.
- Thư mục ảnh: logo, ảnh sản phẩm đặt tên theo mã SKU (`SP-001_1.jpg`).
- Không nhận khoá API, mật khẩu. Nếu phiếu có, bỏ qua và nhắc khách tự nhập trong Admin.

## Các bước
1. **Đọc phiếu, kiểm tra một lượt.** Liệt kê mọi chỗ thiếu hoặc sai (giá không phải số, thiếu ảnh, SKU trùng). Hỏi lại khách một lần, gộp tất cả câu hỏi.
2. **Tạo thư mục khách:** `npm run client:new -- <ma-khach> "<Tên thương hiệu>" <nganh>`. Mã khách: chữ thường không dấu, ngắn (ví dụ `an-phat`).
3. **Điền `client.json`:**
   - `brand`: tên, tên pháp lý, khẩu hiệu, `order_prefix` 2 chữ in hoa không trùng khách khác.
   - `theme`: màu chủ đạo từ logo hoặc phiếu, kèm màu đậm và nhạt. Kiểm tra chữ trắng trên màu `primary` đọc được.
   - `features`: theo gói khách mua và ngành (bảng dưới).
   - `content`: Claude viết từ dữ kiện trong phiếu: `home` (eyebrow, title, lead, trust, promise), `story`, `faqs` (5–8 câu), `personas` nếu phiếu có chân dung khách, `policies`, `topbar`, `footer_about`, `kit` (câu chào bán cho CTV).
   - `deploy`: `worker` và `d1_name` = `shop-<ma-khach>`, `d1_id` để trống, `site_url` nếu đã có tên miền, `enabled: false`.
4. **Sản phẩm:** ghi `products.csv` theo cột của `clients/_mau/products.csv`. Mô tả ngắn và lợi ích do Claude viết từ dữ kiện. Ảnh chuyển về webp, nền sạch, cạnh dài 900px, đặt vào `public/assets/img/`.
5. **Rà câu chữ theo ngành** (bảng dưới). Không viết công dụng chữa bệnh cho thực phẩm, mỹ phẩm.
6. **Kiểm tra:** `npm run client:check`, `npm run client:build -- <ma-khach>`, chạy thử `npm run client:dev -- <ma-khach>`, chụp trang chủ, danh mục, một trang sản phẩm, đặt thử một đơn COD.
7. **Mở PR** tên "Thêm website <Tên thương hiệu>", đính kèm ảnh chụp, liệt kê những phần Claude tự viết để khách duyệt.
8. **Sau khi khách duyệt:** đặt `deploy.enabled: true` trong cùng PR. Chủ dự án merge, Actions deploy (cần duyệt môi trường production).
9. **Bàn giao:** gửi khách hướng dẫn đổi mật khẩu admin, nhập API key Thu-Chi riêng của khách trong Admin → Cài đặt → Kết nối hệ thống Thu-Chi, nhập địa chỉ kho, gắn tên miền.

## Gợi ý theo ngành
| Ngành | features gợi ý | Lưu ý câu chữ |
| --- | --- | --- |
| fmcg | đủ cả | ghi nhãn, số tự công bố; TPBVSK cần xác nhận nội dung quảng cáo |
| me-be | tắt `flash_sale` nếu bán dinh dưỡng cho trẻ dưới 24 tháng | không khuyến mãi, không hoa hồng CTV cho sản phẩm dinh dưỡng trẻ dưới 24 tháng |
| my-pham | đủ cả | cần số phiếu công bố; không nói "trị", "chữa" |
| vat-tu-nong-nghiep | `lot_qr` tuỳ khách | chỉ thuốc BVTV trong danh mục; ghi số đăng ký; ưu tiên đặt qua đại lý |
| dich-vu-nong-nghiep | tắt `flash_sale`, `loyalty` | khung chưa có chế độ báo giá, đặt lịch: tạm dùng trang Liên hệ |

Các lưu ý pháp lý trên là theo hiểu biết chung, cần khách hoặc luật sư xác nhận.
