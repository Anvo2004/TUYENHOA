// Điền ảnh + nguồn ảnh di tích (src/data/di-tich.js) vào DB đang chạy — CHỈ cho di
// tích chưa có ảnh trong DB (không đè ảnh cán bộ đã tải lên qua AdminWeb). So theo tên.
// Chạy: cd Backend && node scripts/update-di-tich-anh.js
const mongoose = require("mongoose");
const config = require("../src/config");
const DiTich = require("../src/models/DiTich");
const DI_TICH = require("../src/data/di-tich");

async function main() {
  await mongoose.connect(config.mongoUri);
  for (const d of DI_TICH.filter((x) => x.image)) {
    const doc = await DiTich.findOne({ ten: d.ten });
    if (!doc) {
      console.log(`- Không thấy "${d.ten}" trong DB, bỏ qua.`);
    } else if (doc.image && doc.image !== d.image) {
      console.log(`- "${d.ten}" đã có ảnh khác (cán bộ tải lên?), giữ nguyên.`);
    } else {
      await DiTich.updateOne({ _id: doc._id }, { $set: { image: d.image, nguonAnh: d.nguonAnh || "", updatedAt: new Date() } });
      console.log(`✓ "${d.ten}" ← ${d.image.split("/").pop()}`);
    }
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
