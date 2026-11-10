import React, { useEffect, useState } from "react";
import API_BASE_URL from "../data/api-config.js";
import { ThPage, ThHeader, ThSection, ThSeg, ThChips, ThSelect, ThEmpty, Th3, Ic } from "../components/th/th-ui.jsx";
import { TRO_CAP_CATEGORIES, statusOf, weekday, ddmm } from "../data/tro-cap-categories.js";

// Màn Thông báo theo bộ giao diện "Tuyên Hóa Số" (10-ThongBao): tab "Trợ cấp xã
// hội" (lịch chi trả theo tháng/năm, collection TroCapSchedule) + "Thông báo
// khác" (collection Notice). Cả hai do cán bộ nhập qua AdminWeb.
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const NOW = new Date();
const YEARS = [NOW.getFullYear() - 1, NOW.getFullYear(), NOW.getFullYear() + 1];
const STATUS_PILL = { "Sắp diễn ra": "", "Đang diễn ra": "th-pill--red", "Hoàn thành": "th-pill--teal" };

const fmtNumber = (n) => (n || 0).toLocaleString("vi-VN");
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const Kv = ({ label, children }) => (
  <div className="th-kv" style={{ padding: "10px 0", borderTop: "1px solid var(--th-divider)" }}>
    <small>{label}</small>
    <span>{children}</span>
  </div>
);

const PayoutCard = ({ item, thang, nam }) => {
  const cat = TRO_CAP_CATEGORIES[item.loaiTroCap] || TRO_CAP_CATEGORIES.baotro;
  const status = statusOf(item.ngayChiTra);
  return (
    <article className="th-card">
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12 }}>
        <span className="th-ib th-ib--lg">
          <img src={cat.img} alt="" width="38" height="38" />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <b style={{ fontSize: 15, fontWeight: 700 }}>
            Lịch chi trả tháng {thang}/{nam}
          </b>
          <span className="th-pill" style={{ alignSelf: "flex-start" }}>
            {cat.label}
          </span>
        </span>
        <span className={`th-pill th-pill--dot ${STATUS_PILL[status] || ""}`}>{status}</span>
      </div>
      <Kv label="Thời gian">
        {weekday(item.ngayChiTra)}, {ddmm(item.ngayChiTra)}
        {item.khungGio ? ` · ${item.khungGio}` : ""}
      </Kv>
      <Kv label="Địa điểm">{item.diaDiem || "Đang cập nhật"}</Kv>
      <Kv label="Đối tượng">
        {fmtNumber(item.soLuong)} {item.donVi || "đối tượng"}
      </Kv>
      <Kv label="Hình thức">
        {item.hinhThuc === "bank" ? "Chuyển qua tài khoản ngân hàng" : "Nhận tiền mặt tại điểm chi trả"}
        {item.soTien ? ` · ${fmtNumber(item.soTien)} đ` : ""}
      </Kv>
      <div style={{ paddingTop: 10, borderTop: "1px solid var(--th-divider)", display: "flex", alignItems: "center", gap: 8 }} className="th-sub">
        <Ic n="shield" size={16} color="#14B8A6" />
        Mang theo CCCD hoặc tài khoản VNeID khi nhận.
      </div>
    </article>
  );
};

