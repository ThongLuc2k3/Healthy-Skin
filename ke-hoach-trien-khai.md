# TÀI LIỆU 2: KẾ HOẠCH TRIỂN KHAI CHI TIẾT (KỸ THUẬT)

## Phase 0: Gỡ bỏ các tính năng đi sâu vào y tế

Xoá hẳn các tính năng khiến web tự đưa khuyến nghị điều trị/theo dõi bệnh lý:

| Tính năng | Trang/route | Backend | DB |
|---|---|---|---|
| Lộ trình chăm sóc | `RoadmapPage.jsx`, `PlanBuilderPage.jsx`, `CustomRoadmapPage.jsx`, routes `/roadmap`, `/roadmap/plan`, `/roadmap/custom` | `server/src/routes/roadmap.routes.js`, `server/src/services/roadmapService.js` | bảng `roadmaps` |
| Điểm danh | `CheckInPage.jsx`, `StreakCalendarPage.jsx`, routes `/checkin`, `/streak` | route/service checkin tương ứng, `checkinLimiter` | bảng `checkins` |
| Tiến độ | `ProgressReportPage.jsx`, route `/progress-report` | service tiến độ tương ứng | bảng `progress_milestones` |
| Trang "đối chiếu"/kết quả 3 mức cũ | `RecommendationPage.jsx`, route `/results` | phần verdict cũ trong luồng dùng `matchEngine.js` để "kết luận" độc lập | không có bảng riêng |

- `src/App.jsx`: xoá các `<Route>` tương ứng.
- `src/components/NavBar.jsx`: xoá các mục Lộ trình, Điểm danh, Tiến độ, Kết quả khỏi `LINKS`.
- `src/components/Analysis.jsx`, `Hero.jsx`, `CTA.jsx`, `Footer.jsx`, `Routine.jsx`, `Dashboard.jsx`: rà soát và bỏ mọi CTA/nội dung trỏ tới các trang trên (`Routine.jsx` hiện là bảng chú giải phù hợp/cần cân nhắc/nên tránh, `Dashboard.jsx` là mockup "báo cáo da" kiểu y tế, cần viết lại nội dung hoặc bỏ hẳn section).
- Diễn đàn đánh giá (`WebsiteReviews.jsx`, route `/reviews`), Motivation, Skin Lab, Lịch sử quét: giữ nguyên không đổi.

## Phase 1: Đổi "Hồ sơ cơ địa" → "Hồ sơ cá nhân"

Đổi tên/copy xuyên suốt để giảm ngôn ngữ y tế, ở các file: `ProfileForm.jsx`, `MotivationPage.jsx`, `ExpertDetailPage.jsx`, `ExpertListPage.jsx`, `ScanDemoPage.jsx`, `Hero.jsx`, `Dashboard.jsx`, `Technology.jsx`, `Analysis.jsx`, `Footer.jsx`, `AuthPageContainer.jsx`, `README.md`, cùng các chuỗi prompt trong `server/src/services/geminiService.js` và `chatService.js`.

- Đổi nhãn hiển thị người dùng sang "Hồ sơ cá nhân". Định danh kỹ thuật (biến `profile`, hàm `profileSummaryText`, cột DB `skin_type`...) giữ nguyên, chỉ đổi chuỗi tiếng Việt hiển thị/prompt.
- Cấu trúc dữ liệu khai báo giữ nguyên, chỉ đổi tông giọng mô tả (bớt nhấn "cơ địa"/"bệnh lý", nói theo hướng thông tin cá nhân hoá).

## Phase 2: Quét sản phẩm, giữ lời khuyên nhưng thêm thông tin sản phẩm

File: `server/src/services/geminiService.js`, `src/pages/ScanDemoPage.jsx`, `src/logic/matchEngine.js`

