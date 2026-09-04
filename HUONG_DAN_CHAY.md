# Hướng dẫn chạy dự án HEALTHY SKIN

## Bước 0 — Lấy code về máy (dành cho người mới / đồng đội trong nhóm)

Nếu bạn clone dự án lần đầu từ GitHub, làm theo đúng thứ tự sau:

```bash
git clone https://github.com/ThongLuc2k3/Healthy_Skin.git
cd Healthy_Skin
```

**Cài dependencies (cả frontend + backend):**

```bash
npm install
cd server
npm install
cd ..
```

**Tạo file cấu hình riêng (`.env`) — bắt buộc, KHÔNG dùng chung với người khác:**

Repo chỉ chứa file mẫu (`.env.example`), không chứa key/secret thật (bị `.gitignore` chặn có chủ đích). Mỗi người tự tạo file `.env` riêng trên máy mình:

```bash
# Ở thư mục gốc dự án
cp .env.example .env

# Trong thư mục server/
cd server
cp .env.example .env
cd ..
```

Sau đó mở `server/.env` vừa tạo và tự điền 2 giá trị quan trọng:

1. **`JWT_SECRET`** — tự tạo chuỗi ngẫu nhiên riêng, không dùng chung với ai:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Copy kết quả dán vào `JWT_SECRET=` trong `server/.env`.

2. **`GEMINI_API_KEY`** — chỉ cần nếu muốn dùng tính năng quét ảnh thật (xem chi tiết ở mục "Bật tính năng quét ảnh thật" bên dưới). Có thể để trống lúc đầu, các tính năng khác vẫn chạy bình thường — chỉ riêng quét ảnh sẽ báo lỗi rõ ràng thay vì crash.

File `.env` gốc thường có thể để nguyên khi dev local. Frontend Vite sẽ tự proxy `/api` sang backend
`http://localhost:4000`, nên không cần hard-code `VITE_API_BASE_URL` chỉ để chạy máy local.

Sau bước này, xem tiếp **Bước 2** bên dưới để chạy thử. Lưu ý: **không bao giờ commit file `.env`** (chỉ commit `.env.example`) — nếu `git status` hiện file `.env` đang chờ commit, đó là dấu hiệu bất thường, cần kiểm tra lại `.gitignore` trước khi commit.

## Yêu cầu trước khi chạy

