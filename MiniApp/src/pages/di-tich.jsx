import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sheet } from "zmp-ui";
import API_BASE_URL from "../data/api-config.js";
import { ThPage, ThHeader, ThSection, ThChips, ThEmpty, Th3, Ic } from "../components/th/th-ui.jsx";
import { openDirections, embedMapUrl } from "../utils/directions.js";

// Tra cứu Di tích lịch sử: 9 di tích đã xếp hạng giao xã quản lý (collection
// DiTich, AdminWeb → Di tích lịch sử). Mỗi di tích: tên, mô tả, địa chỉ, đường
// đến + bản đồ Google nhúng + nút "Chỉ đường" (Google Maps). Mở thẳng 1 di tích bằng
// /di-tich?id=<_id> (khối Di tích ở màn Văn hóa / Du lịch).
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

const capPill = (cap) => (/quốc gia/i.test(cap) ? "th-pill--red" : "");

const DiTichCard = ({ item, onOpen }) => (
  <button type="button" className="th-dt" onClick={() => onOpen(item)}>
    <span className="th-dt__img">
      {item.image ? <img src={item.image} alt="" loading="lazy" /> : <Th3 name="van-hoa" size={44} />}
    </span>
    <span className="th-dt__tx">
      <span className={`th-pill ${capPill(item.capDiTich)}`} style={{ alignSelf: "flex-start" }}>
        Di tích {item.capDiTich.toLowerCase()}
      </span>
      <b>{item.ten}</b>
      {item.tomTat && <span className="th-dt__sum">{item.tomTat}</span>}
      {item.diaChi && (
        <span className="th-dt__addr">
          <Ic n="pin" size={13} color="#8A93A8" />
          {item.diaChi}
        </span>
      )}
    </span>
  </button>
);

export const DiTichDetail = ({ item, onClose }) => (
  <Sheet visible={!!item} onClose={onClose} autoHeight swipeToClose mask handler>
    {item && (
      <div className="th-sheet th-dt-detail">
        {item.image && <img className="th-dt-detail__img" src={item.image} alt={item.ten} />}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 8px" }}>
          <span className={`th-pill ${capPill(item.capDiTich)}`}>Di tích {item.capDiTich.toLowerCase()}</span>
          {item.loaiHinh && <span className="th-pill th-pill--gray">{item.loaiHinh}</span>}
        </div>
        <b className="th-sheet__title">{item.ten}</b>

        <div className="th-dt-detail__kv">
          {item.diaChi && (
            <div className="th-kv">
              <small>Địa chỉ</small>
              <span>{item.diaChi}</span>
            </div>
          )}
          {item.quyetDinh && (
            <div className="th-kv">
              <small>Quyết định xếp hạng</small>
              <span>{item.quyetDinh}</span>
            </div>
          )}
        </div>

        {item.moTa && (
          <>
            <h3 className="th-dt-detail__h">Mô tả di tích</h3>
            {item.moTa.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="th-dt-detail__p">{p}</p>
            ))}
          </>
        )}
        <h3 className="th-dt-detail__h">Đường đến di tích</h3>
        {item.duongDen && <p className="th-dt-detail__p">{item.duongDen}</p>}

        {/* Bản đồ Google nhúng, ghim vị trí di tích (toạ độ hoặc tên + địa chỉ). */}
        <div className="th-dt-map">
          <iframe
            key={item._id}
            title={`Bản đồ ${item.ten}`}
            src={embedMapUrl(item)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <button type="button" className="th-btn th-dt-detail__go" onClick={() => openDirections(item)}>
          <Ic n="send" size={17} sw={2.2} />
          Chỉ đường bằng Google Maps
        </button>
      </div>
    )}
  </Sheet>
);

const DiTichPage = () => {
  const { search } = useLocation();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState("");
  const [cap, setCap] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/di-tich`)
      .then((res) => res.json())
      .then((d) => {
        const list = d.items || [];
        setItems(list);
        const id = new URLSearchParams(search).get("id");
        if (id) setSelected(list.find((x) => x._id === id) || null);
      })
      .catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const caps = useMemo(() => [...new Set((items || []).map((x) => x.capDiTich).filter(Boolean))], [items]);
  const filtered = useMemo(() => {
    const kw = norm(q.trim());
    return (items || []).filter(
      (x) =>
        (cap === "all" || x.capDiTich === cap) &&
        (!kw || norm(`${x.ten} ${x.diaChi} ${x.tomTat} ${x.moTa}`).includes(kw))
    );
  }, [items, q, cap]);

  const quocGia = (items || []).filter((x) => /quốc gia/i.test(x.capDiTich)).length;

  return (
    <ThPage>
      <ThHeader
        title="Di tích lịch sử"
        desc={
          items?.length
            ? `${items.length} di tích đã xếp hạng · ${quocGia} quốc gia, ${items.length - quocGia} cấp tỉnh`
            : "Tra cứu di tích trên địa bàn xã"
        }
        art="van-hoa"
      />

      <ThSection tight>
        <label className="th-search th-search--flat">
          <Ic n="search" size={19} color="#8A93A8" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên di tích, thôn, nhân vật..." />
        </label>
        {caps.length > 1 && (
          <ThChips
            options={[{ value: "all", label: "Tất cả" }, ...caps.map((c) => ({ value: c, label: c }))]}
            value={cap}
            onChange={setCap}
          />
        )}
      </ThSection>

      <ThSection title={items ? `Danh sách (${filtered.length})` : "Danh sách"}>
        {items === null ? (
          <div className="th-sub" style={{ textAlign: "center", padding: 20 }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <ThEmpty icon="van-hoa" title="Không tìm thấy di tích" desc="Thử từ khoá khác hoặc chọn Tất cả." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((it) => (
              <DiTichCard key={it._id} item={it} onOpen={setSelected} />
            ))}
          </div>
        )}
      </ThSection>
      <div style={{ height: 24 }} />

      <DiTichDetail item={selected} onClose={() => setSelected(null)} />
    </ThPage>
  );
};

export default DiTichPage;
