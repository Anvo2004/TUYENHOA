const config = require("../config");

// 9 di tích đã xếp hạng giao UBND xã Tuyên Hóa quản lý (QĐ 70/QĐ-UBND ngày
// 12/01/2026 của UBND tỉnh Quảng Trị — "PHỤ LỤC. 70.pdf", mục 6. XÃ TUYÊN HÓA).
// Nội dung lấy từ tài liệu xã gửi (docs/DI TÍCH ĐỊA BÀN.rar, 18/11/2026):
//   - hồ sơ khoa học từng di tích (lý lịch, vị trí, đường dẫn đến);
//   - công văn cung cấp thông tin Trang TTĐT (mục 2.6 "Truyền thống văn hoá, di tích");
//   - báo cáo rà soát hồ sơ di tích (địa điểm theo thôn cũ).
// Toạ độ: hồ sơ ghi sẵn kinh/vĩ độ → dùng nguyên; hồ sơ chỉ có toạ độ VN-2000
// (bản trích đo địa chính, kinh tuyến trục 106°, múi 3°) → đã đổi sang WGS84.
// Chùa Lèn Bụt, Mộ và Nhà thờ Đề đốc Lê Trực: hồ sơ không có toạ độ → nút
// "Chỉ đường" tìm theo tên + địa chỉ. Ảnh: Lê Trực lấy từ album hồ sơ di tích; Chùa
// Lèn Bụt, Đền thờ Mai Lượng, Mộ Lê Văn Hành lấy từ bài Báo Quảng Trị (25/11/2026,
// ghi nguồn ở nguonAnh); các di tích còn lại chưa có ảnh — chờ xã cung cấp.
const img = (name) => `${config.publicUrl}/site/di-tich/${name}`;
const OLD = (thon, xa) => `${thon} (xã ${xa} cũ), xã Tuyên Hóa, tỉnh Quảng Trị`;

