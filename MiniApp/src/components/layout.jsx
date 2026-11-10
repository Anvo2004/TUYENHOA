import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icons3DDefs } from "./ns/ns-icons3d.jsx";

// Thanh điều hướng dưới theo bộ giao diện "Tuyên Hóa Số" (màn 18-ThanhDieuHuong):
// nền trắng bo góc trên, 5 ô Trang chủ · Dịch vụ · [Phản ánh — nút tròn đỏ nổi
// giữa] · Liên hệ · Cá nhân; tab đang chọn tô xanh + vạch gradient dưới nhãn.
// Đỏ chỉ dùng cho nút Phản ánh (quy ước màu của bộ thiết kế).
//
// "Hiến kế" vẫn ẩn khỏi điều hướng — trang /hien-ke chưa có backend lưu dữ liệu
// thật (bấm gửi chỉ alert() rồi mất). Route còn trong code, chỉ bỏ lối vào.
const TABS = [
  {
    key: "/",
    label: "Trang chủ",
    icon: <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z" />,
  },
  {
    key: "/dich-vu",
    label: "Dịch vụ",
    icon: (
      <>
        <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
      </>
    ),
  },
  { key: "/phan-anh", label: "Phản ánh", also: ["/phan-anh-cua-toi"], center: true },
  {
    key: "/lien-he",
    label: "Liên hệ",
    icon: (
      <path d="M6.6 3.5h2.6l1.5 4-2 1.3a11 11 0 0 0 6.5 6.5l1.3-2 4 1.5v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />
    ),
  },
  {
    key: "/cong-dan",
    label: "Cá nhân",
    also: ["/tich-diem"],
    icon: (
      <>
        <circle cx="12" cy="8.5" r="3.8" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0z" />
      </>
    ),
  },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOn = (t) => t.key === location.pathname || (t.also || []).includes(location.pathname);

  return (
    <div className="layout">
      {/* Gradient dùng chung cho icon 3D vector của các trang cũ (giao diện "ns-") */}
      <Icons3DDefs />
      <div className="layout__content">{children}</div>
      <div className="th-tabbar">
        <nav className="th-tabbar__nav" aria-label="Điều hướng chính">
          {TABS.map((tab) => {
            const on = isOn(tab);
            return (
              <button
                key={tab.key}
                type="button"
                className={`th-tab ${on ? "on" : ""}`}
                aria-current={on ? "page" : undefined}
                onClick={() => navigate(tab.key)}
              >
                {!tab.center && (
                  <svg
                    aria-hidden="true"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={on ? "currentColor" : "none"}
                    fillOpacity=".16"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {tab.icon}
                  </svg>
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <button type="button" className="th-fab" aria-label="Gửi phản ánh" onClick={() => navigate("/phan-anh")}>
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10v4a1 1 0 0 0 1 1h2l6 4.5v-15L7 9H5a1 1 0 0 0-1 1z" />
            <path d="M16.5 9a4 4 0 0 1 0 6" />
            <path d="M19 6.5a7.5 7.5 0 0 1 0 11" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Layout;
