const express = require("express");
const KhaoSat = require("../models/KhaoSat");
const { requireZaloUser } = require("../utils/zaloMiniApp");
const { checkRateLimit } = require("../utils/rateLimit");

// Các lựa chọn cố định của khảo sát (khớp MiniApp/src/pages/cong-du-lieu.jsx).
// Đổi danh sách ở cả 2 nơi; phiếu cũ mang lựa chọn đã bỏ vẫn hiện trong thống kê.
const OPTIONS = [
  "Lịch cắt điện, cấp nước",
  "Tra cứu hồ sơ thủ tục",
  "Phản ánh hiện trường",
  "Thông tin việc làm",
];

// Public (MiniApp): danh tính lấy từ access token Zalo, KHÔNG từ body — tránh
// gửi phiếu thay người khác.
const publicRouter = express.Router();
publicRouter.get("/", (req, res) => res.json({ options: OPTIONS }));
publicRouter.post("/", requireZaloUser, async (req, res) => {
  const option = String(req.body?.option || "").trim();
  if (!OPTIONS.includes(option)) {
    return res.status(400).json({ error: "Lựa chọn không hợp lệ" });
  }
  const { allowed } = await checkRateLimit(`khao-sat:${req.zaloUserId}`, 10, 60 * 60);
  if (!allowed) return res.status(429).json({ error: "Bạn gửi quá nhiều lần. Vui lòng thử lại sau." });

  await KhaoSat.updateOne(
    { zaloUserId: req.zaloUserId },
    { $set: { option, updatedAt: new Date() } },
    { upsert: true }
  );
  res.json({ ok: true });
});

// Admin (JWT): thống kê số phiếu theo lựa chọn.
const adminRouter = express.Router();
adminRouter.get("/stats", async (req, res) => {
  const rows = await KhaoSat.aggregate([{ $group: { _id: "$option", count: { $sum: 1 } } }]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const items = [...new Set([...OPTIONS, ...Object.keys(counts)])].map((option) => ({
    option,
    count: counts[option] || 0,
  }));
  res.json({ total: rows.reduce((s, r) => s + r.count, 0), items });
});

module.exports = { publicRouter, adminRouter, OPTIONS };