module.exports = [
  {
    ten: "Mộ và Nhà thờ Đề đốc Lê Trực",
    capDiTich: "Quốc gia",
    loaiHinh: "Lịch sử",
    quyetDinh: "774/QĐ-BT ngày 21/6/1993",
    diaChi: OLD("Thôn Bàu", "Tiến Hóa"),
    tomTat: "Nơi tưởng niệm Đề đốc Lê Trực, thủ lĩnh nghĩa quân Cần Vương chống Pháp ở Quảng Bình cuối thế kỷ XIX.",
    moTa:
      "Di tích quốc gia duy nhất trên địa bàn xã — nơi tưởng niệm Đề đốc Lê Trực, vị võ tướng có công lớn trong phong trào Cần Vương chống thực dân Pháp ở Quảng Bình những năm cuối thế kỷ XIX.\n" +
      "Thời phong kiến, di tích thuộc thôn Chân Linh, xã Thanh Thủy, tổng Thuận Lệ, phủ Quảng Trạch; nằm dưới chân núi đá Dù, phía Tây của làng.\n" +
      "Khu di tích gồm mộ và nhà thờ với cổng trụ, bình phong và mái ngói trang trí đắp nổi theo lối kiến trúc truyền thống.",
    duongDen:
      "Cách trụ sở UBND xã Tiến Hóa (cũ) khoảng 2 km về phía Đông Nam, cách chợ Cuồi 3 km về phía Đông. Có thể đi ca nô từ Ba Đồn ngược sông Gianh lên xóm Bàu, đi bộ khoảng 300–400 m; hoặc đi ô tô theo đường liên huyện Quảng Trạch – Tuyên Hóa, tới lèn Thanh Thủy rẽ trái là tới di tích.",
    lat: null,
    lng: null,
    image: img("le-truc-toan-canh.jpg"),
    nguonAnh: "Hồ sơ khoa học di tích",
  },
  {
    ten: "Nhà cụ Lê An và Hang Cây Lội",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử cách mạng",
    quyetDinh: "2543/QĐ-UB ngày 18/8/2004",
    diaChi: OLD("Thôn Bàu", "Tiến Hóa"),
    tomTat: "Cơ sở hoạt động của Chi bộ Đảng Thanh Thủy – Ngọa Cương; nơi in báo Hồng Lạc những năm 1942–1943.",
    moTa:
      "Di tích gắn bó với quá trình hoạt động của Chi bộ Đảng Thanh Thủy – Ngọa Cương trong những năm 1939–1945.\n" +
      "Từ giữa năm 1942 đến cuối năm 1943, ngôi nhà của cụ Lê An và Hang Cây Lội là nơi in báo Hồng Lạc — cơ quan ngôn luận đầu tiên của Phủ ủy Quảng Trạch và là một trong những tờ báo cách mạng đầu tiên của Quảng Bình.",
    duongDen:
      "Từ Ba Đồn theo đường 12 khoảng 15 km đến địa phận xã Tiến Hóa (cũ); từ hòn Lèn Bảng ở đầu làng rẽ trái khoảng 2 km là đến di tích. Đi đường sông: từ Ba Đồn ngược sông Gianh khoảng 15 km.",
    lat: 17.7875,
    lng: 106.255556,
    image: "",
  },
  {
    ten: "Miếu thờ Hiệp biện Đại học sĩ, Thái học đường Trần Cảnh Huống",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử",
    quyetDinh: "3139/QĐ-UBND ngày 30/11/2011",
    diaChi: OLD("Thôn Trung Đình", "Văn Hóa"),
    tomTat: "Ghi dấu tinh thần hiếu học, tôn sư trọng đạo của làng Lệ Sơn.",
    moTa:
      "Trần Cảnh Huống sinh vào khoảng đầu thế kỷ XV trong một dòng họ hoàng tộc; ông nội là danh tướng Trần Nguyên Hãn. Ông học rộng, được vua Lê mời vào cung dạy học; lúc về già được vua Lê Thánh Tông phong tặng \"Hiệp biện Đại học sĩ, Mô phạm Thái học đường Quốc Tử Giám\".\n" +
      "Khi tuổi cao, ông được mời về Côn Vang (nay là làng Lệ Sơn) mở trường dạy học cho con cháu trong làng, đặt nền móng cho truyền thống hiếu học của vùng đất này. Dân làng và con cháu họ Trần lập miếu thờ để đời đời ghi nhớ công ơn ông.",
    duongDen: "Gần trung tâm làng Lệ Sơn (xã Văn Hóa cũ). Từ Ba Đồn theo Quốc lộ 12A khoảng 20 km đến cầu Văn Hóa rồi vào làng.",
    lat: 17.779919,
    lng: 106.28083,
    image: "",
  },
  {
    ten: "Đình làng Lệ Sơn",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử",
    quyetDinh: "3081/QĐ-CT ngày 14/12/2012",
    diaChi: OLD("Thôn Trung Đình", "Văn Hóa"),
    tomTat: "Ghi dấu công lao khai canh, lập làng của làng văn vật Lệ Sơn.",
    moTa:
      "Đình làng Lệ Sơn ghi dấu công lao khai canh, lập làng của các bậc tiền nhân. Lệ Sơn xưa là một trong những làng văn vật nổi tiếng ở Quảng Bình — vùng đất hình chiếc võng, núi đá vôi phía sau, sông Gianh phía trước.\n" +
      "Di tích nằm cạnh sân vận động và trụ sở UBND xã Văn Hóa (cũ), phía Nam giáp đường liên xã.",
    duongDen: "Từ Ba Đồn theo Quốc lộ 12A khoảng 20 km đến cầu Văn Hóa, qua cầu vào trung tâm xã Văn Hóa (cũ), cạnh sân vận động.",
    lat: 17.782811,
    lng: 106.28158,
    image: "",
  },
  {
    ten: "Chùa Lèn Bụt",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử",
    quyetDinh: "3188/QĐ-UBND ngày 24/12/2013",
    diaChi: OLD("Thôn Chùa Bụt", "Cao Quảng"),
    tomTat: "Di tích gắn với đời sống tín ngưỡng, tâm linh của người dân Cao Quảng.",
    moTa:
      "Chùa Lèn Bụt nằm tựa vào núi đá (lèn) — phía Bắc và phía Tây giáp núi đá, phía Nam giáp đường nhựa liên xã. Di tích thể hiện đời sống tín ngưỡng, tâm linh của người dân địa phương.\n" +
      "Khu vực bảo vệ di tích rộng khoảng 7,4 ha (gồm khu vực I và II).",
    duongDen: "Thuộc xã Cao Quảng (cũ), cạnh đường nhựa liên xã, dưới chân lèn đá.",
    lat: null,
    lng: null,
    image: img("len-but.jpg"),
    nguonAnh: "Báo Quảng Trị (QBĐT), 3/2014",
  },
  {
    ten: "Đền thờ Lãnh binh Mai Lượng",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử",
    quyetDinh: "2094/QĐ-UBND ngày 26/6/2018",
    diaChi: OLD("Thôn Tân Tiến", "Cao Quảng"),
    tomTat: "Ghi dấu thân thế, sự nghiệp Lãnh binh Mai Lượng trong phong trào Cần Vương chống Pháp.",
    moTa:
      "Đền thờ nằm ở chân núi Voi, ghi dấu thân thế, sự nghiệp của Lãnh binh Mai Lượng trong phong trào Cần Vương chống Pháp ở Quảng Bình.\n" +
      "Nghĩa quân Mai Lượng thường tổ chức tập kích, phục kích để bảo vệ căn cứ của vua Hàm Nghi từ mạn phía Nam; tháng 6/1886 đã đánh chặn đoàn quân tuần tiễu sông Gianh của Pháp trên sông Rào Nan. Ông mất ngày 12/5/1890 (24/3 năm Canh Dần), được nghĩa quân và nhân dân vùng căn cứ Cao Mại bí mật an táng tại chân núi Voi, xóm Gát (nay là thôn Tân Tiến); năm 1893 gia đình đưa hài cốt về quê nhà làng Thọ Linh.",
    duongDen:
      "Từ ngã tư Quảng Thọ (Ba Đồn) theo đường 12 khoảng 5 km, rẽ trái qua cầu Quảng Hải 2, rẽ phải theo đường 559B khoảng 21 km đến km 16 trên địa phận thôn Tân Tiến là đến di tích.",
    lat: 17.761667,
    lng: 106.220833,
    image: img("mai-luong.jpg"),
    nguonAnh: "Báo Quảng Trị (QBĐT), 5/2017",
  },
  {
    ten: "Làng chiến đấu Lệ Sơn",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử",
    quyetDinh: "1617/QĐ-UBND ngày 16/6/2022",
    diaChi: OLD("Thôn Phúc Tự", "Văn Hóa"),
    tomTat: "Ghi dấu tinh thần chiến đấu anh dũng của quân và dân Lệ Sơn những năm đầu kháng chiến chống Pháp.",
    moTa:
      "Nơi ghi dấu tinh thần chiến đấu anh dũng, kiên cường, mưu trí, sáng tạo của quân và dân Lệ Sơn trong những năm đầu cuộc kháng chiến chống thực dân Pháp xâm lược.\n" +
      "Làng dài gần 7 km, lưng dựa vào dãy núi đá vôi như bức trường thành với nhiều thung lũng kín; đầu làng là lèn Đứt Chân với động Chân Linh, cuối làng là núi Đầu Voi.",
    duongDen:
      "Từ ngã tư Ba Đồn theo Quốc lộ 12A khoảng 20 km đến cầu Văn Hóa, qua cầu rẽ phải theo hướng Tây khoảng 700 m. Đi tàu: dừng ở ga Lệ Sơn, đi về hướng Bắc khoảng 1 km.",
    lat: 17.7975,
    lng: 106.276944,
    image: "",
  },
  {
    ten: "Trận địa pháo Phân đội nữ dân quân xã Tiến Hóa",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử",
    quyetDinh: "2782/QĐ-UBND ngày 13/10/2022",
    diaChi: OLD("Thôn Bàu", "Tiến Hóa"),
    tomTat: "Trận địa súng 12 ly 7 của Phân đội nữ dân quân xã Tiến Hóa — biểu tượng tinh thần chống ngoại xâm.",
    moTa:
      "Trận địa pháo (súng 12 ly 7) của Phân đội nữ dân quân xã Tiến Hóa, ghi dấu lòng yêu nước và tinh thần chống ngoại xâm của quân và dân địa phương.\n" +
      "Khu vực bảo vệ di tích rộng 240 m².",
    duongDen: "Thuộc xã Tiến Hóa (cũ). Dùng nút Chỉ đường để mở bản đồ tới vị trí di tích.",
    lat: 17.791054,
    lng: 106.266133,
    image: "",
  },
  {
    ten: "Mộ và Miếu thờ Lê Văn Hành",
    capDiTich: "Cấp tỉnh",
    loaiHinh: "Lịch sử",
    quyetDinh: "2585/QĐ-UBND ngày 10/9/2024",
    diaChi: OLD("Thôn Xuân Sơn", "Văn Hóa"),
    tomTat: "Thủy tổ họ Lê, tiền khai canh làng Lệ Sơn.",
    moTa:
      "Ông Lê Văn Hành — Thủy tổ họ Lê, tiền khai canh làng Lệ Sơn — quê làng Yên Mô thượng, trấn Thanh Hoa ngoại (nay thuộc tỉnh Ninh Bình), con trai Đại học sĩ Thị độc Lê Văn Khanh. Ông đỗ Hương cống dưới triều vua Lê Thánh Tông, được tuyển làm Giám sinh Quốc Tử Giám.\n" +
      "Hưởng ứng chủ trương chiêu dân khai khẩn đất châu Bố Chính, ông vào lập nghiệp, khai canh lập làng Lệ Sơn. Di tích gồm 2 điểm: mộ và miếu thờ.",
    duongDen:
      "Từ Ba Đồn theo đường 12A khoảng 18 km, rẽ trái qua cầu Văn Hóa. Mộ: đi đường bê tông 700 m đến ngã ba, rẽ phải cạnh nghĩa trang liệt sĩ xã Văn Hóa thêm 500 m. Miếu thờ: từ cầu Văn Hóa đi thẳng 800 m, rẽ trái ở ngã tư theo đường bê tông liên thôn khoảng 1,5 km.",
    lat: 17.775833,
    lng: 106.286111,
    image: img("le-van-hanh.jpg"),
    nguonAnh: "Báo Quảng Trị, 11/2024 — ảnh Mộ Lê Văn Hành",
  },
].map((d, i) => ({ ...d, thuTu: i + 1 }));