Đổi `RESULT_VALUES` từ 3 mức `phù hợp/cần cân nhắc/nên tránh` xuống còn **2 mức** `phù hợp` / `cần cân nhắc`, diễn đạt như gợi ý cá nhân ("nếu là bạn thì...") thay vì kết luận chắc chắn kiểu "nên tránh". Mở rộng `RESPONSE_SCHEMA`/prompt trong `analyzeImage()` để trả thêm:

- `advice`: `phù hợp` / `cần cân nhắc` kèm 1-2 câu lý do, giọng gợi ý cá nhân
- `marketPriceRange`: khoảng giá thị trường tham khảo
- `origin`: nơi sản xuất/xuất xứ nếu đọc được từ bao bì
- `authenticityNote`: nhận định sơ bộ dấu hiệu chính hãng hay không (ghi rõ là tham khảo, AI có thể sai)
- `betterAlternatives`: 1-3 sản phẩm liên quan/tốt hơn, ưu tiên lấy từ catalog tiếp thị liên kết (Phase 5) nếu có nhãn hàng đối tác khớp
- `nearbySellers`: gợi ý nơi bán gần đây (danh sách đối tác tĩnh + vị trí trình duyệt cung cấp)

`ScanDemoPage.jsx` hiển thị badge phù hợp/cân nhắc làm điểm nhấn chính, các trường còn lại hiển thị như "thông tin sản phẩm" bên dưới. `matchEngine.js` vẫn dùng để tính `advice` khách quan khi tra được trong database; khi phải suy luận từ ảnh qua Gemini mà không chắc chắn thì hạ về `cần cân nhắc` thay vì đoán liều `phù hợp`.

## Phase 3: Gói Trợ Lý + ví nạp tiền (demo)

Không dùng chữ "AI trả phí" trong UI, gọi là **"Gói Trợ Lý"**. Thiết kế hạ tầng linh hoạt cho cả gói cố định lẫn trả theo câu hỏi, **chưa chốt công thức tính giá** (bàn sau) — chỉ cần track đúng dữ liệu để dễ áp giá về sau.

```sql
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_vnd INTEGER NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  plan_id TEXT NOT NULL DEFAULT 'free',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_usage_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  charged_vnd INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);
```

- `server/src/services/chatUsageService.js` (mới): free tier vài câu/ngày (đặt hằng số cấu hình được), vượt quá thì kiểm tra `user_wallets.balance_vnd`/`plan_id`; đơn giá trừ ví để `0`/placeholder cho tới khi có công thức chính thức. Mỗi lần nạp ví qua `/api/chat/topup`, cộng thêm `loyalty_points` theo tỉ lệ cấu hình được (ví dụ nạp 100 được 100 vào ví + 10 điểm), dùng chung hạ tầng điểm cho Kho Voucher ở Phase 6.
- Endpoint demo `POST /api/chat/topup { amount }` và `POST /api/chat/upgrade { planId }`: cộng thẳng vào ví/đổi gói, ghi rõ trong code là **mock, không có cổng thanh toán thật**.
- `src/pages/PricingPage.jsx` (mới, route `/pricing`): hiện số câu miễn phí/ngày, các gói Trợ Lý, ô nạp ví.
- `ChatWidget.jsx`: hiện số dư/lượt còn lại; khi hết thì đưa 2 lựa chọn: nạp thêm hoặc đặt lịch chuyên gia.
- `chatService.js`: tăng cường chỉ dẫn để AI không đưa giải pháp điều trị mà chuyển hướng đặt lịch chuyên gia khi câu hỏi vượt phạm vi thông tin cơ bản.

## Phase 4: Luồng tư vấn bác sĩ có gửi hồ sơ + nhắn tin

Phần mở rộng lớn nhất: hiện `experts` chỉ là dữ liệu tĩnh, chưa có tài khoản đăng nhập hay hộp thư cho bác sĩ.

