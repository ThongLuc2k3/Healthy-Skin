# TÀI LIỆU 1: MÔ TẢ SẢN PHẨM DỄ HIỂU (ĐẦY ĐỦ CHI TIẾT)

## 1. Web là gì, dành cho ai

Healthy Skin là một web chăm sóc da và dinh dưỡng, giúp người dùng hiểu sản phẩm/thực phẩm nào hợp với mình, dựa trên một bộ thông tin cá nhân khai báo một lần (loại da, dị ứng, mục tiêu...). Đối tượng dùng là người quan tâm chăm sóc da/sức khoẻ hằng ngày, không phải người đang cần cấp cứu hay điều trị bệnh nặng.

## 2. Hiện trạng: web đang hoạt động ra sao

- **Hồ sơ cá nhân**: người dùng khai loại da, dị ứng thực phẩm, bệnh lý nền, mục tiêu chăm sóc.
- **Trợ Lý chat**: nút chat nổi ở mọi trang, miễn phí 5 câu mỗi ngày cho người dùng đăng nhập; hết lượt thì có thể mua Gói Trợ Lý hoặc nạp ví. Trợ Lý chỉ trả lời thông tin cơ bản, không đi sâu vào tư vấn điều trị.
- **Quét ảnh sản phẩm bằng AI**: chụp một sản phẩm/thực phẩm, AI đưa ra 2 mức nhẹ hơn là "phù hợp" hoặc "cần cân nhắc", kèm thông tin bổ sung như giá tham khảo, xuất xứ, dấu hiệu chính hãng, sản phẩm liên quan và nơi bán gần đây.
- **Chuyên gia**: có danh sách chuyên gia mẫu và tài khoản chuyên gia ảo để demo luồng thật gồm đặt lịch, xin phép gửi hồ sơ cá nhân, tạo thread tư vấn, nhắn tin hai chiều, gửi ảnh và gợi ý sản phẩm trong cuộc trò chuyện. Dữ liệu chuyên gia hiện vẫn là dữ liệu minh hoạ, chưa phải đối tác đã ký thật.
- **Diễn đàn đánh giá**: người dùng chia sẻ trải nghiệm, đánh giá kèm ảnh.
- **Skin Lab**: vài mini quiz/thử thách nhỏ để giữ chân người dùng.
- **Góc động lực**: video/nội dung ngắn về skincare, dinh dưỡng, giảm cân lành mạnh.
- **Dịch Vụ Quanh Bạn**: danh sách trung tâm mẫu như spa, phòng khám, gym... cho phép đặt dịch vụ, áp voucher và nhận hoá đơn web nội bộ.
- **Kho Voucher**: đổi điểm lấy voucher, nhận voucher từ mini-game hoặc mua Gói Trợ Lý.

Những luồng trên đã có code và màn hình chạy thật. Tuy nhiên phần thanh toán, dữ liệu đối tác và dữ liệu chuyên gia vẫn còn một phần ở mức demo/minh hoạ, được ghi rõ ở mục 6.

## 3. Vấn đề của hiện trạng

Nếu web tự làm luôn phần việc của bác sĩ, AI trả lời quá sâu hoặc tự vạch lộ trình điều trị thì sẽ phát sinh các vấn đề sau:

- **Rủi ro pháp lý**: nếu người dùng làm theo AI mà có vấn đề, web khó tránh trách nhiệm vì đã "tư vấn" quá sâu.
- **Giảm niềm tin thay vì tăng**: người dùng cảm thấy đang nói chuyện với một cái máy đoán bệnh, không phải một nền tảng đáng tin cậy để kết nối với chuyên gia thật.
- **Doanh thu thiếu minh bạch**: nếu chỉ dựa vào AI miễn phí thì khó có mô hình thu phí rõ ràng.
- **Chuyên gia thật bị đẩy ra rìa**: nếu chỉ dừng ở danh sách hiển thị mà không có luồng tư vấn/đặt lịch/nhắn tin rõ ràng thì rất khó chứng minh giá trị kết nối.

## 4. Định hướng mới: web sẽ hoạt động ra sao

Nguyên tắc chung: **web lùi lại, không đóng vai bác sĩ nữa**. Web chỉ làm 2 việc: (1) cung cấp thông tin sản phẩm ở mức phổ thông, ít liên quan y tế, và (2) kết nối người dùng với chuyên gia thật/trung tâm dịch vụ thật. Việc khám, điều trị, kê đơn là của bên thứ ba (bác sĩ, trung tâm), họ tự chịu trách nhiệm chuyên môn của họ.

