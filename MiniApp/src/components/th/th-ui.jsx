import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";
import API_BASE_URL from "../../data/api-config.js";
import { openExternal } from "../../utils/open-external.js";
import logo from "../../static/logo-tuyenhoa.png";
import AppIcon from "../app-icon.jsx";
import { thIcon } from "./th-icons.js";

// Khối dựng dùng chung cho mọi màn của giao diện "Tuyên Hóa Số" (bộ Xanh dương).
// Style nằm ở css/th.css — giữ đúng thông số bản HTML thiết kế.

// ---------- Icon nét (stroke) nhỏ dùng trong nút/ô nhập ----------
const PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  chev: <path d="M9 6l6 6-6 6" />,
  down: <path d="M6 9l6 6 6-6" />,
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>),
  bell: (<><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  phone: <path d="M6.6 3.5h2.7l1.4 3.9-1.8 1.2a11 11 0 0 0 5.5 5.5l1.2-1.8 3.9 1.4v2.7a1.8 1.8 0 0 1-2 1.8A15.5 15.5 0 0 1 4.8 5.5a1.8 1.8 0 0 1 1.8-2z" />,
  send: <path d="M4 12l16-8-6 16-2.5-6.5z" />,
  pin: (<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>),
  edit: (<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13 7l4 4" /></>),
  cal: (<><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  refresh: (<><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></>),
  shield: (<><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  ext: (<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" /></>),
  copy: (<><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" /></>),
  file: (<><path d="M7 3.5h7l4 4v13H7z" /><path d="M14 3.5v4h4M12 11v6M9.5 14.5L12 17l2.5-2.5" /></>),
  qr: (<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" /></>),
  gift: (<><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M12 9v11M4 13h16M12 9c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1" /></>),
  play: <path d="M9 7l8 5-8 5z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  user: (<><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20c.6-4 3.6-6 7.5-6s6.9 2 7.5 6" /></>),
  home: (<><path d="M4 11l8-6.5 8 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" /><path d="M10 20.5v-5h4v5" /></>),
  grid: (<><rect x="4" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" /></>),
  mega: (<><path d="M4 10v4h3l6 4V6L7 10z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11" /></>),
};

export const Ic = ({ n, size = 18, sw = 2, color = "currentColor", style }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
  >
    {PATHS[n]}
  </svg>
);

// Icon 3D theo slug; không có slug trong bộ thì rỗng.
export const Th3 = ({ name, size = 44, alt = "", style }) => {
  const src = thIcon(name);
  return src ? <img src={src} alt={alt} width={size} height={size} style={style} /> : null;
};

// ---------- Khung trang ----------
export const ThPage = ({ children, className = "" }) => (
  <Page className={`th-page ${className}`.trim()}>
    <div className="th-root">{children}</div>
  </Page>
);

const Circles = () => (
  <>
    <span aria-hidden="true" className="th-hdr__c1" />
    <span aria-hidden="true" className="th-hdr__c2" />
  </>
);

// Chấm đỏ trên chuông = đang có thông báo (/api/public/thong-bao). Cache theo
// phiên để các tab không gọi lại mỗi lần chuyển trang.
let noticeCache = null;
export function useHasNotices() {
  const [has, setHas] = useState(Boolean(noticeCache));
  useEffect(() => {
    if (noticeCache !== null) return;
    fetch(`${API_BASE_URL}/api/public/thong-bao`)
      .then((res) => res.json())
      .then((d) => {
        noticeCache = (d.items || []).length > 0;
        setHas(noticeCache);
      })
      .catch(() => {});
  }, []);
  return has;
}

// Thanh thương hiệu lớn (Trang chủ + các tab chính): logo + "XÃ TUYÊN HÓA" + chuông.
const BrandBar = () => {
  const navigate = useNavigate();
  const bellDot = useHasNotices();
  return (
    <div className="th-hdr__bar">
      <img src={logo} alt="Logo UBND xã Tuyên Hóa" width="46" height="46" className="th-logo" />
      <div className="th-brand">
        <b>XÃ TUYÊN HÓA</b>
        <span>Chính quyền số gần dân</span>
      </div>
      <button type="button" aria-label="Thông báo" className="th-glassbtn" onClick={() => navigate("/thong-bao")}>
        <Ic n="bell" size={20} color="#fff" />
        {bellDot && <span className="th-glassbtn__dot" />}
      </button>
    </div>
  );
};

// Header Trang chủ: thanh thương hiệu + ô tìm kiếm (children).
export const ThHomeHeader = ({ children }) => (
  <header className="th-hdr th-hdr--home">
    <Circles />
    <div className="th-hdr__in">
      <BrandBar />
      {children}
    </div>
  </header>
);

// Header trang: `tab` = trang thuộc thanh điều hướng (thanh thương hiệu lớn,
// không có nút quay lại); còn lại là trang con (nút quay lại + logo nhỏ).
// `art` = slug icon 3D minh hoạ bên phải tiêu đề. `variant="tabs"` chừa chỗ
// cho tab phân đoạn nổi chồng lên đáy header.
export const ThHeader = ({ title, desc, art, tab, kicker = "XÃ TUYÊN HÓA", variant, onBack }) => {
  const navigate = useNavigate();
  return (
    <header className={`th-hdr ${variant === "tabs" ? "th-hdr--tabs" : ""}`}>
      <Circles />
      <div className="th-hdr__in">
        {tab ? (
          <BrandBar />
        ) : (
          <div className="th-hdr__bar">
            <button type="button" aria-label="Quay lại" className="th-glassbtn" onClick={onBack || (() => navigate(-1))}>
              <Ic n="back" size={19} sw={2.4} color="#fff" />
            </button>
            <img src={logo} alt="" width="30" height="30" className="th-logo th-logo--sm" />
            <span className="th-brand-sm">{kicker}</span>
          </div>
        )}
        <div className="th-hdr__title" style={art ? undefined : { paddingRight: 0 }}>
          <h1>{title}</h1>
          {desc && <p>{desc}</p>}
          {art && <img src={thIcon(art)} alt="" className="th-hdr__art" />}
        </div>
      </div>
    </header>
  );
};

// ---------- Mục có tiêu đề vạch gradient ----------
export const ThSection = ({ title, action, tight, children, style }) => (
  <section className={`th-sec ${tight ? "th-sec--tight" : ""}`} style={style}>
    {(title || action) && (
      <div className="th-sec__h">
        {title ? <h2>{title}</h2> : <span />}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const MoreLink = ({ children, onClick }) => (
  <button type="button" className="th-more" onClick={onClick}>
    {children}
    <Ic n="chev" size={14} sw={2.2} />
  </button>
);

// ---------- Toast nhỏ (thay alert) ----------
let toastTimer;
export function useToast() {
  const [msg, setMsg] = useState("");
  const show = (m) => {
    setMsg(m);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setMsg(""), 2400);
  };
  const node = msg ? <div className="th-toast" role="status">{msg}</div> : null;
  return [node, show];
}

// ---------- Mở một mục AppLink (route nội bộ / link ngoài / chưa cấu hình) ----------
export function useOpenLink(onMissing) {
  const navigate = useNavigate();
  return (item) => {
    if (item.path) navigate(item.path);
    else if (item.href) openExternal(item.href);
    else onMissing?.(item);
  };
}

// Icon của một mục AppLink: ảnh tải lên (iconUrl) > bộ icon Tuyên Hóa (slug) > icon vector cũ.
export const LinkIcon = ({ item, size = 44 }) => {
  if (item.iconUrl) return <img src={item.iconUrl} alt="" width={size} height={size} loading="lazy" />;
  const src = thIcon(item.icon);
  if (src) return <img src={src} alt="" width={size} height={size} />;
  return <AppIcon name={item.icon} color={item.color || "n"} vectorClass="i24" />;
};

// Tải danh sách AppLink theo section (quick_link | gov | econ | service | portal).
export function useAppLinks(section) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE_URL}/api/public/app-links?section=${section}`)
      .then((res) => res.json())
      .then((d) => alive && setItems(d.items || []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [section]);
  return items;
}

// Lưới icon 4 cột (Trang chủ).
export const ThLinkGrid = ({ items, onOpen }) => (
  <div className="th-grid">
    {items.map((item) => (
      <button key={item._id || item.label} type="button" className="th-gi" onClick={() => onOpen(item)}>
        <span className="th-gi__ic">
          <LinkIcon item={item} />
        </span>
        <span className="th-gi__lb">{item.label}</span>
      </button>
    ))}
  </div>
);

// ---------- Tab phân đoạn + chip ----------
export const ThSeg = ({ options, value, onChange, flat, className = "" }) => (
  <div role="tablist" className={`th-seg ${flat ? "th-seg--flat" : ""} ${className}`.trim()}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        role="tab"
        aria-selected={value === o.value}
        className={value === o.value ? "on" : ""}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const ThChips = ({ options, value, onChange, wrap, soft }) => (
  <div className={`th-chips ${wrap ? "th-chips--wrap" : ""}`}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={value === o.value}
        className={`th-chip ${soft ? "th-chip--soft" : ""} ${value === o.value ? "on" : ""}`}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// Ô chọn (select) theo kiểu ô nhập của thiết kế.
export const ThSelect = ({ icon, value, onChange, children, ariaLabel }) => (
  <span className="th-input" style={icon ? { paddingLeft: 14 } : undefined}>
    {icon && <Ic n={icon} size={18} color="#1646C8" />}
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel}>
      {children}
    </select>
    <span className="th-input__chev">
      <Ic n="down" size={16} sw={2.2} />
    </span>
  </span>
);

export const ThEmpty = ({ icon, title, desc, children }) => (
  <div className="th-empty">
    {icon && (
      <span className="th-empty__ic">
        <Th3 name={icon} size={62} />
      </span>
    )}
    <b>{title}</b>
    {desc && <span>{desc}</span>}
    {children}
  </div>
);

export const ThNote = ({ children, icon = "shield" }) => (
  <section className="th-note">
    <span className="th-note__ic">
      <Ic n={icon} size={18} color="#fff" />
    </span>
    <p>{children}</p>
  </section>
);
