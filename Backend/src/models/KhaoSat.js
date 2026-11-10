const mongoose = require("mongoose");

// Phiếu "Khảo sát nhu cầu" ở màn Cổng dữ liệu của MiniApp (người dân chọn 1
// tiện ích muốn xã ưu tiên). Mỗi tài khoản Zalo giữ 1 phiếu — gửi lại thì ghi
// đè lựa chọn cũ (xem routes/khaoSat.js), để thống kê không bị dồn phiếu.
const khaoSatSchema = new mongoose.Schema({
  zaloUserId: { type: String, required: true, unique: true },
  option: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("KhaoSat", khaoSatSchema);
