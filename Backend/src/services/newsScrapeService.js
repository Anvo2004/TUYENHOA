const cheerio = require("cheerio");
const config = require("../config");
const News = require("../models/News");

// ============================================================
// Cào tin từ trang TTĐT xã Tuyên Hóa (tuyenhoa.quangtri.gov.vn — nền Liferay
// "3cms" dùng chung cho các xã tỉnh Quảng Trị) → Mongo News. Hai nguồn:
//   - kind "tin-tuc": chuyên mục Tin tức - Sự kiện (config.newsSourceUrl)
//   - kind "chi-dao": Thông tin chỉ đạo điều hành (config.chiDaoSourceUrl)
//
// Cấu trúc trang danh sách (đã kiểm tra 16/11/2026): vài tin nổi bật dạng
// <div class="frames-catalogue-article"> (tin tức) hoặc <div class="artItem">
// (chỉ đạo) có a.article_title_link + .article_summary + img.img_comment; phần
// "Các tin đã đăng" là li > a.article_item_link kèm <font class="article_date">.
// Phân trang: div.google_page a[href*="page=N"].
//
// ID bài = số cuối của link (/chi-tiet-tin/-/view-article/1/<chuyên mục>/<id>),
// chính là mốc thời gian tạo bài tính bằng mili giây → dùng làm `nid` (sắp xếp
// mới→cũ) và suy ra ngày đăng, không cần mở trang chi tiết.
// Ảnh tóm tắt: trang tin tức trả src "/3cmsnew-portlet/ViewImage?..." (404),
// đường đúng là "/o/3cmsnew-portlet/ViewImage?..." (image/jpeg) — sửa ở toImageUrl.
// ============================================================

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

// Số trang danh sách đọc mỗi lượt (trang 1 ~15 tin). Lượt đầu cào vài trang
// để có sẵn tin cũ; các lượt sau tin mới luôn nằm ở trang 1.
const MAX_PAGES = 3;

const SOURCES = {
  "tin-tuc": { tag: "Tin tức", url: () => config.newsSourceUrl },
  "chi-dao": { tag: "Chỉ đạo điều hành", url: () => config.chiDaoSourceUrl },
};

// Tin liên quan phòng chống thiên tai — màn PCTT lọc theo tiêu đề.
const PCTT_RE =
  /thiên tai|bão|lũ|lụt|mưa lớn|mưa to|sạt lở|ngập|áp thấp|triều cường|hạn hán|giông|dông|lốc|rét đậm|rét hại|PCTT|TKCN|cứu hộ|cứu nạn/i;

function isConfigured() {
  return Object.values(SOURCES).some((s) => Boolean(s.url()));
}

function toAbsoluteUrl(src, base) {
  if (!src) return "";
  try {
    return new URL(src, base).href;
  } catch {
    return "";
  }
}

function toImageUrl(src, base) {
  const fixed = /^\/3cmsnew-portlet\//.test(src || "") ? `/o${src}` : src;
  return toAbsoluteUrl(fixed, base);
}

function clean(text) {
  return (text || "").replace(/\s+/g, " ").trim(); // \s gồm cả &nbsp;
}

