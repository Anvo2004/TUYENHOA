const mongoose = require("mongoose");

// Lãnh đạo xã và các cơ quan, đơn vị (tiện ích "Lãnh đạo xã" trên MiniApp).
// Seed từ src/data/lanh-dao.js (Phụ lục I công văn cung cấp thông tin Trang TTĐT,
// 11/2026); cán bộ sửa qua AdminWeb → Lãnh đạo xã.
const lanhDaoSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  chucVu: { type: String, default: "" },
  coQuan: { type: String, default: "" }, // nhóm hiển thị: "UBND xã", "HĐND xã"...
  dienThoai: { type: String, default: "" },
  email: { type: String, default: "" },
  anh: { type: String, default: "" },
  thuTu: { type: Number, default: 0 }, // thứ tự trong toàn danh sách (nhóm theo thứ tự xuất hiện)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model("LanhDao", lanhDaoSchema);
