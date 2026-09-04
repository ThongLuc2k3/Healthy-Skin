import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient, notifyAccountUpdated } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import { formatVnd, formatDateTime, formatDate, formatCompactNumber } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { UserIcon, WalletIcon, ShieldIcon, CheckCircleIcon, StarIcon, SparklesIcon } from '../components/Icons'
import { BadgeTierIcon } from './MotivationPage'
import { AccountAvatar } from '../components/NavBar'

function AvatarCard({ account, onSaved }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const updated = await apiClient.post('/account/avatar', formData, { auth: true, isFormData: true })
      onSaved(updated)
      notifyAccountUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleRemove() {
    setUploading(true)
    setError('')
    try {
      const updated = await apiClient.delete('/account/avatar', { auth: true })
      onSaved(updated)
      notifyAccountUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs">
      <div className="mb-4 flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-[#2563eb]" />
        <h2 className="text-lg font-bold text-[#172554]">Ảnh đại diện</h2>
      </div>
      <div className="flex items-center gap-4">
        <AccountAvatar fullName={account.fullName} email={account.email} avatarUrl={account.avatarUrl} className="h-20 w-20 text-2xl" />
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#172554]">
            {uploading ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFileChange} />
          </label>
          {account.avatarUrl && (
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="block text-xs font-bold text-rose-600 hover:underline disabled:opacity-60"
            >
              Xoá ảnh đại diện
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  )
}

function PersonalInfoCard({ account, onSaved }) {
  const [fullName, setFullName] = useState(account.fullName)
  const [phone, setPhone] = useState(account.phone)
  const [dateOfBirth, setDateOfBirth] = useState(account.dateOfBirth)
  const [addressVi, setAddressVi] = useState(account.addressVi)
  const [socialLink, setSocialLink] = useState(account.socialLink)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await apiClient.put('/account', { fullName, phone, dateOfBirth, addressVi, socialLink }, { auth: true })
      onSaved(updated)
      notifyAccountUpdated()
      setMessage('Đã lưu thông tin cá nhân.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-[#2563eb]" />
        <h2 className="text-lg font-bold text-[#172554]">Thông tin cá nhân</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Họ và tên</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Ngày sinh</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Email</label>
          <input
            disabled
            value={account.email}
            className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#f5f5f5] px-3.5 py-2.5 text-sm text-[#64748B]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Địa chỉ</label>
        <input
          value={addressVi}
          onChange={(e) => setAddressVi(e.target.value)}
          placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
          className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-[#64748B]">
          Dùng làm vị trí dự phòng để tính khoảng cách ở "Dịch Vụ Quanh Bạn" khi trình duyệt không cấp quyền vị trí.
        </p>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Link mạng xã hội</label>
        <input
          type="url"
          value={socialLink}
          onChange={(e) => setSocialLink(e.target.value)}
          placeholder="https://facebook.com/... hoặc Zalo, Instagram..."
          className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-[#64748B]">
          Hiện công khai kèm tên bạn khi người khác bấm vào bài đăng của bạn ở Góc truyền động lực.
        </p>
      </div>

      {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#172554] disabled:opacity-60"
      >
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  )
}

function WalletCard({ wallet }) {
  if (!wallet) return null
  return (
    <div className="rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs">
      <div className="flex items-center gap-2">
        <WalletIcon className="h-5 w-5 text-[#2563eb]" />
        <h2 className="text-lg font-bold text-[#172554]">Ví của tôi</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#eff6ff] p-4">
          <p className="text-xs text-[#64748B]">Số dư</p>
          <p className="mt-1 text-xl font-black text-[#2563eb]">{formatVnd(wallet.balanceVnd)}</p>
        </div>
        <div className="rounded-2xl bg-[#eff6ff] p-4">
          <p className="text-xs text-[#64748B]">Điểm tích luỹ</p>
          <p className="mt-1 text-xl font-black text-[#2563eb]">{wallet.loyaltyPoints}</p>
        </div>
        <div className="rounded-2xl bg-[#eff6ff] p-4">
          <p className="text-xs text-[#64748B]">Gói hiện tại</p>
          <p className="mt-1 text-xl font-black text-[#2563eb]">{wallet.planId === 'free' ? 'Miễn phí' : wallet.planId}</p>
        </div>
      </div>
    </div>
  )
}

function BankLinkCard({ account, bankOptions, onChanged }) {
  const [bankName, setBankName] = useState(bankOptions[0] || '')
  const [accountNumber, setAccountNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleLink(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await apiClient.post('/account/bank-link', { bankName, accountNumber }, { auth: true })
      onChanged(updated)
      setAccountNumber('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUnlink() {
    setBusy(true)
    setError('')
    try {
      const updated = await apiClient.delete('/account/bank-link', { auth: true })
      onChanged(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs">
      <div className="flex items-center gap-2">
        <ShieldIcon className="h-5 w-5 text-[#2563eb]" />
        <h2 className="text-lg font-bold text-[#172554]">Ngân hàng liên kết</h2>
      </div>

      {account.bankName ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#eff6ff] p-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-[#2563eb]" />
            <div>
              <p className="font-bold text-[#172554]">{account.bankName}</p>
              <p className="text-xs text-[#64748B]">Số tài khoản {account.bankAccountMasked} · Liên kết lúc {formatDateTime(account.bankLinkedAt)}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleUnlink}
            className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          >
            Huỷ liên kết
          </button>
        </div>
      ) : (
        <form onSubmit={handleLink} className="mt-4 space-y-3">
          <p className="text-xs text-[#64748B]">Liên kết ví với tài khoản ngân hàng để nạp tiền nhanh hơn.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
            >
              {bankOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <input
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Số tài khoản"
              className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
            />
          </div>
          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#172554] disabled:opacity-60"
          >
            {busy ? 'Đang liên kết...' : 'Liên kết ngân hàng'}
          </button>
        </form>
      )}
    </div>
  )
}

function ActivityCard({ userId }) {
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [followers, setFollowers] = useState(null)
  const [openPanel, setOpenPanel] = useState(null)

  useEffect(() => {
    apiClient.get(`/users/${userId}`, { auth: true }).then(setProfile).catch(() => {})
    apiClient.get('/reviews/mine', { auth: true }).then((data) => setReviews(data.reviews)).catch(() => setReviews([]))
  }, [userId])

  function toggleFollowersPanel() {
    if (openPanel === 'followers') {
      setOpenPanel(null)
      return
    }
    setOpenPanel('followers')
    if (!followers) {
      apiClient.get(`/users/${userId}/followers`, { auth: true }).then(setFollowers).catch(() => setFollowers([]))
    }
  }

  return (
    <div className="rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-[#2563eb]" />
        <h2 className="text-lg font-bold text-[#172554]">Hoạt động của tôi</h2>
        {profile?.badgeTier && <BadgeTierIcon badgeTier={profile.badgeTier} />}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={toggleFollowersPanel}
          className="rounded-2xl bg-[#eff6ff] p-4 text-left hover:bg-[#60a5fa]/15 transition"
        >
          <p className="text-xl font-black text-[#2563eb]">{profile ? formatCompactNumber(profile.followerCount) : '...'}</p>
          <p className="text-xs text-[#64748B]">Người theo dõi</p>
        </button>

        <Link to={`/nguoi-dung/${userId}`} className="rounded-2xl bg-[#eff6ff] p-4 hover:bg-[#60a5fa]/15 transition">
          <p className="text-xl font-black text-[#2563eb]">{profile?.posts?.length ?? '...'}</p>
          <p className="text-xs text-[#64748B]">Bài đăng (Góc truyền động lực)</p>
        </Link>

        <button
          type="button"
          onClick={() => setOpenPanel((v) => (v === 'reviews' ? null : 'reviews'))}
          className="rounded-2xl bg-[#eff6ff] p-4 text-left hover:bg-[#60a5fa]/15 transition"
        >
          <p className="text-xl font-black text-[#2563eb]">{reviews?.length ?? '...'}</p>
          <p className="text-xs text-[#64748B]">Bài đánh giá (Diễn đàn)</p>
        </button>
      </div>

      {openPanel === 'followers' && (
        <div className="rounded-2xl border border-[#dbeafe] p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Người đang theo dõi bạn</p>
          {followers === null ? (
            <p className="text-sm text-[#64748B]">Đang tải...</p>
          ) : followers.length === 0 ? (
            <p className="text-sm text-[#64748B]">Chưa có ai theo dõi bạn.</p>
          ) : (
            <ul className="space-y-1.5">
              {followers.map((f) => (
                <li key={f.id}>
                  <Link to={`/nguoi-dung/${f.id}`} className="text-sm font-medium text-[#172554] hover:text-[#2563eb] hover:underline">
                    {f.fullName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {openPanel === 'reviews' && (
        <div className="rounded-2xl border border-[#dbeafe] p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Bài đánh giá của bạn</p>
          {reviews.length === 0 ? (
            <p className="text-sm text-[#64748B]">Bạn chưa viết đánh giá nào ở Diễn đàn.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-xl bg-[#eff6ff] p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#172554]">{r.title}</p>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                    <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {r.rating}/5
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">{formatDate(r.created_at)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function AccountSettingsPage() {
  useDocumentTitle('Tài khoản của tôi')
  const { user } = useAuth()
  const [account, setAccount] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [bankOptions, setBankOptions] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    Promise.all([
      apiClient.get('/account', { auth: true }),
      apiClient.get('/chat/wallet', { auth: true }).catch(() => null),
      apiClient.get('/account/bank-options'),
    ])
      .then(([accountData, walletData, banks]) => {
        setAccount(accountData)
        setWallet(walletData)
        setBankOptions(banks)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') {
    return <p className="mx-auto mt-24 text-center text-sm text-[#64748B]">Đang tải...</p>
  }
  if (status === 'error' || !account) {
    return <p className="mx-auto mt-24 text-center text-sm text-rose-600">Không tải được thông tin tài khoản.</p>
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[800px] space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-[#172554]">
            Tài khoản của tôi
          </h1>
          <p className="text-sm text-[#64748B]">Quản lý thông tin cá nhân, ví và ngân hàng liên kết.</p>
        </motion.div>

        {user && <ActivityCard userId={user.id} />}
        <AvatarCard account={account} onSaved={setAccount} />
        <PersonalInfoCard account={account} onSaved={setAccount} />
        <WalletCard wallet={wallet} />
        <BankLinkCard account={account} bankOptions={bankOptions} onChanged={setAccount} />
      </div>
    </div>
  )
}

export default AccountSettingsPage
