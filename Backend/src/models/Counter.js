const mongoose = require("mongoose");

// Bộ đếm tăng dần dùng chung (atomic qua $inc) — hiện dùng cho mã phản ánh tự
// cấp (services/feedbackCodeService.js). _id là tên bộ đếm.
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", CounterSchema);
