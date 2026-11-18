import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "zmp-ui";
import API_BASE_URL from "../data/api-config.js";
import { Th3, Ic } from "./th/th-ui.jsx";

// Khối "Di tích lịch sử" ở màn Văn hóa và Du lịch: thẻ mở màn tra cứu /di-tich +
// vài di tích tiêu biểu (bấm mở thẳng chi tiết). Dữ liệu: /api/public/di-tich.
const DiTichBlock = ({ limit = 4 }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/di-tich`)
      .then((res) => res.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;
  const quocGia = items.filter((x) => /quốc gia/i.test(x.capDiTich)).length;

  return (
    <Box className="section">
      <div className="section__title">🏛️ Di tích lịch sử</div>
      <button type="button" className="th-dt-cta" onClick={() => navigate("/di-tich")}>
        <span className="th-ib th-ib--lg">
          <Th3 name="van-hoa" size={38} />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
          <b style={{ fontSize: 15, fontWeight: 700 }}>Tra cứu di tích lịch sử</b>
          <span className="th-sub">
            {items.length} di tích đã xếp hạng · {quocGia} quốc gia, {items.length - quocGia} cấp tỉnh
          </span>
        </span>
        <Ic n="chev" size={18} color="#A9B3C7" />
      </button>
      <div className="th-list" style={{ marginTop: 10 }}>
        {items.slice(0, limit).map((it) => (
          <button key={it._id} type="button" className="th-row" onClick={() => navigate(`/di-tich?id=${it._id}`)}>
            <span className="th-ib">{it.image ? <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }} /> : <Th3 name="van-hoa" size={30} />}</span>
            <span className="th-row__tx">
              <b>{it.ten}</b>
              <span>{it.diaChi}</span>
            </span>
            <span className="th-row__chev">
              <Ic n="chev" size={16} />
            </span>
          </button>
        ))}
      </div>
    </Box>
  );
};

export default DiTichBlock;