- Đã cài [Node.js](https://nodejs.org/) (khuyến nghị bản 20 trở lên) và `npm` đi kèm.
- Kiểm tra đã cài chưa:
  ```bash
  node -v
  npm -v
  ```
- Nếu muốn chạy backend (Bước 4): máy cần có `gcc`, `g++`, `make`, `python3` để biên dịch
  driver PostgreSQL `pg`
  with C++" hoặc dùng WSL2).

## Bước 1 — Cài dependencies
 
Chỉ cần làm **một lần** đầu tiên, hoặc mỗi khi `package.json` thay đổi (nếu đã làm ở Bước 0 khi mới clone thì có thể bỏ qua):

```bash
cd đường-dẫn-tới-thư-mục-dự-án
npm install
```

## Bước 2 — Chạy dev server (xem giao diện khi đang phát triển)

```bash
npm run dev
```

Terminal sẽ hiện dòng dạng:

```
➜  Local:   http://localhost:5173/
```

Mở link đó bằng trình duyệt để xem app. Mỗi lần sửa code, trang sẽ tự tải lại (hot reload).
Nhấn `Ctrl + C` trong terminal để dừng server.

Ở chế độ này (chưa bật backend), hồ sơ lưu trong `localStorage` của trình duyệt, database là 2 file
JSON tĩnh (`src/data/`) — không cần đăng nhập, không cần Internet, chạy được ngay.

## Bước 3 — Thử luồng demo trên giao diện

1. Vào **Trang chủ** → bấm **"Bắt đầu khai báo hồ sơ"**.
2. Chọn **loại da** (bắt buộc), có thể chọn thêm dị ứng / bệnh lý nền / mục tiêu → bấm **"Xem gợi ý cho tôi"**.
3. Ở trang **Kết quả**, chuyển giữa 2 tab **Chăm sóc da** / **Dinh dưỡng**, bấm vào từng mục để xem lý do phù hợp/cần cân nhắc/nên tránh.
4. Vào tab **Quét thử** để tìm nhanh một sản phẩm hoặc thực phẩm cụ thể (tìm kiếm thủ công, luôn dùng được không cần backend) và xem kết quả ngay.
5. Tab **Lịch sử** hiển thị các lần quét ảnh thật đã thực hiện — cần đăng nhập và bật backend (Bước 4) mới có dữ liệu.

## Bước 4 — Chạy backend thật (tùy chọn: tài khoản, đồng bộ hồ sơ, quét ảnh thật)

Nếu chỉ cần xem demo cơ bản, bỏ qua bước này — app vẫn chạy đầy đủ nhờ dữ liệu JSON tĩnh +
localStorage như Bước 2-3.

Cài đặt backend (chỉ cần làm một lần):

```bash
cd server
npm install
cp .env.example .env
cd ..
```

Cấu hình `VITE_API_BASE_URL` cho frontend (chỉ cần nếu frontend phải gọi backend ở domain/port khác,
ví dụ backend đã deploy lên internet hoặc không muốn dùng Vite proxy):

```bash
cp .env.example .env    # ở thư mục gốc dự án, chỉ chỉnh VITE_API_BASE_URL nếu thực sự cần
```

Chạy cả 2 server cùng lúc từ thư mục gốc:

```bash
npm run dev:all
```

Script này tự chọn cổng trống cho cả frontend và backend. Nếu `5173` hoặc `4000` đang bận, nó sẽ nhảy
sang cổng khác và tự nối frontend với backend bằng `VITE_API_BASE_URL` phù hợp. Vào **Đăng nhập** trên
thanh điều hướng để tạo tài khoản — hồ sơ cơ địa sẽ tự đồng bộ lên server, dùng lại được trên thiết bị
khác khi đăng nhập cùng tài khoản.

### Bật tính năng quét ảnh thật (AI đọc ảnh + suy luận bằng Gemini)

Tính năng quét ảnh thật dùng **Gemini API** (Google AI Studio) — một lần gọi vừa đọc ảnh vừa suy
luận mức độ phù hợp, **miễn phí thật sự, không cần thẻ thanh toán** (khác với Google Cloud Vision
API, dù có free tier vẫn bắt buộc gắn billing account).

**Lưu ý về bản chất:** ở chế độ này, kết quả phù hợp/cần cân nhắc/nên tránh do AI (Gemini) tự suy
luận trực tiếp từ ảnh + hồ sơ cơ địa, **không giới hạn trong 40 mục của database** như tìm kiếm thủ
công, nhưng cũng **không đi qua `matchEngine.js` rule-based** — kết quả có thể không hoàn toàn nhất
quán giữa các lần quét và không tuyệt đối chính xác. Giao diện luôn hiện rõ dòng cảnh báo "kết quả do
AI tạo tự động" để người dùng biết.

1. Vào [Google AI Studio](https://aistudio.google.com/apikey), đăng nhập bằng tài khoản Google.
2. Bấm **Create API key** — không cần khai báo thẻ thanh toán.
3. Mở `server/.env`, điền `GEMINI_API_KEY=<key vừa tạo>`.
4. Khởi động lại backend (`npm run dev:server` hoặc `npm run dev:all`).

Nếu chưa cấu hình key, trang **Quét thử** vẫn dùng được bình thường — chỉ riêng nút "Quét ảnh" sẽ báo
lỗi rõ ràng, và người dùng vẫn có thể dùng ô tìm kiếm thủ công bên dưới (vẫn chạy rule-based như cũ).

### Bảo mật API

- `server/.env` chứa bí mật (JWT secret, Gemini API key) — **không commit file này**, đã có trong `.gitignore`. Không paste API key vào chat, issue, README hay bất kỳ nơi công khai nào.
- Nếu nghi ngờ key đã bị lộ: vào [Google AI Studio](https://aistudio.google.com/apikey), thu hồi key cũ và tạo key mới, cập nhật lại `server/.env`.
- Nếu trước đó bạn từng tạo **service account JSON** cho Google Cloud Vision (phương án cũ, nay không còn dùng), nên vào **Google Cloud Console → IAM & Admin → Service Accounts** xoá/vô hiệu hoá key đó và xoá file JSON còn sót lại trên máy — không nên giữ credential không còn dùng tới.
- Backend đã có sẵn các lớp bảo vệ:
  - **Rate limit**: `/api/auth/login` và `/api/auth/register` giới hạn 10 lần/15 phút mỗi IP (chống brute-force mật khẩu/spam tài khoản); `/api/scan` giới hạn 15 lần/15 phút mỗi tài khoản (chống một người dùng chiếm hết quota Gemini free tier dùng chung 1.500 request/ngày); toàn bộ `/api` giới hạn 300 request/15 phút mỗi IP.
  - **Helmet**: tự động gắn các HTTP header bảo mật cơ bản (chống clickjacking, MIME sniffing...).
  - Giới hạn kích thước JSON body (20kb) và kích thước ảnh upload (8MB).
  - Mật khẩu hash bằng bcrypt, toàn bộ truy vấn database dùng prepared statement (không lo SQL injection).

## Các lệnh khác (tùy chọn)

| Lệnh | Mục đích |
|---|---|
| `npm run test` | Chạy unit test cho logic đối chiếu (`matchEngine.js`), in PASS/FAIL ra console |
| `npm run lint` | Kiểm tra lỗi/style code bằng Oxlint |
| `npm run build` | Build bản production vào thư mục `dist/` (dùng để deploy) |
| `npm run preview` | Chạy thử bản đã build (sau khi `npm run build`) |
| `npm run dev:server` | Chỉ chạy backend (không chạy frontend) |
| `npm run dev:all` | Chạy song song frontend + backend |
| `npm --prefix server run seed` | Nạp lại dữ liệu từ `src/data/*.json` vào PostgreSQL qua `DATABASE_URL` |
| `npm --prefix server run seed:demo` | Tạo lại tài khoản demo + profile + lịch sử scan + roadmap + streak + lịch hẹn mẫu |

### Seed dữ liệu demo để quay video

Nếu bạn muốn có sẵn tài khoản và dữ liệu đẹp để quay màn hình:

```bash
npm --prefix server run seed:demo
```

Script này sẽ:

- seed lại dữ liệu skincare/food/chuyên gia mẫu
- tạo hoặc làm mới 2 tài khoản demo
- tạo profile, roadmap, check-in nhiều ngày, lịch sử scan
- tạo 1 lịch hẹn mẫu kèm báo cáo tư vấn demo cho tài khoản chính

Thông tin đăng nhập demo:

- `demo.main@da-duong.local` / `Demo123!@#`
- `demo.alt@da-duong.local` / `Demo123!@#`

## Build & deploy (khi cần đưa lên internet để demo)

Repo đã có sẵn `render.yaml` để deploy toàn bộ ứng dụng lên **Render free bằng một web service duy
nhất**. Cấu hình này sẽ:

- cài dependencies ở root và trong `server/`
- build frontend Vite ra `dist/`
- start backend Express trong `server/`
- phục vụ luôn frontend SPA cùng API `/api` trên một domain

Nếu cần làm thủ công trên Render, dùng các giá trị tương đương:

- `Build Command`: `npm install && npm --prefix server install && npm run build`
- `Start Command`: `cd server && npm start`
- `Root Directory`: thư mục gốc của repo

Sau khi deploy, vào dashboard Render và thêm biến môi trường tối thiểu:

- `JWT_SECRET` — bắt buộc cho backend production
- `GEMINI_API_KEY` — chỉ cần nếu muốn bật quét ảnh thật

Vì frontend và backend chạy chung một service nên không cần chỉnh `VITE_API_BASE_URL` cho Render.
`src/lib/apiClient.js` sẽ gọi cùng origin qua `/api`.

## Xử lý sự cố thường gặp

- **Lỗi "port 5173 đã được dùng"**: frontend có thể tự nhảy sang `5174` hoặc cổng khác. Điều này không còn làm hỏng đăng nhập trong dev mode vì Vite proxy `/api` về backend.
- **Lỗi `EADDRINUSE ... :4000`**: nếu bạn dùng `npm run dev:all`, script mới sẽ tự tránh cổng bận. Lỗi này chỉ còn đáng lo khi bạn chạy riêng `npm run dev:server` và đã có tiến trình khác giữ cổng `4000`.
- **Cài `npm install` bị lỗi**: xóa `node_modules` và `package-lock.json` rồi chạy lại `npm install`.
- **Trang trắng / lỗi console**: mở DevTools (F12) trong trình duyệt, tab Console để xem chi tiết lỗi.
- **Lỗi quét ảnh: "Tính năng quét ảnh thật chưa sẵn sàng"**: chưa cấu hình `GEMINI_API_KEY` trong `server/.env` — xem Bước 4. Trong lúc chờ, dùng ô tìm kiếm thủ công ở trang Quét thử.
- **Lỗi quét ảnh: "Không thể phân tích ảnh lúc này" (mã 502)**: key sai/hết hạn, hoặc vượt giới hạn free tier của Gemini (mặc định 1.500 request/ngày) — kiểm tra log server để xem lỗi chi tiết từ Gemini API.
- **Lỗi "Quá nhiều lần thử..." / "Bạn đã quét quá nhiều lần..." (mã 429)**: đang bị rate limit do gọi API quá nhanh/nhiều lần liên tiếp — đợi khoảng 15 phút rồi thử lại (xem mục "Bảo mật API").
- **Trang Kết quả/Quét thử không đăng nhập được / không lưu hồ sơ lên server**: kiểm tra backend có đang chạy không (`npm run dev:server` hoặc `npm run dev:all`). Nếu đang dev local, ưu tiên bỏ trống `VITE_API_BASE_URL` để frontend dùng Vite proxy; chỉ đặt biến này khi thật sự cần gọi sang domain/port khác.
- **Backend báo `Thiếu DATABASE_URL`**: thêm chuỗi kết nối PostgreSQL vào `.env` ở thư mục đang chạy server (hoặc biến môi trường của nền tảng deploy).
