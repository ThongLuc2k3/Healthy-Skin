import { useEffect, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { SerumDropper, SunscreenTube, LotionPumpBottle, CreamJar } from '../CosmeticDecoration'

const PRODUCT_ICONS = {
  sp_serum_niacinamide: SerumDropper,
  sp_kem_chong_nang: SunscreenTube,
  sp_sua_rua_mat_diu_nhe: LotionPumpBottle,
}

export default function SponsoredStrip() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    apiClient.get('/sponsored/products?placement=trang_chu').then(setProducts).catch(() => {})
  }, [])

  if (products.length === 0) return null

  return (
    <section className="relative py-16 bg-[#eff6ff] border-t border-[#E7ECEE]">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A87A45]">
          Sản phẩm gợi ý · Quảng cáo / Liên kết tiếp thị
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {products.slice(0, 3).map((p) => {
            const Icon = PRODUCT_ICONS[p.id] || CreamJar
            return (
              <a
                key={p.id}
                href={p.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="group flex flex-col items-center rounded-2xl border border-[#D8B27A]/30 bg-white px-5 py-6 text-center transition hover:border-[#D8B27A] hover:shadow-md"
              >
                <Icon className="h-20 w-20 transition-transform duration-300 group-hover:scale-105" />
                <p className="mt-3 text-sm font-bold text-[#172554]">{p.name}</p>
                {p.priceVnd && (
                  <p className="mt-1 text-xs font-bold text-[#A87A45]">
                    {p.priceVnd.toLocaleString('vi-VN')}đ
                  </p>
                )}
                <p className="mt-1 text-[11px] text-[#64748B]">{p.sponsorName}</p>
              </a>
            )
          })}
        </div>
        <p className="mt-4 text-[11px] text-[#64748B]">
          Nội dung tài trợ, không phải đánh giá khách quan từ HEALTHY SKIN.
        </p>
      </div>
    </section>
  )
}