// mili giây → "dd/MM/yyyy" theo giờ Việt Nam.
function vnDate(ms) {
  const d = new Date(ms + 7 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

function articleId(href) {
  const m = (href || "").match(/view-article\/\d+\/\d+\/(\d{10,})/);
  return m ? Number(m[1]) : null;
}

// HTML 1 trang danh sách → { items, nextUrl }.
function parseListing(html, pageUrl, kind) {
  const $ = cheerio.load(html);
  const tag = SOURCES[kind]?.tag || "Tin tức";
  const items = [];
  const seen = new Set();
  const add = (it) => {
    if (!it.nid || !it.title || seen.has(it.nid)) return;
    seen.add(it.nid);
    items.push({ ...it, kind, tag, date: vnDate(it.nid) });
  };

  // Tin nổi bật: có tóm tắt + ảnh.
  $("a.article_title_link").each((_, a) => {
    const $a = $(a);
    const href = $a.attr("href") || "";
    const box = $a.parent();
    add({
      nid: articleId(href),
      title: clean($a.find(".article_title").text() || $a.text()),
      summary: clean(box.find(".article_summary").first().text()),
      link: toAbsoluteUrl(href, pageUrl),
      imageUrl: toImageUrl(box.find("img.img_comment").first().attr("src"), pageUrl),
    });
  });

  // "Các tin đã đăng": chỉ có tiêu đề + ngày.
  $("a.article_item_link").each((_, a) => {
    const $a = $(a).clone();
    $a.find(".article_date").remove();
    const href = $(a).attr("href") || "";
    add({
      nid: articleId(href),
      title: clean($a.text()),
      summary: "",
      link: toAbsoluteUrl(href, pageUrl),
      imageUrl: "",
    });
  });

  const cur = Number(new URL(pageUrl).searchParams.get("page")) || 1;
  let nextUrl = "";
  $(".google_page a[href]").each((_, a) => {
    const href = $(a).attr("href");
    const abs = toAbsoluteUrl(href, pageUrl);
    if (!nextUrl && abs && Number(new URL(abs).searchParams.get("page")) === cur + 1) nextUrl = abs;
  });
  return { items, nextUrl };
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Không tải được ${url}: HTTP ${res.status}`);
  return res.text();
}

// Trả [{ nid, kind, title, summary, date, tag, link, imageUrl }] của 1 nguồn.
async function fetchListing(kind = "tin-tuc", maxPages = MAX_PAGES) {
  let url = SOURCES[kind]?.url();
  if (!url) return [];
  const all = new Map();
  for (let page = 0; url && page < maxPages; page++) {
    const { items, nextUrl } = parseListing(await fetchHtml(url), url, kind);
    for (const it of items) {
      // Tin nổi bật (có tóm tắt/ảnh) ưu tiên hơn bản chỉ có tiêu đề.
      const prev = all.get(it.nid);
      if (!prev || (!prev.summary && it.summary)) all.set(it.nid, it);
    }
    url = nextUrl;
  }
  return [...all.values()];
}

// Upsert theo nid — tin mới tạo mới, tin đã có cập nhật lại text/ảnh (ảnh nhúng
// thẳng từ nguồn, không lưu file riêng nên cứ ghi đè theo bản mới nhất).
const TRUNCATED_RE = /(\.\.\.|…)$/;

// Trang danh sách cắt tiêu đề dài ("...") — lấy tiêu đề đầy đủ ở trang chi tiết.
async function fetchFullTitle(link) {
  try {
    const $ = cheerio.load(await fetchHtml(link));
    return clean($("h3.h1_title_news").first().text());
  } catch (e) {
    console.warn(`[News] Không lấy được tiêu đề đầy đủ ${link}: ${e.message}`);
    return "";
  }
}

async function syncKind(kind) {
  const items = await fetchListing(kind);
  let created = 0;
  for (const it of items) {
    if (TRUNCATED_RE.test(it.title)) {
      const existing = await News.findOne({ nid: it.nid }).select("title").lean();
      it.title =
        existing && !TRUNCATED_RE.test(existing.title)
          ? existing.title
          : (await fetchFullTitle(it.link)) || it.title;
    }
    const fields = {
      kind: it.kind,
      title: it.title,
      date: it.date,
      tag: it.tag,
      link: it.link,
      // Tin chỉ thấy ở phần "Các tin đã đăng" không có tóm tắt/ảnh — không ghi
      // đè tóm tắt/ảnh đã lấy được ở lượt trước khi tin còn nằm ở khối nổi bật.
      ...(it.summary ? { summary: it.summary } : {}),
      ...(it.imageUrl ? { imageUrl: it.imageUrl } : {}),
    };
    const r = await News.updateOne(
      { nid: it.nid },
      {
        $set: fields,
        $setOnInsert: { nid: it.nid, source: "UBND xã Tuyên Hóa", scrapedAt: new Date() },
      },
      { upsert: true }
    );
    if (r.upsertedCount) created++;
  }
  console.log(`[News] Đồng bộ ${kind}: ${items.length} tin (mới: ${created})`);
  return created;
}

async function syncNews() {
  if (!isConfigured()) {
    console.log("[News] Bỏ qua đồng bộ: NEWS_SOURCE_URL / CHI_DAO_SOURCE_URL chưa được cấu hình");
    return 0;
  }
  let created = 0;
  for (const kind of Object.keys(SOURCES)) {
    if (!SOURCES[kind].url()) continue;
    try {
      created += await syncKind(kind);
    } catch (e) {
      // 1 nguồn lỗi không chặn nguồn còn lại.
      console.error(`[News] Đồng bộ ${kind} lỗi:`, e.message);
    }
  }
  return created;
}

// ===== Nội dung đầy đủ 1 tin (trang chi tiết) — dùng để tạo bài viết OA đầy đủ =====
// Trang chi tiết 3cms: h3.h1_title_news (tiêu đề), span.summary_detail_news
// (sapo), div.article_content (thân bài: <p> xen <img>, bảng). Duyệt thân bài
// ĐÚNG THỨ TỰ, gom đoạn văn liên tiếp thành 1 khối chữ, mỗi ảnh 1 khối ảnh;
// bảng thành từng dòng "ô | ô". Đã chạy thử trên tin thật của
// tuyenhoa.quangtri.gov.vn (tin có ảnh, thông báo dạng ảnh scan).
const DETAIL_BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "blockquote",
  "figure", "figcaption", "section", "article", "table", "thead", "tbody", "tr",
]);
// Nội dung bài OA không thể hiện được: file đính kèm (tin "V/v tin bão..." chỉ có
// PDF nhúng + nút "Tải về") và khung nhúng (iframe/video).
const DETAIL_FILE_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|rar)(?:[?#]|$)/i;
const DETAIL_EMBED_TAGS = new Set(["iframe", "embed", "object", "video", "audio"]);

// → [{ type: "text", paragraphs: [...] } | { type: "image", url } | { type: "file", url }]
// — sapo (nếu có) là đoạn đầu; "file" = tài liệu đính kèm/khung nhúng.
function parseNewsDetail(html, pageUrl) {
  const $ = cheerio.load(html);
  const root = $(".article_content").first();
  const sapo = $(".summary_detail_news").first().text().replace(/\s+/g, " ").trim();

  const blocks = sapo ? [{ type: "text", paragraphs: [sapo] }] : [];
  let para = "";
  const flush = () => {
    const text = para.replace(/\s+/g, " ").trim();
    para = "";
    if (!text) return;
    const last = blocks[blocks.length - 1];
    if (last && last.type === "text") last.paragraphs.push(text);
    else blocks.push({ type: "text", paragraphs: [text] });
  };
  const walk = (node) => {
    if (node.type === "text") {
      para += node.data;
      return;
    }
    if (node.type !== "tag" || node.name === "script" || node.name === "style") return;
    if (node.name === "img") {
      const src = $(node).attr("src") || $(node).attr("data-src") || "";
      // new URL().href giữ nguyên %XX sẵn có, chỉ mã hoá dấu cách/chữ có dấu trong src.
      const url = src ? toAbsoluteUrl(src, pageUrl) : "";
      if (url) {
        flush();
        blocks.push({ type: "image", url });
      }
      return;
    }
    const fileUrl =
      node.name === "a" && DETAIL_FILE_RE.test($(node).attr("href") || "")
        ? $(node).attr("href")
        : DETAIL_EMBED_TAGS.has(node.name)
          ? $(node).attr("src") || $(node).attr("data") || $(node).find("source").attr("src") || ""
          : null;
    if (fileUrl !== null) {
      // Bỏ chữ của link tải ("Tải về") — thay bằng khối file; cùng 1 file (link +
      // khung xem PDF) chỉ giữ 1 lần.
      const url = fileUrl ? toAbsoluteUrl(fileUrl, pageUrl) : "";
      if (url && !blocks.some((b) => b.type === "file" && b.url === url)) {
        flush();
        blocks.push({ type: "file", url });
      }
      return;
    }
    if (node.name === "br") return flush();
    if (node.name === "td" || node.name === "th") {
      for (const child of node.children || []) walk(child);
      para += " | ";
      return;
    }
    const isBlock = DETAIL_BLOCK_TAGS.has(node.name);
    if (isBlock) flush();
    for (const child of node.children || []) walk(child);
    if (node.name === "tr") para = para.replace(/\s*\|\s*$/, "");
    if (isBlock) flush();
  };
  root.contents().each((_, node) => walk(node));
  flush();
  return blocks;
}

async function fetchNewsDetail(link) {
  const res = await fetch(link, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Không tải được trang chi tiết: HTTP ${res.status}`);
  return parseNewsDetail(await res.text(), link);
}

// Tin mới nhất — sắp theo nid giảm dần (nid = mốc tạo bài, lớn hơn = mới hơn).
// kind: "tin-tuc" (mặc định, gồm cả tin cũ chưa có kind) | "chi-dao" | "pctt"
// (tin của cả 2 nguồn có tiêu đề liên quan thiên tai — màn Phòng chống thiên tai).
async function listNews(limit = 20, kind = "tin-tuc") {
  const filter =
    kind === "pctt"
      ? { title: PCTT_RE }
      : kind === "chi-dao"
        ? { kind: "chi-dao" }
        : { kind: { $in: ["tin-tuc", null] } };
  return News.find(filter).sort({ nid: -1 }).limit(limit).lean();
}

function startAutoSync() {
  const cron = require("node-cron");
  syncNews().catch((e) => console.error("[News] Sync lần đầu lỗi:", e.message));
  cron.schedule("30 5,11,17 * * *", () => {
    syncNews().catch((e) => console.error("[News] Sync định kỳ lỗi:", e.message));
  });
  console.log("[News] Đã bật tự động cào tin tức (3 lần/ngày)");
}

module.exports = {
  fetchListing,
  parseListing,
  syncNews,
  listNews,
  startAutoSync,
  isConfigured,
  parseNewsDetail,
  fetchNewsDetail,
};
