const mongoose = require("mongoose");

// Di tích lịch sử - văn hóa đã xếp hạng trên địa bàn xã (QĐ 70/QĐ-UBND ngày
// 12/01/2026 của UBND tỉnh giao xã quản lý). Seed từ src/data/di-tich.js
// (scripts/seed-di-tich-lanh-dao.js), cán bộ sửa qua AdminWeb → Di tích.
const diTichSchema = new mongoose.Schema({
  ten: { type: String, required: true },
  capDiTich: { type: String, default: "Cấp tỉnh" }, // "Quốc gia" | "Cấp tỉnh" | ...
  loaiHinh: { type: String, default: "Lịch sử" },
  quyetDinh: { type: String, default: "" }, // số/ngày quyết định xếp hạng
  diaChi: { type: String, default: "" },
  tomTat: { type: String, default: "" }, // 1 câu hiện ở danh sách
  moTa: { type: String, default: "" }, // nội dung chi tiết (nhiều đoạn, cách nhau "\n")
  duongDen: { type: String, default: "" }, // hướng dẫn đường đi (theo hồ sơ di tích)
  // Toạ độ WGS84 cho nút "Chỉ đường"; trống thì chỉ đường theo tên + địa chỉ.
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  image: { type: String, default: "" },
  nguonAnh: { type: String, default: "" }, // ghi nguồn ảnh (vd "Báo Quảng Trị") — hiện dưới ảnh
  thuTu: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model("DiTich", diTichSchema);
