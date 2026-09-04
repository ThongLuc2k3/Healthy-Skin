# Kho tri thức RAG của HEALTHY SKIN

Các file Markdown trong thư mục này là nguồn nội bộ cho Chat Agent. Mỗi tài liệu có frontmatter phân
loại `domain`, `risk_level`, `authority`, `reviewed_at`, `tags`; nội dung được chia theo cây H1/H2/H3.
`query-expansions.json` mở rộng các cách diễn đạt tiếng Việt để hybrid search xếp hạng theo tiêu đề,
tag, cấp cha/con và nội dung. Kết quả luôn mang metadata và nguồn để Agent kiểm tra trước khi trả lời.

Quy tắc cập nhật:

- Ưu tiên hướng dẫn của cơ quan y tế hoặc tổ chức chuyên môn.
- Không đưa phác đồ, liều thuốc hay khẳng định chẩn đoán vào kho.
- Ghi ngày truy cập và URL nguồn; rà soát ít nhất mỗi 6 tháng.
- Một chunk nên tập trung vào một câu hỏi để truy xuất chính xác.

Phân tầng rủi ro:

- `low`: kiến thức và hướng dẫn app thông thường.
- `medium`: nội dung cần lưu ý, không cá nhân hóa thành phác đồ.
- `high`: phản ứng hoặc tình trạng cần khuyến nghị gặp chuyên gia.
- `urgent`: dấu hiệu có thể cần hỗ trợ y tế khẩn cấp, luôn được ưu tiên khi truy xuất.

Luồng dữ liệu: truy vấn → chuẩn hóa/mở rộng bằng JSON → lọc và hybrid ranking → ưu tiên an toàn →
top K chunk có nguồn → LLM viết câu trả lời. Embedding/reranker sẽ được thêm khi có API key; pipeline
hiện tại vẫn hoạt động hoàn toàn nội bộ.
