const Counter = require("../models/Counter");

// ============================================================
// Mã phản ánh do hệ thống TỰ CẤP — dùng khi KHÔNG tích hợp Cổng góp ý 1022
// (1022 là hệ thống của TP Đà Nẵng, xã Tuyên Hóa thuộc tỉnh Quảng Trị nên
// không có). Mã là số 6 chữ số tăng dần (100001, 100002, ...) giống mẫu
// "#115377" trong bộ giao diện, cấp atomic qua Counter nên không trùng.
//
// Khi 1022 được cấu hình, mã hiển thị vẫn ưu tiên cgy1022.gopyId như cũ —
// xem displayCode().
// ============================================================

const COUNTER_ID = "feedback_code";
const START_AT = 100000;

async function nextFeedbackCode() {
  // Lần đầu: upsert tạo bộ đếm ở START_AT rồi mới $inc (không chạy được $inc
  // và $setOnInsert trên cùng field nên tách 2 bước; bước 1 vô hại nếu đã có).
  await Counter.updateOne(
    { _id: COUNTER_ID },
    { $setOnInsert: { seq: START_AT } },
    { upsert: true }
  );
  const c = await Counter.findOneAndUpdate(
    { _id: COUNTER_ID },
    { $inc: { seq: 1 } },
    { new: true }
  );
  return String(c.seq);
}

// Mã hiển thị cho người dân/cán bộ: mã 1022 nếu có, không thì mã tự cấp.
function displayCode(fb) {
  return fb?.cgy1022?.gopyId || fb?.code || "";
}

module.exports = { nextFeedbackCode, displayCode };
