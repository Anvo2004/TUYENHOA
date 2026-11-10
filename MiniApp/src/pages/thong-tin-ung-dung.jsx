import React from "react";
import { Page, Header, Box } from "zmp-ui";
import SITE from "../data/site.js";
import { openExternal } from "../utils/open-external.js";
import logo from "../static/logo-tuyenhoa.png";

// Nguồn tư liệu hiển thị ở cuối trang. Bộ icon 3D và logo là của bộ giao diện
// "Tuyên Hóa Số" (không cần ghi công bên thứ ba); phông Be Vietnam Pro theo
// giấy phép SIL Open Font License.
const CREDITS = [
  { label: "Bộ icon & giao diện", value: "Tuyên Hóa Số – bộ Xanh dương" },
  { label: "Phông chữ", value: "Be Vietnam Pro (SIL OFL)" },
];

const ThongTinUngDungPage = () => (
  <Page className="page-about">
    <Header title="Thông tin ứng dụng" />

    <Box className="section">
      <div className="about-card">
        <img className="about-card__logo" src={logo} alt="" />
        <div className="about-card__name">{SITE.appName}</div>
        <div className="about-card__desc">
          Ứng dụng chính quyền số của {SITE.office}, {SITE.province.replace(/^T/, "t")}
        </div>
        <div className="about-card__version">Phiên bản 1.0.0</div>
      </div>

      <div className="about-block">
        <div className="about-block__title">Nguồn tư liệu & hình ảnh</div>
        {CREDITS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="about-row"
            onClick={item.href ? () => openExternal(item.href) : undefined}
            disabled={!item.href}
          >
            <span className="about-row__label">{item.label}</span>
            <span className="about-row__value">{item.value}</span>
          </button>
        ))}
      </div>

      <p className="about-note">
        Mọi góp ý về ứng dụng xin gửi qua mục Phản ánh hoặc liên hệ trực tiếp
        UBND xã.
      </p>
    </Box>
  </Page>
);

export default ThongTinUngDungPage;
