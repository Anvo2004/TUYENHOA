import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../data/api-config.js";
import { ThPage, ThHeader, ThSection, ThSeg, ThEmpty, Th3, Ic } from "../components/th/th-ui.jsx";

// Màn Lịch y tế theo bộ giao diện "Tuyên Hóa Số" (11-LichYTe): chuyển tháng,
// lọc loại hình, dải 7 ngày (chạm 1 ngày để chỉ xem lịch ngày đó), danh sách.
// Dữ liệu: collection LichYTe (AdminWeb), tra theo tháng/năm.
const LOAI_HINH = { kham_benh: "Khám bệnh", tiem_chung: "Tiêm chủng", khac: "Khác" };
const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const today = new Date();
today.setHours(0, 0, 0, 0);

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// 7 ngày (T2→CN) chứa hôm nay nếu đang xem tháng hiện tại, không thì tuần đầu tháng.
function weekOf(thang, nam) {
  const anchor = thang === today.getMonth() + 1 && nam === today.getFullYear() ? new Date(today) : new Date(nam, thang - 1, 1);
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const LichYTePage = () => {
  const [thang, setThang] = useState(today.getMonth() + 1);
  const [nam, setNam] = useState(today.getFullYear());
  const [loai, setLoai] = useState("all");
  const [day, setDay] = useState(null); // dayKey | null
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setDay(null);
    fetch(`${API_BASE_URL}/api/public/lich-y-te?thang=${thang}&nam=${nam}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setError("Không thể tải dữ liệu lịch y tế. Vui lòng thử lại sau."))
      .finally(() => setLoading(false));
  }, [thang, nam]);

  const shiftMonth = (delta) => {
    const d = new Date(nam, thang - 1 + delta, 1);
    setThang(d.getMonth() + 1);
    setNam(d.getFullYear());
  };

  const week = useMemo(() => weekOf(thang, nam), [thang, nam]);
  const daysWithEvents = useMemo(() => new Set(items.map((i) => dayKey(new Date(i.ngayKham)))), [items]);
  const shown = items.filter(
    (i) => (loai === "all" || i.loaiHinh === loai) && (!day || dayKey(new Date(i.ngayKham)) === day)
  );

  return (
    <ThPage>
      <ThHeader title="Lịch y tế" desc="Lịch khám bệnh, tiêm chủng trên địa bàn xã Tuyên Hóa." art="lich-y-te" />

      <section className="th-card th-card--float th-float th-stack">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" aria-label="Tháng trước" className="th-glassbtn" style={{ background: "#EEF3FF", border: 0, color: "var(--th-primary)" }} onClick={() => shiftMonth(-1)}>
            <Ic n="back" size={18} sw={2.4} />
          </button>
          <label style={{ flex: 1, position: "relative", textAlign: "center", display: "flex", flexDirection: "column" }}>
            <b style={{ fontSize: 17, fontWeight: 800 }}>
              Tháng {thang} · {nam}
            </b>
            <span className="th-meta">Chạm để chọn tháng khác</span>
            <input
              type="month"
              aria-label="Chọn tháng"
              value={`${nam}-${String(thang).padStart(2, "0")}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                if (y && m) {
                  setNam(y);
                  setThang(m);
                }
              }}
              style={{ position: "absolute", inset: 0, opacity: 0, width: "100%" }}
            />
          </label>
          <button type="button" aria-label="Tháng sau" className="th-glassbtn" style={{ background: "#EEF3FF", border: 0, color: "var(--th-primary)" }} onClick={() => shiftMonth(1)}>
            <Ic n="chev" size={18} sw={2.4} />
          </button>
        </div>
        <ThSeg
          flat
          className="th-seg--inset"
          options={[
            { value: "all", label: "Tất cả" },
            { value: "kham_benh", label: "Khám bệnh" },
            { value: "tiem_chung", label: "Tiêm chủng" },
          ]}
          value={loai}
          onChange={setLoai}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4 }}>
          {week.map((d) => {
            const k = dayKey(d);
            const isToday = k === dayKey(today);
            const on = day === k || (!day && isToday);
            const inMonth = d.getMonth() + 1 === thang;
            return (
              <button
                key={k}
                type="button"
                disabled={!inMonth}
                onClick={() => setDay(day === k ? null : k)}
                style={{
                  height: 58,
                  borderRadius: 14,
                  border: 0,
                  padding: 0,
                  background: on ? "var(--th-btn-grad)" : "transparent",
                  color: on ? "#fff" : inMonth ? "var(--th-text)" : "#C3CADA",
                  boxShadow: on ? "0 6px 12px rgba(22,70,200,.25)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, opacity: on ? 0.9 : 0.7 }}>{DOW[d.getDay()]}</span>
                <b style={{ fontSize: 15, fontWeight: 800 }}>{d.getDate()}</b>
                <i style={{ width: 5, height: 5, borderRadius: "50%", background: daysWithEvents.has(k) ? (on ? "#fff" : "var(--th-teal)") : "transparent" }} />
              </button>
            );
          })}
        </div>
      </section>

      <ThSection tight>
        {loading && <div className="th-spin" />}
        {!loading && error && <ThEmpty icon="lich-y-te" title="Không tải được dữ liệu" desc={error} />}
        {!loading && !error && shown.length === 0 && (
          <div className="th-card">
            <ThEmpty
              icon="lich-y-te"
              title={`Chưa có lịch y tế ${day ? "trong ngày đã chọn" : `trong tháng ${thang}/${nam}`}`}
              desc="Lịch khám bệnh, tiêm chủng sẽ hiển thị tại đây khi Trạm Y tế xã cập nhật."
            />
          </div>
        )}
        {!loading &&
          !error &&
          shown.map((item) => {
            const d = new Date(item.ngayKham);
            return (
              <article key={item._id} className="th-art" style={{ display: "flex", gap: 14 }}>
                <div
                  style={{
                    width: 58,
                    flexShrink: 0,
                    alignSelf: "flex-start",
                    padding: "8px 0",
                    borderRadius: 16,
                    background: "linear-gradient(180deg,#F6F9FF,#E7EEFE)",
                    boxShadow: "inset 0 0 0 1px #E3EBFB",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    color: "var(--th-primary)",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{DOW[d.getDay()]}</span>
                  <strong style={{ fontSize: 22, lineHeight: 1.15, fontWeight: 800 }}>{String(d.getDate()).padStart(2, "0")}</strong>
                  <span style={{ fontSize: 10.5, fontWeight: 600 }}>Th{d.getMonth() + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className={`th-pill ${item.loaiHinh === "tiem_chung" ? "th-pill--teal" : ""}`}>
                      {LOAI_HINH[item.loaiHinh] || "Khám bệnh"}
                    </span>
                    {item.khungGio && (
                      <span className="th-meta" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Ic n="clock" size={13} color="#8A93A8" />
                        {item.khungGio}
                      </span>
                    )}
                  </span>
                  <b style={{ fontSize: 14.5, lineHeight: 1.4, fontWeight: 700 }}>{item.diaDiem}</b>
                  {item.donViThucHien && <span className="th-sub">{item.donViThucHien}</span>}
                  {item.doiTuong && <span className="th-sub">Đối tượng: {item.doiTuong}</span>}
                  {item.ghiChu && <span className="th-meta">{item.ghiChu}</span>}
                </div>
                <Th3 name="lich-y-te" size={34} style={{ alignSelf: "flex-start", flexShrink: 0 }} />
              </article>
            );
          })}
      </ThSection>
    </ThPage>
  );
};

export default LichYTePage;
