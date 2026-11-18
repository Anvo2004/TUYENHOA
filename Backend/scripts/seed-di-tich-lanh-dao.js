// Nạp danh mục Di tích (src/data/di-tich.js) và Lãnh đạo xã (src/data/lanh-dao.js)
// vào DB, đồng thời:
//   - nối tiện ích Trang chủ "Lãnh đạo xã" sang màn /lanh-dao;
//   - điền Chủ tịch UBND xã vào SiteInfo.contact.chairman (màn Liên hệ) nếu còn trống.
// Mặc định chỉ nạp collection còn trống (không ghi đè dữ liệu cán bộ đã sửa qua
// AdminWeb); --force để xoá và nạp lại toàn bộ 2 danh mục.
// Chạy: cd Backend && node scripts/seed-di-tich-lanh-dao.js [--force]
const mongoose = require("mongoose");
const config = require("../src/config");
const DiTich = require("../src/models/DiTich");
const LanhDao = require("../src/models/LanhDao");
const AppLink = require("../src/models/AppLink");
const SiteInfo = require("../src/models/SiteInfo");
const DI_TICH = require("../src/data/di-tich");
const LANH_DAO = require("../src/data/lanh-dao");

const force = process.argv.includes("--force");

async function seed(name, Model, items) {
  const count = await Model.countDocuments();
  if (count && !force) {
    console.log(`${name}: đã có ${count} bản ghi, bỏ qua (dùng --force để nạp lại).`);
    return;
  }
  if (count) await Model.deleteMany({});
  await Model.insertMany(items);
  console.log(`${name}: đã nạp ${items.length} bản ghi.`);
}

async function main() {
  await mongoose.connect(config.mongoUri);
  await seed("DiTich", DiTich, DI_TICH);
  await seed("LanhDao", LanhDao, LANH_DAO);

  const link = await AppLink.updateMany({ label: "Lãnh đạo xã" }, { $set: { path: "/lanh-dao", href: "" } });
  console.log(`AppLink "Lãnh đạo xã" → /lanh-dao (${link.modifiedCount} bản ghi)`);

  const chairman = LANH_DAO.find((p) => /Chủ tịch UBND xã/.test(p.chucVu));
  const site = await SiteInfo.findOne().lean();
  if (chairman && !site?.contact?.chairman?.name) {
    await SiteInfo.updateOne(
      {},
      { $set: { "contact.chairman.name": chairman.hoTen, "contact.chairman.title": "Chủ tịch UBND xã Tuyên Hóa", "contact.chairman.phone": chairman.dienThoai } },
      { upsert: true }
    );
    console.log(`SiteInfo.contact.chairman = ${chairman.hoTen}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
