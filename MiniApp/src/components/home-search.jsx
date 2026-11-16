import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scanQRCode } from "zmp-sdk/apis";
import API_BASE_URL from "../data/api-config.js";
import { openExternal } from "../utils/open-external.js";
import { Ic, LinkIcon, Th3 } from "./th/th-ui.jsx";

// Ô tìm kiếm trong header Trang chủ (bộ giao diện Tuyên Hóa Số): tìm trong các
// mục AppLink (3 lưới Trang chủ + danh sách Dịch vụ), thông báo và danh mục TTHC.
// Nút QR bên phải: quét bằng camera Zalo (scanQRCode) — mã là link http(s) thì
// mở bằng webview, còn lại sao chép nội dung và báo cho người dùng.
const LINK_SECTIONS = ["quick_link", "gov", "econ", "service"];

function matches(text, q) {
  return (text || "").toLowerCase().includes(q);
}

const HomeSearch = ({ onMissing, onNotify }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [notices, setNotices] = useState([]);
  const [links, setLinks] = useState([]);
  const [tthcResults, setTthcResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/thong-bao`)
      .then((res) => res.json())
      .then((data) => setNotices(data.items || []))
      .catch(() => setNotices([]));

    Promise.all(
      LINK_SECTIONS.map((s) =>
        fetch(`${API_BASE_URL}/api/public/app-links?section=${s}`)
          .then((res) => res.json())
          .then((d) => d.items || [])
          .catch(() => [])
      )
    ).then((lists) => {
      // Cùng 1 đích (vd Phản ánh ở cả Tiện ích nhanh và Dịch vụ) chỉ hiện 1 lần.
      const seen = new Set();
      setLinks(
        lists.flat().filter((it) => {
          const key = it.path || it.href || it.label;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
      );
    });
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setTthcResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/public/thu-tuc-hanh-chinh?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => setTthcResults((data.items || []).slice(0, 5)))
        .catch(() => setTthcResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const q = query.trim().toLowerCase();
  const linkResults = q ? links.filter((it) => matches(it.label, q)).slice(0, 6) : [];
  const noticeResults = q
    ? notices.filter((n) => matches(n.title, q) || matches(n.content, q)).slice(0, 5)
    : [];
  const hasResults = linkResults.length + noticeResults.length + tthcResults.length > 0;

  function close() {
    setQuery("");
    setFocused(false);
  }

  function goTo(item) {
    if (item.path) navigate(item.path);
    else if (item.href) openExternal(item.href);
    else onMissing?.(item);
    close();
  }

  const iconBox = { width: 34, height: 34, borderRadius: 11 };

  const scan = async () => {
    let content = "";
    try {
      ({ content } = await scanQRCode());
    } catch (err) {
      // Người dùng đóng camera → bỏ qua; ngoài app Zalo (bản web) thì không có camera Zalo.
      if (!/cancel|hủy|huỷ/i.test(String(err?.message || err))) {
        onNotify?.("Chỉ quét mã QR được khi mở trong ứng dụng Zalo");
      }
      return;
    }
    content = (content || "").trim();
    if (!content) return;
    if (/^https?:\/\//i.test(content)) {
      openExternal(content);
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      onNotify?.(`Đã sao chép nội dung mã QR: ${content.slice(0, 60)}`);
    } catch {
      onNotify?.(`Nội dung mã QR: ${content.slice(0, 80)}`);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={boxRef}>
      <label role="search" className="th-search">
        <Ic n="search" size={20} sw={2} color="#8A93A8" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Tìm dịch vụ, thủ tục, thông báo…"
        />
        <button
          type="button"
          aria-label="Quét mã QR"
          className="th-search__qr"
          onClick={(e) => {
            e.preventDefault(); // không focus ô nhập khi bấm nút trong <label>
            scan();
          }}
        >
          <Ic n="qr" size={20} sw={2} />
        </button>
      </label>

      {focused && q && (
        <div className="home-search__results">
          {!hasResults && <div className="home-search__empty">Không tìm thấy kết quả phù hợp</div>}

          {linkResults.map((it) => (
            <div key={`ln-${it._id}`} className="home-search__item" onClick={() => goTo(it)}>
              <span className="th-ib" style={iconBox}>
                <LinkIcon item={it} size={26} />
              </span>
              <span className="home-search__label">{it.label}</span>
            </div>
          ))}

          {tthcResults.map((it) => (
            <div
              key={`tthc-${it._id}`}
              className="home-search__item"
              onClick={() => {
                navigate("/thu-tuc-hanh-chinh");
                close();
              }}
            >
              <span className="th-ib" style={iconBox}>
                <Th3 name="thu-tuc" size={26} />
              </span>
              <span className="home-search__label">{it.tenThuTuc}</span>
            </div>
          ))}

          {noticeResults.map((n) => (
            <div
              key={`nt-${n._id}`}
              className="home-search__item"
              onClick={() => {
                navigate("/thong-bao");
                close();
              }}
            >
              <span className="th-ib" style={iconBox}>
                <Th3 name="thong-bao" size={26} />
              </span>
              <span className="home-search__label">{n.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
