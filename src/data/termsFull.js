// Nội dung trích xuất nguyên văn bởi scripts/extract-legal-content.mjs
// từ HELTHY SKIN.docx (Quy chế hoạt động và Điều khoản sử dụng), KHÔNG chỉnh sửa tay, chạy lại script nếu tài liệu gốc thay đổi.
const termsFull = [
  {
    "type": "paragraph",
    "text": "HELTHY SKIN"
  },
  {
    "type": "paragraph",
    "text": "QUY CHẾ HOẠT ĐỘNG"
  },
  {
    "type": "paragraph",
    "text": "&"
  },
  {
    "type": "paragraph",
    "text": "ĐIỀU KHOẢN SỬ DỤNG"
  },
  {
    "type": "paragraph",
    "text": "WEBSITE HEALTHY SKIN"
  },
  {
    "type": "paragraph",
    "text": "_____🍃______"
  },
  {
    "type": "paragraph",
    "text": "Bộ quy chế này quy định quyền và nghĩa vụ của người dùng cũng như các chính sách áp dụng khi sử dụng website Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "NGÀY BAN HÀNH:"
  },
  {
    "type": "paragraph",
    "text": "ĐƠN VỊ BAN HÀNH: BAN QUẢN TRỊ WEDSITE HELTHY SKIN"
  },
  {
    "type": "paragraph",
    "text": "🛡️Cam kết bảo vệ quyền lợi người dùng và xây dựng cộng đồng chăm sóc da khoa học an toàn bền vững"
  },
  {
    "type": "paragraph",
    "text": "MỤC LỤC"
  },
  {
    "type": "paragraph",
    "text": "LỜI MỞ ĐẦU"
  },
  {
    "type": "paragraph",
    "text": "Trong bối cảnh chuyển đổi số và sự phát triển mạnh mẽ của công nghệ trí tuệ nhân tạo (Artificial Intelligence - AI), các nền tảng chăm sóc sức khỏe trực tuyến đang dần trở thành công cụ hỗ trợ hữu ích, giúp người dùng tiếp cận thông tin một cách nhanh chóng, thuận tiện và hiệu quả. Đặc biệt, trong lĩnh vực chăm sóc da, việc ứng dụng AI vào quá trình phân tích tình trạng da và gợi ý quy trình chăm sóc phù hợp không chỉ nâng cao trải nghiệm người dùng mà còn góp phần hình thành thói quen chăm sóc da khoa học và chủ động."
  },
  {
    "type": "paragraph",
    "text": "Website Healthy Skin được xây dựng với mục tiêu trở thành nền tảng hỗ trợ người dùng trong việc phân tích sơ bộ tình trạng làn da, cung cấp các thông tin tham khảo về chăm sóc da, thành phần mỹ phẩm và gợi ý quy trình chăm sóc phù hợp với từng nhu cầu cá nhân. Bên cạnh việc ứng dụng công nghệ hiện đại, Healthy Skin luôn đặt quyền riêng tư, tính minh bạch và sự an toàn của người dùng lên hàng đầu trong quá trình vận hành và phát triển hệ thống."
  },
  {
    "type": "paragraph",
    "text": "Để bảo đảm việc cung cấp dịch vụ được thực hiện một cách thống nhất, minh bạch và phù hợp với các quy định của pháp luật Việt Nam, Healthy Skin ban hành Quy chế hoạt động và Điều khoản sử dụng Website Healthy Skin. Tài liệu này là cơ sở quy định các nguyên tắc hoạt động của website; quyền và nghĩa vụ của Healthy Skin và người dùng; chính sách bảo vệ thông tin cá nhân; nguyên tắc ứng dụng công nghệ AI; giới hạn trách nhiệm; cơ chế xử lý vi phạm, giải quyết tranh chấp cùng các quy định khác có liên quan."
  },
  {
    "type": "paragraph",
    "text": "Việc ban hành Quy chế không chỉ nhằm bảo vệ quyền và lợi ích hợp pháp của các bên tham gia mà còn góp phần xây dựng một môi trường trực tuyến an toàn, minh bạch và đáng tin cậy, tạo nền tảng cho sự phát triển bền vững của Healthy Skin trong tương lai."
  },
  {
    "type": "paragraph",
    "text": "Người dùng khi truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên Website Healthy Skin được xem là đã đọc, hiểu và đồng ý tuân thủ toàn bộ các quy định được nêu trong Quy chế hoạt động và Điều khoản sử dụng này. Trong trường hợp có sự thay đổi, bổ sung nội dung Quy chế, Healthy Skin sẽ thông báo theo hình thức phù hợp để người dùng kịp thời cập nhật và tiếp tục sử dụng dịch vụ trên cơ sở tự nguyện và minh bạch."
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin cam kết không ngừng hoàn thiện hệ thống, nâng cao chất lượng dịch vụ, tăng cường các biện pháp bảo vệ dữ liệu cá nhân và ứng dụng công nghệ một cách có trách nhiệm, hướng đến mục tiêu mang lại những trải nghiệm an toàn, tiện ích và đáng tin cậy cho cộng đồng người dùng."
  },
  {
    "type": "paragraph",
    "text": "CƠ SỞ PHÁP LÝ"
  },
  {
    "type": "paragraph",
    "text": "Quy chế hoạt động và Điều khoản sử dụng Website Healthy Skin được xây dựng trên cơ sở các quy định của pháp luật Việt Nam, bao gồm nhưng không giới hạn:"
  },
  {
    "type": "list",
    "items": [
      "Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam năm 2013;",
      "Bộ luật Dân sự năm 2015;",
      "Luật Giao dịch điện tử năm 2023;",
      "Luật An ninh mạng năm 2018;",
      "Luật Bảo vệ quyền lợi người tiêu dùng năm 2023;",
      "Nghị định số 13/2023/NĐ-CP ngày 17/4/2023 của Chính phủ về bảo vệ dữ liệu cá nhân;",
      "Các văn bản pháp luật khác có liên quan."
    ]
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG I. GIỚI THIỆU VỀ HỀ THỐNG HEALTHY SKIN"
  },
  {
    "type": "article",
    "text": "Điều 1. Giới thiệu về Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin là nền tảng hỗ trợ chăm sóc da ứng dụng công nghệ trí tuệ nhân tạo (AI), được phát triển nhằm hỗ trợ người dùng đánh giá sơ bộ tình trạng làn da, tiếp cận các kiến thức chăm sóc da đáng tin cậy và xây dựng lộ trình chăm sóc phù hợp với nhu cầu cá nhân."
  },
  {
    "type": "paragraph",
    "text": "Thông qua việc phân tích thông tin do người dùng cung cấp, bao gồm hình ảnh làn da, đặc điểm da và các thông tin liên quan, Healthy Skin đưa ra các gợi ý mang tính tham khảo về tình trạng da, quy trình chăm sóc, thành phần mỹ phẩm phù hợp và các khuyến nghị nhằm nâng cao hiệu quả chăm sóc da hằng ngày."
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin được xây dựng với định hướng trở thành một nền tảng hỗ trợ thông minh, góp phần giúp người dùng chủ động hơn trong việc chăm sóc sức khỏe làn da, đồng thời nâng cao nhận thức về việc lựa chọn mỹ phẩm và xây dựng thói quen chăm sóc da an toàn, khoa học."
  },
  {
    "type": "paragraph",
    "text": "Các thông tin, hình ảnh, nội dung và chức năng trên hệ thống được cung cấp nhằm mục đích hỗ trợ người dùng trong quá trình tìm hiểu và chăm sóc da; không được hiểu là hoạt động khám bệnh, chữa bệnh hoặc tư vấn y tế chuyên sâu."
  },
  {
    "type": "article",
    "text": "Điều 2. Mục đích ban hành Chính sách và Điều khoản sử dụng"
  },
  {
    "type": "paragraph",
    "text": "Chính sách và Điều khoản sử dụng này được ban hành nhằm:"
  },
  {
    "type": "list",
    "items": [
      "Thiết lập các nguyên tắc chung trong quá trình sử dụng website và các dịch vụ do Healthy Skin cung cấp.",
      "Quy định quyền, nghĩa vụ và trách nhiệm của người dùng khi truy cập, đăng ký tài khoản hoặc sử dụng các chức năng trên hệ thống.",
      "Quy định quyền, nghĩa vụ và trách nhiệm của Healthy Skin trong việc vận hành, quản lý và phát triển nền tảng.",
      "Bảo vệ quyền và lợi ích hợp pháp của người dùng cũng như của Healthy Skin trong quá trình cung cấp và sử dụng dịch vụ.",
      "Xây dựng môi trường sử dụng minh bạch, an toàn, tôn trọng quyền riêng tư và phù hợp với các quy định của pháp luật Việt Nam."
    ]
  },
  {
    "type": "article",
    "text": "Điều 3. Phạm vi áp dụng"
  },
  {
    "type": "paragraph",
    "text": "Chính sách và Điều khoản sử dụng này được áp dụng đối với toàn bộ cá nhân, tổ chức có hành vi truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ chức năng nào trên website và các nền tảng thuộc hệ thống Healthy Skin."
  },
  {
    "type": "paragraph",
    "text": "Việc người dùng truy cập hoặc tiếp tục sử dụng Healthy Skin đồng nghĩa với việc người dùng đã đọc, hiểu và đồng ý tuân thủ toàn bộ nội dung của Chính sách và Điều khoản sử dụng này."
  },
  {
    "type": "paragraph",
    "text": "Trường hợp người dùng không đồng ý với bất kỳ nội dung nào trong tài liệu này, người dùng vui lòng ngừng truy cập hoặc sử dụng các dịch vụ của Healthy Skin."
  },
  {
    "type": "article",
    "text": "Điều 4. Đối tượng sử dụng"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin hướng tới các đối tượng sau:"
  },
  {
    "type": "list",
    "items": [
      "Cá nhân có nhu cầu tìm hiểu, theo dõi và chăm sóc làn da.",
      "Người sử dụng mỹ phẩm mong muốn lựa chọn sản phẩm phù hợp với đặc điểm làn da.",
      "Sinh viên, học sinh và các cá nhân quan tâm đến kiến thức chăm sóc da an toàn, khoa học.",
      "Các tổ chức, đơn vị hoặc đối tác hợp tác với Healthy Skin theo các chương trình được hai bên thống nhất."
    ]
  },
  {
    "type": "paragraph",
    "text": "Đối với người dưới 16 tuổi hoặc người chưa có đầy đủ năng lực hành vi dân sự theo quy định của pháp luật, việc sử dụng Healthy Skin cần có sự đồng ý và giám sát của cha mẹ hoặc người giám hộ hợp pháp."
  },
  {
    "type": "article",
    "text": "Điều 5. Nguyên tắc hoạt động của Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin hoạt động trên các nguyên tắc sau:"
  },
  {
    "type": "list",
    "items": [
      "Tôn trọng quyền riêng tư và bảo vệ dữ liệu cá nhân của người dùng.",
      "Minh bạch trong việc thu thập, lưu trữ và sử dụng thông tin.",
      "Cung cấp thông tin chăm sóc da dựa trên dữ liệu và thuật toán trí tuệ nhân tạo nhằm hỗ trợ người dùng đưa ra quyết định phù hợp.",
      "Không ưu tiên hoặc quảng bá bất kỳ thương hiệu mỹ phẩm nào dưới hình thức gây hiểu nhầm cho người dùng.",
      "Không cung cấp dịch vụ khám bệnh, chữa bệnh hoặc kê đơn thuốc dưới bất kỳ hình thức nào.",
      "Không bảo đảm kết quả điều trị hoặc hiệu quả sử dụng của bất kỳ sản phẩm mỹ phẩm nào được hệ thống gợi ý."
    ]
  },
  {
    "type": "article",
    "text": "Điều 6. Giải thích thuật ngữ"
  },
  {
    "type": "paragraph",
    "text": "Trong Chính sách và Điều khoản sử dụng này, các thuật ngữ dưới đây được hiểu như sau:"
  },
  {
    "type": "paragraph",
    "text": "1. Healthy Skin là website và các nền tảng trực thuộc cung cấp dịch vụ hỗ trợ phân tích và chăm sóc da ứng dụng công nghệ trí tuệ nhân tạo."
  },
  {
    "type": "paragraph",
    "text": "2. Người dùng là cá nhân hoặc tổ chức truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào do Healthy Skin cung cấp."
  },
  {
    "type": "paragraph",
    "text": "3. Dữ liệu cá nhân là các thông tin liên quan đến một cá nhân được Healthy Skin thu thập trong quá trình sử dụng dịch vụ, bao gồm nhưng không giới hạn ở họ tên, địa chỉ thư điện tử, số điện thoại, hình ảnh khuôn mặt, hình ảnh làn da và các thông tin khác do người dùng cung cấp."
  },
  {
    "type": "paragraph",
    "text": "4. Tài khoản là tài khoản do người dùng tạo lập để sử dụng các chức năng của Healthy Skin."
  },
  {
    "type": "paragraph",
    "text": "5. Dịch vụ là toàn bộ các tính năng, công cụ và tiện ích được Healthy Skin cung cấp trên website hoặc các nền tảng liên quan."
  },
  {
    "type": "paragraph",
    "text": "6. Hệ thống AI là công nghệ trí tuệ nhân tạo được Healthy Skin sử dụng để hỗ trợ phân tích hình ảnh, đánh giá sơ bộ tình trạng da và đưa ra các gợi ý mang tính tham khảo."
  },
  {
    "type": "article",
    "text": "Điều 7. Hiệu lực áp dụng"
  },
  {
    "type": "paragraph",
    "text": "Chính sách và Điều khoản sử dụng này có hiệu lực kể từ thời điểm được công bố trên website Healthy Skin."
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có quyền sửa đổi, bổ sung hoặc cập nhật nội dung của Chính sách và Điều khoản sử dụng nhằm phù hợp với quá trình vận hành hệ thống hoặc yêu cầu của pháp luật. Phiên bản mới sẽ được công bố trên website và có hiệu lực kể từ thời điểm đăng tải, trừ khi có quy định khác."
  },
  {
    "type": "paragraph",
    "text": "Việc người dùng tiếp tục sử dụng Healthy Skin sau khi các thay đổi được công bố được hiểu là người dùng đã đọc, hiểu và đồng ý với các nội dung được cập nhật."
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG II. CHÍNH SÁCH BẢO VỆ THÔNG TIN CÁ NHÂN"
  },
  {
    "type": "article",
    "text": "Điều 8. Mục đích thu thập thông tin cá nhân"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin thu thập và xử lý một số thông tin cá nhân của người dùng nhằm đảm bảo việc cung cấp dịch vụ được chính xác, an toàn và phù hợp với nhu cầu của từng cá nhân."
  },
  {
    "type": "paragraph",
    "text": "Thông tin được thu thập phục vụ cho các mục đích sau:"
  },
  {
    "type": "list",
    "items": [
      "Tạo lập và quản lý tài khoản người dùng.",
      "Xác thực danh tính khi đăng ký hoặc đăng nhập hệ thống.",
      "Hỗ trợ hệ thống AI phân tích sơ bộ tình trạng làn da dựa trên dữ liệu do người dùng cung cấp.",
      "Đưa ra các gợi ý về quy trình chăm sóc da, thành phần mỹ phẩm và sản phẩm phù hợp với từng đặc điểm làn da.",
      "Theo dõi sự thay đổi của tình trạng da trong quá trình sử dụng dịch vụ.",
      "Tiếp nhận, xử lý và phản hồi các yêu cầu hỗ trợ, khiếu nại hoặc góp ý từ người dùng.",
      "Cải thiện chất lượng dịch vụ, tối ưu thuật toán AI và nâng cao trải nghiệm người dùng.",
      "Thực hiện các nghĩa vụ theo quy định của pháp luật hoặc theo yêu cầu của cơ quan nhà nước có thẩm quyền."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin cam kết chỉ thu thập những thông tin cần thiết cho việc cung cấp dịch vụ và không thu thập dữ liệu ngoài phạm vi mục đích đã công bố nếu chưa có sự đồng ý của người dùng."
  },
  {
    "type": "article",
    "text": "Điều 9. Các loại thông tin được thu thập"
  },
  {
    "type": "paragraph",
    "text": "Trong quá trình sử dụng dịch vụ, Healthy Skin có thể thu thập các nhóm thông tin sau:"
  },
  {
    "type": "paragraph",
    "text": "1. Thông tin do người dùng cung cấp"
  },
  {
    "type": "list",
    "items": [
      "Họ và tên.",
      "Địa chỉ thư điện tử (Email).",
      "Số điện thoại.",
      "Ngày sinh.",
      "Giới tính.",
      "Mật khẩu đăng nhập (được mã hóa).",
      "Thông tin về loại da, tình trạng da và mục tiêu chăm sóc."
    ]
  },
  {
    "type": "paragraph",
    "text": "2. Hình ảnh và dữ liệu phân tích"
  },
  {
    "type": "list",
    "items": [
      "Hình ảnh khuôn mặt hoặc vùng da được người dùng tải lên.",
      "Kết quả phân tích do hệ thống AI tạo ra.",
      "Lịch sử phân tích và các báo cáo theo dõi quá trình chăm sóc da."
    ]
  },
  {
    "type": "paragraph",
    "text": "3. Thông tin kỹ thuật"
  },
  {
    "type": "list",
    "items": [
      "Địa chỉ IP.",
      "Loại trình duyệt.",
      "Hệ điều hành.",
      "Thiết bị truy cập.",
      "Thời gian đăng nhập.",
      "Nhật ký hoạt động trên hệ thống."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin không chủ động thu thập các dữ liệu nhạy cảm vượt quá nhu cầu cần thiết của dịch vụ, trừ trường hợp người dùng tự nguyện cung cấp hoặc pháp luật có quy định khác."
  },
  {
    "type": "article",
    "text": "Điều 10. Phạm vi sử dụng thông tin"
  },
  {
    "type": "paragraph",
    "text": "Thông tin cá nhân của người dùng chỉ được Healthy Skin sử dụng trong phạm vi cần thiết để vận hành và phát triển hệ thống."
  },
  {
    "type": "paragraph",
    "text": "Cụ thể, thông tin có thể được sử dụng để:"
  },
  {
    "type": "list",
    "items": [
      "Cung cấp các chức năng của website.",
      "Phân tích dữ liệu và cá nhân hóa trải nghiệm người dùng.",
      "Cải thiện độ chính xác của thuật toán AI.",
      "Gửi thông báo liên quan đến tài khoản hoặc dịch vụ.",
      "Hỗ trợ kỹ thuật và chăm sóc khách hàng.",
      "Phát hiện, ngăn chặn và xử lý các hành vi gian lận hoặc sử dụng trái phép.",
      "Thực hiện nghĩa vụ pháp lý theo quy định hiện hành."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin không sử dụng thông tin cá nhân của người dùng cho mục đích quảng cáo, tiếp thị hoặc thương mại nếu chưa có sự đồng ý của người dùng."
  },
  {
    "type": "article",
    "text": "Điều 11. Thời gian lưu trữ thông tin"
  },
  {
    "type": "paragraph",
    "text": "Thông tin cá nhân được lưu trữ trong thời gian cần thiết để phục vụ mục đích cung cấp dịch vụ hoặc theo thời hạn do pháp luật quy định."
  },
  {
    "type": "paragraph",
    "text": "Thông tin sẽ được xóa hoặc ẩn danh trong các trường hợp sau:"
  },
  {
    "type": "list",
    "items": [
      "Người dùng yêu cầu xóa tài khoản và dữ liệu cá nhân.",
      "Dữ liệu không còn cần thiết cho mục đích xử lý.",
      "Theo yêu cầu của cơ quan nhà nước có thẩm quyền.",
      "Các trường hợp khác theo quy định của pháp luật."
    ]
  },
  {
    "type": "paragraph",
    "text": "Một số dữ liệu có thể tiếp tục được lưu trữ dưới dạng ẩn danh nhằm phục vụ mục đích thống kê, nghiên cứu và cải thiện chất lượng hệ thống, với điều kiện không thể xác định được danh tính của người dùng."
  },
  {
    "type": "article",
    "text": "Điều 12. Chia sẻ và cung cấp thông tin"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin cam kết không bán, trao đổi hoặc chuyển giao thông tin cá nhân của người dùng cho bất kỳ tổ chức hoặc cá nhân nào vì mục đích thương mại."
  },
  {
    "type": "paragraph",
    "text": "Thông tin chỉ được chia sẻ trong các trường hợp sau:"
  },
  {
    "type": "list",
    "items": [
      "Có sự đồng ý của người dùng.",
      "Theo yêu cầu bằng văn bản của cơ quan nhà nước có thẩm quyền.",
      "Phục vụ việc giải quyết tranh chấp, khiếu nại hoặc bảo vệ quyền và lợi ích hợp pháp của Healthy Skin.",
      "Với các đối tác cung cấp hạ tầng kỹ thuật, lưu trữ dữ liệu hoặc vận hành hệ thống, với điều kiện các đối tác này phải tuân thủ nghĩa vụ bảo mật thông tin tương đương Healthy Skin.",
      "Trong trường hợp sáp nhập, hợp nhất, chuyển nhượng hoặc tái cơ cấu doanh nghiệp theo quy định của pháp luật."
    ]
  },
  {
    "type": "article",
    "text": "Điều 13. Biện pháp bảo vệ thông tin"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin áp dụng các biện pháp kỹ thuật và quản lý phù hợp nhằm bảo vệ dữ liệu cá nhân của người dùng, bao gồm nhưng không giới hạn:"
  },
  {
    "type": "list",
    "items": [
      "Mã hóa dữ liệu trong quá trình truyền tải và lưu trữ.",
      "Phân quyền truy cập dữ liệu.",
      "Sao lưu dữ liệu định kỳ.",
      "Giám sát và phát hiện các hành vi truy cập trái phép.",
      "Cập nhật các giải pháp bảo mật nhằm giảm thiểu nguy cơ mất mát hoặc rò rỉ dữ liệu."
    ]
  },
  {
    "type": "paragraph",
    "text": "Mặc dù đã áp dụng các biện pháp bảo mật cần thiết, Healthy Skin không thể bảo đảm tuyệt đối rằng dữ liệu sẽ không bị truy cập trái phép do các sự cố ngoài khả năng kiểm soát như tấn công mạng quy mô lớn, lỗi từ nhà cung cấp hạ tầng hoặc các sự kiện bất khả kháng khác."
  },
  {
    "type": "article",
    "text": "Điều 14. Quyền của người dùng đối với dữ liệu cá nhân"
  },
  {
    "type": "paragraph",
    "text": "Người dùng có các quyền sau đây đối với thông tin cá nhân của mình:"
  },
  {
    "type": "list",
    "items": [
      "Được biết về việc thu thập và xử lý dữ liệu.",
      "Truy cập, xem và kiểm tra thông tin đã cung cấp.",
      "Yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác.",
      "Yêu cầu xóa dữ liệu hoặc chấm dứt xử lý dữ liệu trong các trường hợp pháp luật cho phép.",
      "Rút lại sự đồng ý đối với việc xử lý dữ liệu cá nhân theo quy định của pháp luật."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin sẽ tiếp nhận và xử lý các yêu cầu hợp lệ của người dùng trong thời gian sớm nhất có thể. Trong một số trường hợp, việc từ chối yêu cầu có thể xảy ra nếu dữ liệu vẫn cần được lưu giữ để thực hiện nghĩa vụ pháp lý hoặc giải quyết tranh chấp."
  },
  {
    "type": "article",
    "text": "Điều 15. Cookie và công nghệ theo dõi"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có thể sử dụng Cookie và các công nghệ tương tự nhằm:"
  },
  {
    "type": "list",
    "items": [
      "Ghi nhớ trạng thái đăng nhập.",
      "Cá nhân hóa trải nghiệm sử dụng.",
      "Phân tích lưu lượng truy cập.",
      "Cải thiện hiệu suất hoạt động của website.",
      "Phát hiện các hành vi bất thường hoặc gian lận."
    ]
  },
  {
    "type": "paragraph",
    "text": "Người dùng có thể chủ động điều chỉnh cài đặt Cookie trên trình duyệt của mình. Tuy nhiên, việc từ chối Cookie có thể làm ảnh hưởng đến một số chức năng của website."
  },
  {
    "type": "article",
    "text": "Điều 16. Liên hệ về bảo vệ thông tin cá nhân"
  },
  {
    "type": "paragraph",
    "text": "Mọi yêu cầu liên quan đến việc bảo vệ dữ liệu cá nhân, người dùng có thể liên hệ với Healthy Skin thông qua:"
  },
  {
    "type": "list",
    "items": [
      "Email: support@healthyskin.vn (địa chỉ minh họa, nhóm có thể thay đổi khi triển khai thực tế).",
      "Hotline: 1900 xxxx (minh họa).",
      "Biểu mẫu liên hệ: Mục \"Liên hệ với chúng tôi\" trên website."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin sẽ tiếp nhận và phản hồi các yêu cầu trong thời gian hợp lý theo quy định của pháp luật và quy trình nội bộ."
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG III. ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ"
  },
  {
    "type": "article",
    "text": "Điều 17. Chấp nhận Điều khoản sử dụng"
  },
  {
    "type": "list",
    "items": [
      "Khi truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ chức năng nào trên hệ thống Healthy Skin, người dùng được hiểu là đã đọc, hiểu và đồng ý tuân thủ toàn bộ nội dung của Chính sách và Điều khoản sử dụng này.",
      "Trường hợp người dùng không đồng ý với bất kỳ nội dung nào của Điều khoản sử dụng, người dùng vui lòng ngừng truy cập hoặc sử dụng các dịch vụ do Healthy Skin cung cấp.",
      "Healthy Skin có quyền từ chối cung cấp dịch vụ đối với các trường hợp không đáp ứng điều kiện sử dụng hoặc có hành vi vi phạm các quy định tại tài liệu này."
    ]
  },
  {
    "type": "article",
    "text": "Điều 18. Điều kiện sử dụng dịch vụ"
  },
  {
    "type": "paragraph",
    "text": "Người dùng khi sử dụng Healthy Skin cần đáp ứng các điều kiện sau:"
  },
  {
    "type": "list",
    "items": [
      "Có đầy đủ năng lực hành vi dân sự theo quy định của pháp luật hoặc sử dụng dưới sự đồng ý và giám sát của cha mẹ hoặc người giám hộ hợp pháp.",
      "Cung cấp đầy đủ, trung thực và chính xác các thông tin cần thiết khi đăng ký tài khoản hoặc sử dụng dịch vụ.",
      "Chịu trách nhiệm về việc bảo mật tài khoản, mật khẩu và các thông tin đăng nhập của mình.",
      "Không chia sẻ tài khoản cho người khác sử dụng khi chưa được Healthy Skin cho phép.",
      "Chỉ sử dụng website vào các mục đích hợp pháp và đúng với chức năng của hệ thống."
    ]
  },
  {
    "type": "article",
    "text": "Điều 19. Quyền của người dùng"
  },
  {
    "type": "paragraph",
    "text": "Người dùng có các quyền sau đây:"
  },
  {
    "type": "list",
    "items": [
      "Được truy cập và sử dụng các chức năng của Healthy Skin theo phạm vi dịch vụ được cung cấp.",
      "Được yêu cầu chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân theo quy định tại Chính sách bảo mật.",
      "Được phản ánh, góp ý hoặc khiếu nại về chất lượng dịch vụ.",
      "Được thông báo khi Healthy Skin có sự thay đổi đáng kể liên quan đến quyền và lợi ích của người dùng.",
      "Được bảo vệ quyền riêng tư và dữ liệu cá nhân theo quy định của pháp luật và Chính sách bảo mật của Healthy Skin."
    ]
  },
  {
    "type": "article",
    "text": "Điều 20. Nghĩa vụ của người dùng"
  },
  {
    "type": "paragraph",
    "text": "Người dùng có trách nhiệm:"
  },
  {
    "type": "list",
    "items": [
      "Tuân thủ đầy đủ Chính sách và Điều khoản sử dụng của Healthy Skin.",
      "Cung cấp thông tin trung thực, chính xác và cập nhật khi sử dụng dịch vụ.",
      "Tự bảo mật thông tin đăng nhập và chịu trách nhiệm đối với mọi hoạt động phát sinh từ tài khoản của mình.",
      "Không thực hiện các hành vi làm ảnh hưởng đến hoạt động bình thường của website hoặc gây thiệt hại cho Healthy Skin và các người dùng khác.",
      "Chịu trách nhiệm về mọi nội dung, hình ảnh và dữ liệu do mình tải lên hệ thống.",
      "Chủ động tham khảo ý kiến của bác sĩ hoặc chuyên gia y tế đối với các vấn đề sức khỏe nghiêm trọng, không phụ thuộc hoàn toàn vào các gợi ý của hệ thống."
    ]
  },
  {
    "type": "article",
    "text": "Điều 21. Những hành vi bị nghiêm cấm"
  },
  {
    "type": "paragraph",
    "text": "Để đảm bảo môi trường sử dụng an toàn và minh bạch, Healthy Skin nghiêm cấm người dùng thực hiện các hành vi sau:"
  },
  {
    "type": "list",
    "items": [
      "Cung cấp thông tin giả mạo hoặc mạo danh tổ chức, cá nhân khác.",
      "Sử dụng website vào mục đích lừa đảo, phát tán thông tin sai sự thật hoặc vi phạm pháp luật.",
      "Xâm nhập trái phép, can thiệp hoặc làm gián đoạn hoạt động của hệ thống.",
      "Phát tán mã độc, virus, phần mềm gây hại hoặc thực hiện các hành vi tấn công mạng.",
      "Thu thập, sao chép hoặc khai thác trái phép dữ liệu của Healthy Skin hoặc của người dùng khác.",
      "Đăng tải nội dung có tính chất xúc phạm, kích động bạo lực, phân biệt đối xử hoặc vi phạm thuần phong mỹ tục.",
      "Sử dụng kết quả phân tích của Healthy Skin để quảng cáo, kinh doanh hoặc thực hiện các hoạt động trái pháp luật mà chưa được Healthy Skin chấp thuận bằng văn bản."
    ]
  },
  {
    "type": "article",
    "text": "Điều 22. Quyền của Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Để đảm bảo hoạt động ổn định của hệ thống, Healthy Skin có quyền:"
  },
  {
    "type": "list",
    "items": [
      "Kiểm tra, xác minh thông tin do người dùng cung cấp khi cần thiết.",
      "Tạm ngừng, hạn chế hoặc chấm dứt quyền sử dụng dịch vụ đối với người dùng có dấu hiệu vi phạm Điều khoản sử dụng.",
      "Khóa hoặc xóa tài khoản của người dùng trong trường hợp phát hiện hành vi gian lận, giả mạo, tấn công hệ thống hoặc vi phạm pháp luật.",
      "Cập nhật, thay đổi, bổ sung hoặc loại bỏ các tính năng của website nhằm nâng cao chất lượng dịch vụ mà không cần thông báo trước, trừ trường hợp pháp luật có quy định khác.",
      "Từ chối cung cấp dịch vụ trong trường hợp việc tiếp tục cung cấp dịch vụ có thể gây ảnh hưởng đến an toàn hệ thống, quyền lợi của Healthy Skin hoặc của người dùng khác.",
      "Lưu giữ các thông tin cần thiết phục vụ công tác kiểm tra, giải quyết tranh chấp hoặc theo yêu cầu của cơ quan nhà nước có thẩm quyền."
    ]
  },
  {
    "type": "article",
    "text": "Điều 23. Tạm ngừng hoặc chấm dứt dịch vụ"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có quyền tạm ngừng hoặc chấm dứt việc cung cấp dịch vụ trong các trường hợp sau:"
  },
  {
    "type": "list",
    "items": [
      "Người dùng vi phạm Chính sách và Điều khoản sử dụng.",
      "Hệ thống cần bảo trì, nâng cấp hoặc khắc phục sự cố kỹ thuật.",
      "Có yêu cầu của cơ quan nhà nước có thẩm quyền.",
      "Xảy ra các sự kiện bất khả kháng như thiên tai, hỏa hoạn, chiến tranh, dịch bệnh, mất điện diện rộng hoặc sự cố từ nhà cung cấp hạ tầng."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin sẽ cố gắng thông báo trước cho người dùng trong trường hợp việc tạm ngừng dịch vụ đã được dự kiến từ trước và việc thông báo là khả thi."
  },
  {
    "type": "article",
    "text": "Điều 24. Quyền sở hữu trí tuệ"
  },
  {
    "type": "list",
    "items": [
      "Toàn bộ giao diện, thiết kế, logo, biểu tượng, hình ảnh, nội dung, cơ sở dữ liệu, mã nguồn, thuật toán AI và các tài sản trí tuệ khác trên Healthy Skin thuộc quyền sở hữu của Healthy Skin hoặc được sử dụng hợp pháp theo quy định của pháp luật.",
      "Người dùng không được sao chép, chỉnh sửa, phân phối, khai thác hoặc sử dụng các tài sản trí tuệ của Healthy Skin cho mục đích thương mại khi chưa có sự chấp thuận bằng văn bản của Healthy Skin.",
      "Mọi hành vi xâm phạm quyền sở hữu trí tuệ sẽ được xử lý theo quy định của pháp luật hiện hành."
    ]
  },
  {
    "type": "article",
    "text": "Điều 25. Thay đổi Điều khoản sử dụng"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin có quyền sửa đổi, bổ sung hoặc cập nhật Điều khoản sử dụng nhằm phù hợp với quá trình vận hành hệ thống hoặc theo yêu cầu của pháp luật.",
      "Phiên bản cập nhật sẽ được công bố trên website và có hiệu lực kể từ thời điểm đăng tải hoặc theo thời điểm được ghi rõ trong thông báo.",
      "Việc người dùng tiếp tục sử dụng Healthy Skin sau khi Điều khoản sử dụng được cập nhật được xem là sự chấp thuận đối với các nội dung sửa đổi."
    ]
  },
  {
    "type": "article",
    "text": "Điều 26. Hiệu lực của Điều khoản sử dụng"
  },
  {
    "type": "list",
    "items": [
      "Điều khoản sử dụng này có hiệu lực kể từ ngày được công bố trên website Healthy Skin.",
      "Trong trường hợp có bất kỳ điều khoản nào bị cơ quan có thẩm quyền xác định là vô hiệu hoặc không thể thi hành, các điều khoản còn lại vẫn giữ nguyên hiệu lực.",
      "Mọi tranh chấp phát sinh liên quan đến việc sử dụng Healthy Skin sẽ được ưu tiên giải quyết thông qua thương lượng, hòa giải. Trường hợp không đạt được thỏa thuận, tranh chấp sẽ được giải quyết theo quy định của pháp luật Việt Nam."
    ]
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG IV. CAM KẾT VỀ SỨC KHỎE NGƯỜI DÙNG"
  },
  {
    "type": "article",
    "text": "Điều 27. Mục tiêu hoạt động"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin được phát triển với mục tiêu hỗ trợ người dùng nâng cao hiểu biết về tình trạng làn da và xây dựng thói quen chăm sóc da khoa học thông qua việc ứng dụng công nghệ trí tuệ nhân tạo (AI) kết hợp với cơ sở dữ liệu về da liễu và mỹ phẩm."
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin hướng đến việc cung cấp thông tin tham khảo, giúp người dùng chủ động hơn trong việc chăm sóc làn da, đồng thời nâng cao nhận thức về việc lựa chọn mỹ phẩm và quy trình chăm sóc phù hợp với từng đặc điểm da."
  },
  {
    "type": "article",
    "text": "Điều 28. Phạm vi hỗ trợ của Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin hỗ trợ người dùng thông qua các chức năng sau:"
  },
  {
    "type": "list",
    "items": [
      "Phân tích sơ bộ tình trạng làn da dựa trên hình ảnh và thông tin do người dùng cung cấp.",
      "Gợi ý quy trình chăm sóc da phù hợp với từng loại da và mục tiêu chăm sóc.",
      "Cung cấp thông tin về thành phần mỹ phẩm, công dụng và các lưu ý khi sử dụng.",
      "Theo dõi quá trình cải thiện làn da dựa trên lịch sử sử dụng của người dùng.",
      "Cung cấp các bài viết, kiến thức và thông tin tham khảo liên quan đến chăm sóc da."
    ]
  },
  {
    "type": "paragraph",
    "text": "Các chức năng trên chỉ mang tính chất hỗ trợ và tham khảo, không nhằm thay thế việc khám, chẩn đoán hoặc điều trị của bác sĩ, dược sĩ hoặc chuyên gia y tế."
  },
  {
    "type": "article",
    "text": "Điều 29. Cam kết của Healthy Skin đối với người dùng"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin cam kết:"
  },
  {
    "type": "list",
    "items": [
      "Cung cấp thông tin dựa trên dữ liệu đã được tổng hợp, nghiên cứu và cập nhật từ các nguồn đáng tin cậy trong phạm vi khả năng của hệ thống.",
      "Không cố ý cung cấp thông tin sai lệch hoặc gây hiểu nhầm cho người dùng.",
      "Không quảng bá, ưu tiên hoặc thao túng kết quả phân tích nhằm phục vụ lợi ích của bất kỳ thương hiệu mỹ phẩm nào nếu không được công bố rõ ràng.",
      "Liên tục cập nhật, cải tiến thuật toán AI và cơ sở dữ liệu để nâng cao chất lượng gợi ý.",
      "Tiếp nhận phản hồi của người dùng nhằm cải thiện chất lượng dịch vụ."
    ]
  },
  {
    "type": "article",
    "text": "Điều 30. Giới hạn của hệ thống AI"
  },
  {
    "type": "paragraph",
    "text": "Người dùng hiểu và đồng ý rằng:"
  },
  {
    "type": "list",
    "items": [
      "Hệ thống AI của Healthy Skin hoạt động dựa trên dữ liệu, thuật toán và thông tin do người dùng cung cấp.",
      "Kết quả phân tích có thể bị ảnh hưởng bởi chất lượng hình ảnh, điều kiện ánh sáng, góc chụp, thiết bị sử dụng hoặc thông tin đầu vào không đầy đủ.",
      "AI không có khả năng thay thế việc thăm khám trực tiếp của bác sĩ hoặc chuyên gia y tế.",
      "Kết quả phân tích và các gợi ý của Healthy Skin chỉ mang tính tham khảo, không phải là kết luận y khoa hoặc chỉ định điều trị.",
      "Healthy Skin không cam kết kết quả phân tích luôn chính xác tuyệt đối trong mọi trường hợp."
    ]
  },
  {
    "type": "article",
    "text": "Điều 31. Khuyến nghị đối với người dùng"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin khuyến nghị người dùng:"
  },
  {
    "type": "list",
    "items": [
      "Chỉ sử dụng kết quả phân tích như một nguồn thông tin tham khảo trong quá trình chăm sóc da.",
      "Đọc kỹ hướng dẫn sử dụng, thành phần và cảnh báo của sản phẩm mỹ phẩm trước khi sử dụng.",
      "Thử sản phẩm trên một vùng da nhỏ trước khi sử dụng trên diện rộng nếu chưa từng sử dụng trước đó.",
      "Ngừng sử dụng sản phẩm và tham khảo ý kiến chuyên gia khi xuất hiện các dấu hiệu bất thường như kích ứng, nổi mẩn, ngứa, sưng, đau hoặc các biểu hiện nghi ngờ dị ứng.",
      "Chủ động đến cơ sở y tế hoặc bác sĩ chuyên khoa da liễu khi gặp các vấn đề nghiêm trọng hoặc kéo dài."
    ]
  },
  {
    "type": "article",
    "text": "Điều 32. Các trường hợp cần được thăm khám y tế"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin khuyến nghị người dùng không phụ thuộc hoàn toàn vào kết quả của hệ thống và cần đến cơ sở y tế trong các trường hợp sau:"
  },
  {
    "type": "list",
    "items": [
      "Da bị viêm, nhiễm trùng hoặc có dấu hiệu lan rộng.",
      "Xuất hiện phản ứng dị ứng nghiêm trọng sau khi sử dụng mỹ phẩm.",
      "Mụn bọc, mụn viêm hoặc các tổn thương da kéo dài không cải thiện.",
      "Có biểu hiện đau, sốt, chảy dịch hoặc các dấu hiệu bất thường khác.",
      "Có tiền sử bệnh lý về da cần được theo dõi hoặc điều trị chuyên khoa."
    ]
  },
  {
    "type": "paragraph",
    "text": "Trong các trường hợp nêu trên, việc thăm khám và điều trị bởi bác sĩ hoặc cơ sở y tế là cần thiết. Healthy Skin không thay thế vai trò của cơ sở khám, chữa bệnh."
  },
  {
    "type": "article",
    "text": "Điều 33. Trách nhiệm của người dùng đối với sức khỏe của mình"
  },
  {
    "type": "paragraph",
    "text": "Người dùng có trách nhiệm:"
  },
  {
    "type": "list",
    "items": [
      "Cung cấp thông tin và hình ảnh trung thực, rõ ràng để hệ thống có cơ sở phân tích phù hợp.",
      "Không tự ý sử dụng thuốc hoặc thay đổi phác đồ điều trị chỉ dựa trên kết quả từ Healthy Skin.",
      "Chủ động tham khảo ý kiến bác sĩ hoặc chuyên gia khi cần thiết.",
      "Tự chịu trách nhiệm đối với quyết định lựa chọn và sử dụng mỹ phẩm hoặc phương pháp chăm sóc da của mình."
    ]
  },
  {
    "type": "article",
    "text": "Điều 34. Cập nhật thông tin và cải tiến hệ thống"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin sẽ thường xuyên rà soát, cập nhật cơ sở dữ liệu và cải tiến thuật toán AI nhằm nâng cao chất lượng phân tích và gợi ý."
  },
  {
    "type": "paragraph",
    "text": "Việc cập nhật này có thể làm thay đổi kết quả hoặc khuyến nghị so với các phiên bản trước. Người dùng đồng ý rằng các kết quả được cung cấp tại từng thời điểm sẽ phụ thuộc vào phiên bản hệ thống đang được áp dụng."
  },
  {
    "type": "article",
    "text": "Điều 35. Hiệu lực của cam kết"
  },
  {
    "type": "paragraph",
    "text": "Các cam kết về sức khỏe người dùng là một phần không tách rời của Chính sách và Điều khoản sử dụng Healthy Skin."
  },
  {
    "type": "paragraph",
    "text": "Việc người dùng tiếp tục truy cập hoặc sử dụng Healthy Skin đồng nghĩa với việc người dùng đã đọc, hiểu và đồng ý với các nội dung quy định tại Chương này."
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG V. MIỄN TRỪ TRÁCH NHIỆM"
  },
  {
    "type": "article",
    "text": "Điều 36. Nguyên tắc miễn trừ và giới hạn trách nhiệm"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin luôn nỗ lực cung cấp thông tin, dịch vụ và các tính năng hỗ trợ với độ chính xác cao nhất trên cơ sở dữ liệu hiện có và công nghệ trí tuệ nhân tạo (AI).",
      "Tuy nhiên, do đặc điểm của công nghệ AI và sự phụ thuộc vào dữ liệu do người dùng cung cấp, Healthy Skin không bảo đảm rằng mọi kết quả phân tích hoặc khuyến nghị luôn chính xác tuyệt đối trong mọi trường hợp.",
      "Người dùng hiểu và đồng ý rằng việc sử dụng dịch vụ của Healthy Skin hoàn toàn dựa trên sự tự nguyện và người dùng tự chịu trách nhiệm đối với các quyết định được đưa ra trên cơ sở tham khảo thông tin từ hệ thống."
    ]
  },
  {
    "type": "article",
    "text": "Điều 37. Giới hạn trách nhiệm đối với kết quả phân tích AI"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin không chịu trách nhiệm đối với các sai lệch trong kết quả phân tích phát sinh từ các nguyên nhân sau:"
  },
  {
    "type": "list",
    "items": [
      "Hình ảnh được tải lên không rõ nét, thiếu sáng, bị che khuất hoặc không đáp ứng yêu cầu kỹ thuật của hệ thống.",
      "Người dùng cung cấp thông tin không đầy đủ, không chính xác hoặc cố ý cung cấp thông tin sai lệch.",
      "Chất lượng thiết bị, camera hoặc kết nối Internet làm ảnh hưởng đến quá trình phân tích.",
      "Các giới hạn vốn có của công nghệ trí tuệ nhân tạo trong việc xử lý dữ liệu.",
      "Những yếu tố sinh học hoặc bệnh lý đặc biệt mà hệ thống chưa thể nhận diện đầy đủ."
    ]
  },
  {
    "type": "paragraph",
    "text": "Trong mọi trường hợp, kết quả phân tích chỉ mang tính chất tham khảo và không thay thế ý kiến chuyên môn của bác sĩ hoặc cơ sở khám, chữa bệnh."
  },
  {
    "type": "article",
    "text": "Điều 38. Miễn trừ trách nhiệm đối với việc sử dụng mỹ phẩm và sản phẩm chăm sóc da"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin không chịu trách nhiệm đối với:"
  },
  {
    "type": "list",
    "items": [
      "Hiệu quả sử dụng của bất kỳ sản phẩm mỹ phẩm nào do người dùng lựa chọn.",
      "Phản ứng dị ứng, kích ứng hoặc các tác dụng không mong muốn phát sinh từ việc sử dụng mỹ phẩm.",
      "Việc người dùng sử dụng mỹ phẩm không đúng hướng dẫn của nhà sản xuất hoặc của chuyên gia.",
      "Các thiệt hại phát sinh do người dùng kết hợp nhiều sản phẩm không phù hợp hoặc tự ý thay đổi quy trình chăm sóc da."
    ]
  },
  {
    "type": "paragraph",
    "text": "Các gợi ý về sản phẩm trên Healthy Skin chỉ nhằm mục đích tham khảo và không được hiểu là sự bảo đảm về chất lượng hoặc hiệu quả của sản phẩm."
  },
  {
    "type": "article",
    "text": "Điều 39. Miễn trừ trách nhiệm đối với quyết định của người dùng"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin không chịu trách nhiệm đối với các hậu quả phát sinh từ việc người dùng:"
  },
  {
    "type": "list",
    "items": [
      "Tự ý chẩn đoán tình trạng da.",
      "Tự ý điều trị hoặc sử dụng thuốc mà không có chỉ định của bác sĩ.",
      "Trì hoãn hoặc từ chối việc thăm khám tại cơ sở y tế do tin tưởng hoàn toàn vào kết quả phân tích của hệ thống.",
      "Không tuân thủ hướng dẫn sử dụng mỹ phẩm hoặc hướng dẫn của chuyên gia."
    ]
  },
  {
    "type": "paragraph",
    "text": "Mọi quyết định liên quan đến sức khỏe của người dùng cần được cân nhắc trên cơ sở tư vấn của bác sĩ hoặc chuyên gia y tế có chuyên môn."
  },
  {
    "type": "article",
    "text": "Điều 40. Giới hạn trách nhiệm đối với sự cố kỹ thuật"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin không chịu trách nhiệm đối với các thiệt hại phát sinh từ:"
  },
  {
    "type": "list",
    "items": [
      "Mất kết nối Internet hoặc gián đoạn đường truyền.",
      "Lỗi thiết bị của người dùng.",
      "Sự cố máy chủ, trung tâm dữ liệu hoặc nhà cung cấp dịch vụ hạ tầng.",
      "Tấn công mạng, virus máy tính hoặc các hành vi truy cập trái phép ngoài khả năng kiểm soát hợp lý của Healthy Skin.",
      "Thiên tai, hỏa hoạn, dịch bệnh, chiến tranh, mất điện diện rộng hoặc các sự kiện bất khả kháng khác."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin sẽ nỗ lực khắc phục các sự cố trong thời gian hợp lý nhưng không cam kết dịch vụ hoạt động liên tục hoặc không có gián đoạn."
  },
  {
    "type": "article",
    "text": "Điều 41. Giới hạn trách nhiệm đối với bên thứ ba"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin có thể tích hợp hoặc cung cấp liên kết đến các website, ứng dụng hoặc dịch vụ của bên thứ ba nhằm hỗ trợ trải nghiệm người dùng.",
      "Healthy Skin không kiểm soát nội dung, chất lượng hoặc chính sách của các bên thứ ba và không chịu trách nhiệm đối với bất kỳ thiệt hại nào phát sinh từ việc người dùng sử dụng các dịch vụ này.",
      "Người dùng cần tự đánh giá và tuân thủ các điều khoản của bên thứ ba trước khi sử dụng."
    ]
  },
  {
    "type": "article",
    "text": "Điều 42. Giới hạn trách nhiệm bồi thường"
  },
  {
    "type": "list",
    "items": [
      "Trong phạm vi pháp luật cho phép, Healthy Skin chỉ chịu trách nhiệm đối với các thiệt hại phát sinh do lỗi trực tiếp của mình.",
      "Healthy Skin không chịu trách nhiệm đối với các thiệt hại gián tiếp, bao gồm nhưng không giới hạn ở:",
      "Mất cơ hội kinh doanh.",
      "Mất dữ liệu do lỗi từ phía người dùng.",
      "Thiệt hại về uy tín hoặc lợi nhuận.",
      "Các tổn thất phát sinh ngoài phạm vi kiểm soát hợp lý của Healthy Skin.",
      "Trường hợp phát sinh trách nhiệm bồi thường theo quy định của pháp luật, trách nhiệm của Healthy Skin sẽ được xác định trên cơ sở mức độ lỗi, thiệt hại thực tế và các quy định pháp luật có liên quan."
    ]
  },
  {
    "type": "article",
    "text": "Điều 43. Trách nhiệm của người dùng"
  },
  {
    "type": "paragraph",
    "text": "Người dùng đồng ý rằng:"
  },
  {
    "type": "list",
    "items": [
      "Tự chịu trách nhiệm đối với việc sử dụng các thông tin và khuyến nghị do Healthy Skin cung cấp.",
      "Chủ động kiểm tra, xác minh thông tin trước khi đưa ra các quyết định ảnh hưởng đến sức khỏe của bản thân.",
      "Không sử dụng Healthy Skin như một công cụ thay thế cho việc khám, chữa bệnh hoặc tư vấn y tế chuyên môn.",
      "Bồi thường cho Healthy Skin nếu hành vi vi phạm của người dùng gây thiệt hại cho Healthy Skin hoặc bên thứ ba theo quy định của pháp luật."
    ]
  },
  {
    "type": "article",
    "text": "Điều 44. Hiệu lực của quy định về miễn trừ trách nhiệm"
  },
  {
    "type": "list",
    "items": [
      "Các quy định tại Chương này là một phần không tách rời của Chính sách và Điều khoản sử dụng Healthy Skin.",
      "Trong trường hợp một hoặc một số nội dung của Chương này bị cơ quan có thẩm quyền xác định là vô hiệu hoặc không thể thực hiện, các nội dung còn lại vẫn giữ nguyên hiệu lực.",
      "Việc người dùng tiếp tục sử dụng Healthy Skin được xem là đã hiểu và đồng ý với các quy định về giới hạn trách nhiệm được nêu tại Chương này."
    ]
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG VI. QUYỀN VÀ NGHĨA VỤ CỦA NGƯỜI DÙNG"
  },
  {
    "type": "article",
    "text": "Điều 45. Quyền của người dùng"
  },
  {
    "type": "paragraph",
    "text": "Khi sử dụng Healthy Skin, người dùng được hưởng các quyền sau:"
  },
  {
    "type": "list",
    "items": [
      "Được đăng ký tài khoản và sử dụng các chức năng của Healthy Skin theo đúng phạm vi dịch vụ được cung cấp.",
      "Được hệ thống hỗ trợ phân tích sơ bộ tình trạng da và nhận các gợi ý chăm sóc da dựa trên dữ liệu đã cung cấp.",
      "Được truy cập, xem và quản lý thông tin cá nhân của mình trên hệ thống.",
      "Được yêu cầu chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân theo quy định của Chính sách bảo vệ thông tin cá nhân và pháp luật hiện hành.",
      "Được phản ánh, góp ý, khiếu nại hoặc đề xuất cải tiến đối với chất lượng dịch vụ của Healthy Skin.",
      "Được thông báo về các thay đổi quan trọng liên quan đến dịch vụ, Chính sách và Điều khoản sử dụng khi pháp luật yêu cầu hoặc khi Healthy Skin xét thấy cần thiết.",
      "Được bảo vệ quyền và lợi ích hợp pháp theo quy định của pháp luật trong quá trình sử dụng dịch vụ."
    ]
  },
  {
    "type": "article",
    "text": "Điều 46. Nghĩa vụ của người dùng"
  },
  {
    "type": "paragraph",
    "text": "Người dùng có trách nhiệm:"
  },
  {
    "type": "list",
    "items": [
      "Cung cấp đầy đủ, trung thực và chính xác các thông tin cần thiết khi đăng ký và sử dụng dịch vụ.",
      "Bảo mật tài khoản, mật khẩu và các thông tin đăng nhập; không chia sẻ tài khoản cho người khác nếu chưa được Healthy Skin cho phép.",
      "Chịu trách nhiệm đối với mọi hoạt động phát sinh từ tài khoản của mình.",
      "Cập nhật thông tin cá nhân khi có sự thay đổi nhằm đảm bảo hệ thống hoạt động chính xác.",
      "Tuân thủ đầy đủ các quy định của Chính sách và Điều khoản sử dụng cũng như các quy định của pháp luật Việt Nam.",
      "Không sử dụng Healthy Skin vào mục đích trái pháp luật hoặc gây ảnh hưởng đến quyền và lợi ích hợp pháp của tổ chức, cá nhân khác."
    ]
  },
  {
    "type": "article",
    "text": "Điều 47. Trách nhiệm khi cung cấp dữ liệu"
  },
  {
    "type": "list",
    "items": [
      "Người dùng chịu trách nhiệm về tính chính xác, đầy đủ và hợp pháp của các thông tin, hình ảnh và dữ liệu được cung cấp cho Healthy Skin.",
      "Người dùng cam kết chỉ tải lên các hình ảnh thuộc quyền sử dụng hợp pháp của mình và không xâm phạm quyền riêng tư hoặc quyền sở hữu trí tuệ của bất kỳ cá nhân, tổ chức nào.",
      "Trường hợp người dùng cố ý cung cấp thông tin sai lệch, giả mạo hoặc vi phạm pháp luật, Healthy Skin có quyền từ chối cung cấp dịch vụ, khóa tài khoản hoặc thực hiện các biện pháp cần thiết theo quy định của pháp luật."
    ]
  },
  {
    "type": "article",
    "text": "Điều 48. Quy định về sử dụng tài khoản"
  },
  {
    "type": "paragraph",
    "text": "Người dùng không được thực hiện các hành vi sau:"
  },
  {
    "type": "list",
    "items": [
      "Cho thuê, chuyển nhượng, mua bán hoặc chia sẻ tài khoản cho người khác.",
      "Tạo nhiều tài khoản nhằm gian lận, lạm dụng chương trình ưu đãi hoặc gây ảnh hưởng đến hoạt động của hệ thống.",
      "Sử dụng tài khoản của người khác khi chưa được sự đồng ý hợp pháp.",
      "Tự ý can thiệp vào hệ thống xác thực hoặc các biện pháp bảo mật của Healthy Skin."
    ]
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện các hành vi trên."
  },
  {
    "type": "article",
    "text": "Điều 49. Quy định về nội dung do người dùng đăng tải"
  },
  {
    "type": "paragraph",
    "text": "Người dùng cam kết không đăng tải, chia sẻ hoặc truyền tải thông qua Healthy Skin các nội dung:"
  },
  {
    "type": "list",
    "items": [
      "Vi phạm pháp luật, đạo đức xã hội hoặc thuần phong mỹ tục.",
      "Xúc phạm danh dự, nhân phẩm hoặc quyền lợi hợp pháp của cá nhân, tổ chức khác.",
      "Có nội dung lừa đảo, quảng cáo trái phép hoặc phát tán thông tin sai sự thật.",
      "Chứa mã độc, virus hoặc các chương trình có khả năng gây ảnh hưởng đến hệ thống.",
      "Xâm phạm quyền sở hữu trí tuệ của Healthy Skin hoặc của bên thứ ba."
    ]
  },
  {
    "type": "paragraph",
    "text": "Người dùng hoàn toàn chịu trách nhiệm trước pháp luật về các nội dung do mình đăng tải."
  },
  {
    "type": "article",
    "text": "Điều 50. Quy định về sử dụng kết quả phân tích"
  },
  {
    "type": "list",
    "items": [
      "Kết quả phân tích và các khuyến nghị của Healthy Skin chỉ mang tính chất tham khảo.",
      "Người dùng không được sử dụng kết quả phân tích để quảng bá, kinh doanh, tư vấn y tế hoặc thực hiện các hoạt động có thể gây hiểu nhầm rằng đây là kết luận chuyên môn của bác sĩ.",
      "Healthy Skin không chịu trách nhiệm đối với các hậu quả phát sinh từ việc người dùng sử dụng sai mục đích các thông tin do hệ thống cung cấp."
    ]
  },
  {
    "type": "article",
    "text": "Điều 51. Hợp tác với Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Người dùng đồng ý:"
  },
  {
    "type": "list",
    "items": [
      "Hợp tác với Healthy Skin trong quá trình xác minh thông tin, giải quyết khiếu nại hoặc xử lý các sự cố liên quan đến tài khoản.",
      "Cung cấp các thông tin cần thiết khi Healthy Skin có căn cứ hợp lý cho rằng tài khoản đang bị sử dụng trái phép hoặc có dấu hiệu vi phạm.",
      "Thực hiện các yêu cầu hợp lý của Healthy Skin nhằm đảm bảo an toàn cho hệ thống và cộng đồng người dùng."
    ]
  },
  {
    "type": "article",
    "text": "Điều 52. Trách nhiệm bồi thường"
  },
  {
    "type": "list",
    "items": [
      "Người dùng phải chịu trách nhiệm đối với các thiệt hại phát sinh do hành vi vi phạm Chính sách và Điều khoản sử dụng của mình.",
      "Trường hợp hành vi vi phạm của người dùng gây thiệt hại cho Healthy Skin hoặc bên thứ ba, người dùng có trách nhiệm bồi thường theo quy định của pháp luật.",
      "Healthy Skin có quyền yêu cầu người dùng chấm dứt hành vi vi phạm, khắc phục hậu quả hoặc phối hợp với cơ quan có thẩm quyền để bảo vệ quyền và lợi ích hợp pháp của mình."
    ]
  },
  {
    "type": "article",
    "text": "Điều 53. Chấm dứt quyền sử dụng dịch vụ"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có quyền tạm ngừng hoặc chấm dứt quyền sử dụng dịch vụ của người dùng trong các trường hợp sau:"
  },
  {
    "type": "list",
    "items": [
      "Người dùng vi phạm nghiêm trọng Chính sách và Điều khoản sử dụng.",
      "Người dùng thực hiện các hành vi gây ảnh hưởng đến an toàn, ổn định hoặc uy tín của Healthy Skin.",
      "Có yêu cầu từ cơ quan nhà nước có thẩm quyền theo quy định của pháp luật.",
      "Các trường hợp khác theo quy định của pháp luật hoặc theo quyết định hợp lý của Healthy Skin nhằm bảo vệ hệ thống và cộng đồng người dùng."
    ]
  },
  {
    "type": "paragraph",
    "text": "Việc chấm dứt quyền sử dụng dịch vụ không làm chấm dứt trách nhiệm của người dùng đối với các nghĩa vụ đã phát sinh trước thời điểm tài khoản bị khóa hoặc chấm dứt."
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG VII. QUYỀN VÀ NGHĨA VỤ CỦA HEALTHY SKIN"
  },
  {
    "type": "article",
    "text": "Điều 54. Quyền của Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Trong quá trình vận hành và cung cấp dịch vụ, Healthy Skin có các quyền sau:"
  },
  {
    "type": "list",
    "items": [
      "Quyết định việc cung cấp, tạm ngừng hoặc chấm dứt một phần hoặc toàn bộ dịch vụ nhằm bảo trì hệ thống, nâng cấp tính năng hoặc vì các lý do cần thiết khác.",
      "Yêu cầu người dùng cung cấp hoặc cập nhật thông tin nhằm xác minh danh tính, đảm bảo tính chính xác của dữ liệu và phòng chống các hành vi gian lận.",
      "Từ chối, tạm khóa hoặc chấm dứt tài khoản của người dùng trong trường hợp phát hiện hành vi vi phạm Chính sách và Điều khoản sử dụng hoặc có dấu hiệu gây ảnh hưởng đến hoạt động của hệ thống.",
      "Điều chỉnh, cập nhật hoặc thay đổi giao diện, chức năng, thuật toán AI, cơ sở dữ liệu hoặc các dịch vụ khác nhằm nâng cao chất lượng hoạt động của Healthy Skin.",
      "Thu thập, xử lý và lưu trữ dữ liệu người dùng theo đúng phạm vi đã được quy định tại Chính sách bảo vệ thông tin cá nhân và theo quy định của pháp luật.",
      "Thực hiện các biện pháp cần thiết để bảo vệ hệ thống, dữ liệu, quyền và lợi ích hợp pháp của Healthy Skin cũng như của cộng đồng người dùng.",
      "Hợp tác với cơ quan nhà nước có thẩm quyền khi có yêu cầu theo quy định của pháp luật."
    ]
  },
  {
    "type": "article",
    "text": "Điều 55. Nghĩa vụ của Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin cam kết thực hiện các nghĩa vụ sau:"
  },
  {
    "type": "list",
    "items": [
      "Vận hành hệ thống ổn định, an toàn và liên tục trong phạm vi điều kiện kỹ thuật cho phép.",
      "Bảo vệ thông tin cá nhân của người dùng theo quy định của pháp luật và Chính sách bảo vệ thông tin cá nhân đã công bố.",
      "Cung cấp thông tin minh bạch về chức năng, phạm vi hoạt động và giới hạn của hệ thống AI.",
      "Tiếp nhận, xử lý và phản hồi các phản ánh, góp ý hoặc khiếu nại của người dùng trong thời gian hợp lý.",
      "Thường xuyên cập nhật cơ sở dữ liệu, cải tiến thuật toán và nâng cao chất lượng dịch vụ nhằm mang lại trải nghiệm tốt hơn cho người dùng.",
      "Không sử dụng dữ liệu cá nhân của người dùng ngoài các mục đích đã được công bố hoặc khi chưa có căn cứ pháp lý phù hợp."
    ]
  },
  {
    "type": "article",
    "text": "Điều 56. Quyền quản lý và vận hành hệ thống"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có quyền:"
  },
  {
    "type": "list",
    "items": [
      "Giám sát hoạt động của hệ thống nhằm phát hiện và ngăn chặn các hành vi vi phạm.",
      "Thực hiện bảo trì, nâng cấp hoặc sửa lỗi hệ thống mà không làm thay đổi quyền và lợi ích hợp pháp của người dùng.",
      "Thiết lập các quy tắc kỹ thuật, quy trình bảo mật và các biện pháp quản lý cần thiết để đảm bảo an toàn cho hệ thống.",
      "Tạm dừng một số chức năng trong trường hợp phát hiện nguy cơ ảnh hưởng đến tính bảo mật hoặc sự ổn định của hệ thống."
    ]
  },
  {
    "type": "article",
    "text": "Điều 57. Quyền đối với nội dung và dữ liệu"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin là chủ sở hữu hoặc có quyền sử dụng hợp pháp đối với toàn bộ giao diện, thiết kế, logo, cơ sở dữ liệu, nội dung, hình ảnh, thuật toán AI, mã nguồn và các tài sản trí tuệ khác của hệ thống.",
      "Healthy Skin có quyền sử dụng dữ liệu đã được ẩn danh để phục vụ mục đích nghiên cứu, thống kê, cải thiện thuật toán AI và nâng cao chất lượng dịch vụ, với điều kiện không làm lộ danh tính của người dùng.",
      "Healthy Skin không được sử dụng thông tin cá nhân của người dùng cho mục đích thương mại nếu chưa có sự đồng ý của người dùng hoặc chưa có căn cứ pháp lý phù hợp."
    ]
  },
  {
    "type": "article",
    "text": "Điều 58. Quyền sửa đổi và cập nhật dịch vụ"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin có quyền sửa đổi, bổ sung hoặc loại bỏ các tính năng của hệ thống nhằm đáp ứng nhu cầu thực tế hoặc yêu cầu của pháp luật.",
      "Healthy Skin có quyền cập nhật các Chính sách và Điều khoản sử dụng khi cần thiết. Các nội dung cập nhật sẽ được công bố trên website và có hiệu lực theo quy định tại Chương I của tài liệu này.",
      "Việc cập nhật không nhằm làm giảm hoặc loại bỏ các quyền hợp pháp của người dùng đã được pháp luật bảo vệ."
    ]
  },
  {
    "type": "article",
    "text": "Điều 59. Trách nhiệm trong việc bảo đảm an toàn hệ thống"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có trách nhiệm:"
  },
  {
    "type": "list",
    "items": [
      "Áp dụng các biện pháp kỹ thuật nhằm bảo vệ hệ thống trước các nguy cơ mất an toàn thông tin.",
      "Thực hiện sao lưu dữ liệu định kỳ và có kế hoạch khôi phục khi xảy ra sự cố.",
      "Chủ động phát hiện và xử lý các hành vi xâm nhập trái phép hoặc các nguy cơ ảnh hưởng đến hoạt động của hệ thống.",
      "Thông báo cho người dùng khi phát hiện sự cố có nguy cơ ảnh hưởng đến dữ liệu cá nhân hoặc quyền lợi của người dùng theo quy định của pháp luật."
    ]
  },
  {
    "type": "article",
    "text": "Điều 60. Hợp tác và giải quyết tranh chấp"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin khuyến khích các bên ưu tiên giải quyết tranh chấp thông qua thương lượng và hòa giải trên tinh thần thiện chí.",
      "Trường hợp không thể giải quyết bằng thương lượng, Healthy Skin có quyền yêu cầu cơ quan có thẩm quyền giải quyết theo quy định của pháp luật Việt Nam.",
      "Healthy Skin có quyền lưu giữ các tài liệu, dữ liệu và nhật ký hệ thống cần thiết nhằm phục vụ việc giải quyết tranh chấp hoặc yêu cầu của cơ quan có thẩm quyền."
    ]
  },
  {
    "type": "article",
    "text": "Điều 61. Hiệu lực của Chương VII"
  },
  {
    "type": "list",
    "items": [
      "Các quyền và nghĩa vụ quy định tại Chương này là một phần không tách rời của Chính sách và Điều khoản sử dụng Healthy Skin.",
      "Mọi cá nhân, tổ chức sử dụng Healthy Skin đều có trách nhiệm tôn trọng và thực hiện các quy định tại Chương này.",
      "Trường hợp có sự khác nhau giữa quy định tại Chương này và quy định của pháp luật bắt buộc áp dụng thì quy định của pháp luật sẽ được ưu tiên thực hiện."
    ]
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG VIII. CHÍNH SÁCH VỀ TRÍ TUỆ NHÂN TẠO (AI)"
  },
  {
    "type": "article",
    "text": "Điều 62. Mục đích sử dụng công nghệ trí tuệ nhân tạo"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin ứng dụng công nghệ trí tuệ nhân tạo (Artificial Intelligence - AI) nhằm hỗ trợ người dùng trong việc phân tích sơ bộ tình trạng làn da, gợi ý quy trình chăm sóc da và cung cấp các thông tin tham khảo phù hợp với nhu cầu cá nhân.",
      "Việc ứng dụng AI nhằm nâng cao trải nghiệm người dùng, tối ưu hóa quá trình chăm sóc da và hỗ trợ người dùng tiếp cận các thông tin nhanh chóng, thuận tiện.",
      "Healthy Skin cam kết sử dụng AI với mục đích phục vụ lợi ích của người dùng, không sử dụng AI để thực hiện các hành vi trái pháp luật hoặc xâm phạm quyền, lợi ích hợp pháp của cá nhân, tổ chức khác."
    ]
  },
  {
    "type": "article",
    "text": "Điều 63. Nguyên tắc hoạt động của hệ thống AI"
  },
  {
    "type": "paragraph",
    "text": "Hệ thống AI của Healthy Skin hoạt động trên các nguyên tắc sau:"
  },
  {
    "type": "list",
    "items": [
      "Phân tích dữ liệu dựa trên hình ảnh và thông tin do người dùng chủ động cung cấp.",
      "Đưa ra kết quả phân tích và các gợi ý chăm sóc da dựa trên thuật toán và cơ sở dữ liệu hiện có tại thời điểm xử lý.",
      "Không tự động đưa ra quyết định thay người dùng trong các vấn đề liên quan đến điều trị hoặc chăm sóc sức khỏe.",
      "Không thay đổi hoặc chỉnh sửa dữ liệu cá nhân của người dùng nếu chưa có sự đồng ý hoặc căn cứ pháp lý phù hợp.",
      "Luôn được cập nhật và cải tiến nhằm nâng cao độ chính xác và hiệu quả hoạt động."
    ]
  },
  {
    "type": "article",
    "text": "Điều 64. Phạm vi hỗ trợ của AI"
  },
  {
    "type": "paragraph",
    "text": "Hệ thống AI của Healthy Skin hỗ trợ người dùng trong các nội dung sau:"
  },
  {
    "type": "list",
    "items": [
      "Phân tích sơ bộ tình trạng da thông qua hình ảnh.",
      "Nhận diện một số dấu hiệu phổ biến của làn da như da dầu, da khô, da hỗn hợp, mụn, thâm, nám, tàn nhang hoặc lỗ chân lông to.",
      "Đề xuất quy trình chăm sóc da phù hợp với từng loại da.",
      "Gợi ý thành phần mỹ phẩm hoặc nhóm sản phẩm có thể phù hợp với nhu cầu chăm sóc da của người dùng.",
      "Theo dõi sự thay đổi của tình trạng da dựa trên lịch sử phân tích."
    ]
  },
  {
    "type": "paragraph",
    "text": "Những nội dung trên chỉ mang tính chất tham khảo và hỗ trợ, không phải là kết luận chuyên môn hoặc chỉ định điều trị."
  },
  {
    "type": "article",
    "text": "Điều 65. Giới hạn của công nghệ AI"
  },
  {
    "type": "paragraph",
    "text": "Người dùng hiểu và đồng ý rằng:"
  },
  {
    "type": "list",
    "items": [
      "AI hoạt động dựa trên thuật toán và dữ liệu đầu vào, vì vậy kết quả phân tích có thể chịu ảnh hưởng bởi chất lượng hình ảnh, điều kiện ánh sáng, góc chụp hoặc thông tin do người dùng cung cấp.",
      "AI không thể thay thế bác sĩ da liễu, chuyên gia y tế hoặc các cơ sở khám, chữa bệnh.",
      "Healthy Skin không bảo đảm kết quả phân tích của AI luôn chính xác tuyệt đối trong mọi trường hợp.",
      "AI không có khả năng phát hiện hoặc chẩn đoán toàn bộ các bệnh lý về da, đặc biệt là các bệnh lý phức tạp hoặc cần thăm khám trực tiếp.",
      "Người dùng không nên đưa ra các quyết định ảnh hưởng đến sức khỏe chỉ dựa trên kết quả phân tích của AI."
    ]
  },
  {
    "type": "article",
    "text": "Điều 66. Quyền và trách nhiệm của người dùng khi sử dụng AI"
  },
  {
    "type": "paragraph",
    "text": "Người dùng có trách nhiệm:"
  },
  {
    "type": "list",
    "items": [
      "Cung cấp hình ảnh rõ nét, trung thực và đúng với tình trạng thực tế của làn da.",
      "Không chỉnh sửa, cắt ghép hoặc làm sai lệch hình ảnh nhằm mục đích đánh lừa hệ thống AI.",
      "Chỉ sử dụng kết quả phân tích cho mục đích tham khảo và chăm sóc cá nhân.",
      "Chủ động tham khảo ý kiến bác sĩ hoặc chuyên gia khi có các dấu hiệu bất thường hoặc cần điều trị.",
      "Không sử dụng kết quả phân tích của AI để quảng bá, tư vấn y tế hoặc thực hiện các hoạt động có thể gây hiểu nhầm cho người khác."
    ]
  },
  {
    "type": "article",
    "text": "Điều 67. Quyền của Healthy Skin đối với hệ thống AI"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin có quyền:"
  },
  {
    "type": "list",
    "items": [
      "Cập nhật, cải tiến hoặc thay đổi thuật toán AI nhằm nâng cao chất lượng dịch vụ.",
      "Điều chỉnh cơ sở dữ liệu phục vụ cho việc huấn luyện và tối ưu hệ thống AI trên cơ sở tuân thủ các quy định về bảo vệ dữ liệu cá nhân.",
      "Tạm ngừng hoặc hạn chế một số chức năng AI trong trường hợp cần bảo trì, nâng cấp hoặc xử lý sự cố kỹ thuật.",
      "Thu thập và sử dụng dữ liệu đã được ẩn danh để nghiên cứu, đánh giá và cải thiện hiệu quả hoạt động của AI."
    ]
  },
  {
    "type": "article",
    "text": "Điều 68. Bảo đảm tính minh bạch trong sử dụng AI"
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin cam kết:"
  },
  {
    "type": "list",
    "items": [
      "Thông báo rõ cho người dùng khi kết quả được tạo ra bởi hệ thống AI.",
      "Không cố ý che giấu việc sử dụng AI trong quá trình cung cấp dịch vụ.",
      "Không sử dụng AI để tạo ra các thông tin giả mạo, gây hiểu nhầm hoặc ảnh hưởng tiêu cực đến quyền và lợi ích hợp pháp của người dùng.",
      "Không sử dụng AI nhằm mục đích phân biệt đối xử hoặc đưa ra các quyết định bất công đối với người dùng."
    ]
  },
  {
    "type": "article",
    "text": "Điều 69. Bảo mật dữ liệu trong quá trình sử dụng AI"
  },
  {
    "type": "list",
    "items": [
      "Dữ liệu được sử dụng để phân tích bằng AI sẽ được xử lý theo quy định tại Chương II - Chính sách bảo vệ thông tin cá nhân.",
      "Healthy Skin áp dụng các biện pháp kỹ thuật phù hợp nhằm bảo vệ dữ liệu trong quá trình AI xử lý và lưu trữ.",
      "Dữ liệu đã được ẩn danh có thể được sử dụng để cải thiện hiệu suất của hệ thống AI nhưng không nhằm mục đích xác định danh tính người dùng."
    ]
  },
  {
    "type": "article",
    "text": "Điều 70. Hiệu lực của Chính sách về AI"
  },
  {
    "type": "list",
    "items": [
      "Chính sách về trí tuệ nhân tạo là một phần không tách rời của Chính sách và Điều khoản sử dụng Healthy Skin.",
      "Người dùng được xem là đã đọc, hiểu và đồng ý với các quy định tại Chương này khi sử dụng các tính năng AI của Healthy Skin.",
      "Healthy Skin có quyền sửa đổi, bổ sung Chính sách về AI nhằm phù hợp với sự phát triển của công nghệ và quy định của pháp luật. Mọi thay đổi sẽ được công bố trên website và có hiệu lực kể từ thời điểm đăng tải."
    ]
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG IX. CHÍNH SÁCH XỬ LÝ VI PHẠM VÀ GIẢI QUYẾT TRANH CHẤP"
  },
  {
    "type": "article",
    "text": "Điều 71. Nguyên tắc xử lý vi phạm"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin khuyến khích mọi người dùng sử dụng hệ thống trên tinh thần trung thực, văn minh, tôn trọng quyền và lợi ích hợp pháp của các bên.",
      "Mọi hành vi vi phạm Chính sách và Điều khoản sử dụng sẽ được xem xét và xử lý theo mức độ vi phạm, hậu quả gây ra và các quy định của pháp luật Việt Nam.",
      "Việc xử lý vi phạm nhằm bảo vệ quyền, lợi ích hợp pháp của Healthy Skin, người dùng và đảm bảo môi trường hoạt động an toàn, minh bạch."
    ]
  },
  {
    "type": "article",
    "text": "Điều 72. Các hành vi bị xem là vi phạm"
  },
  {
    "type": "paragraph",
    "text": "Người dùng được xem là vi phạm Chính sách và Điều khoản sử dụng nếu thực hiện một trong các hành vi sau:"
  },
  {
    "type": "list",
    "items": [
      "Cung cấp thông tin giả mạo hoặc sử dụng thông tin của người khác mà không được phép.",
      "Đăng tải, chia sẻ hoặc truyền tải nội dung vi phạm pháp luật, trái đạo đức xã hội hoặc xâm phạm quyền và lợi ích hợp pháp của tổ chức, cá nhân khác.",
      "Phát tán mã độc, virus, phần mềm độc hại hoặc thực hiện các hành vi tấn công mạng nhằm làm gián đoạn hoạt động của Healthy Skin.",
      "Can thiệp trái phép vào hệ thống, cơ sở dữ liệu hoặc các biện pháp bảo mật của Healthy Skin.",
      "Khai thác, sao chép, chỉnh sửa hoặc sử dụng trái phép giao diện, mã nguồn, cơ sở dữ liệu, thuật toán AI hoặc các tài sản trí tuệ khác của Healthy Skin.",
      "Lợi dụng hệ thống để thực hiện hành vi lừa đảo, gian lận hoặc các hoạt động trái pháp luật.",
      "Cố ý cung cấp dữ liệu sai lệch nhằm làm sai kết quả phân tích của hệ thống.",
      "Có các hành vi khác gây ảnh hưởng đến uy tín, hoạt động hoặc quyền và lợi ích hợp pháp của Healthy Skin và cộng đồng người dùng."
    ]
  },
  {
    "type": "article",
    "text": "Điều 73. Biện pháp xử lý vi phạm"
  },
  {
    "type": "paragraph",
    "text": "Tùy theo tính chất và mức độ vi phạm, Healthy Skin có thể áp dụng một hoặc nhiều biện pháp sau:"
  },
  {
    "type": "list",
    "items": [
      "Gửi cảnh báo đến người dùng.",
      "Yêu cầu người dùng chỉnh sửa, gỡ bỏ hoặc chấm dứt hành vi vi phạm.",
      "Tạm thời hạn chế quyền truy cập hoặc sử dụng một số chức năng của hệ thống.",
      "Tạm khóa hoặc chấm dứt tài khoản người dùng.",
      "Từ chối tiếp tục cung cấp dịch vụ.",
      "Yêu cầu người dùng bồi thường thiệt hại nếu hành vi vi phạm gây tổn thất cho Healthy Skin hoặc bên thứ ba theo quy định của pháp luật.",
      "Chuyển vụ việc đến cơ quan nhà nước có thẩm quyền khi có dấu hiệu vi phạm pháp luật."
    ]
  },
  {
    "type": "article",
    "text": "Điều 74. Quyền khiếu nại của người dùng"
  },
  {
    "type": "list",
    "items": [
      "Người dùng có quyền gửi khiếu nại hoặc kiến nghị nếu cho rằng việc xử lý vi phạm của Healthy Skin không phù hợp.",
      "Khiếu nại cần được gửi thông qua các kênh liên hệ chính thức của Healthy Skin và phải kèm theo các tài liệu, chứng cứ liên quan (nếu có).",
      "Healthy Skin sẽ tiếp nhận, xem xét và phản hồi khiếu nại trong thời gian hợp lý theo quy trình nội bộ.",
      "Việc gửi khiếu nại không làm đình chỉ hiệu lực của các biện pháp xử lý đã được áp dụng, trừ khi Healthy Skin hoặc cơ quan có thẩm quyền có quyết định khác."
    ]
  },
  {
    "type": "article",
    "text": "Điều 75. Giải quyết tranh chấp"
  },
  {
    "type": "list",
    "items": [
      "Mọi tranh chấp phát sinh từ việc sử dụng Healthy Skin sẽ được ưu tiên giải quyết thông qua thương lượng và hòa giải trên tinh thần thiện chí, hợp tác và tôn trọng quyền lợi của các bên.",
      "Trường hợp các bên không đạt được thỏa thuận trong thời gian hợp lý, tranh chấp sẽ được giải quyết theo quy định của pháp luật Việt Nam tại cơ quan có thẩm quyền.",
      "Trong quá trình giải quyết tranh chấp, các bên có trách nhiệm cung cấp đầy đủ thông tin, tài liệu và chứng cứ liên quan để phục vụ việc xác minh và xử lý vụ việc."
    ]
  },
  {
    "type": "article",
    "text": "Điều 76. Thu thập và lưu giữ chứng cứ"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin có quyền lưu giữ nhật ký hệ thống (log), dữ liệu giao dịch, lịch sử hoạt động và các tài liệu liên quan nhằm phục vụ việc phát hiện vi phạm, giải quyết khiếu nại, tranh chấp hoặc đáp ứng yêu cầu của cơ quan nhà nước có thẩm quyền.",
      "Việc thu thập và lưu giữ dữ liệu được thực hiện theo quy định của pháp luật về bảo vệ dữ liệu cá nhân và các quy định pháp luật có liên quan.",
      "Dữ liệu lưu giữ chỉ được sử dụng cho các mục đích hợp pháp và được bảo mật theo Chính sách bảo vệ thông tin cá nhân của Healthy Skin."
    ]
  },
  {
    "type": "article",
    "text": "Điều 77. Hợp tác với cơ quan có thẩm quyền"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin có trách nhiệm phối hợp với cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp liên quan đến việc điều tra, xác minh hoặc xử lý các hành vi vi phạm pháp luật.",
      "Trong phạm vi pháp luật cho phép, Healthy Skin có thể cung cấp các thông tin, dữ liệu cần thiết phục vụ quá trình giải quyết vụ việc.",
      "Việc cung cấp thông tin chỉ được thực hiện trên cơ sở yêu cầu hợp pháp và tuân thủ các quy định về bảo vệ dữ liệu cá nhân."
    ]
  },
  {
    "type": "article",
    "text": "Điều 78. Hiệu lực của Chương IX"
  },
  {
    "type": "list",
    "items": [
      "Các quy định tại Chương này là một phần không tách rời của Chính sách và Điều khoản sử dụng Healthy Skin.",
      "Người dùng có trách nhiệm tuân thủ các quy định về xử lý vi phạm và giải quyết tranh chấp trong suốt quá trình sử dụng dịch vụ.",
      "Trường hợp có sự khác nhau giữa quy định tại Chương này và quy định của pháp luật bắt buộc áp dụng thì quy định của pháp luật sẽ được ưu tiên thực hiện."
    ]
  },
  {
    "type": "chapter",
    "text": "CHƯƠNG X. ĐIỀU KHOẢN CHUNG"
  },
  {
    "type": "article",
    "text": "Điều 79. Hiệu lực của Chính sách và Điều khoản sử dụng"
  },
  {
    "type": "list",
    "items": [
      "Chính sách và Điều khoản sử dụng này có hiệu lực kể từ ngày được công bố trên website Healthy Skin.",
      "Tài liệu này là cơ sở điều chỉnh mối quan hệ giữa Healthy Skin và người dùng trong suốt quá trình truy cập, đăng ký tài khoản và sử dụng các dịch vụ của hệ thống.",
      "Việc người dùng tiếp tục truy cập hoặc sử dụng Healthy Skin sau khi Chính sách và Điều khoản sử dụng được công bố hoặc cập nhật được xem là người dùng đã đọc, hiểu và đồng ý tuân thủ toàn bộ nội dung của tài liệu này."
    ]
  },
  {
    "type": "article",
    "text": "Điều 80. Sửa đổi và bổ sung Chính sách, Điều khoản sử dụng"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin có quyền sửa đổi, bổ sung hoặc cập nhật Chính sách và Điều khoản sử dụng nhằm:",
      "Phù hợp với sự phát triển của hệ thống và công nghệ.",
      "Cập nhật theo yêu cầu của pháp luật.",
      "Nâng cao chất lượng dịch vụ và trải nghiệm người dùng.",
      "Các nội dung sửa đổi sẽ được công bố trên website hoặc thông báo thông qua các kênh liên lạc phù hợp (nếu cần).",
      "Phiên bản mới sẽ có hiệu lực kể từ thời điểm được công bố hoặc theo thời điểm được ghi rõ trong thông báo.",
      "Trường hợp người dùng không đồng ý với các nội dung sửa đổi, người dùng có quyền ngừng sử dụng dịch vụ và yêu cầu chấm dứt tài khoản theo quy định."
    ]
  },
  {
    "type": "article",
    "text": "Điều 81. Luật áp dụng"
  },
  {
    "type": "list",
    "items": [
      "Chính sách và Điều khoản sử dụng này được điều chỉnh và giải thích theo pháp luật của nước Cộng hòa xã hội chủ nghĩa Việt Nam.",
      "Mọi vấn đề chưa được quy định trong tài liệu này sẽ được thực hiện theo các quy định pháp luật hiện hành.",
      "Trường hợp có sự khác nhau giữa quy định của Chính sách và Điều khoản sử dụng với quy định bắt buộc của pháp luật thì quy định của pháp luật sẽ được ưu tiên áp dụng."
    ]
  },
  {
    "type": "article",
    "text": "Điều 82. Điều khoản tách biệt"
  },
  {
    "type": "list",
    "items": [
      "Trường hợp một hoặc một số điều khoản trong tài liệu này bị cơ quan nhà nước có thẩm quyền xác định là vô hiệu hoặc không thể thi hành, các điều khoản còn lại vẫn giữ nguyên hiệu lực.",
      "Healthy Skin sẽ sửa đổi hoặc thay thế điều khoản bị vô hiệu bằng nội dung phù hợp với quy định của pháp luật và mục đích ban đầu của điều khoản đó."
    ]
  },
  {
    "type": "article",
    "text": "Điều 83. Sự kiện bất khả kháng"
  },
  {
    "type": "list",
    "items": [
      "Healthy Skin không chịu trách nhiệm đối với việc chậm thực hiện hoặc không thể thực hiện nghĩa vụ phát sinh từ các sự kiện bất khả kháng ngoài khả năng kiểm soát hợp lý, bao gồm nhưng không giới hạn ở:",
      "Thiên tai.",
      "Hỏa hoạn.",
      "Dịch bệnh.",
      "Chiến tranh.",
      "Khủng bố.",
      "Mất điện trên diện rộng.",
      "Sự cố hạ tầng viễn thông.",
      "Tấn công mạng quy mô lớn.",
      "Quyết định của cơ quan nhà nước có thẩm quyền.",
      "Khi xảy ra sự kiện bất khả kháng, Healthy Skin sẽ nỗ lực áp dụng các biện pháp cần thiết nhằm hạn chế thiệt hại và khôi phục hoạt động của hệ thống trong thời gian sớm nhất có thể."
    ]
  },
  {
    "type": "article",
    "text": "Điều 84. Thông tin liên hệ"
  },
  {
    "type": "paragraph",
    "text": "Khi cần hỗ trợ, góp ý, phản ánh hoặc khiếu nại liên quan đến việc sử dụng Healthy Skin, người dùng có thể liên hệ thông qua các kênh sau:"
  },
  {
    "type": "paragraph",
    "text": "Đơn vị vận hành: Healthy Skin"
  },
  {
    "type": "paragraph",
    "text": "Địa chỉ: (Bổ sung khi triển khai chính thức.)"
  },
  {
    "type": "paragraph",
    "text": "Email hỗ trợ: support@healthyskin.vn (Địa chỉ minh họa.)"
  },
  {
    "type": "paragraph",
    "text": "Hotline: 1900 xxxx (Số điện thoại minh họa.)"
  },
  {
    "type": "paragraph",
    "text": "Website: https://www.healthyskin.vn (Tên miền minh họa.)"
  },
  {
    "type": "paragraph",
    "text": "Thời gian tiếp nhận yêu cầu: Từ 08:00 đến 17:00, từ Thứ Hai đến Thứ Sáu (trừ ngày nghỉ lễ theo quy định)."
  },
  {
    "type": "paragraph",
    "text": "Healthy Skin sẽ tiếp nhận và phản hồi các yêu cầu trong thời gian hợp lý, tùy thuộc vào tính chất của từng vụ việc."
  },
  {
    "type": "article",
    "text": "Điều 85. Điều khoản cuối cùng"
  },
  {
    "type": "list",
    "items": [
      "Chính sách và Điều khoản sử dụng này là toàn bộ thỏa thuận giữa Healthy Skin và người dùng liên quan đến việc truy cập và sử dụng website.",
      "Người dùng xác nhận đã đọc, hiểu đầy đủ các quyền, nghĩa vụ, giới hạn trách nhiệm và các quy định khác được nêu trong tài liệu này trước khi sử dụng dịch vụ.",
      "Việc tiếp tục truy cập hoặc sử dụng Healthy Skin sau khi tài liệu này có hiệu lực được xem là sự chấp thuận của người dùng đối với toàn bộ nội dung của Chính sách và Điều khoản sử dụng.",
      "Healthy Skin luôn hướng tới việc xây dựng một môi trường trực tuyến an toàn, minh bạch, tôn trọng quyền riêng tư và bảo vệ quyền, lợi ích hợp pháp của người dùng theo quy định của pháp luật Việt Nam."
    ]
  },
  {
    "type": "paragraph",
    "text": "KẾT LUẬN"
  },
  {
    "type": "paragraph",
    "text": "Quy chế hoạt động và Điều khoản sử dụng Website Healthy Skin được xây dựng nhằm thiết lập khuôn khổ pháp lý và nguyên tắc hoạt động cho toàn bộ hệ thống, góp phần bảo đảm tính minh bạch, an toàn và trách nhiệm trong quá trình cung cấp cũng như sử dụng dịch vụ. Đây không chỉ là cơ sở để điều chỉnh mối quan hệ giữa Healthy Skin và người dùng mà còn là nền tảng quan trọng giúp bảo vệ quyền, lợi ích hợp pháp của các bên theo quy định của pháp luật Việt Nam."
  },
  {
    "type": "paragraph",
    "text": "Thông qua việc quy định rõ các nguyên tắc hoạt động, chính sách bảo vệ thông tin cá nhân, điều khoản sử dụng, quyền và nghĩa vụ của các bên, chính sách ứng dụng công nghệ trí tuệ nhân tạo (AI), giới hạn trách nhiệm, cơ chế xử lý vi phạm và giải quyết tranh chấp, Healthy Skin hướng đến việc xây dựng một môi trường trực tuyến an toàn, minh bạch và đáng tin cậy. Đồng thời, bộ quy chế cũng góp phần nâng cao ý thức của người dùng trong việc sử dụng dịch vụ một cách có trách nhiệm và tuân thủ các quy định của pháp luật."
  },
  {
    "type": "paragraph",
    "text": "Trong quá trình phát triển, Healthy Skin cam kết không ngừng hoàn thiện hệ thống, cập nhật công nghệ, nâng cao chất lượng dịch vụ và tăng cường các biện pháp bảo vệ dữ liệu cá nhân nhằm đáp ứng tốt hơn nhu cầu của người dùng cũng như các yêu cầu của pháp luật và thực tiễn. Mọi sửa đổi, bổ sung đối với Quy chế sẽ được thực hiện trên tinh thần minh bạch, công khai và hướng đến việc bảo đảm sự cân bằng giữa quyền lợi của người dùng và trách nhiệm của đơn vị vận hành."
  },
  {
    "type": "paragraph",
    "text": "Với định hướng lấy người dùng làm trung tâm, Healthy Skin mong muốn trở thành một nền tảng hỗ trợ chăm sóc da đáng tin cậy, ứng dụng công nghệ một cách có trách nhiệm và góp phần lan tỏa lối sống chăm sóc sức khỏe làn da khoa học, an toàn và bền vững. Bộ Quy chế hoạt động và Điều khoản sử dụng Website Healthy Skin là nền tảng quan trọng để website phát triển ổn định, tạo dựng niềm tin với người dùng và hướng tới việc xây dựng một hệ sinh thái chăm sóc da hiện đại, thân thiện và phù hợp với xu hướng chuyển đổi số trong lĩnh vực chăm sóc sức khỏe và sắc đẹp."
  }
]

export default termsFull
