function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

export const MOTIVATION_CATEGORIES = [
  {
    id: 'skincare_routine',
    label: 'Routine chăm sóc da',
    color: 'emerald',
    items: [
      {
        title: 'Routine skincare buổi sáng cho người mới bắt đầu',
        desc: 'Các bước cơ bản: rửa mặt, dưỡng ẩm, chống nắng, dễ áp dụng ngay từ hôm nay.',
        url: youtubeSearchUrl('routine skincare buổi sáng cho người mới bắt đầu'),
      },
      {
        title: 'Cách trị mụn tại nhà an toàn, đúng khoa học',
        desc: 'Tổng hợp mẹo chăm da mụn không gây kích ứng, có nguồn tham khảo da liễu.',
        url: youtubeSearchUrl('cách trị mụn tại nhà an toàn khoa học da liễu'),
      },
    ],
  },
  {
    id: 'weight_loss',
    label: 'Giảm cân lành mạnh',
    color: 'amber',
    items: [
      {
        title: 'Thực đơn giảm cân 7 ngày cho người bận rộn',
        desc: 'Gợi ý bữa ăn cân bằng dinh dưỡng, dễ chuẩn bị, không nhịn ăn cực đoan.',
        url: youtubeSearchUrl('thực đơn giảm cân 7 ngày lành mạnh'),
      },
      {
        title: 'Bài tập 15 phút tại nhà không cần dụng cụ',
        desc: 'Vận động nhẹ mỗi ngày để hỗ trợ quá trình giảm cân bền vững.',
        url: youtubeSearchUrl('bài tập 15 phút tại nhà giảm cân không dụng cụ'),
      },
    ],
  },
  {
    id: 'nutrition',
    label: 'Dinh dưỡng & động lực',
    color: 'teal',
    items: [
      {
        title: 'Cách đọc nhãn dinh dưỡng thực phẩm đóng gói',
        desc: 'Hiểu đúng thành phần trên bao bì để chọn thực phẩm phù hợp với bạn.',
        url: youtubeSearchUrl('cách đọc nhãn dinh dưỡng thực phẩm đóng gói'),
      },
      {
        title: 'Câu chuyện truyền cảm hứng: hành trình thay đổi thói quen ăn uống',
        desc: 'Chia sẻ thực tế giúp duy trì động lực khi thay đổi lối sống.',
        url: youtubeSearchUrl('câu chuyện truyền cảm hứng thay đổi thói quen ăn uống lành mạnh'),
      },
    ],
  },
]
