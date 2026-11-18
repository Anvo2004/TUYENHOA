const express = require("express");
const multer = require("multer");
const { uploadFromBuffer } = require("./cloudinary");
const { requireRole } = require("../middleware/auth");

const WRITE_ROLES = ["superadmin", "dept_leader", "officer"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    IMAGE_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error("Chỉ nhận ảnh JPG, PNG hoặc WEBP")),
});

// Router CRUD admin cho danh mục đơn giản (Di tích, Lãnh đạo xã): list / create /
// update / delete + POST /upload (ảnh → Cloudinary hoặc đĩa VPS, xem utils/cloudinary.js).
// `fields` = các trường được phép ghi từ body (chặn ghi đè _id, createdAt...).
function crudRouter(Model, { fields, required = [], sort = { thuTu: 1 }, uploadFolder }) {
  const router = express.Router();
  const pick = (body) => {
    const out = {};
    for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
    return out;
  };

  router.get("/", async (req, res) => {
    const items = await Model.find().sort(sort).lean();
    res.json({ items });
  });

  router.post("/", requireRole(...WRITE_ROLES), async (req, res) => {
    const data = pick(req.body);
    const missing = required.filter((f) => !String(data[f] || "").trim());
    if (missing.length) return res.status(400).json({ error: `Thiếu trường bắt buộc: ${missing.join(", ")}` });
    const item = await Model.create(data);
    res.json({ item });
  });

  router.put("/:id", requireRole(...WRITE_ROLES), async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, { ...pick(req.body), updatedAt: new Date() }, { new: true });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  });

  router.delete("/:id", requireRole(...WRITE_ROLES), async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  });

  router.post(
    "/upload",
    requireRole(...WRITE_ROLES),
    (req, res, next) =>
      upload.single("file")(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Ảnh vượt quá 5MB" : err.message });
        next();
      }),
    async (req, res) => {
      if (!req.file) return res.status(400).json({ error: "Thiếu file ảnh" });
      const result = await uploadFromBuffer(req.file.buffer, uploadFolder);
      res.json({ url: result.secure_url });
    }
  );

  return router;
}

module.exports = { crudRouter };
