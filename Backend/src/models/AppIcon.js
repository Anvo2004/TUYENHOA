const mongoose = require("mongoose");

// Thư viện ảnh icon dùng chung cho MiniApp — cán bộ chọn lại ảnh đã có thay vì
// upload trùng mỗi lần sửa một mục trong AppLink. Ảnh thật nằm trên Cloudinary
// (hoặc Backend/public/images khi thiếu cấu hình Cloudinary), đây chỉ lưu URL.
// Thư viện ảnh icon do cán bộ tải lên qua AdminWeb (bộ icon mặc định của MiniApp
// là bộ "Tuyên Hóa Số" đóng gói sẵn trong MiniApp/src/static/th-icons).
const appIconSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // định danh ngắn, vd "qr-code" — trùng slug nguồn để seed không tạo bản sao
  label: { type: String, required: true }, // tên tiếng Việt hiện trong bảng chọn
  url: { type: String, required: true },
  group: { type: String, default: "" }, // nhóm hiển thị trong bảng chọn, vd "Hành chính", "Y tế"
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AppIcon", appIconSchema);