### 4.1. Những gì bị bỏ hẳn, và vì sao

- **Lộ trình chăm sóc da** (AI tự vạch kế hoạch điều trị): bỏ, vì đây chính là hành vi "kê phác đồ" mà web không nên làm thay bác sĩ.
- **Điểm danh + streak**: bỏ, vì nó chỉ có ý nghĩa khi đi kèm lộ trình, bỏ lộ trình thì điểm danh cũng không còn giá trị.
- **Theo dõi tiến độ da**: bỏ, vì đây là công việc theo dõi điều trị, nên để bác sĩ theo dõi bệnh nhân của họ, không phải web tự làm.
- **Trang "Kết quả" (đối chiếu hàng loạt ra phù hợp/cần cân nhắc/nên tránh)**: bỏ như một trang độc lập mang tính "phán quyết", được thay bằng cách đánh giá nhẹ nhàng hơn gắn liền với tính năng Quét sản phẩm (xem mục 4.4).
- **Diễn đàn đánh giá, Skin Lab, Góc động lực, Lịch sử quét**: giữ nguyên, vì đây là tiện ích chung chung, không mang tính y tế, giúp người dùng có lý do quay lại web dù không tiêu tiền.

### 4.2. Đổi tên "Hồ sơ cơ địa" thành "Hồ sơ cá nhân"

Vẫn khai báo những thông tin cũ (loại da, dị ứng, mục tiêu...), chỉ đổi cách gọi và tông giọng mô tả, bớt nghe như hồ sơ bệnh án, giống một hồ sơ sở thích/thông tin cá nhân hơn.

### 4.3. Hành trình một người dùng mới

1. Vào web, khai báo Hồ sơ cá nhân.
2. Lướt web thoải mái: đọc diễn đàn, chơi Skin Lab, xem nội dung động lực — hoàn toàn miễn phí, không giới hạn.
3. Quét thử một sản phẩm đang phân vân có nên mua/dùng không (chụp một sản phẩm/thực phẩm, để biết thêm thông tin về sản phẩm hoặc thực phẩm này cũng như lời khuyên nhỏ với thông tin hồ sơ bản thân(những cái suy luận này k quá về ý tế nó là kiểu tìm kiếm tra cứu như có bệnh nền k ăn này này này mà quyét trúng nên phải nhắc nhẹ)).
4. Nếu muốn hỏi nhanh một câu vặt, dùng Trợ Lý — vài câu đầu miễn phí mỗi ngày.
5. Nếu câu hỏi đụng tới việc "trị bệnh gì đó thế nào", Trợ Lý sẽ không tự tư vấn sâu mà gợi ý đặt lịch bác sĩ.
6. Nếu muốn khám thật, đặt lịch chuyên gia ngay trên web, hồ sơ cá nhân được gửi cho chuyên gia xem trước (có xin phép), rồi hai bên trò chuyện qua web.
7. Nếu muốn đi spa/phòng khám/gym ngoài đời, vào tab "Dịch Vụ Quanh Bạn", đặt chỗ với giá cố định từ chính trung tâm đó, có thể dùng voucher đang có để giảm giá.
8. Có voucher bằng cách đổi điểm tích luỹ (tích được khi nạp ví), chơi mini-game ở Skin Lab, hoặc mua Gói Trợ Lý có tặng kèm.

### 4.4. Quét sản phẩm: vẫn có lời khuyên, nhưng thêm thông tin hữu ích, bớt tông y tế

Thay vì kết luận cứng "phù hợp / cần cân nhắc / nên tránh" (3 mức, mức cuối nghe rất y tế), web chỉ còn đưa ra lời khuyên nhẹ nhàng 2 mức: **"phù hợp"** hoặc **"cần cân nhắc, nếu là bạn thì..."**, giống một gợi ý cá nhân hơn là phán quyết. Kèm theo đó, web cung cấp thêm các thông tin thực tế và hữu ích về sản phẩm:

- **Giá thị trường tham khảo**
- **Nơi sản xuất/xuất xứ**
- **Dấu hiệu chính hãng hay không** (nhận định tham khảo, không phải xác nhận pháp lý)
- **Sản phẩm liên quan hoặc tốt hơn**, ưu tiên lấy từ catalog tài trợ/liên kết nếu có
- **Nơi bán gần đây**

