// Cập nhật lưới "Tiện ích" Trang chủ trên DB đang chạy (seed-app-links.js bỏ qua
// section đã có dữ liệu) theo yêu cầu xã 16/11/2026:
//   - Bỏ OCOP, BHXH, Mã số thuế, Cổng dữ liệu, Camera an ninh, Khảo sát.
//   - Gán link "Học vụ số" (lấy từ ECON_LINKS trong seed-app-links.js).
//   - Đánh lại thứ tự từng nhóm gov / econ cho liền mạch.
// An toàn để chạy lại. Chạy trên VPS: cd Backend && node scripts/update-home-links.js
const mongoose = require("mongoose");
const config = require("../src/config");
const AppLink = require("../src/models/AppLink");
const { ECON_LINKS } = require("./seed-app-links");

const REMOVED = ["OCOP", "BHXH", "Mã số thuế", "Cổng dữ liệu", "Camera an ninh", "Khảo sát"];

async function main() {
  await mongoose.connect(config.mongoUri);

  const del = await AppLink.deleteMany({ section: { $in: ["quick_link", "gov", "econ"] }, label: { $in: REMOVED } });
  console.log(`Đã xoá ${del.deletedCount} mục:`, REMOVED.join(", "));

  const hocVuSo = ECON_LINKS.find((l) => l.label === "Học vụ số");
  const upd = await AppLink.updateMany({ section: "econ", label: "Học vụ số" }, { $set: { href: hocVuSo.href, path: "" } });
  console.log(`Học vụ số → ${hocVuSo.href} (${upd.modifiedCount} bản ghi)`);

  for (const section of ["gov", "econ"]) {
    const items = await AppLink.find({ section }).sort({ order: 1, label: 1 });
    await Promise.all(items.map((it, i) => AppLink.updateOne({ _id: it._id }, { $set: { order: i + 1 } })));
    console.log(`[${section}]`, items.map((it) => it.label).join(" · "));
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
