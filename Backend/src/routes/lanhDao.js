const LanhDao = require("../models/LanhDao");
const { crudRouter } = require("../utils/crudRouter");

// CRUD admin "Lãnh đạo xã" (AdminWeb → Lãnh đạo xã). Bản public: GET /api/public/lanh-dao.
module.exports = crudRouter(LanhDao, {
  fields: ["hoTen", "chucVu", "coQuan", "dienThoai", "email", "anh", "thuTu"],
  required: ["hoTen"],
  sort: { thuTu: 1, hoTen: 1 },
  uploadFolder: "tuyenhoa-lanh-dao",
});
