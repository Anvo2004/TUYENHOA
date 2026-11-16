// Cập nhật dữ liệu đã seed trên DB đang chạy (seed-*.js bỏ qua mục đã có dữ liệu):
//   1. Ghép thông tin liên hệ do xã cung cấp (CONTACT trong seed-site-content.js)
//      vào SiteInfo.contact — chỉ ghi các trường có trong CONTACT, giữ nguyên
//      các trường khác cán bộ đã nhập (giờ làm việc, PCTT, bản đồ...).
//   2. Thêm mục "Chỉ đạo điều hành" vào danh sách Dịch vụ nếu chưa có.
// An toàn để chạy lại. Chạy trên VPS: cd Backend && node scripts/update-contact.js
const mongoose = require("mongoose");
const config = require("../src/config");
const SiteInfo = require("../src/models/SiteInfo");
const AppLink = require("../src/models/AppLink");
const { CONTACT } = require("./seed-site-content");
const { SERVICES } = require("./seed-app-links");

async function main() {
  await mongoose.connect(config.mongoUri);

  const set = { updatedAt: new Date() };
  for (const [k, v] of Object.entries(CONTACT)) {
    if (v && typeof v === "object") {
      for (const [k2, v2] of Object.entries(v)) set[`contact.${k}.${k2}`] = v2;
    } else {
      set[`contact.${k}`] = v;
    }
  }
  await SiteInfo.updateOne({}, { $set: set }, { upsert: true });
  console.log("Đã cập nhật SiteInfo.contact:", Object.keys(set).filter((k) => k !== "updatedAt").join(", "));

  const chiDao = SERVICES.find((s) => s.path === "/thong-bao?tab=chi-dao");
  if (await AppLink.exists({ section: "service", path: chiDao.path })) {
    console.log("Mục Dịch vụ 'Chỉ đạo điều hành' đã có, bỏ qua.");
  } else {
    const last = await AppLink.findOne({ section: "service" }).sort({ order: -1 }).lean();
    await AppLink.create({ ...chiDao, section: "service", order: (last?.order || 0) + 1 });
    console.log("Đã thêm mục Dịch vụ 'Chỉ đạo điều hành'.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
