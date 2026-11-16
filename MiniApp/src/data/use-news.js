import { useEffect, useState } from "react";
import API_BASE_URL from "./api-config.js";
import STATIC_NEWS from "./news.js";

// Tin cào từ trang TTĐT xã (Backend /api/public/news, xem newsScrapeService.js).
const toItem = (it) => ({
  id: it.nid,
  tag: it.tag || "Tin tức",
  title: it.title,
  date: it.date,
  summary: it.summary,
  source: it.source || "UBND xã Tuyên Hóa",
  image: it.imageUrl || null,
  link: it.link,
});

// Tin tức - Sự kiện (Trang chủ, màn Tin tức). Lỗi/rỗng → giữ danh sách tĩnh.
export default function useNews() {
  const [news, setNews] = useState(STATIC_NEWS);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/news`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items || []).map(toItem);
        if (items.length > 0) setNews(items);
      })
      .catch(() => {
        /* giữ STATIC_NEWS làm dự phòng */
      });
  }, []);

  return news;
}

// kind: "chi-dao" (Thông tin chỉ đạo điều hành) | "pctt" (tin thiên tai).
// → { items, loading, error }
export function useNewsKind(kind, limit = 20) {
  const [state, setState] = useState({ items: [], loading: true, error: "" });

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE_URL}/api/public/news?kind=${kind}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => alive && setState({ items: (data.items || []).map(toItem), loading: false, error: "" }))
      .catch(() => alive && setState({ items: [], loading: false, error: "Không tải được dữ liệu. Vui lòng thử lại sau." }));
    return () => {
      alive = false;
    };
  }, [kind, limit]);

  return state;
}
