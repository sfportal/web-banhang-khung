-- Nông Xanh Tây Nguyên: bỏ dòng chờ "cập nhật địa chỉ cửa hàng" ở chân trang (27/11/2026). Khi có địa chỉ thật thì cập nhật trong trang quản trị.
UPDATE settings SET value = json_set(value, '$.address', 'Tây Nguyên, Việt Nam') WHERE key = 'shop';