```sql
CREATE TABLE IF NOT EXISTS expert_accounts (
  id BIGSERIAL PRIMARY KEY,
  expert_id TEXT NOT NULL REFERENCES experts(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_threads (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES expert_bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_review',
  profile_snapshot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES consultation_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  text TEXT,
  image_path TEXT,
  recommended_product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- Khi người dùng xác nhận đặt lịch (mở rộng `BookingDetailPage.jsx`/`bookingService.js` hiện có), tạo `consultation_threads` kèm `profile_snapshot` (JSON hồ sơ cá nhân tại thời điểm đặt), có màn hình xin đồng ý rõ ràng trước khi gửi thông tin cho bác sĩ.
- Backend mới: đăng nhập chuyên gia (`expert_accounts`), trang `src/pages/expert/ExpertDashboardPage.jsx` (mới) để bác sĩ xem hồ sơ, nhắn tin, gửi ảnh, gợi ý sản phẩm.
- Khi bác sĩ gợi ý sản phẩm: dashboard ưu tiên chọn từ catalog tiếp thị liên kết (Phase 5) trước, vẫn cho nhập tự do nếu cần (quy tắc UX/vận hành, không ép cứng bằng code).
- `BookingDetailPage.jsx` phía người dùng hiển thị luồng tin nhắn (tải lại theo interval đơn giản, không cần realtime cho phạm vi đồ án).
- `experts.json` hiện là dữ liệu minh hoạ (chưa xác thực) — ghi chú rõ trong UI đây là môi trường demo cho tới khi có đối tác bác sĩ thật.

## Phase 5: Catalog sản phẩm tiếp thị liên kết + quảng cáo trang chủ

```sql
CREATE TABLE IF NOT EXISTS sponsored_products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT,
  matched_item_id TEXT, price_vnd INTEGER, affiliate_url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS homepage_ads (
  id BIGSERIAL PRIMARY KEY,
  sponsor_name TEXT NOT NULL, image_url TEXT NOT NULL, link_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE, priority INTEGER NOT NULL DEFAULT 0
);
```

- `sponsored_products` cấp dữ liệu cho `betterAlternatives`/`nearbySellers` ở Phase 2 và gợi ý sản phẩm ở Phase 4.
- `homepage_ads` cấp dữ liệu cho dải quảng cáo "Nhà bán hàng uy tín" trên trang chủ, luôn gắn nhãn rõ "Quảng cáo/Liên kết tiếp thị".
- Chưa có đối tác thật thì seed vài mục demo có nhãn rõ, tương tự cách `experts.json` đang là dữ liệu minh hoạ.

## Phase 6: Tab "Dịch Vụ Quanh Bạn" + Kho Voucher + điểm tích luỹ

**(a)** Tab khám phá/đặt lịch trung tâm đối tác, tên đề xuất **"Dịch Vụ Quanh Bạn"** (route `/dich-vu`).
**(b)** **Kho Voucher** — trang riêng liệt kê voucher người dùng đang sở hữu, dùng để áp giảm giá khi đặt dịch vụ ở (a).

```sql
CREATE TABLE IF NOT EXISTS partner_venues (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  address_vi TEXT NOT NULL, area_vi TEXT NOT NULL,
  description_vi TEXT NOT NULL, cover_image_url TEXT
);

CREATE TABLE IF NOT EXISTS partner_services (
  id BIGSERIAL PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  name_vi TEXT NOT NULL, price_vnd INTEGER NOT NULL, duration_minutes INTEGER
);

CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY, title_vi TEXT NOT NULL, discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL, venue_id TEXT REFERENCES partner_venues(id),
  valid_from DATE, valid_to DATE, quota INTEGER,
  source TEXT NOT NULL DEFAULT 'points'
);

CREATE TABLE IF NOT EXISTS user_vouchers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voucher_id TEXT NOT NULL REFERENCES vouchers(id),
  obtained_via TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES partner_services(id),
  user_voucher_id BIGINT REFERENCES user_vouchers(id),
  scheduled_at TIMESTAMPTZ NOT NULL, final_price_vnd INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  invoice_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Điểm tích luỹ dùng chung cột `user_wallets.loyalty_points` (Phase 3, nạp ví là nguồn điểm chính). Trang Kho Voucher cho đổi điểm lấy voucher theo bảng quy đổi (`vouchers.source = 'points'`).

