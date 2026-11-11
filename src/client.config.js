// Tự sinh từ clients/<ma-khach>/client.json bởi scripts/build-client.mjs. Bản mặc định là khách mẫu _mau.
export default {
  "slug": "_mau",
  "industry": "fmcg",
  "brand": {
    "name": "Cửa hàng Mẫu",
    "legal_name": "Công ty TNHH Cửa hàng Mẫu",
    "tagline": "Sản phẩm tốt, giao tận nơi",
    "logo": "/assets/img/logo.svg",
    "logo_light": "/assets/img/logo-light.svg",
    "favicon": "/assets/img/favicon.svg",
    "icon": "/assets/img/favicon.svg",
    "og_image": "/assets/img/og.svg",
    "order_prefix": "DH"
  },
  "theme": {
    "primary": "#1f6feb",
    "primary_dark": "#123f86",
    "primary_light": "#e3edfd",
    "accent": "#f2a516",
    "accent_dark": "#e8811a",
    "accent_light": "#fff1d2",
    "background": "#f7f8fa",
    "ink": "#1b2330"
  },
  "features": {
    "affiliate": true,
    "loyalty": true,
    "flash_sale": true,
    "lot_qr": false,
    "blog": true,
    "otp": true
  },
  "deploy": {
    "worker": "shop-mau",
    "d1_name": "shop-mau",
    "d1_id": "",
    "site_url": "",
    "thuchi_service": "sepay-thuchi",
    "enabled": false,
    "note": "Khách mẫu để kiểm thử khung. Không deploy."
  },
  "content": {
    "home": {
      "eyebrow": "Chào mừng đến Cửa hàng Mẫu",
      "title": "Sản phẩm tốt, giao tận nơi",
      "lead": "Mô tả ngắn 1–2 câu về thương hiệu: bán gì, cho ai, khác biệt ở đâu.",
      "hero_image": "",
      "trust": [
        "Hàng chính hãng",
        "Giao toàn quốc",
        "COD khi nhận hàng"
      ],
      "promise": [
        "Chính hãng",
        "Đổi trả 7 ngày",
        "Thanh toán QR hoặc COD",
        "Giao toàn quốc"
      ],
      "stats": []
    },
    "story": {
      "title": "Câu chuyện của chúng tôi",
      "lead": "Khách điền 5–10 dữ kiện về thương hiệu trong phiếu, Claude viết thành đoạn này.",
      "image": "",
      "sections": [
        {
          "icon": "🎯",
          "title": "Sứ mệnh",
          "text": "Điều thương hiệu muốn mang lại cho khách hàng."
        },
        {
          "icon": "🤝",
          "title": "Cam kết",
          "text": "Chất lượng, nguồn gốc, dịch vụ sau bán."
        }
      ]
    },
    "topbar": [
      "💳 Chuyển khoản QR hoặc trả tiền khi nhận hàng (COD)",
      "🤝 Làm cộng tác viên, nhận hoa hồng mỗi đơn"
    ],
    "footer_about": "Mô tả ngắn về cửa hàng hiển thị ở chân trang.",
    "disclaimer": "",
    "catalog_title": "Sản phẩm của Cửa hàng Mẫu",
    "catalog_description": "Danh sách sản phẩm, combo và ưu đãi đang có.",
    "b2b_note": "Đặt số lượng lớn, đại lý: liên hệ để nhận giá sỉ.",
    "policies": {
      "shipping_note": "Hàng dễ vỡ được đóng gói chống sốc.",
      "return_days": 7,
      "return_note": ""
    },
    "personas": [],
    "journey": [],
    "faqs": [
      [
        "Tôi có thể thanh toán bằng cách nào?",
        "Chuyển khoản qua mã VietQR (hệ thống tự xác nhận khi tiền về) hoặc trả tiền mặt khi nhận hàng (COD)."
      ],
      [
        "Phí giao hàng tính thế nào?",
        "Phí được tính tự động theo địa chỉ, khối lượng và kích thước kiện hàng ở bước thanh toán."
      ]
    ],
    "line_labels": {
      "combo": "Combo"
    }
  }
};
