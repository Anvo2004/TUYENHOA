const mongoose = require("mongoose");

// Tin cào từ trang TTĐT xã tuyenhoa.quangtri.gov.vn (xem newsScrapeService.js).
// Khử trùng theo `nid` (id bài trên CMS nguồn = mốc tạo bài, mili giây).
const newsSchema = new mongoose.Schema(
  {
    nid: { type: Number, required: true, unique: true }, // id bài trên CMS (số cuối của link)
    // "tin-tuc" = Tin tức - Sự kiện, "chi-dao" = Thông tin chỉ đạo điều hành.
    kind: { type: String, default: "tin-tuc", index: true },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    date: { type: String, default: "" }, // dd/MM/yyyy (chuỗi, theo tóm tắt)
    tag: { type: String, default: "Tin tức" },
    source: { type: String, default: "UBND xã Tuyên Hóa" },
    link: { type: String, default: "" },
    imageUrl: { type: String, default: "" }, // ảnh tóm tắt, nhúng thẳng từ trang nguồn
    scrapedAt: { type: Date, default: Date.now },

    // Trạng thái đăng lên Zalo OA (Nội dung dạng Bài viết) — xem services/zaloNewsService.js
    zalo: {
      articleId: { type: String, default: "" }, // id bài trên OA (đã tạo)
      // link mở bài viết trong Zalo (article/getdetail → link_view) — "thẻ tin" trỏ vào đây
      linkView: { type: String, default: "" },
      // Bài OA có nội dung đầy đủ (chữ + ảnh + văn bản PDF thành ảnh, từ trang chi
      // tiết), không chỉ tóm tắt.
      fullContent: { type: Boolean, default: false },
      // Phiên bản cách dựng nội dung bài (zaloNewsService.ARTICLE_BODY_VERSION) —
      // bài chưa đầy đủ dựng bằng bản cũ được dựng lại khi gửi thẻ tin. Chỉ ghi
      // khi Zalo nhận đúng bản đầy đủ nhất.
      bodyVersion: { type: Number, default: 0 },
      bodyRetries: { type: Number, default: 0 }, // số lần đã dựng lại mà Zalo vẫn từ chối bản đầy đủ
      lastReject: { type: String, default: "" }, // lý do Zalo bỏ bản đầy đủ (hiện ở AdminWeb)
      // Bài Zalo đã nhận nhưng xử lý chưa xong (verify quá hạn) — lượt sau verify
      // tiếp bằng token này thay vì tạo bài mới (tránh bài rác trên OA).
      pending: {
        token: { type: String, default: "" },
        at: { type: Date, default: null },
        meta: { type: mongoose.Schema.Types.Mixed, default: null },
      },
      postedAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      lastError: { type: String, default: "" },
      // Bỏ qua tin này: không đăng bài OA, không tự gửi thẻ tin (backfill đánh dấu
      // tin cũ; cán bộ cũng có thể đặt cho tin không muốn gửi cho dân).
      skip: { type: Boolean, default: false },
      // Đã tạo bài (articleId) KHÁC đã gửi (broadcastedAt) — tạo bài thành công không
      // đảm bảo broadcast cũng thành công (2 lệnh gọi API tách biệt).
      broadcastedAt: { type: Date, default: null },
      broadcastError: { type: String, default: "" },
      // Tự động gửi thẻ tin (newsCardService.runAutoSend) — số lần thử lỗi (vd. không
      // tạo được bài OA, không lấy được danh sách follower), quá AUTO_MAX_ATTEMPTS thì thôi.
      cardAttempts: { type: Number, default: 0 },
      cardError: { type: String, default: "" },
      cardAttemptAt: { type: Date, default: null }, // lần thử gần nhất — hết lượt vẫn thử lại sau vài giờ
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
