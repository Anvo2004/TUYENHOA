// Nạp nội dung trang Du lịch / Văn hóa (DU_LICH, VAN_HOA trong seed-site-content.js)
// vào DB đang chạy. Mặc định CHỈ điền mục còn trống — không ghi đè nội dung cán bộ
// đã nhập qua AdminWeb; thêm --force để thay toàn bộ.
// Chạy trên VPS: cd Backend && node scripts/update-du-lich-van-hoa.js [--force]
const mongoose = require("mongoose");
const config = require("../src/config");
const DuLich = require("../src/models/DuLich");
const VanHoa = require("../src/models/VanHoa");
const { DU_LICH, VAN_HOA } = require("./seed-site-content");

const force = process.argv.includes("--force");

async function fill(name, Model, data) {
  const doc = (await Model.findOne().lean()) || {};
  const set = {};
  for (const [k, v] of Object.entries(data)) {
    const cur = doc[k];
    const empty = cur == null || cur === "" || (Array.isArray(cur) && cur.length === 0);
    if (force || empty) set[k] = v;
  }
  if (!Object.keys(set).length) {
    console.log(`${name}: đã có nội dung, bỏ qua (dùng --force để ghi đè).`);
    return;
  }
  await Model.updateOne({}, { $set: { ...set, updatedAt: new Date() } }, { upsert: true });
  console.log(`${name}: đã cập nhật`, Object.keys(set).join(", "));
}

async function main() {
  await mongoose.connect(config.mongoUri);
  await fill("DuLich", DuLich, DU_LICH);
  await fill("VanHoa", VanHoa, VAN_HOA);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
