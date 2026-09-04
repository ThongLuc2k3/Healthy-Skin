-- Web đã bỏ Lộ trình/Điểm danh/Tiến độ (đi quá sâu vào tư vấn y tế), dọn bảng cũ khỏi DB dev cục bộ.
DROP TABLE IF EXISTS progress_milestones, checkins, roadmaps CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thông tin cá nhân + liên kết ngân hàng (demo, KHÔNG phải tích hợp ngân hàng thật) — tách khỏi
-- `profiles` vì `profiles` là hồ sơ DA (loại da/dị ứng/mục tiêu), còn đây là thông tin định danh
-- tài khoản hiển thị ở trang "Tài khoản của tôi". bank_account_masked chỉ lưu 4 số cuối, không lưu
-- số tài khoản đầy đủ dù là demo, tránh thói quen xấu nếu sau này cắm liên kết ngân hàng thật.
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_masked TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_linked_at TIMESTAMPTZ;

-- Địa chỉ tự khai của người dùng — dùng làm phương án dự phòng tính khoảng cách cho "Dịch Vụ Quanh
-- Bạn" khi trình duyệt không cấp quyền vị trí (xem venueService.resolveApproxCoords, mô phỏng bằng
-- cách khớp tên quận/huyện trong chuỗi địa chỉ, KHÔNG phải geocoding thật).
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_vi TEXT;

-- Link mạng xã hội tự khai (Facebook/Zalo/Instagram...) — hiện công khai kèm tên khi người khác bấm
-- vào tác giả 1 bài đăng ở Góc truyền động lực (xem motivationPostService.listPosts), KHÁC với các
-- trường address/phone/DOB ở trên vốn chỉ dùng nội bộ (ước tính khoảng cách), không public.
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_link TEXT;

-- Theo dõi (follow) giữa người dùng — dùng cho trang cá nhân công khai + huy hiệu theo số người
-- theo dõi (xem followService.js). PRIMARY KEY kép chặn follow trùng, CHECK chặn tự follow chính
-- mình.
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_id);

-- Số người theo dõi "ảo" cộng thêm cho mục đích demo/trình diễn (ví dụ thuyết trình khoá luận) —
-- KHÔNG phải follower thật, không tạo hàng triệu dòng user_follows giả. Cộng vào số đếm thật khi
-- hiển thị (xem followService.getFollowerCount), mặc định 0 với tài khoản bình thường.
ALTER TABLE users ADD COLUMN IF NOT EXISTS follower_boost INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  skin_type TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '[]',
  conditions TEXT NOT NULL DEFAULT '[]',
  goals TEXT NOT NULL DEFAULT '[]',
  skin_type_note TEXT NOT NULL DEFAULT '',
  allergies_note TEXT NOT NULL DEFAULT '',
  conditions_note TEXT NOT NULL DEFAULT '',
  goals_note TEXT NOT NULL DEFAULT '',
  consent_given_at TIMESTAMPTZ,
  face_photo_path TEXT,
  face_photo_mime TEXT,
  diagnosed_conditions TEXT NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skincare_ingredients (
  id TEXT PRIMARY KEY, name_vi TEXT NOT NULL, name_en TEXT,
  category TEXT NOT NULL DEFAULT 'skincare', flags TEXT NOT NULL DEFAULT '[]',
  conflicts_with_skin_type TEXT NOT NULL DEFAULT '[]',
  explanation_vi TEXT NOT NULL, source TEXT
);

CREATE TABLE IF NOT EXISTS food_items (
  id TEXT PRIMARY KEY, name_vi TEXT NOT NULL, name_en TEXT,
  category TEXT NOT NULL DEFAULT 'food', flags TEXT NOT NULL DEFAULT '[]',
  conflicts_with_allergy TEXT NOT NULL DEFAULT '[]',
  conflicts_with_condition TEXT NOT NULL DEFAULT '[]',
  explanation_vi TEXT NOT NULL, source TEXT
);

CREATE TABLE IF NOT EXISTS scan_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_item_id TEXT, matched_item_category TEXT, ocr_raw_text TEXT,
  product_name TEXT, result TEXT, reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);

CREATE TABLE IF NOT EXISTS expert_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, file_mime TEXT NOT NULL, original_name TEXT,
  source TEXT NOT NULL DEFAULT 'user_upload',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expert_reports_user ON expert_reports(user_id);