3 cách có voucher, đều ghi vào `user_vouchers`:
1. **Đổi điểm tích luỹ** (từ nạp ví) — `obtained_via = 'points_redeem'`
2. **Chơi mini-game** ở `SkinPlaygroundPage.jsx` (Skin Lab) — trang này hiện chỉ chạy state cục bộ, cần thêm endpoint nhỏ để ghi nhận hoàn thành và phát voucher — `obtained_via = 'game_reward'`
3. **Mua Gói Trợ Lý** (hoặc gói riêng) tặng kèm voucher — `obtained_via = 'package_bonus'`

- `category` của `partner_venues` không giới hạn skincare: spa, phòng khám da liễu, gym, xông hơi...
- Trang mới: `src/pages/ServicesNearbyPage.jsx` (danh sách trung tâm gần đây, lọc khu vực/loại hình), `src/pages/ServiceDetailPage.jsx` (chọn dịch vụ, áp voucher, đặt cọc demo), `src/pages/MyVouchersPage.jsx` (Kho Voucher).
- "Gần đây" dùng Geolocation API trình duyệt so khớp `area_vi`/toạ độ tĩnh, không cần tích hợp bản đồ ngoài.
- Thanh toán/đặt cọc là **mock**, `invoice_code` là mã hoá đơn nội bộ, ghi rõ "hoá đơn web, không phải hoá đơn điện tử hợp lệ".
- Thêm mục "Dịch Vụ Quanh Bạn" vào `NavBar.jsx` (kèm badge số voucher đang có).

## Phase 7: Tái cấu trúc trang chủ

File: `src/pages/HomePage.jsx`, `src/components/Analysis.jsx`, `src/components/Hero.jsx`, `src/components/Dashboard.jsx`, `src/components/Routine.jsx`, component mới `src/components/ExpertsShowcase.jsx`, `src/components/ServicesHighlight.jsx`

Thứ tự đề xuất: Hero (CTA chính: khai báo hồ sơ cá nhân) → **ExpertsShowcase** (mới, đẩy kết nối chuyên gia lên) → Analysis (rút gọn, bỏ card lộ trình/điểm danh, thêm card Quét sản phẩm bản mới và tab Dịch Vụ Quanh Bạn) → Technology (đổi nội dung, không nhấn AI "biết tuốt") → **ServicesHighlight** (mới, giới thiệu vài dịch vụ/ưu đãi nổi bật) → **khối gợi ý sản phẩm tiếp thị liên kết** (gần cuối, có nhãn quảng cáo rõ) → CTA → Footer. `Dashboard.jsx`/`Routine.jsx` viết lại nội dung cho khớp luồng mới hoặc bỏ hẳn nếu không còn phù hợp.

## Kiểm thử

- Người dùng tự chạy `npm run dev:all` để xem trực tiếp (không tự động chạy dev server).
- `npm run test` cho `matchEngine` và test mới cho `chatUsageService`, logic voucher (áp đúng giảm giá, không double-apply).
- Kiểm tra thủ công theo từng phase: các route đã xoá trả 404/không còn trong menu; trang Quét sản phẩm hiện badge phù hợp/cân nhắc kèm giá, xuất xứ, tính chính hãng, sản phẩm liên quan; ví/Gói Trợ Lý trừ đúng, cộng điểm khi nạp, chặn khi hết lượt; đặt lịch chuyên gia có bước xin đồng ý gửi hồ sơ và mở được luồng tin nhắn; tab Dịch Vụ Quanh Bạn đặt được dịch vụ, áp voucher, nhận "hoá đơn web" demo; Kho Voucher nhận đúng voucher từ cả 3 nguồn; trang chủ hiển thị đúng thứ tự ưu tiên mới.
