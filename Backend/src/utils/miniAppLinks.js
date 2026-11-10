// Lọc danh sách AppLink trước khi trả cho MiniApp. Trang chủ không còn các mục
// Dân số và Thôn xóm (số liệu đã nằm ở khối thống kê đầu trang).
function prepareMiniAppLinks(items) {
  return items.filter(
    (item) => !(item.section === "quick_link" && ["/dan-so", "/thon-xom"].includes(item.path))
  );
}

module.exports = { prepareMiniAppLinks };