Đây là chỗ web có thể kiếm tiền qua **tiếp thị liên kết**: khi gợi ý "sản phẩm tốt hơn", web có thể ưu tiên các nhãn hàng đối tác, có gắn link mua hàng. Hiện catalog này vẫn là dữ liệu mẫu.

### 4.5. Trợ Lý (trước đây gọi là "AI chat")

Đổi tên gọi thành **"Trợ Lý"**, không dùng chữ "AI trả phí" nghe sòng phẳng quá mức cần thiết. Cách hoạt động:

- Miễn phí một số câu hỏi mỗi ngày.
- Hỏi nhiều hơn thì nâng cấp **Gói Trợ Lý** (mua trọn gói) hoặc **nạp ví** (trả theo câu hỏi, cách tính giá cụ thể sẽ bàn sau).
- Nạp ví được cộng cả tiền lẫn **điểm tích luỹ** (ví dụ nạp 100 được 100 vào ví + 10 điểm) — điểm này dùng đổi voucher.
- Trợ Lý chỉ trả lời thông tin cơ bản (cách dùng app, tra cứu thành phần...). Nếu câu hỏi đụng tới việc "trị bệnh/vấn đề da cụ thể thế nào", Trợ Lý sẽ không tự đưa giải pháp mà gợi ý đặt lịch chuyên gia — đây chính là cách web dẫn người dùng sang nguồn thu chính (hoa hồng đặt lịch) một cách tự nhiên, không "vẽ vời" quá nhiều để giữ chân câu hỏi.

### 4.6. Kết nối chuyên gia: từ "đặt chỗ suông" thành tư vấn thật

- Danh sách chuyên gia (hiện là dữ liệu minh hoạ) được đưa lên nổi bật hơn trên trang chủ, không còn nằm khuất trong menu.
- Giá tư vấn hiển thị rõ ràng ngay từ đầu (minh bạch giá).
- Người dùng đặt lịch xong, có bước **xin phép gửi Hồ sơ cá nhân** cho chuyên gia xem trước.
- Sau đó hai bên **trò chuyện trực tiếp qua web**: chuyên gia có thể gửi ảnh, tư vấn, và giới thiệu sản phẩm. Để demo luồng này trước khi có hợp đồng thật, hệ thống tạo sẵn tài khoản chuyên gia ảo cho từng hồ sơ chuyên gia mẫu.
- Đây là nguồn thu chính: **web ăn hoa hồng trên mỗi lượt đặt lịch thành công**, đồng thời trách nhiệm chuyên môn hoàn toàn thuộc về chuyên gia, không phải web.

### 4.7. Tab mới: "Dịch Vụ Quanh Bạn"

Một tab mới (khác hẳn mục Chuyên gia) để người dùng tìm và đặt các dịch vụ sức khoẻ/làm đẹp ngoài đời: spa, phòng khám da liễu, gym, xông hơi... không giới hạn chỉ trong da liễu.

- Xem danh sách trung tâm theo khu vực/danh mục trên web. Phần "gần bạn" hiện chủ yếu đang ở mức dữ liệu minh hoạ theo khu vực, chưa phải mạng lưới đối tác thật có đồng bộ vị trí theo thời gian thực.
- Chọn dịch vụ, giá là **giá cố định do chính trung tâm đó niêm yết** (web chỉ là trung gian).
- Có thể áp **voucher** từ Kho Voucher của mình để được giảm giá.
- Đặt cọc/thanh toán xong nhận **hoá đơn web** (ghi rõ đây là hoá đơn nội bộ, không phải hoá đơn điện tử của nhà nước), rồi tới tận nơi trải nghiệm. Phần thanh toán hiện đi qua provider mock.
- Nguồn thu: **web ăn hoa hồng trên mỗi lượt đặt dịch vụ thành công** tại các trung tâm đối tác.

### 4.8. Kho Voucher

Một trang riêng liệt kê các voucher người dùng đang có, dùng để giảm giá khi đặt dịch vụ ở tab "Dịch Vụ Quanh Bạn". Có 3 cách để có voucher:

1. **Đổi điểm tích luỹ** — điểm có được từ việc nạp ví ở mục Trợ Lý.
2. **Chơi mini-game ở Skin Lab** — hoàn thành quiz/thử thách được thưởng voucher, biến tính năng giải trí sẵn có thành một kênh giữ chân người dùng có giá trị thực tế hơn.
3. **Mua Gói Trợ Lý** — một số gói có tặng kèm voucher, khuyến khích người dùng mua gói lớn hơn.

