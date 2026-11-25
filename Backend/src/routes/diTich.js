const DiTich = require("../models/DiTich");
const { crudRouter } = require("../utils/crudRouter");

// CRUD admin "Di tích" (AdminWeb → Di tích). Bản public: GET /api/public/di-tich.
module.exports = crudRouter(DiTich, {
  fields: ["ten", "capDiTich", "loaiHinh", "quyetDinh", "diaChi", "tomTat", "moTa", "duongDen", "lat", "lng", "image", "nguonAnh", "thuTu"],
  required: ["ten"],
  sort: { thuTu: 1, ten: 1 },
  uploadFolder: "tuyenhoa-di-tich",
});
