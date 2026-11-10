import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeSearch from "../components/home-search.jsx";
import {
  ThPage,
  ThHomeHeader,
  ThSection,
  ThLinkGrid,
  MoreLink,
  Ic,
  useAppLinks,
  useOpenLink,
  useToast,
} from "../components/th/th-ui.jsx";
import { thIcon } from "../components/th/th-icons.js";
import { useCountUp, fmtInt, fmtDec } from "../components/ns/ns-util.js";
import API_BASE_URL from "../data/api-config.js";
import { openExternal } from "../utils/open-external.js";
import useNews from "../data/use-news.js";
import SITE from "../data/site.js";

// Trang chủ theo bộ giao diện "Tuyên Hóa Số" (01-TrangChu): header xanh + ô tìm
// kiếm, thẻ "TUYÊN HÓA SỐ" với 3 số liệu (từ /api/public/dan-so), rồi 3 lưới
// icon lấy từ AppLink (DB, AdminWeb quản lý): quick_link · gov · econ.
// Tin tức (cào trang TTĐT xã) chỉ hiện khi đã có dữ liệu — bản thiết kế không
// có khối này, nhưng giữ để không mất tính năng khi xã bật nguồn tin.
const HomePage = () => {
  const navigate = useNavigate();
  const news = useNews();
  const [toast, showToast] = useToast();
  const openLink = useOpenLink(() => showToast("Tiện ích đang được cập nhật"));

  const quick = useAppLinks("quick_link");
  const gov = useAppLinks("gov");
  const econ = useAppLinks("econ");

  const [danSo, setDanSo] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/dan-so`)
      .then((res) => res.json())
      .then((d) => setDanSo(d || {}))
      .catch(() => setDanSo({}));
  }, []);

  const pop = useCountUp(danSo.tongDanSo);
  const area = useCountUp(danSo.dienTichKm2);

  return (
    <ThPage>
      <ThHomeHeader>
        <HomeSearch onMissing={() => showToast("Tiện ích đang được cập nhật")} />
      </ThHomeHeader>

      <section className="th-hero th-float th-float--64">
        <div>
          <img
            src={thIcon("tru-so")}
            alt=""
            width="92"
            height="92"
            style={{ position: "absolute", right: -10, top: -12, filter: "drop-shadow(0 10px 14px rgba(6,24,90,.3))" }}
          />
          <div style={{ paddingRight: 84, display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="th-hero__kicker">{SITE.appName.toUpperCase()}</span>
            <h2 style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 800 }}>{SITE.slogan}</h2>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(255,255,255,.9)" }}>
              Hợp nhất từ {SITE.mergedFrom.length} xã: {SITE.mergedFrom.join(" · ")}
            </p>
          </div>
          <div className="th-stats">
            <div className="th-stat">
              <strong>{fmtInt(pop)}</strong>
              <span>Dân số (người)</span>
            </div>
            <div className="th-stat">
              <strong>{danSo.soThon ? fmtInt(danSo.soThon) : "—"}</strong>
              <span>Thôn</span>
            </div>
            <div className="th-stat">
              <strong>{fmtDec(area)}</strong>
              <span>Diện tích (km²)</span>
            </div>
          </div>
        </div>
      </section>

      {quick?.length > 0 && (
        <ThSection title="Tiện ích nhanh" action={<MoreLink onClick={() => navigate("/dich-vu")}>Xem tất cả</MoreLink>}>
          <ThLinkGrid items={quick} onOpen={openLink} />
        </ThSection>
      )}

      {gov?.length > 0 && (
        <ThSection title="Chính quyền số">
          <ThLinkGrid items={gov} onOpen={openLink} />
        </ThSection>
      )}

      {econ?.length > 0 && (
        <ThSection title="Kinh tế · Văn hóa · Học tập">
          <ThLinkGrid items={econ} onOpen={openLink} />
        </ThSection>
      )}

      {news.length > 0 && (
        <ThSection title="Tin tức mới nhất" action={<MoreLink onClick={() => navigate("/tin-tuc")}>Xem thêm</MoreLink>}>
          <div className="th-list">
            {news.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                className="th-row"
                onClick={item.link ? () => openExternal(item.link) : undefined}
              >
                <span
                  style={{
                    width: 72,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "linear-gradient(135deg,#DCE7FB,#EEF3FF)",
                  }}
                >
                  {item.image && (
                    <img src={item.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </span>
                <span className="th-row__tx">
                  <b style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.title}
                  </b>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Ic n="clock" size={13} color="#8A93A8" />
                    {item.date || "—"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </ThSection>
      )}
      {toast}
    </ThPage>
  );
};

export default HomePage;
