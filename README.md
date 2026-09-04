# Healthy Skin

Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng, dùng AI để giải thích thông tin sản phẩm ở mức phổ
thông và kết nối người dùng với chuyên gia hoặc dịch vụ phù hợp khi cần, dựa trên một hồ sơ cá nhân
dùng chung cho toàn bộ trải nghiệm.

## Tính năng

- **Hồ sơ cá nhân**: khai báo loại da, dị ứng, bệnh lý, mục tiêu chăm sóc; lưu vĩnh viễn khi có tài khoản.
- **Quét mỹ phẩm/thực phẩm**: đối chiếu rule-based dựa trên hồ sơ (`matchEngine.js`), hoặc quét ảnh
  thật qua Gemini API để đọc và suy luận trực tiếp; trả về 2 mức "phù hợp / cần cân nhắc" kèm thông tin
  bổ sung như giá tham khảo, xuất xứ, dấu hiệu chính hãng, sản phẩm liên quan và nơi bán gần đây.
- **Trợ Lý + Gói Trợ Lý**: chat thông tin cơ bản, miễn phí 5 câu/ngày cho người dùng đăng nhập; có ví,
  gói mua thêm lượt hỏi và tích điểm đổi voucher. Phần giao dịch hiện dùng provider mock.
- **Chuyên gia**: xem danh sách, đặt lịch tư vấn, xin phép chia sẻ hồ sơ cá nhân, nhắn tin hai chiều
  với chuyên gia, và có Expert Dashboard riêng cho tài khoản chuyên gia demo.
- **Dịch Vụ Quanh Bạn + Voucher**: đặt dịch vụ tại trung tâm mẫu, áp voucher, nhận hoá đơn web nội bộ.
- **Diễn đàn đánh giá**: người dùng chia sẻ trải nghiệm, đánh giá kèm ảnh.
- **Về chúng tôi**: chính sách bảo vệ thông tin cá nhân, điều khoản sử dụng, cam kết về sức khỏe và
  giới hạn trách nhiệm khi dùng AI.

Frontend luôn chạy độc lập, không bắt buộc backend. Khi backend không chạy, app tự rơi về chế độ demo
(localStorage + JSON tĩnh) cho các phần có thể hoạt động offline; các luồng cần backend như đăng nhập,
lịch sử quét, ví, booking, voucher, expert portal sẽ không hoạt động đầy đủ.

## Chạy chỉ frontend (chế độ demo, không cần backend)

```bash
npm install
npm run dev      # chạy dev server
npm run build    # build production
npm run test     # chạy unit test cho logic đối chiếu (matchEngine)
npm run lint     # kiểm tra lỗi lint
```

## Chạy đầy đủ (frontend + backend)

```bash
npm install
cp .env.example .env               # thường có thể giữ nguyên khi dev local

cd server
npm install
cp .env.example .env               # điền DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
cd ..

npm run dev:all   # tự chọn cổng trống cho frontend/backend và nối 2 tiến trình với nhau
```

Backend cần `DATABASE_URL` trỏ tới một database PostgreSQL (khuyến nghị [Neon](https://neon.tech),
free, không cần thẻ). Không có `GEMINI_API_KEY` vẫn chạy được bình thường, chỉ riêng tính năng quét
ảnh thật ở trang Quét thử sẽ báo "chưa sẵn sàng" cho tới khi bạn thêm key vào `server/.env`. Key này
lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/apikey), xem `HUONG_DAN_CHAY.md` để
biết chi tiết.

## Cấu trúc

- `src/data`: database JSON gốc (thành phần mỹ phẩm, thực phẩm) và danh sách lựa chọn hồ sơ
- `src/logic/matchEngine.js`: logic đối chiếu rule-based (`matchProfile`, `getRecommendations`), dùng chung cho cả frontend lẫn backend
- `src/context/ProfileContext.jsx`: state hồ sơ cá nhân, lưu localStorage, đồng bộ lên backend khi đã đăng nhập
- `src/context/AuthContext.jsx`: trạng thái đăng nhập, JWT
- `src/pages`: Trang chủ, Hồ sơ, Quét thử, Lịch sử quét, Chuyên gia, Gói Trợ Lý, Dịch Vụ Quanh Bạn, Kho Voucher, Diễn đàn, Về chúng tôi, Đăng nhập/Đăng ký
- `src/components`: component UI dùng chung
- `server/`: backend Express + PostgreSQL. Xác thực JWT, lưu hồ sơ/lịch sử quét, quét ảnh thật qua Gemini API (`server/src/services/geminiService.js`), chat quota/wallet, booking chuyên gia, consultation thread, voucher, booking dịch vụ, payment intents mock, rate limit + helmet bảo vệ API. Chuỗi kết nối được đọc từ `DATABASE_URL`.
- `knowledge/`: tài liệu Markdown dùng cho RAG; Agent chia theo heading, tìm đoạn liên quan và trả kèm nguồn.
- `server/src/services/chatTools.js`: schema và executor cho các tool được phép của Chat Agent.
- `server/src/services/knowledgeService.js`: bộ nạp, chia chunk và xếp hạng tài liệu RAG nội bộ.
- `server/src/services/fastChatService.js`: định tuyến keyword/RAG cho câu đơn giản; chỉ chuyển câu dài hoặc mơ hồ sang Gemini Agent và không trừ quota cho phản hồi nhanh.

## Deploy

Repo đã có `render.yaml` để deploy toàn bộ ứng dụng lên **Render free bằng một web service duy nhất**.
Render sẽ build frontend vào `dist/` rồi backend Express trong `server/` phục vụ luôn SPA đó cùng API
`/api`, nên không cần cấu hình CORS giữa hai domain riêng.

Nếu muốn deploy thủ công thay vì dùng blueprint, cấu hình tương đương là:

- Build command: `npm install && npm --prefix server install && npm run build`
- Start command: `cd server && npm start`
- Root directory: thư mục gốc của repo

Khi tạo service trên Render, nhớ đặt các biến môi trường cần thiết trong dashboard, tối thiểu là
`DATABASE_URL` và `JWT_SECRET`. Nếu dùng quét ảnh thật thì thêm `GEMINI_API_KEY`.

## Ghi chú dev mode

`npm run dev:all` hiện tự dò cổng trống, ví dụ frontend có thể chạy ở `5174` còn backend ở `4001`
nếu `5173/4000` đang bận. Script sẽ tự truyền `VITE_API_BASE_URL` tương ứng cho frontend, nên không
cần tự sửa lại `.env` chỉ vì xung đột cổng local.
