const express = require("express");
const Village = require("../models/Village");
const Citizen = require("../models/Citizen");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const WRITE_ROLES = ["superadmin", "dept_leader", "officer"];

router.get("/", async (req, res) => {
  const items = await Village.find().sort({ thuTu: 1, ten: 1 }).lean();
  // Số công dân đã liên kết Zalo và chọn thôn này (tab Cá nhân của MiniApp).
  const counts = await Citizen.aggregate([
    { $match: { villageId: { $ne: null } } },
    { $group: { _id: "$villageId", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({ items: items.map((v) => ({ ...v, soCongDan: byId.get(String(v._id)) || 0 })) });
});

router.post("/", requireRole(...WRITE_ROLES), async (req, res) => {
  const { ten, biThu, thonTruong, matTran, soHo, danSo, thuTu } = req.body;

  if (!ten) {
    return res.status(400).json({ error: "Thiếu tên thôn" });
  }

  const village = await Village.create({
    ten,
    biThu,
    thonTruong,
    matTran,
    soHo,
    danSo,
    thuTu,
  });

  res.json({ village });
});

router.put("/:id", requireRole(...WRITE_ROLES), async (req, res) => {
  const { ten, biThu, thonTruong, matTran, soHo, danSo, thuTu } = req.body;

  const village = await Village.findByIdAndUpdate(
    req.params.id,
    { ten, biThu, thonTruong, matTran, soHo, danSo, thuTu, updatedAt: new Date() },
    { new: true }
  );
  if (!village) return res.status(404).json({ error: "Not found" });
  // Hồ sơ công dân lưu kèm tên thôn để hiển thị nhanh → đổi tên thì đồng bộ theo.
  await Citizen.updateMany({ villageId: village._id }, { $set: { villageName: village.ten } });
  res.json({ village });
});

router.delete("/:id", requireRole(...WRITE_ROLES), async (req, res) => {
  const village = await Village.findByIdAndDelete(req.params.id);
  if (village) {
    // Công dân đang chọn thôn này phải chọn lại, không giữ liên kết tới thôn đã xoá.
    await Citizen.updateMany({ villageId: village._id }, { $set: { villageId: null, villageName: "" } });
  }
  res.json({ ok: true });
});

module.exports = router;