const ThongBaoPage = () => {
  const [tab, setTab] = useState("tro-cap");

  // ===== Trợ cấp xã hội (tra cứu theo tháng/năm) =====
  const [thang, setThang] = useState(NOW.getMonth() + 1);
  const [nam, setNam] = useState(NOW.getFullYear());
  const [searched, setSearched] = useState({ thang: NOW.getMonth() + 1, nam: NOW.getFullYear() });
  const [troCapFilter, setTroCapFilter] = useState("all");
  const [troCapItems, setTroCapItems] = useState([]);
  const [troCapLoading, setTroCapLoading] = useState(true);
  const [troCapError, setTroCapError] = useState("");

  const searchTroCap = (m = thang, y = nam) => {
    setTroCapLoading(true);
    setTroCapError("");
    fetch(`${API_BASE_URL}/api/public/tro-cap?thang=${m}&nam=${y}`)
      .then((res) => res.json())
      .then((data) => {
        setTroCapItems(data.items || []);
        setTroCapFilter("all");
        setSearched({ thang: m, nam: y });
      })
      .catch(() => setTroCapError("Có lỗi xảy ra, vui lòng thử lại"))
      .finally(() => setTroCapLoading(false));
  };

  // ===== Thông báo khác =====
  const [noticeList, setNoticeList] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(true);
  const [noticeError, setNoticeError] = useState("");

  useEffect(() => {
    searchTroCap();
    fetch(`${API_BASE_URL}/api/public/thong-bao`)
      .then((res) => res.json())
      .then((data) => setNoticeList(data.items || []))
      .catch(() => setNoticeError("Không thể tải thông báo. Vui lòng thử lại sau."))
      .finally(() => setNoticeLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cats = Object.keys(TRO_CAP_CATEGORIES).filter((k) => troCapItems.some((x) => x.loaiTroCap === k));
  const filtered = troCapFilter === "all" ? troCapItems : troCapItems.filter((x) => x.loaiTroCap === troCapFilter);

  return (
    <ThPage>
      <ThHeader
        variant="tabs"
        title="Thông báo"
        desc="Lịch chi trả trợ cấp xã hội hằng tháng và các chính sách an sinh xã hội của xã."
        art="thong-bao"
      />
      <div className="th-float th-float--30">
        <ThSeg
          options={[
            { value: "tro-cap", label: "Trợ cấp xã hội" },
            { value: "khac", label: "Thông báo khác" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "tro-cap" && (
        <>
          <ThSection tight>
            <div className="th-card th-stack">
              <span className="th-label">Chọn tháng / năm</span>
              <div className="th-btn-row">
                <ThSelect value={thang} onChange={(v) => setThang(Number(v))} ariaLabel="Tháng">
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </ThSelect>
                <ThSelect value={nam} onChange={(v) => setNam(Number(v))} ariaLabel="Năm">
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </ThSelect>
              </div>
              <button type="button" className="th-btn" disabled={troCapLoading} onClick={() => searchTroCap()}>
                <Ic n="search" size={18} sw={2.2} />
                {troCapLoading ? "Đang tra cứu…" : "Tra cứu lịch chi trả"}
              </button>
            </div>
          </ThSection>

          <ThSection title="Kết quả">
            {cats.length > 1 && (
              <ThChips
                options={[
                  { value: "all", label: `Tất cả · ${troCapItems.length}` },
                  ...cats.map((k) => ({ value: k, label: TRO_CAP_CATEGORIES[k].shortLabel })),
                ]}
                value={troCapFilter}
                onChange={setTroCapFilter}
              />
            )}
            {troCapLoading && <div className="th-spin" />}
            {!troCapLoading && troCapError && <ThEmpty icon="tro-cap" title="Không tải được dữ liệu" desc={troCapError} />}
            {!troCapLoading && !troCapError && troCapItems.length === 0 && (
              <ThEmpty
                icon="tro-cap"
                title={`Chưa có lịch chi trả tháng ${searched.thang}/${searched.nam}`}
                desc="Lịch chi trả sẽ hiện ở đây khi UBND xã công bố. Vui lòng chọn tháng khác."
              />
            )}
            {!troCapLoading &&
              !troCapError &&
              filtered.map((item) => <PayoutCard key={item._id} item={item} thang={searched.thang} nam={searched.nam} />)}
          </ThSection>
        </>
      )}

      {tab === "khac" && (
        <ThSection tight>
          {noticeLoading && <div className="th-spin" />}
          {!noticeLoading && noticeError && <ThEmpty icon="thong-bao" title="Không tải được thông báo" desc={noticeError} />}
          {!noticeLoading && !noticeError && noticeList.length === 0 && (
            <ThEmpty icon="thong-bao" title="Chưa có thông báo nào" desc="Thông báo của UBND xã sẽ hiện ở đây." />
          )}
          {!noticeLoading &&
            !noticeError &&
            noticeList.map((item) => (
              <article key={item._id} className="th-art" style={{ display: "flex", gap: 12 }}>
                <span className="th-ib">
                  <Th3 name="loa" size={30} />
                </span>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <b style={{ fontSize: 14.5, lineHeight: 1.4, fontWeight: 700 }}>{item.title}</b>
                  <span className="th-sub" style={{ whiteSpace: "pre-line" }}>{item.content}</span>
                  <span className="th-meta">{formatDate(item.createdAt)}</span>
                </span>
              </article>
            ))}
        </ThSection>
      )}
    </ThPage>
  );
};

export default ThongBaoPage;