CREATE TABLE IF NOT EXISTS experts (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, specialty TEXT NOT NULL,
  clinic_name TEXT NOT NULL, area_vi TEXT NOT NULL, bio_vi TEXT NOT NULL,
  certifications TEXT NOT NULL DEFAULT '[]', rating_avg REAL NOT NULL DEFAULT 0,
  reviews TEXT NOT NULL DEFAULT '[]', available_slots TEXT NOT NULL DEFAULT '[]',
  consultation_fee_vnd INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE experts ADD COLUMN IF NOT EXISTS consultation_fee_vnd INTEGER NOT NULL DEFAULT 0;

-- Đơn đăng ký trở thành chuyên gia trên nền tảng — người nộp đơn tự đề xuất mức phí tư vấn và
-- khung giờ rảnh của mình (kể cả cao hơn giá thị trường), quản trị viên chỉ duyệt/từ chối chứ
-- không chỉnh số liệu đề xuất. Duyệt xong tạo thẳng 1 dòng experts, giống venue_applications.
CREATE TABLE IF NOT EXISTS expert_applications (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  area_vi TEXT NOT NULL,
  bio_vi TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  proposed_fee_vnd INTEGER NOT NULL,
  proposed_slots TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_expert_id TEXT REFERENCES experts(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS expert_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id TEXT NOT NULL REFERENCES experts(id), slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  consultation_report_id BIGINT REFERENCES expert_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expert_bookings_user ON expert_bookings(user_id);

-- Tài khoản đăng nhập demo cho chuyên gia (mật khẩu seed cố định, xem seedExpertAccounts) —
-- để bác sĩ có thể xem hồ sơ đã gửi và nhắn tin với người dùng qua Expert Dashboard.
CREATE TABLE IF NOT EXISTS expert_accounts (
  id BIGSERIAL PRIMARY KEY,
  expert_id TEXT NOT NULL REFERENCES experts(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mỗi lịch hẹn mở một thread tư vấn — profile_snapshot lưu lại hồ sơ cá nhân tại thời điểm người
-- dùng đồng ý gửi cho chuyên gia xem trước, không đồng bộ theo hồ sơ mới nhất về sau.
CREATE TABLE IF NOT EXISTS consultation_threads (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL UNIQUE REFERENCES expert_bookings(id) ON DELETE CASCADE,
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
  image_mime TEXT,
  recommended_product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_thread ON consultation_messages(thread_id);

-- Gói Trợ Lý + ví nạp tiền (demo, không tích hợp cổng thanh toán thật). balance_vnd và
-- loyalty_points chỉ là số đếm nội bộ, nạp/trừ qua route mock trong chat.routes.js.
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_vnd INTEGER NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  plan_id TEXT NOT NULL DEFAULT 'free',
  purchased_questions_remaining INTEGER NOT NULL DEFAULT 0,
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

-- Catalog sản phẩm tiếp thị liên kết (demo) — dùng để gợi ý "sản phẩm liên quan/tốt hơn" ở trang
-- Quét sản phẩm và trong luồng tư vấn chuyên gia. Chưa có đối tác thật, seed vài mục demo có nhãn rõ.
CREATE TABLE IF NOT EXISTS sponsored_products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT,
  matched_item_id TEXT, price_vnd INTEGER, affiliate_url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Vị trí trên web mà mỗi sản phẩm tài trợ được phép xuất hiện — mảng JSON các khoá cố định:
-- 'trang_chu' (dải tài trợ trang chủ), 'ket_qua_quet' (gợi ý sau khi quét sản phẩm),
-- 'tu_van_chuyen_gia' (chuyên gia gợi ý trong khung chat). Quản trị viên bật/tắt qua trang Admin.
ALTER TABLE sponsored_products ADD COLUMN IF NOT EXISTS placements TEXT NOT NULL DEFAULT '[]';

-- Dải quảng cáo "Nhà bán hàng uy tín" trên trang chủ (demo), luôn gắn nhãn Quảng cáo/Liên kết tiếp thị.
CREATE TABLE IF NOT EXISTS homepage_ads (
  id BIGSERIAL PRIMARY KEY,
  sponsor_name TEXT NOT NULL, image_url TEXT NOT NULL, link_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE, priority INTEGER NOT NULL DEFAULT 0
);

-- Tab "Dịch Vụ Quanh Bạn": đặt dịch vụ tại trung tâm đối tác (spa, phòng khám, gym...), giá cố định
-- do chính trung tâm niêm yết, web chỉ là trung gian và ăn hoa hồng (demo, không phải đối tác thật).
CREATE TABLE IF NOT EXISTS partner_venues (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  address_vi TEXT NOT NULL, area_vi TEXT NOT NULL,
  description_vi TEXT NOT NULL, cover_image_url TEXT
);

-- Toạ độ để tính khoảng cách tới người dùng (xem venueService.listVenues) — cho phép NULL vì các
-- trung tâm được duyệt từ venue_applications (chưa nhập toạ độ) vẫn phải hiển thị được, chỉ là
-- không có khoảng cách kèm theo.
ALTER TABLE partner_venues ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE partner_venues ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS partner_services (
  id BIGSERIAL PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  name_vi TEXT NOT NULL, price_vnd INTEGER NOT NULL, duration_minutes INTEGER
);

-- Đánh giá cho "Dịch Vụ Quanh Bạn" (mô phỏng lại kiểu đánh giá đã có ở chuyên gia), nhưng lưu thành
-- bảng riêng thay vì JSON lồng trong partner_venues vì venue không có sẵn cột reviews như experts.
CREATE TABLE IF NOT EXISTS venue_reviews (
  id BIGSERIAL PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment_vi TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue ON venue_reviews(venue_id);

-- Kho voucher: mỗi voucher là một "mẫu" giảm giá; user_vouchers ghi nhận ai đang sở hữu bản nào,
-- lấy được qua đổi điểm tích luỹ / chơi minigame Skin Lab / mua Gói Trợ Lý (xem obtained_via).
CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY, title_vi TEXT NOT NULL, discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL, venue_id TEXT REFERENCES partner_venues(id),
  points_cost INTEGER NOT NULL DEFAULT 0,
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

-- Chỉ populate cho obtained_via='points_redeem' (đổi bằng điểm) — các nguồn còn lại (tặng kèm/thưởng
-- minigame/quà chào mừng) không trừ điểm nên để NULL. Lưu lại NGAY LÚC đổi vì loyalty_points là số
-- chạy theo thời gian, không thể suy ngược "lúc đó còn bao nhiêu điểm" nếu không chụp lại tại đây.
ALTER TABLE user_vouchers ADD COLUMN IF NOT EXISTS points_spent INTEGER;
ALTER TABLE user_vouchers ADD COLUMN IF NOT EXISTS points_balance_after INTEGER;
CREATE INDEX IF NOT EXISTS idx_user_vouchers_user ON user_vouchers(user_id);

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
CREATE INDEX IF NOT EXISTS idx_venue_bookings_user ON venue_bookings(user_id);

CREATE TABLE IF NOT EXISTS website_reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) DEFAULT 5,
  title TEXT NOT NULL, content TEXT NOT NULL, image_path TEXT, image_mime TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tên hiển thị tuỳ chọn cho người đánh giá — nếu để trống, route GET /reviews sẽ hiển thị email
-- người dùng thay thế. Thêm sau khi bảng đã tồn tại nên cần ALTER riêng cho DB dev cục bộ cũ.
ALTER TABLE website_reviews ADD COLUMN IF NOT EXISTS author_name TEXT;

-- website_reviews.user_id ban đầu không có ON DELETE CASCADE — nếu xoá tài khoản theo cách thông
-- thường (DELETE FROM users) thì bất kỳ user nào có review sẽ làm request vỡ vì lỗi khoá ngoại.
-- DROP luôn chạy trước ADD nên khối này idempotent mỗi lần khởi động (đúng kiểu file này đang dùng).
ALTER TABLE website_reviews DROP CONSTRAINT IF EXISTS website_reviews_user_id_fkey;
ALTER TABLE website_reviews ADD CONSTRAINT website_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Bình luận dưới 1 đánh giá ở Diễn đàn — parent_comment_id cho phép trả lời 1 bình luận (đúng 1 cấp
-- lồng: bình luận -> trả lời, không trả lời-của-trả lời để khỏi phải làm UI thread nhiều cấp phức
-- tạp). image_path/image_mime tuỳ chọn, đúng cách profileService lưu ảnh khuôn mặt.
CREATE TABLE IF NOT EXISTS review_comments (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES website_reviews(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_comments_review ON review_comments(review_id);
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS parent_comment_id BIGINT REFERENCES review_comments(id) ON DELETE CASCADE;
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS image_path TEXT;
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS image_mime TEXT;
ALTER TABLE review_comments ALTER COLUMN content DROP NOT NULL;

-- Nhiều ảnh/1 bình luận (mảng đường dẫn) — cột image_path/image_mime cũ giữ lại để không vỡ dữ liệu
-- bình luận cũ, đọc dữ liệu ưu tiên image_paths, rỗng thì mới lấy image_path (xem commentService.js).
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS image_paths TEXT[];

-- Dùng CHUNG bảng review_comments/comment_reactions cho cả bình luận ở Diễn đàn (đánh giá) LẪN Góc
-- truyền động lực (bài đăng) — motivation_post_id nullable, đúng 1 trong 2 cột (review_id/
-- motivation_post_id) có giá trị tuỳ loại nội dung đang bình luận (xem commentService.js). Gộp
-- chung để không phải nhân đôi toàn bộ logic bình luận/trả lời/thích/sửa/xoá cho riêng Góc truyền
-- động lực.
ALTER TABLE review_comments ALTER COLUMN review_id DROP NOT NULL;
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS motivation_post_id BIGINT REFERENCES motivation_posts(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_review_comments_motivation_post ON review_comments(motivation_post_id);

-- Nhiều ảnh/1 đánh giá — cùng kiểu image_paths ở trên, image_path/image_mime cũ giữ lại cho dữ liệu
-- đánh giá cũ.
ALTER TABLE website_reviews ADD COLUMN IF NOT EXISTS image_paths TEXT[];

-- Thích/không thích 1 đánh giá — mỗi người đúng 1 phản ứng/đánh giá; bấm lại cùng loại thì gỡ, bấm
-- loại khác thì thay (xem toggleReaction trong review.routes.js).
CREATE TABLE IF NOT EXISTS review_reactions (
  review_id BIGINT NOT NULL REFERENCES website_reviews(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like','dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- Thích/không thích 1 bình luận — cùng cơ chế toggle với review_reactions, tách bảng riêng vì khoá
-- ngoại trỏ vào review_comments chứ không phải website_reviews.
CREATE TABLE IF NOT EXISTS comment_reactions (
  comment_id BIGINT NOT NULL REFERENCES review_comments(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like','dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- Nhật ký đồng ý (consent) — thay cho việc chỉ có 1 cờ profiles.consent_given_at bị ghi đè không
-- lưu lịch sử. Mỗi lần người dùng đồng ý/thu hồi đồng ý dùng dữ liệu nhạy cảm, hoặc đồng ý gửi hồ sơ
-- cho chuyên gia xem trước khi đặt lịch, đều ghi thành 1 dòng ở đây, không sửa/xoá dòng cũ.
CREATE TABLE IF NOT EXISTS consent_events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  booking_id BIGINT,
  granted BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consent_events_user ON consent_events(user_id);

-- Hạ tầng giá/hoa hồng + sổ đối soát (demo): ghi nhận minh bạch phần hoa hồng nền tảng tách khỏi
-- phần trả đối tác trên MỖI booking, để có thể đối chiếu sau này khi có đối tác/thanh toán thật.
-- KHÔNG thêm bước thu tiền mới ở luồng đặt lịch chuyên gia — đó là quyết định sản phẩm/UX riêng.
ALTER TABLE expert_bookings ADD COLUMN IF NOT EXISTS consultation_fee_vnd INTEGER NOT NULL DEFAULT 0;
ALTER TABLE expert_bookings ADD COLUMN IF NOT EXISTS platform_commission_vnd INTEGER NOT NULL DEFAULT 0;

ALTER TABLE venue_bookings ADD COLUMN IF NOT EXISTS platform_commission_vnd INTEGER NOT NULL DEFAULT 0;
ALTER TABLE venue_bookings ADD COLUMN IF NOT EXISTS partner_payout_vnd INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS settlement_records (
  id BIGSERIAL PRIMARY KEY,
  booking_type TEXT NOT NULL, -- 'expert' | 'venue'
  booking_id BIGINT NOT NULL,
  gross_amount_vnd INTEGER NOT NULL,
  commission_vnd INTEGER NOT NULL,
  payout_vnd INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_settlement_records_booking ON settlement_records(booking_type, booking_id);

-- Tài khoản đăng nhập trang Quản trị (Admin) — quản lý doanh thu, thành viên, chuyên gia, đơn đăng
-- ký đối tác và vị trí hiển thị sản phẩm tài trợ. Tách khỏi users/expert_accounts để không lẫn quyền.
CREATE TABLE IF NOT EXISTS admin_accounts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Đơn đăng ký trở thành trung tâm đối tác (spa/phòng khám/gym...) gửi bởi chủ cửa hàng — quản trị
-- viên duyệt (approved) sẽ tạo dòng tương ứng trong partner_venues, hoặc từ chối (rejected) kèm ghi
-- chú lý do. 'pending' là trạng thái mặc định khi vừa nộp đơn, chưa được ai xử lý.
CREATE TABLE IF NOT EXISTS venue_applications (
  id BIGSERIAL PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  area_vi TEXT NOT NULL,
  address_vi TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_venue_id TEXT REFERENCES partner_venues(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Payment intent — lớp trung gian giữa "hành động nạp tiền/đặt cọc" và ví/booking thật, để sau này
-- cắm cổng thanh toán thật (VNPay/Momo/...) chỉ cần thêm 1 provider mới, không sửa route/service
-- nghiệp vụ. Với provider 'mock' hiện tại, intent luôn được xác nhận thành công ngay lập tức.
-- Đề xuất lịch hẹn từ khách hàng gửi đích danh 1 chuyên gia — khác với expert_applications (chuyên
-- gia tự ứng tuyển vào nền tảng). Ở đây khách chọn 1 chuyên gia đã có sẵn rồi tự đề xuất ngày/giờ/
-- mức phí khác với giá niêm yết, chuyên gia xem và bấm nhận/từ chối; nhận xong khách phải xác nhận
-- lại (confirm) mới tạo expert_bookings thật, tránh việc chuyên gia bấm nhận thay luôn quyết định đặt
-- lịch của khách.
CREATE TABLE IF NOT EXISTS expert_booking_proposals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id TEXT NOT NULL REFERENCES experts(id),
  proposed_date DATE NOT NULL,
  proposed_time TEXT NOT NULL,
  proposed_fee_vnd INTEGER NOT NULL,
  note_vi TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected | confirmed
  expert_note TEXT,
  booking_id BIGINT REFERENCES expert_bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_expert_booking_proposals_expert ON expert_booking_proposals(expert_id, status);
CREATE INDEX IF NOT EXISTS idx_expert_booking_proposals_user ON expert_booking_proposals(user_id);

-- Bài đăng video do người dùng tự đăng ở Góc truyền động lực — khác với MOTIVATION_CATEGORIES (nội
-- dung tĩnh do đội ngũ chọn sẵn trong src/data/motivationContent.js). Đúng 1 trong 2 nguồn video:
-- video_url (dán link YouTube/TikTok...) hoặc video_path (tự tải file lên), không cả hai/không thiếu
-- cả hai (ràng buộc kiểm tra ở motivationPostService.createPost, không đặt CHECK ở DB cho đơn giản).
CREATE TABLE IF NOT EXISTS motivation_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  video_path TEXT,
  video_mime TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_motivation_posts_user ON motivation_posts(user_id);

-- Lượt xem đã tính điểm cho chủ bài — chặn 1 người dùng xem đi xem lại cùng 1 bài để cày điểm ảo
-- (xem motivationPostService.recordView). Khách ẩn danh vẫn xem được nhưng không tính điểm.
CREATE TABLE IF NOT EXISTS motivation_post_views (
  post_id BIGINT NOT NULL REFERENCES motivation_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Lượt tim — bật/tắt được (like/unlike), cộng/trừ điểm cho chủ bài đúng theo trạng thái hiện tại để
-- tránh cày điểm bằng cách tim rồi bỏ tim lặp lại.
CREATE TABLE IF NOT EXISTS motivation_post_likes (
  post_id BIGINT NOT NULL REFERENCES motivation_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS payment_intents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL, -- 'wallet_topup' | 'plan_purchase' | 'venue_deposit'
  reference_id TEXT,
  amount_vnd INTEGER NOT NULL,
  provider TEXT NOT NULL DEFAULT 'mock',
  status TEXT NOT NULL DEFAULT 'pending',
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user ON payment_intents(user_id);

-- Khoá tài khoản từ Cổng Quản Trị (nghi rửa tiền/gian lận...) — chặn đăng nhập mới NGAY (auth.routes
-- login) và buộc đăng xuất phiên đang mở ở lần gọi /auth/me kế tiếp (mỗi lần tải lại trang), KHÔNG
-- kiểm tra ở requireAuth cho mọi request để tránh cõng thêm 1 lượt truy vấn DB vào từng API.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- Ảnh đại diện tự tải lên — lưu Cloudinary (URL tuyệt đối), cùng cách với ảnh đánh giá/bình luận/
-- Góc truyền động lực, KHÔNG ghi ổ đĩa local (xem accountService.js).
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
