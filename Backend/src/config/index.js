require("dotenv").config();
const path = require("path");

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "tuyenhoa-jwt-secret-2026",

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },

  zalo: {
    appId: process.env.ZALO_APP_ID,
    appSecret: process.env.ZALO_APP_SECRET,
    oaToken: process.env.ZALO_OA_TOKEN,
    refreshToken: process.env.ZALO_REFRESH_TOKEN,
    // Khoá bí mật OA (oa.zalo.me → Cài đặt → Bảo mật) — dùng để xác thực chữ ký
    // webhook (X-ZEvent-Signature), KHÁC với ZALO_APP_SECRET. Để trống thì
    // webhook vẫn nhận request bình thường, chỉ bỏ qua bước xác thực chữ ký.
    oaSecretKey: process.env.ZALO_OA_SECRET_KEY || "",
    // ID Official Account — MiniApp dùng cho nút Quan tâm/Bỏ quan tâm OA ở tab
    // Công dân. Trống thì ẩn nút (xem docs/SETUP_CHECKLIST.md).
    oaId: process.env.ZALO_OA_ID || "",
  },

  corsOrigin: process.env.CORS_ORIGIN || "*",

  // Tên miền ngoài .gov.vn được phép làm liên kết trong MiniApp (chủ thể là CQNN, VD báo đài
  // địa phương) — phân tách bằng dấu phẩy. Để trống = chỉ cho .gov.vn. Xem utils/linkPolicy.js.
  allowedLinkDomains: process.env.ALLOWED_LINK_DOMAINS || "",

  // URL công khai của Backend — để tạo LINK TUYỆT ĐỐI cho file gửi qua Zalo OA
  // (Zalo cần URL đầy đủ https://...; link tương đối bị bọc thành zalo.me/nf).
  publicUrl: process.env.PUBLIC_URL || "https://tuyenhoaapi.dxvtech.vn",

  // ===== Trợ lý số (Claude API) — tự tắt (503) nếu thiếu API key =====
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
  },

  // Thư mục chứa media tĩnh nặng (video Kỹ năng PCTT) — nằm ngoài git, phục vụ
  // qua express.static, không bị đụng tới bởi git pull / npm ci khi deploy.
  mediaDir: process.env.MEDIA_DIR || path.join(__dirname, "..", "..", "media"),

  // ===== Lịch cắt điện (EVN CPC public API) =====
  // TODO: chưa xác định điện lực phụ trách xã Tuyên Hóa (Quảng Trị, thuộc EVN CPC)
  // — để trống orgCode/subOrgCode/XENVN_URL thì đồng bộ tự bỏ qua (xem
  // docs/SETUP_CHECKLIST.md). Không đoán mã.
  evncpc: {
    apiUrl: process.env.EVNCPC_API_URL || "https://cskh-api.cpc.vn/api/remote/outages/area",
    orgListUrl:
      process.env.EVNCPC_ORG_LIST_URL || "https://cskh-api.cpc.vn/api/remote/organizations",
    orgCode: process.env.EVNCPC_ORG_CODE || "",
    subOrgCode: process.env.EVNCPC_SUBORG_CODE || "",
    // GitHub Actions cron job (sync-lich-cup-dien.yml) gọi EVN CPC từ hạ tầng
    // GitHub rồi đẩy dữ liệu qua route ingest này (VPS có thể bị chặn gọi thẳng
    // cskh-api.cpc.vn — xem README của workflow).
    ingestSecret: process.env.LICH_CUP_DIEN_INGEST_SECRET || "",
    // Nguồn thay thế: cào trang bên thứ 3 xenvn.com (đăng lại lịch cắt điện).
    // URL mẫu Thăng Điền: https://xenvn.com/lich-cup-dien/dien-luc-thang-binh-pc05ff/
    // — path "dien-luc-thang-binh-pc05ff" đổi theo mã điện lực từng khu vực.
    xenvnUrl: process.env.XENVN_URL || "",
  },

  // ===== Văn bản - Chính sách =====
  // TODO: chưa xác nhận cổng thông tin điều hành của xã Tuyên Hóa — để trống
  // thì vanBanTuyenHoaService tự bỏ qua đồng bộ (không cào nhầm site khác).
  vanBanSourceUrl: process.env.VAN_BAN_SOURCE_URL || "",

  // ===== Tin tức (trang TTĐT xã) =====
  // TODO: chưa xác nhận trang tin tức của xã Tuyên Hóa. newsScrapeService.js
  // parse HTML portal VNPT của các xã Đà Nẵng — nếu trang của xã khác cấu trúc
  // thì phải viết lại parser trước khi điền NEWS_SOURCE_URL.
  newsSourceUrl: process.env.NEWS_SOURCE_URL || "",

  // ===== Cổng góp ý 1022 (gopy.danang.gov.vn) — đồng bộ phản ánh sang hệ thống thành phố =====
  // Xác thực: HTTP Basic Auth. Bắt buộc User-Agent trình duyệt (WAF chặn UA lạ).
  // Thiếu baseUrl/username/password thì tính năng tự tắt (isConfigured=false).
  // Hệ thống của TP Đà Nẵng — KHÔNG áp dụng cho xã Tuyên Hóa (tỉnh Quảng Trị),
  // để trống. Khi tắt, mã phản ánh do hệ thống tự cấp (feedbackCodeService.js).
  cgy1022: {
    baseUrl: process.env.CGY1022_BASE_URL || "",
    username: process.env.CGY1022_USERNAME || "",
    password: process.env.CGY1022_PASSWORD || "",
    gopyPath: process.env.CGY1022_GOPY_PATH || "/api/gopy",
    userId: process.env.CGY1022_USER_ID || "0",
    defaultEmail: process.env.CGY1022_DEFAULT_EMAIL || "",
    // QUAN TRỌNG: nguonGopY phải khớp CHÍNH XÁC giá trị đã đăng ký sẵn phía 1022
    // cho tài khoản đang dùng — gửi giá trị lạ → 404 "does not exist" (đã gặp
    // thật ở Thăng Điền/Đại Lộc, nơi chỉ "Zalo" được đăng ký sẵn).
    nguon: process.env.CGY1022_NGUON || "Góp ý Zalo",
    // JSON map tên danh mục → linhVucId của 1022, VD: {"Môi trường": 4}
    linhVucMap: process.env.CGY1022_LINHVUC_MAP || "{}",
    linhVucDefault: process.env.CGY1022_LINHVUC_DEFAULT || "",
  },

  // ===== Tự động đăng tin cào lên Zalo OA (Nội dung dạng Bài viết) =====
  // Dùng CHUNG token OA của zaloToken.js (KHÔNG tạo token store riêng — tránh
  // 2 nơi refresh đá nhau làm hỏng token production). Tắt mặc định; bật bằng
  // ZALO_ARTICLE_ENABLED=true trên VPS sau khi đã chạy backfill để không dồn
  // tin cũ lên OA.
  zaloArticle: {
    enabled: (process.env.ZALO_ARTICLE_ENABLED || "false").toLowerCase() === "true",
    // Ảnh cover mặc định khi tin không có ảnh (Zalo Article bắt buộc có cover)
    defaultCover: process.env.ZALO_ARTICLE_DEFAULT_COVER || "",
    // Cờ RIÊNG cho bước broadcast (gửi bài đã tạo tới toàn bộ follower) — tách
    // khỏi "enabled" (chỉ tạo bài) vì cần quyền Zalo khác + rủi ro cao hơn hẳn
    // (không thể thu hồi sau khi gửi). Bật bằng ZALO_BROADCAST_ENABLED=true.
    broadcastEnabled: (process.env.ZALO_BROADCAST_ENABLED || "false").toLowerCase() === "true",
  },
};
