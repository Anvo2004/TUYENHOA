import React, { useEffect, useState } from "react";
import API_BASE_URL from "../data/api-config.js";
import { ThPage, ThHeader, ThSection, ThSelect, ThEmpty, Ic } from "../components/th/th-ui.jsx";

// Màn Lịch cắt điện theo bộ giao diện "Tuyên Hóa Số" (08-LichCatDien). Dữ liệu
// đồng bộ tự động từ EVN CPC / xenvn (catDienService.js) — chưa cấu hình điện
// lực thì danh sách rỗng.
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const pad = (n) => String(n).padStart(2, "0");

// Ngày giờ từ Date ISO; thiếu thì tách từ chuỗi "HH:mm dd/MM/yyyy" của nguồn.
function parts(iso, str = "") {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const m = str.match(/(\d{1,2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? new Date(Number(m[5]), Number(m[4]) - 1, Number(m[3]), Number(m[1]), Number(m[2])) : null;
}
const hhmm = (d) => (d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : "--:--");
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

function formatDateTime(iso) {
  const d = new Date(iso);
  return `${hhmm(d)} · ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Job đồng bộ chạy mỗi 30 phút — quá lâu không chạy (VD: 3 tiếng) là dấu hiệu
// pipeline đã ngừng hoạt động, không phải đơn giản là "không có lịch cắt điện".
const STALE_SYNC_HOURS = 3;

const DateField = ({ label, value, onChange }) => (
  <label className="th-field">
    <span className="th-label">{label}</span>
    <span className="th-input">
      <Ic n="cal" size={18} color="#1646C8" />
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </span>
  </label>
);

const OutageCard = ({ item }) => {
  const from = parts(item.fromDate, item.fromDateStr);
  const to = parts(item.toDate, item.toDateStr);
  const today = sameDay(from, new Date());
  return (
    <article className="th-art">
      <div style={{ display: "flex", gap: 14 }}>
        <div
          style={{
            width: 64,
            flexShrink: 0,
            padding: "8px 0 9px",
            borderRadius: 16,
            background: "var(--th-btn-grad)",
            color: "#fff",
            boxShadow: "0 8px 16px rgba(22,70,200,.28)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            alignSelf: "flex-start",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.88)" }}>
            {from ? `Th${from.getMonth() + 1}` : ""}
          </span>
          <strong style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 800 }}>{from ? pad(from.getDate()) : "--"}</strong>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.88)" }}>{from ? WEEKDAYS[from.getDay()] : ""}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 800, color: "var(--th-primary)" }}>
              <Ic n="clock" size={16} />
              {hhmm(from)} – {hhmm(to)}
            </span>
            <span className={`th-pill ${today ? "th-pill--red" : ""}`}>{today ? "Hôm nay" : item.statusStr || "Dự kiến"}</span>
          </span>
          <b style={{ fontSize: 14.5, lineHeight: 1.4, fontWeight: 700 }}>{item.stationName || "Đang cập nhật khu vực"}</b>
          <span className="th-sub">Lý do: {item.reason || "Đang cập nhật"}</span>
          {item.subOrgName && <span className="th-meta">Đơn vị: {item.subOrgName}</span>}
        </div>
      </div>
    </article>
  );
};

const LichCupDienPage = () => {
  const [stations, setStations] = useState([]);
  const [station, setStation] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = () => {
    const params = new URLSearchParams();
    if (station !== "all") params.set("station", station);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    setLoading(true);
    setError("");
    fetch(`${API_BASE_URL}/api/public/lich-cup-dien?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setError("Không thể tải dữ liệu lịch cắt điện. Vui lòng thử lại sau."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/lich-cup-dien/tram`)
      .then((res) => res.json())
      .then((data) => {
        setStations(data.stations || []);
        setLastSyncedAt(data.lastSyncedAt || null);
      })
      .catch(() => setStations([]));
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stale = lastSyncedAt && (Date.now() - new Date(lastSyncedAt).getTime()) / 3600000 > STALE_SYNC_HOURS;

  return (
    <ThPage>
      <ThHeader
        title="Lịch cắt điện"
        desc="Lịch tạm ngừng cung cấp điện trên địa bàn xã Tuyên Hóa (nguồn: Điện lực, EVN CPC)."
        art="lich-cat-dien"
      />

      <section className="th-card th-card--float th-float th-stack">
        <label className="th-field">
          <span className="th-label">Khu vực</span>
          <ThSelect icon="pin" value={station} onChange={setStation} ariaLabel="Khu vực">
            <option value="all">Tất cả khu vực</option>
            {stations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </ThSelect>
        </label>
        <div className="th-btn-row">
          <DateField label="Từ ngày" value={dateFrom} onChange={setDateFrom} />
          <DateField label="Đến ngày" value={dateTo} onChange={setDateTo} />
        </div>
        <button type="button" className="th-btn" onClick={search}>
          <Ic n="search" size={18} sw={2.2} />
          Tìm kiếm
        </button>
      </section>

      {lastSyncedAt && (
        <p style={{ margin: "12px 18px 0", display: "flex", alignItems: "center", gap: 6 }} className="th-meta">
          <Ic n="refresh" size={14} color="#8A93A8" />
          Cập nhật lần cuối: {formatDateTime(lastSyncedAt)}
        </p>
      )}
      {stale && (
        <div style={{ margin: "10px 16px 0", padding: "10px 12px", borderRadius: 14, background: "#FFF4DE", color: "#8A4B07", fontSize: 12.5, lineHeight: 1.5 }}>
          Dữ liệu có thể chưa được cập nhật gần đây. Vui lòng gọi Điện lực để xác nhận trước khi dựa vào lịch này.
        </div>
      )}

      <ThSection tight title="Lịch sắp tới" action={!loading && items.length > 0 ? <span className="th-more">{items.length} lịch</span> : null}>
        {loading && <div className="th-spin" />}
        {!loading && error && <ThEmpty icon="lich-cat-dien" title="Không tải được dữ liệu" desc={error} />}
        {!loading && !error && items.length === 0 && (
          <ThEmpty icon="o-dien" title="Không có lịch cắt điện phù hợp" desc="Lịch tạm ngừng cấp điện sẽ hiện ở đây khi Điện lực công bố." />
        )}
        {!loading && !error && items.map((item) => <OutageCard key={item._id} item={item} />)}
      </ThSection>
    </ThPage>
  );
};

export default LichCupDienPage;
