const mongoose = require("mongoose");

// Danh sách icon/liên kết hiển thị trong MiniApp (Trang chủ "Tiện ích nhanh",
// trang "Dịch vụ" + "Cổng dịch vụ công") — nhập tay qua AdminWeb thay vì
// hardcode trong MiniApp/src/data/*.js, để đổi icon/link không cần build lại
// app. `section` phân biệt nơi hiển thị:
//   - quick_link: lưới "Tiện ích nhanh" ở Trang chủ
//   - gov:        lưới "Chính quyền số" ở Trang chủ
//   - econ:       lưới "Kinh tế · Văn hóa · Học tập" ở Trang chủ
//   - service:    danh sách dịch vụ chính ở trang /dich-vu
//   - portal:     danh sách "Cổng kết nối" ở cuối trang /dich-vu
//   - data:       "Bộ dữ liệu mở" ở trang /cong-du-lieu (description = mô tả ngắn,
//                 badge = định dạng XLSX/CSV/PDF/BẢN ĐỒ, href = link tải/xem)
const appLinkSchema = new mongoose.Schema({
  section: { type: String, enum: ["quick_link", "gov", "econ", "service", "portal", "data"], required: true },
  // Tên icon: ưu tiên slug bộ icon Tuyên Hóa (MiniApp/src/static/th-icons/<slug>.svg,
  // vd "phan-anh"), không có thì tra MiniApp/src/data/icon-paths.js (dự phòng).
  icon: { type: String, default: "" },
  iconUrl: { type: String, default: "" }, // ảnh icon 3D đã upload; có giá trị thì MiniApp ưu tiên dùng thay cho `icon`
  color: { type: String, default: "" }, // hậu tố lớp .tile-<color>, thuần hiển thị
  label: { type: String, required: true }, // tên hiển thị
  type: { type: String, enum: ["online", "offline", ""], default: "" }, // chỉ dùng cho section=service
  description: { type: String, default: "" }, // section=portal/data
  badge: { type: String, default: "" }, // section=portal ("Đang hoàn thiện") / data (định dạng)
  path: { type: String, default: "" }, // route nội bộ MiniApp, vd "/dan-so"
  href: { type: String, default: "" }, // URL ngoài, vd "https://..."
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model("AppLink", appLinkSchema);