### 4.9. Trang chủ sắp xếp lại

- Phần giới thiệu chuyên gia được đẩy lên gần đầu trang, nổi bật hơn hẳn hiện tại (hiện chỉ nằm trong menu).
- Phần giới thiệu dịch vụ/ưu đãi từ tab "Dịch Vụ Quanh Bạn" xuất hiện ở khoảng giữa-cuối trang.
- Khối gợi ý sản phẩm tiếp thị liên kết đặt gần cuối trang, có nhãn "Quảng cáo/Liên kết tiếp thị" rõ ràng để không gây hiểu nhầm là lời khuyên khách quan.
- Các nội dung tự quảng cáo AI ("Trợ lý AI luôn sẵn sàng", công nghệ AI "biết tuốt") được rút gọn, đổi giọng điệu bớt phô trương.

## 5. Tổng hợp 4 nguồn thu

| # | Nguồn thu | Cách hoạt động |
|---|---|---|
| 1 | Tiếp thị liên kết + quảng cáo sản phẩm | Gợi ý "sản phẩm tốt hơn" khi quét sản phẩm, dải quảng cáo trang chủ cho nhà bán hàng uy tín trả phí |
| 2 | Gói Trợ Lý / nạp ví | Người dùng mua gói hỏi-đáp hoặc nạp ví trả theo câu hỏi |
| 3 | Hoa hồng đặt lịch chuyên gia | Web ăn hoa hồng mỗi lượt đặt lịch bác sĩ thành công, bác sĩ ưu tiên giới thiệu sản phẩm liên kết web trong lúc tư vấn |
| 4 | Hoa hồng đặt dịch vụ tại trung tâm đối tác | Qua tab "Dịch Vụ Quanh Bạn", web ăn hoa hồng mỗi lượt đặt dịch vụ spa/phòng khám/gym... thành công |

Song song 4 nguồn thu trên, các tính năng miễn phí (Hồ sơ cá nhân, Diễn đàn, Skin Lab, Góc động lực, quét sản phẩm ở mức cơ bản) luôn được giữ nguyên, không bị chặn bởi paywall, để người dùng có lý do quay lại web thường xuyên dù không tiêu tiền.

## 6. Ranh giới trách nhiệm: web làm gì, bác sĩ làm gì

- **Web làm**: cung cấp thông tin sản phẩm phổ thông (giá, xuất xứ, gợi ý sản phẩm khác), kết nối người dùng với chuyên gia/trung tâm, xử lý đặt lịch/đặt chỗ và ghi nhận dữ liệu vận hành.
- **Chuyên gia/trung tâm làm**: toàn bộ phần chẩn đoán, tư vấn điều trị, kê đơn, thực hiện dịch vụ — và tự chịu trách nhiệm chuyên môn về những gì họ tư vấn/thực hiện.
- **Vì đây là đồ án tốt nghiệp**: mọi khâu "tiền bạc" (nạp ví, mua gói, đặt cọc dịch vụ) đều làm ở mức demo/giả lập, không tích hợp cổng thanh toán thật, không phát hành hoá đơn điện tử hợp lệ.

## 7. Những gì còn là demo/minh hoạ theo đúng code hiện tại

- **Dữ liệu chuyên gia**: hồ sơ chuyên gia, lịch trống, chứng chỉ hiển thị và tài khoản đăng nhập expert hiện được seed từ dữ liệu mẫu. Có thể dùng để demo trọn luồng tư vấn, nhưng chưa phải mạng lưới đối tác đã ký hợp đồng thật.
- **Dữ liệu trung tâm dịch vụ**: danh sách spa/phòng khám/gym và bảng giá hiện là dữ liệu minh hoạ do nhóm tạo sẵn.
- **Catalog tiếp thị liên kết và quảng cáo trang chủ**: đã có backend và UI đọc dữ liệu, nhưng dữ liệu hiện vẫn là mẫu.
- **Thanh toán**: nạp ví, mua gói, đặt dịch vụ đều đi qua `payment_intents` và một provider `mock`, tức có ghi nhận giao dịch trong hệ thống nhưng chưa có tiền thật di chuyển.
- **Hoá đơn**: mã hoá đơn khi đặt dịch vụ chỉ là mã nội bộ của web, không phải chứng từ điện tử hợp lệ.
- **Giá gói và tỉ lệ hoa hồng**: hiện mới là mức minh hoạ để hoàn thiện luồng kỹ thuật, chưa phải biểu giá thương mại đã chốt.
