# Ảnh fixture cho ca kiểm thử Gemini

Thư mục này hiện **chưa có ảnh thật**. `testCases.js` (mục `GEMINI_TEST_CASES`) đã định nghĩa sẵn 3
ca tham chiếu, mỗi ca chờ đúng 1 file ảnh:

- `niacinamide_serum_label.jpg` — ảnh chụp rõ nhãn thành phần một serum chứa niacinamide.
- `benzoyl_peroxide_cream.jpg` — ảnh chụp rõ nhãn/hộp một kem trị mụn chứa benzoyl peroxide.
- `anh_mo_khong_ro.jpg` — một ảnh mờ hoặc không phải sản phẩm mỹ phẩm/thực phẩm, dùng để kiểm tra
  AI có trả `recognized: false` thay vì đoán liều hay không.

Cho tới khi có đủ 3 file này, `node server/src/qa/runQa.js` sẽ **tự bỏ qua phần Gemini kèm cảnh báo
rõ ràng trong output**, không âm thầm coi như đã kiểm thử xong. Khi có ảnh thật, chỉ cần thả đúng tên
file vào thư mục này (không cần sửa code) là `runQa.js` sẽ tự chạy đủ 3 lần/ca để đo tính nhất quán.

Ảnh trong thư mục này chỉ dùng nội bộ để kiểm thử, không commit ảnh chứa thông tin cá nhân thật.
