import { useEffect, useState, type ReactNode } from "react"
import { supabase, supabaseConfigured } from "./lib/supabase"

type IconName = "home" | "scan" | "book" | "users" | "calendar" | "wallet" | "chart" | "settings" | "search" | "bell" | "chevron" | "arrow" | "check" | "x" | "clock" | "warning" | "wifi" | "menu" | "plus" | "filter" | "download" | "printer" | "mail" | "shield" | "barcode" | "spark" | "file" | "moon"

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-7h6v7" />
    </>
  ),
  scan: (
    <>
      <path d="M3 5V3h4M17 3h4v2M21 19v2h-4M7 21H3v-2" />
      <path d="M7 8v8M10 8v8M14 8v8M17 8v8" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  wallet: (
    <>
      <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v11H5a3 3 0 0 1-3-3V6" />
      <path d="M16 13h2" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 16 4-5 4 3 5-7" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.09A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  arrow: <path d="m5 12 14 0M13 6l6 6-6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  x: <path d="m18 6-12 12M6 6l12 12" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
      <path d="M12 20h.01" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M4 5h16l-6 7v5l-4 2v-7Z" />,
  download: <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />,
  printer: (
    <>
      <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  barcode: <path d="M3 5v14M7 5v14M10 5v14M14 5v14M17 5v14M21 5v14" />,
  spark: (
    <>
      <path d="m12 3-1.3 4.7L6 9l4.7 1.3L12 15l1.3-4.7L18 9l-4.7-1.3Z" />
      <path d="m5 15-.7 2.3L2 18l2.3.7L5 21l.7-2.3L8 18l-2.3-.7Z" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </>
  ),
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
}

function Icon({ name, size = 18 }: { name: IconName size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: IconName
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  )
}

function Field({
  label,
  placeholder,
  icon,
  value,
  onChange,
  autoFocus,
  type = "text",
}: {
  label?: string
  placeholder?: string
  icon?: IconName
  value?: string
  onChange?: (value: string) => void
  autoFocus?: boolean
  type?: string
}) {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      <div className="input-shell">
        {icon && <Icon name={icon} />}
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          type={type}
        />
      </div>
    </label>
  )
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "success" | "info" | "warning" | "danger" | "purple" | "neutral"
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <i />
      {children}
    </span>
  )
}

function Avatar({ name, small = false }: { name: string small?: boolean }) {
  return (
    <div className={`avatar ${small ? "avatar-small" : ""}`}>
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </div>
  )
}

function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <div className="title">{title}</div>
        {description && <div className="subtitle">{description}</div>}
      </div>
      {action && <div className="title-actions">{action}</div>}
    </div>
  )
}

function Stat({
  label,
  value,
  detail,
  tone = "teal",
  icon,
}: {
  label: string
  value: string
  detail: string
  tone?: string
  icon: IconName
}) {
  return (
    <div className="card stat">
      <div className={`stat-icon tone-${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <div className="muted">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-detail">{detail}</div>
      </div>
    </div>
  )
}

const nav = [
  ["dashboard", "Dashboard", "home"],
  ["sirkulasi", "Meja Sirkulasi", "scan"],
  ["katalog", "Katalog", "book"],
  ["anggota", "Anggota", "users"],
  ["reservasi", "Reservasi", "calendar"],
  ["denda", "Denda & Pembayaran", "wallet"],
  ["laporan", "Laporan", "chart"],
  ["notifikasi", "Notifikasi", "bell"],
  ["pengaturan", "Pengaturan", "settings"],
] as const

function Login({
  onLogin,
  onPortal,
  errorMessage,
}: {
  onLogin: (email: string, password: string) => void
  onPortal: () => void
  errorMessage: string | null
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showExampleError, setShowExampleError] = useState(false)
  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="logo light">
          <Icon name="book" size={24} />
        </div>
        <div className="brand-copy">
          <b>Pustaka Bersama</b>
          <span>Berbagi pengetahuan, menjaga kebersamaan.</span>
        </div>
        <div className="illustration">
          <div className="sun" />
          <div className="shelf shelf-one" />
          <div className="shelf shelf-two" />
          <div className="book-stack one" />
          <div className="book-stack two" />
          <div className="plant">⌁</div>
        </div>
        <div className="quote">
          “Satu tempat untuk mengelola buku, barang, dan semangat berbagi di
          komunitas.”
        </div>
        <div className="org-pill">
          <Icon name="shield" /> Sistem komunitas yang aman & transparan
        </div>
      </div>
      <div className="login-form">
        <div className="login-box">
          <div className="mobile-logo">
            <div className="logo">
              <Icon name="book" />
            </div>
            <b>Pustaka Bersama</b>
          </div>
          <div className="eyebrow">PORTAL PENGELOLA</div>
          <div className="login-title">Selamat datang kembali</div>
          <div className="subtitle">
            Masuk untuk mengelola koleksi dan peminjaman komunitas.
          </div>
          {(errorMessage || showExampleError) && (
            <div className="alert alert-danger">
              <Icon name="warning" />
              <div>
                <b>Tidak dapat masuk</b>
                <span>
                  {errorMessage || "Email atau kata sandi yang Anda masukkan tidak sesuai."}
                </span>
              </div>
            </div>
          )}
          <Field
            label="Alamat email"
            placeholder="nama@organisasi.id"
            icon="mail"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <Field
            label="Kata sandi"
            placeholder="Masukkan kata sandi"
            icon="shield"
            value={password}
            onChange={setPassword}
            type="password"
          />
          <div className="login-meta">
            <label>
              <input type="checkbox" /> Ingat saya
            </label>
            <button className="text-button">Lupa kata sandi?</button>
          </div>
          <Button onClick={() => onLogin(email, password)} className="wide">
            Masuk ke dashboard
          </Button>
          <button className="demo-error" onClick={() => setShowExampleError(true)}>
            Tampilkan contoh pesan error
          </button>
          <div className="divider">
            <span>atau</span>
          </div>
          <Button variant="secondary" className="wide" onClick={onPortal}>
            Buka portal anggota
          </Button>
          <div className="secure-note">
            <Icon name="shield" size={15} /> Dilindungi dengan koneksi
            terenkripsi
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminShell({
  onPortal,
  onLogout,
  demoMode,
}: {
  onPortal: () => void
  onLogout: () => void
  demoMode: boolean
}) {
  const [page, setPage] = useState("dashboard")
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="side-head">
          <div className="logo">
            <Icon name="book" />
          </div>
          {!collapsed && (
            <div>
              <b>Pustaka</b>
              <span>Bersama</span>
            </div>
          )}
          <button
            className="icon-btn collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon name="menu" />
          </button>
        </div>
        <div className="org-card">
          {!collapsed && (
            <>
              <span>ORGANISASI</span>
              <b>Perpustakaan Cendekia</b>
              <small>Sekolah • Jakarta</small>
            </>
          )}
        </div>
        <nav>
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""} ${
                id === "sirkulasi" ? "featured" : ""
              }`}
              onClick={() => setPage(id)}
            >
              <Icon name={icon} />
              {!collapsed && <span>{label}</span>}
              {id === "notifikasi" && !collapsed && <em>3</em>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button className="nav-item" onClick={() => setPage("components")}>
            <Icon name="spark" />
            {!collapsed && <span>Komponen UI</span>}
          </button>
          <div className="help-card">
            {!collapsed && (
              <>
                <Icon name="book" />
                <b>Butuh bantuan?</b>
                <span>Lihat panduan pengelola</span>
              </>
            )}
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="global-search">
            <Icon name="search" />
            <input placeholder="Cari anggota, judul, atau kode..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <div className={`network ${demoMode ? "demo" : ""}`}>
              <i />
              <span>{demoMode ? "Mode demo" : "Terhubung"}</span>
            </div>
            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
              title="Ubah tema"
            >
              <Icon name="moon" />
            </button>
            <button className="icon-btn notification">
              <Icon name="bell" />
              <i />
            </button>
            <button className="profile" onClick={onPortal}>
              <Avatar name="Bu Rina" small />
              <span>
                <b>Bu Rina</b>
                <small>Super Admin</small>
              </span>
              <Icon name="chevron" size={14} />
            </button>
          </div>
        </header>
        <main className="content">
          {page === "dashboard" && <Dashboard onNavigate={setPage} />}
          {page === "sirkulasi" && <Circulation />}
          {page === "katalog" && <Catalog />}
          {page === "anggota" && <Members />}
          {page === "reservasi" && <Reservations />}
          {page === "denda" && <Fines />}
          {page === "laporan" && <Reports />}
          {page === "notifikasi" && <Notifications />}
          {page === "pengaturan" && <Settings onLogout={onLogout} />}
          {page === "components" && <Components />}
        </main>
      </div>
    </div>
  )
}

function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const bars = [34, 48, 42, 65, 50, 78, 62, 84, 58, 70, 91, 72, 80, 68]
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())
  return (
    <>
      <PageTitle
        eyebrow={today.toLocaleUpperCase("id-ID")}
        title="Selamat pagi, Bu Rina"
        description="Berikut ringkasan aktivitas Perpustakaan Cendekia hari ini."
        action={
          <Button icon="scan" onClick={() => onNavigate("sirkulasi")}>
            Buka Meja Sirkulasi
          </Button>
        }
      />
      <div className="stats-grid">
        <Stat
          label="Pinjaman aktif"
          value="142"
          detail="+12 minggu ini"
          icon="book"
        />
        <Stat
          label="Jatuh tempo hari ini"
          value="18"
          detail="11 belum dikonfirmasi"
          tone="blue"
          icon="clock"
        />
        <Stat
          label="Terlambat"
          value="9"
          detail="3 lebih dari 30 hari"
          tone="red"
          icon="warning"
        />
        <Stat
          label="Hold siap diambil"
          value="7"
          detail="2 berakhir hari ini"
          tone="purple"
          icon="calendar"
        />
        <Stat
          label="Denda outstanding"
          value="Rp328.500"
          detail="24 anggota"
          tone="amber"
          icon="wallet"
        />
      </div>
      <div className="dashboard-grid">
        <section className="card chart-card">
          <div className="section-head">
            <div>
              <b>Aktivitas peminjaman</b>
              <span>30 hari terakhir</span>
            </div>
            <div className="legend">
              <i /> Dipinjam <i /> Dikembalikan
            </div>
          </div>
          <div className="chart-wrap">
            <div className="y-labels">
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            <div className="bar-chart">
              {bars.map((h, i) => (
                <div key={i} className="bar-pair">
                  <i style={{ height: `${h}%` }} />
                  <i style={{ height: `${Math.max(20, h - 14)}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="chart-summary">
            <span>
              <b>428</b> total dipinjam
            </span>
            <span>
              <b>396</b> dikembalikan
            </span>
            <span className="positive">↗ 8,4% dari bulan lalu</span>
          </div>
        </section>
        <section className="card action-card">
          <div className="section-head">
            <div>
              <b>Perlu tindakan hari ini</b>
              <span>5 tugas membutuhkan perhatian</span>
            </div>
            <button className="text-button">Lihat semua</button>
          </div>
          <ActionRow
            tone="danger"
            icon="warning"
            title="3 pinjaman terlambat >30 hari"
            sub="Hubungi anggota secara manual"
            cta="Tindak lanjut"
          />
          <ActionRow
            tone="warning"
            icon="mail"
            title="2 notifikasi gagal terkirim"
            sub="Pak Anton tidak memiliki email"
            cta="Periksa"
          />
          <ActionRow
            tone="purple"
            icon="clock"
            title="2 hold berakhir hari ini"
            sub="Batas pengambilan pukul 16.00"
            cta="Lihat"
          />
        </section>
      </div>
      <section className="card popular">
        <div className="section-head">
          <div>
            <b>Barang paling populer</b>
            <span>Berdasarkan jumlah peminjaman 30 hari terakhir</span>
          </div>
          <Button variant="ghost">
            Lihat katalog <Icon name="arrow" />
          </Button>
        </div>
        <div className="popular-list">
          <Popular
            rank="01"
            title="Laskar Pelangi"
            kind="Buku • Andrea Hirata"
            count="28 kali"
            available="2/5 tersedia"
          />
          <Popular
            rank="02"
            title="Proyektor Epson"
            kind="Peralatan • Multimedia"
            count="21 kali"
            available="0/2 tersedia"
          />
          <Popular
            rank="03"
            title="Bor Listrik Bosch"
            kind="Peralatan • Perkakas"
            count="17 kali"
            available="1/3 tersedia"
          />
          <Popular
            rank="04"
            title="Tenda Pesta 4×6"
            kind="Lainnya • Acara"
            count="12 kali"
            available="1/1 tersedia"
          />
        </div>
      </section>
    </>
  )
}

function ActionRow({
  tone,
  icon,
  title,
  sub,
  cta,
}: {
  tone: string
  icon: IconName
  title: string
  sub: string
  cta: string
}) {
  return (
    <div className="action-row">
      <div className={`action-icon tone-${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <b>{title}</b>
        <span>{sub}</span>
      </div>
      <Button variant="ghost">
        {cta}
        <Icon name="chevron" />
      </Button>
    </div>
  )
}
function Popular({
  rank,
  title,
  kind,
  count,
  available,
}: {
  rank: string
  title: string
  kind: string
  count: string
  available: string
}) {
  return (
    <div className="popular-item">
      <span className="rank">{rank}</span>
      <div className="item-thumb">
        <Icon name="book" />
      </div>
      <div className="grow">
        <b>{title}</b>
        <span>{kind}</span>
      </div>
      <b>{count}</b>
      <Badge tone={available.startsWith("0") ? "danger" : "success"}>
        {available}
      </Badge>
    </div>
  )
}

type CirculationTab = "pinjam" | "kembali" | "perpanjang"
function Circulation() {
  const [tab, setTab] = useState<CirculationTab>("pinjam")
  const [step, setStep] = useState<"member" | "cart" | "success">("member")
  const [scan, setScan] = useState("")
  const [condition, setCondition] = useState("Baik")
  const doScan = () => {
    if (tab === "pinjam") setStep(step === "member" ? "cart" : "cart")
    else setStep("cart")
    setScan("")
  }
  const reset = () => setStep("member")
  return (
    <>
      <PageTitle
        eyebrow="OPERASIONAL"
        title="Meja Sirkulasi"
        description="Pindai kartu anggota dan kode barang. Sistem siap menerima input scanner."
        action={
          <div className="sound-toggle">
            <Icon name="wifi" />
            <span>Bunyi scan</span>
            <i />
          </div>
        }
      />
      <div className="circulation-tabs">
        {(["pinjam", "kembali", "perpanjang"] as const).map((t, i) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => {
              setTab(t)
              reset()
            }}
          >
            <span>{t[0].toUpperCase() + t.slice(1)}</span>
            <kbd>F{i + 2}</kbd>
          </button>
        ))}
        <span className="esc">
          Batalkan <kbd>Esc</kbd>
        </span>
      </div>
      <div className={`scan-field ${step === "success" ? "scan-done" : ""}`}>
        <Icon name={step === "success" ? "check" : "scan"} size={26} />
        <label>
          <span>
            {tab === "pinjam" && step === "member"
              ? "Pindai kartu anggota"
              : tab === "pinjam"
                ? "Pindai kode barang"
                : `Pindai kode barang untuk ${tab}`}
          </span>
          <input
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doScan()}
            placeholder={
              tab === "pinjam" && step === "member"
                ? "Contoh: M-000123"
                : "Contoh: BK-000123"
            }
            autoFocus
          />
        </label>
        <Button onClick={doScan}>
          Proses <kbd>Enter</kbd>
        </Button>
      </div>
      {step === "member" && (
        <div className="circulation-empty">
          <div className="scan-illustration">
            <Icon name="scan" size={40} />
            <i />
          </div>
          <b>
            {tab === "pinjam"
              ? "Mulai dengan kartu anggota"
              : `Pindai barang yang akan di${tab}`}
          </b>
          <span>
            Scanner aktif dan siap. Anda juga dapat mengetik kode secara manual.
          </span>
          <div className="hint-row">
            <span>
              <kbd>F2</kbd> Pinjam
            </span>
            <span>
              <kbd>F3</kbd> Kembali
            </span>
            <span>
              <kbd>F4</kbd> Perpanjang
            </span>
          </div>
        </div>
      )}
      {step === "cart" && tab === "pinjam" && (
        <Checkout onFinish={() => setStep("success")} />
      )}
      {step === "cart" && tab === "kembali" && (
        <ReturnPanel
          condition={condition}
          setCondition={setCondition}
          onFinish={() => setStep("success")}
        />
      )}
      {step === "cart" && tab === "perpanjang" && (
        <RenewPanel onFinish={() => setStep("success")} />
      )}
      {step === "success" && <SuccessPanel tab={tab} onReset={reset} />}
    </>
  )
}

function MemberCard() {
  return (
    <section className="card member-panel">
      <div className="member-head">
        <Avatar name="Sinta Putri" />
        <div>
          <b>Sinta Putri</b>
          <span>M-000123 • Siswa</span>
        </div>
        <Badge tone="success">AKTIF</Badge>
      </div>
      <div className="member-meta">
        <div>
          <span>Kuota terpakai</span>
          <b>2 dari 3 buku</b>
          <div className="progress">
            <i />
          </div>
        </div>
        <div>
          <span>Total denda</span>
          <b className="success-text">Rp0</b>
        </div>
      </div>
      <div className="mini-note">
        <Icon name="calendar" />
        <span>
          Keanggotaan berlaku hingga <b>30 Jun 2027</b>
        </span>
      </div>
    </section>
  )
}
function Checkout({ onFinish }: { onFinish: () => void }) {
  const [override, setOverride] = useState(false)
  return (
    <div className="checkout-grid">
      <div>
        <MemberCard />
        <div className="alert alert-info">
          <Icon name="shield" />
          <div>
            <b>Kebijakan Siswa</b>
            <span>7 hari • Maks. 3 buku • 1× perpanjang • Rp500/hari</span>
          </div>
        </div>
      </div>
      <section className="card cart-panel">
        <div className="section-head">
          <div>
            <b>Keranjang peminjaman</b>
            <span>2 barang dipindai</span>
          </div>
          <Badge tone="info">2 ITEM</Badge>
        </div>
        <CartItem
          code="BK-000123"
          title="Laskar Pelangi"
          meta="Buku • Rak A-03"
          due="20 Okt 2026"
        />
        <CartItem
          code="EQ-000045"
          title="Bor Listrik Bosch"
          meta="Peralatan • Gudang B"
          due="16 Okt 2026"
        />
        <div className="alert alert-warning compact">
          <Icon name="warning" />
          <div>
            <b>Scan ganda diabaikan</b>
            <span>BK-000123 sudah ada di keranjang.</span>
          </div>
        </div>
        <div className="cart-total">
          <span>Jatuh tempo mengikuti kebijakan tiap barang</span>
          <Button onClick={onFinish}>
            Selesaikan peminjaman <kbd>Enter</kbd>
          </Button>
        </div>
        <button
          className="text-button override-link"
          onClick={() => setOverride(true)}
        >
          Simulasikan penolakan kuota & override
        </button>
      </section>
      {override && (
        <Modal
          title="Override batas kuota"
          onClose={() => setOverride(false)}
          danger
        >
          <div className="alert alert-danger">
            <Icon name="warning" />
            <div>
              <b>Kuota pinjam siswa (3 buku) sudah penuh.</b>
              <span>
                Kembalikan salah satu buku, atau minta Super Admin melakukan
                override.
              </span>
            </div>
          </div>
          <Field
            label="Alasan override (wajib)"
            placeholder="Jelaskan alasan pengecualian..."
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setOverride(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={() => setOverride(false)}>
              Konfirmasi override
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
function CartItem({
  code,
  title,
  meta,
  due,
}: {
  code: string
  title: string
  meta: string
  due: string
}) {
  return (
    <div className="cart-item">
      <div className="item-thumb">
        <Icon name="book" />
      </div>
      <div className="grow">
        <Badge tone="neutral">{code}</Badge>
        <b>{title}</b>
        <span>{meta}</span>
      </div>
      <div className="due">
        <span>Jatuh tempo</span>
        <b>{due}</b>
      </div>
      <button className="icon-btn">
        <Icon name="x" />
      </button>
    </div>
  )
}
function ReturnPanel({
  condition,
  setCondition,
  onFinish,
}: {
  condition: string
  setCondition: (s: string) => void
  onFinish: () => void
}) {
  return (
    <div className="return-grid">
      <section className="card return-detail">
        <div className="section-head">
          <div>
            <b>Barang ditemukan</b>
            <span>BK-000123</span>
          </div>
          <Badge tone="info">DIPINJAM</Badge>
        </div>
        <div className="return-item">
          <div className="item-thumb large">
            <Icon name="book" size={28} />
          </div>
          <div>
            <b>Laskar Pelangi</b>
            <span>Dipinjam Sinta Putri • 25 Sep 2026</span>
          </div>
        </div>
        <div className="detail-grid">
          <span>
            Jatuh tempo<b>1 Okt 2026</b>
          </span>
          <span>
            Dikembalikan<b>12 Okt 2026</b>
          </span>
          <span>
            Terlambat<b className="danger-text">10 hari kena denda</b>
          </span>
          <span>
            Estimasi denda<b>Rp6.500</b>
          </span>
        </div>
        <div className="field">
          <span>Kondisi saat kembali</span>
          <div className="choice-row">
            {["Baik", "Rusak", "Hilang"].map((c) => (
              <button
                className={condition === c ? "active" : ""}
                onClick={() => setCondition(c)}
                key={c}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="card payment-panel">
        <b>Penyelesaian denda</b>
        <span>Pilih cara menangani denda anggota.</span>
        <label className="radio-card">
          <input type="radio" name="pay" defaultChecked />
          <div>
            <b>Catat pembayaran sekarang</b>
            <span>Tunai, transfer, atau QRIS manual</span>
          </div>
        </label>
        <label className="radio-card">
          <input type="radio" name="pay" />
          <div>
            <b>Tagih nanti</b>
            <span>Denda masuk ke tunggakan anggota</span>
          </div>
        </label>
        <Button className="wide" onClick={onFinish}>
          Proses pengembalian
        </Button>
      </section>
    </div>
  )
}
function RenewPanel({ onFinish }: { onFinish: () => void }) {
  const [blocked, setBlocked] = useState(false)
  return (
    <div className="checkout-grid">
      <MemberCard />
      <section className="card cart-panel">
        <div className="section-head">
          <div>
            <b>Perpanjang pinjaman</b>
            <span>BK-000123 • Laskar Pelangi</span>
          </div>
          <Badge tone={blocked ? "danger" : "success"}>
            {blocked ? "DITOLAK" : "DAPAT DIPERPANJANG"}
          </Badge>
        </div>
        {!blocked ? (
          <>
            <div className="renew-date">
              <span>
                Jatuh tempo lama<b>13 Okt 2026</b>
              </span>
              <Icon name="arrow" />
              <span>
                Jatuh tempo baru<b>20 Okt 2026</b>
              </span>
            </div>
            <div className="alert alert-info">
              <Icon name="calendar" />
              <div>
                <b>Perpanjangan 1 dari 1</b>
                <span>Tidak ada anggota dalam antrian reservasi.</span>
              </div>
            </div>
            <Button onClick={onFinish}>Konfirmasi perpanjangan</Button>
          </>
        ) : (
          <div className="alert alert-danger">
            <Icon name="x" />
            <div>
              <b>RENEWAL_BLOCKED_BY_QUEUE</b>
              <span>
                Tidak dapat diperpanjang karena ada 2 anggota dalam antrian.
              </span>
            </div>
          </div>
        )}
        <button
          className="text-button override-link"
          onClick={() => setBlocked(!blocked)}
        >
          {blocked ? "Lihat state sukses" : "Lihat state ditolak"}
        </button>
      </section>
    </div>
  )
}
function SuccessPanel({
  tab,
  onReset,
}: {
  tab: CirculationTab
  onReset: () => void
}) {
  if (tab === "kembali")
    return (
      <div className="success-layout">
        <div className="hold-banner">
          <div className="hold-icon">
            <Icon name="calendar" size={28} />
          </div>
          <div>
            <span>PERLU TINDAKAN PETUGAS</span>
            <b>TAHAN untuk Pak Dedi</b>
            <p>
              Letakkan barang di <strong>Rak Hold H-02</strong>. Batas klaim: 15
              Okt 2026, 16.00
            </p>
          </div>
          <Badge tone="purple">
            <Icon name="clock" /> 47j 28m
          </Badge>
        </div>
        <section className="card success-card">
          <div className="success-mark">
            <Icon name="check" size={30} />
          </div>
          <div>
            <b>Pengembalian berhasil</b>
            <span>Denda Rp6.500 dicatat sebagai belum dibayar.</span>
          </div>
          <Button onClick={onReset}>Kembali berikutnya</Button>
        </section>
      </div>
    )
  return (
    <section className="card success-panel">
      <div className="success-mark">
        <Icon name="check" size={34} />
      </div>
      <div className="success-title">
        {tab === "pinjam" ? "Peminjaman berhasil" : "Perpanjangan berhasil"}
      </div>
      <p>
        {tab === "pinjam"
          ? "2 barang berhasil dipinjamkan kepada Sinta Putri."
          : "Jatuh tempo baru telah ditetapkan pada 20 Okt 2026."}
      </p>
      <div className="receipt-summary">
        <span>
          No. transaksi<b>TRX-20261013-0842</b>
        </span>
        <span>
          Diproses oleh<b>Bu Rina</b>
        </span>
        <span>
          Waktu<b>13 Okt 2026, 09.42</b>
        </span>
      </div>
      <div className="button-row">
        <Button variant="secondary" icon="printer">
          Cetak bukti
        </Button>
        <Button variant="secondary" icon="mail">
          Kirim bukti
        </Button>
        <Button onClick={onReset}>
          Anggota berikutnya <Icon name="arrow" />
        </Button>
      </div>
    </section>
  )
}

function Modal({
  title,
  children,
  onClose,
  danger,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  danger?: boolean
}) {
  return (
    <div className="modal-backdrop">
      <div className={`modal ${danger ? "modal-danger" : ""}`}>
        <div className="modal-head">
          <b>{title}</b>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const catalogRows = [
  ["BK-000123", "Laskar Pelangi", "Buku", "2 dari 5", "Rak A-03", "TERSEDIA"],
  [
    "EQ-000045",
    "Bor Listrik Bosch",
    "Peralatan",
    "1 dari 3",
    "Gudang B",
    "TERSEDIA",
  ],
  [
    "EQ-000051",
    "Proyektor Epson",
    "Peralatan",
    "0 dari 2",
    "Ruang AV",
    "DIPINJAM",
  ],
  [
    "OT-000007",
    "Tenda Pesta 4×6",
    "Lainnya",
    "1 dari 1",
    "Gudang C",
    "TERSEDIA",
  ],
]
function Catalog() {
  const [detail, setDetail] = useState(false)
  return (
    <>
      <PageTitle
        eyebrow="KOLEKSI"
        title="Katalog"
        description="Kelola judul, eksemplar, lokasi, dan status koleksi."
        action={<Button icon="plus">Tambah item</Button>}
      />
      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" />
          <input placeholder="Cari judul, penulis, ISBN, atau kode..." />
        </div>
        <Button variant="secondary" icon="filter">
          Jenis: Semua
        </Button>
        <Button variant="secondary">Kategori</Button>
        <Button variant="secondary">Lokasi</Button>
        <div className="view-toggle">
          <button className="active">Tabel</button>
          <button>Kartu</button>
        </div>
      </div>
      <section className="card table-card">
        <div className="table-summary">
          <span>
            <b>1.284</b> judul • <b>2.842</b> eksemplar
          </span>
          <Button variant="ghost" icon="download">
            Ekspor
          </Button>
        </div>
        <div className="data-table">
          <div className="tr th">
            <span>
              <input type="checkbox" />
            </span>
            <span>ITEM / KODE</span>
            <span>JENIS</span>
            <span>KETERSEDIAAN</span>
            <span>LOKASI</span>
            <span>STATUS</span>
            <span />
          </div>
          {catalogRows.map((r, i) => (
            <button className="tr" key={r[0]} onClick={() => setDetail(true)}>
              <span>
                <input type="checkbox" />
              </span>
              <span className="title-cell">
                <div className={`item-thumb color-${i}`}>
                  <Icon name="book" />
                </div>
                <i>
                  <b>{r[1]}</b>
                  <small>
                    {r[0]} •{" "}
                    {i === 0 ? "Andrea Hirata" : "Inventaris komunitas"}
                  </small>
                </i>
              </span>
              <span>{r[2]}</span>
              <span>
                <b>{r[3]}</b>
                <small>{i === 2 ? "Antrian: 2" : "Siap dipinjam"}</small>
              </span>
              <span>{r[4]}</span>
              <span>
                <Badge tone={r[5] === "TERSEDIA" ? "success" : "info"}>
                  {r[5]}
                </Badge>
              </span>
              <span>
                <Icon name="chevron" />
              </span>
            </button>
          ))}
        </div>
        <div className="pagination">
          <span>Menampilkan 1–4 dari 1.284</span>
          <div>
            <Button variant="secondary">Sebelumnya</Button>
            <Button variant="secondary">Berikutnya</Button>
          </div>
        </div>
      </section>
      {detail && (
        <Modal title="Detail item" onClose={() => setDetail(false)}>
          <div className="item-modal-head">
            <div className="item-thumb large">
              <Icon name="book" />
            </div>
            <div>
              <Badge tone="success">BUKU</Badge>
              <b>Laskar Pelangi</b>
              <span>Andrea Hirata • ISBN 978-979-3062-79-2</span>
            </div>
          </div>
          <div className="modal-tabs">
            <b>Eksemplar (5)</b>
            <span>Riwayat</span>
            <span>Antrian (1)</span>
          </div>
          {["BK-000123", "BK-000124", "BK-000125"].map((x, i) => (
            <div className="copy-row" key={x}>
              <Icon name="barcode" />
              <span>
                <b>{x}</b>
                <small>Rak A-03</small>
              </span>
              <Badge tone={i === 0 ? "success" : "info"}>
                {i === 0 ? "TERSEDIA" : "DIPINJAM"}
              </Badge>
            </div>
          ))}
          <div className="modal-actions">
            <Button variant="secondary" icon="printer">
              Cetak label
            </Button>
            <Button>Tambah eksemplar</Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function Members() {
  const [card, setCard] = useState(false)
  const people = [
    ["Sinta Putri", "M-000123", "Siswa", "2", "Rp0", "AKTIF"],
    ["Pak Dedi", "M-000097", "Warga", "1", "Rp2.500", "AKTIF"],
    ["Pak Anton", "M-000084", "Warga", "0", "Rp0", "DISUSPEND"],
    ["Bu Maya", "M-000041", "Pengurus", "3", "Rp6.500", "AKTIF"],
  ]
  return (
    <>
      <PageTitle
        eyebrow="KOMUNITAS"
        title="Anggota"
        description="Kelola data, status, dan aktivitas anggota."
        action={
          <Button icon="plus" onClick={() => setCard(true)}>
            Daftarkan anggota
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" />
          <input placeholder="Cari nama, ID anggota, atau kontak..." />
        </div>
        <Button variant="secondary" icon="filter">
          Status: Semua
        </Button>
        <Button variant="secondary">Kategori: Semua</Button>
      </div>
      <section className="card table-card">
        <div className="data-table member-table">
          <div className="tr th">
            <span>ANGGOTA</span>
            <span>KATEGORI</span>
            <span>PINJAMAN AKTIF</span>
            <span>DENDA</span>
            <span>STATUS</span>
            <span />
          </div>
          {people.map((p) => (
            <button className="tr" key={p[1]} onClick={() => setCard(true)}>
              <span className="person-cell">
                <Avatar name={p[0]} small />
                <i>
                  <b>{p[0]}</b>
                  <small>
                    {p[1]} • {p[0].replace(" ", ".").toLowerCase()}@contoh.id
                  </small>
                </i>
              </span>
              <span>{p[2]}</span>
              <span>{p[3]} item</span>
              <span>{p[4]}</span>
              <span>
                <Badge tone={p[5] === "AKTIF" ? "success" : "warning"}>
                  {p[5]}
                </Badge>
              </span>
              <span>
                <Icon name="chevron" />
              </span>
            </button>
          ))}
        </div>
      </section>
      {card && (
        <Modal title="Kartu anggota digital" onClose={() => setCard(false)}>
          <div className="member-id-card">
            <div className="id-brand">
              <div className="logo light">
                <Icon name="book" />
              </div>
              <span>
                PUSTAKA BERSAMA<small>Perpustakaan Cendekia</small>
              </span>
            </div>
            <div className="id-person">
              <Avatar name="Sinta Putri" />
              <span>
                <b>Sinta Putri</b>
                <small>Siswa • M-000123</small>
              </span>
            </div>
            <div className="qr">
              <div className="qr-grid">
                {Array.from({ length: 64 }).map((_, i) => (
                  <i
                    className={(i * 7 + (i % 5)) % 3 === 0 ? "on" : ""}
                    key={i}
                  />
                ))}
              </div>
              <span>M-000123</span>
            </div>
            <small>Berlaku hingga 30 Jun 2027</small>
          </div>
          <div className="alert alert-warning">
            <Icon name="warning" />
            <div>
              <b>Kemiripan data ditemukan</b>
              <span>
                Ada anggota bernama “Sinta P.” dengan nomor kontak serupa.
              </span>
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="secondary">Lihat detail</Button>
            <Button icon="printer">Cetak kartu</Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function Reservations() {
  return (
    <>
      <PageTitle
        eyebrow="ANTREAN"
        title="Reservasi"
        description="Pantau hold siap diambil dan antrean per judul."
      />
      <div className="subtabs">
        <button className="active">
          Siap diambil <em>7</em>
        </button>
        <button>
          Antrian per judul <em>12</em>
        </button>
      </div>
      <div className="reservation-grid">
        {[
          ["Pak Dedi", "Proyektor Epson", "EQ-000051", "47j 28m"],
          ["Sinta Putri", "Laskar Pelangi", "BK-000125", "6j 12m"],
          ["Bu Maya", "Bor Listrik Bosch", "EQ-000046", "23j 04m"],
        ].map((r, i) => (
          <section className="card hold-card" key={r[0]}>
            <div className="hold-top">
              <Badge tone={i === 1 ? "danger" : "purple"}>SIAP DIAMBIL</Badge>
              <span className={`countdown ${i === 1 ? "urgent" : ""}`}>
                <Icon name="clock" />
                {r[3]}
              </span>
            </div>
            <div className="hold-person">
              <Avatar name={r[0]} />
              <div>
                <b>{r[0]}</b>
                <span>{i === 0 ? "M-000097" : "M-000123"}</span>
              </div>
            </div>
            <div className="hold-item">
              <div className="item-thumb">
                <Icon name="book" />
              </div>
              <div>
                <b>{r[1]}</b>
                <span>
                  {r[2]} • Rak Hold H-0{i + 1}
                </span>
              </div>
            </div>
            <div className="hold-actions">
              <Button variant="secondary">Batalkan</Button>
              <Button>Tandai diambil</Button>
            </div>
          </section>
        ))}
      </div>
      <section className="card queue-card">
        <div className="section-head">
          <div>
            <b>Antrian terpanjang</b>
            <span>Urutan otomatis berdasarkan FIFO</span>
          </div>
          <Button variant="ghost">Lihat semua</Button>
        </div>
        <div className="queue-row">
          <div className="item-thumb">
            <Icon name="book" />
          </div>
          <div className="grow">
            <b>Proyektor Epson</b>
            <span>0 dari 2 tersedia • Perkiraan berikutnya 18 Okt 2026</span>
          </div>
          {["1 Pak Dedi", "2 Bu Maya", "3 Sinta Putri"].map((x) => (
            <Badge key={x} tone="neutral">
              {x}
            </Badge>
          ))}
        </div>
      </section>
    </>
  )
}

function Fines() {
  const [pay, setPay] = useState(false)
  const [receipt, setReceipt] = useState(false)
  return (
    <>
      <PageTitle
        eyebrow="KEUANGAN"
        title="Denda & Pembayaran"
        description="Catat denda dan pembayaran secara transparan."
        action={
          <Button icon="plus" onClick={() => setPay(true)}>
            Catat pembayaran
          </Button>
        }
      />
      <div className="stats-grid compact-stats">
        <Stat
          label="Belum dibayar"
          value="Rp328.500"
          detail="24 anggota"
          icon="wallet"
          tone="red"
        />
        <Stat
          label="Diterima bulan ini"
          value="Rp1.240.000"
          detail="86 transaksi"
          icon="chart"
        />
        <Stat
          label="Dihapuskan"
          value="Rp42.000"
          detail="7 transaksi"
          icon="shield"
          tone="amber"
        />
      </div>
      <section className="card table-card">
        <div className="toolbar inner">
          <div className="search-box">
            <Icon name="search" />
            <input placeholder="Cari anggota atau transaksi..." />
          </div>
          <Button variant="secondary" icon="filter">
            Status
          </Button>
        </div>
        <div className="data-table fines-table">
          {[
            [
              "Sinta Putri",
              "Laskar Pelangi",
              "12 Okt 2026",
              "Rp6.500",
              "BELUM_BAYAR",
            ],
            [
              "Pak Dedi",
              "Bor Listrik Bosch",
              "8 Okt 2026",
              "Rp2.500",
              "SEBAGIAN",
            ],
            ["Bu Maya", "Proyektor Epson", "2 Okt 2026", "Rp18.000", "LUNAS"],
          ].map((x, i) => (
            <button className="tr" onClick={() => setPay(true)} key={x[0]}>
              <span className="person-cell">
                <Avatar name={x[0]} small />
                <i>
                  <b>{x[0]}</b>
                  <small>M-000{123 - i * 20}</small>
                </i>
              </span>
              <span>
                <b>{x[1]}</b>
                <small>Dikembalikan {x[2]}</small>
              </span>
              <span>
                <b>{x[3]}</b>
                <small>
                  {i === 1
                    ? "Sisa Rp2.500"
                    : i === 0
                      ? "Grace 1 hari • bertingkat"
                      : "Lunas 3 Okt"}
                </small>
              </span>
              <span>
                <Badge
                  tone={i === 2 ? "success" : i === 1 ? "warning" : "danger"}
                >
                  {x[4]}
                </Badge>
              </span>
              <span>
                <Icon name="chevron" />
              </span>
            </button>
          ))}
        </div>
      </section>
      {pay && (
        <Modal title="Catat pembayaran denda" onClose={() => setPay(false)}>
          <div className="invoice">
            <span>Sinta Putri • M-000123</span>
            <b>
              Total denda <strong>Rp6.500</strong>
            </b>
          </div>
          <Field label="Jumlah pembayaran" value="Rp4.000" />
          <div className="field">
            <span>Metode pembayaran</span>
            <div className="choice-row four">
              {["TUNAI", "TRANSFER", "QRIS MANUAL", "LAINNYA"].map((x, i) => (
                <button className={i === 0 ? "active" : ""} key={x}>
                  {x}
                </button>
              ))}
            </div>
          </div>
          <Field
            label="Catatan (opsional)"
            placeholder="Tambahkan catatan pembayaran"
          />
          <div className="payment-result">
            <span>Setelah pembayaran</span>
            <b>SEBAGIAN • Sisa Rp2.500</b>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setPay(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                setPay(false)
                setReceipt(true)
              }}
            >
              Simpan pembayaran
            </Button>
          </div>
        </Modal>
      )}
      {receipt && (
        <Modal title="Pembayaran berhasil" onClose={() => setReceipt(false)}>
          <div className="receipt">
            <div className="success-mark">
              <Icon name="check" />
            </div>
            <b>PUSTAKA BERSAMA</b>
            <span>Perpustakaan Cendekia</span>
            <div className="receipt-line" />
            <p>
              13 Okt 2026, 10.24
              <br />
              PAY-20261013-0041
            </p>
            <div className="receipt-row">
              <span>Denda</span>
              <b>Rp6.500</b>
            </div>
            <div className="receipt-row">
              <span>Dibayar (Tunai)</span>
              <b>Rp4.000</b>
            </div>
            <div className="receipt-row total">
              <span>Sisa</span>
              <b>Rp2.500</b>
            </div>
            <small>Dicatat oleh Bu Rina</small>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" icon="mail">
              Kirim
            </Button>
            <Button icon="printer">Cetak struk</Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function Reports() {
  const reports = [
    ["Sirkulasi", "Aktivitas pinjam dan kembali", "scan"],
    ["Pinjaman & jatuh tempo", "Status pinjaman aktif", "calendar"],
    ["Keterlambatan", "Rincian dan tindak lanjut", "warning"],
    ["Rekap denda", "Tagihan dan pembayaran", "wallet"],
    ["Barang populer", "Tren penggunaan koleksi", "chart"],
    ["Inventaris", "Status dan nilai koleksi", "book"],
    ["Anggota", "Pertumbuhan dan aktivitas", "users"],
    ["Audit", "Jejak perubahan sistem", "shield"],
  ] as const
  return (
    <>
      <PageTitle
        eyebrow="ANALITIK"
        title="Laporan"
        description="Data operasional untuk keputusan komunitas."
        action={
          <Button variant="secondary" icon="download">
            Ekspor CSV
          </Button>
        }
      />
      <div className="report-filters">
        <Field label="Periode" value="1 Sep – 13 Okt 2026" />
        <Field label="Lokasi" value="Semua lokasi" />
        <Field label="Kelompok" value="Mingguan" />
        <Button>Terapkan filter</Button>
      </div>
      <div className="report-layout">
        <section className="report-menu">
          {reports.map((r, i) => (
            <button className={i === 0 ? "active" : ""}>
              <span>
                <Icon name={r[2]} />
              </span>
              <i>
                <b>{r[0]}</b>
                <small>{r[1]}</small>
              </i>
              <Icon name="chevron" />
            </button>
          ))}
        </section>
        <section className="card report-chart">
          <div className="section-head">
            <div>
              <b>Tren sirkulasi mingguan</b>
              <span>1 Sep – 13 Okt 2026</span>
            </div>
            <Badge tone="success">+8,4%</Badge>
          </div>
          <div className="line-chart">
            <svg viewBox="0 0 700 250" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0"
                    stopColor="var(--primary)"
                    stopOpacity=".22"
                  />
                  <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="grid-line"
                d="M0 50H700M0 110H700M0 170H700M0 230H700"
              />
              <path
                className="area"
                d="M0 210 C80 190,90 140,160 155 S260 100,330 125 S410 70,480 85 S590 35,700 55 V250H0Z"
              />
              <path
                className="line"
                d="M0 210 C80 190,90 140,160 155 S260 100,330 125 S410 70,480 85 S590 35,700 55"
              />
            </svg>
          </div>
          <div className="report-note">
            <Icon name="clock" />
            <span>Dibuat 13 Okt 2026, 10.30 WIB • Zona waktu Asia/Jakarta</span>
          </div>
        </section>
      </div>
    </>
  )
}

function Notifications() {
  return (
    <>
      <PageTitle
        eyebrow="OUTBOX"
        title="Notifikasi"
        description="Pantau pengiriman dan tindak lanjut manual."
      />
      <div className="subtabs">
        <button className="active">Status pengiriman</button>
        <button>
          Perlu dihubungi manual <em>3</em>
        </button>
        <button>Template</button>
      </div>
      <section className="card table-card">
        <div className="data-table notify-table">
          {[
            ["HOLD_READY", "Pak Dedi", "WhatsApp", "SENT", "13 Okt, 09.12"],
            ["REMINDER_H2", "Sinta Putri", "Email", "PENDING", "13 Okt, 09.15"],
            ["FINE_OUTSTANDING", "Pak Anton", "Email", "FAILED", "3 percobaan"],
            [
              "HOLD_READY",
              "Bu Maya",
              "WhatsApp",
              "SKIPPED",
              "Preferensi nonaktif",
            ],
          ].map((x, i) => (
            <div className="tr" key={x[0] + x[1]}>
              <span>
                <Icon name="mail" />
              </span>
              <span>
                <b>{x[0]}</b>
                <small>
                  {x[1]} • {x[2]}
                </small>
              </span>
              <span>{x[4]}</span>
              <span>
                <Badge
                  tone={
                    i === 0
                      ? "success"
                      : i === 1
                        ? "warning"
                        : i === 2
                          ? "danger"
                          : "neutral"
                  }
                >
                  {x[3]}
                </Badge>
              </span>
              <span>
                <Button variant="ghost">
                  {i === 2 ? "Coba lagi" : "Detail"}
                </Button>
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="card email-preview">
        <div className="email-head">
          <div>
            <Badge tone="info">PRATINJAU EMAIL</Badge>
            <b>Barang reservasi Anda siap diambil</b>
          </div>
          <Button variant="secondary">Edit template</Button>
        </div>
        <p>Halo Pak Dedi,</p>
        <p>
          Kabar baik! <b>Proyektor Epson</b> yang Anda reservasi sudah siap
          diambil di <b>Rak Hold H-02</b>. Mohon ambil sebelum{" "}
          <b>15 Okt 2026, pukul 16.00 WIB</b>.
        </p>
        <p>
          Jika tidak sempat, reservasi akan diteruskan kepada anggota
          berikutnya.
        </p>
        <p>
          Salam hangat,
          <br />
          <b>Perpustakaan Cendekia</b>
        </p>
      </section>
    </>
  )
}

function Settings({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState("Kebijakan pinjam")
  const sections = [
    "Organisasi",
    "Kategori anggota",
    "Kebijakan pinjam",
    "Kategori barang",
    "Lokasi",
    "Template notifikasi",
    "Hari libur",
    "Pengguna & peran",
    "Impor / Ekspor",
    "Log audit",
  ]
  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRASI"
        title="Pengaturan"
        description="Konfigurasi organisasi dan aturan operasional."
      />
      <div className="settings-layout">
        <aside className="settings-nav">
          {sections.map((s) => (
            <button
              className={section === s ? "active" : ""}
              onClick={() => setSection(s)}
            >
              {s}
              <Icon name="chevron" />
            </button>
          ))}
          <button onClick={onLogout}>
            Keluar dari akun
            <Icon name="arrow" />
          </button>
        </aside>
        <section className="card settings-content">
          <div className="section-head">
            <div>
              <b>{section}</b>
              <span>
                {section === "Kebijakan pinjam"
                  ? "Atur durasi, kuota, perpanjangan, dan denda per kategori."
                  : "Kelola konfigurasi organisasi Anda."}
              </span>
            </div>
            <Button>Simpan perubahan</Button>
          </div>
          {section === "Kebijakan pinjam" ? (
            <PolicyMatrix />
          ) : (
            <SettingsPlaceholder section={section} />
          )}
        </section>
      </div>
    </>
  )
}
function PolicyMatrix() {
  return (
    <>
      <div className="alert alert-info">
        <Icon name="shield" />
        <div>
          <b>Perubahan berlaku untuk transaksi baru</b>
          <span>
            Pinjaman aktif tetap memakai kebijakan saat transaksi dibuat.
          </span>
        </div>
      </div>
      <div className="matrix">
        <div className="matrix-row head">
          <span>KATEGORI ANGGOTA</span>
          <span>JENIS BARANG</span>
          <span>DURASI</span>
          <span>KUOTA</span>
          <span>PERPANJANGAN</span>
          <span>DENDA / HARI</span>
        </div>
        {[
          ["Siswa", "Buku", "7 hari", "3", "1×", "Rp500"],
          ["Siswa", "Peralatan", "3 hari", "1", "0×", "Rp2.000"],
          ["Guru", "Buku", "14 hari", "5", "2×", "Rp500"],
          ["Warga", "Lainnya", "3 hari", "2", "1×", "Rp5.000"],
        ].map((r) => (
          <div className="matrix-row">
            {r.map((x, i) => (
              <span className={i > 1 ? "matrix-input" : ""}>{x}</span>
            ))}
          </div>
        ))}
      </div>
      <Button variant="secondary" icon="plus">
        Tambah aturan
      </Button>
    </>
  )
}
function SettingsPlaceholder({ section }: { section: string }) {
  if (section === "Impor / Ekspor") return <ImportWizard />
  return (
    <div className="settings-form">
      <Field
        label={`Nama ${section.toLowerCase()}`}
        value={
          section === "Organisasi"
            ? "Perpustakaan Cendekia"
            : "Konfigurasi aktif"
        }
      />
      <Field label="Zona waktu" value="Asia/Jakarta (WIB)" />
      <div className="field">
        <span>Status</span>
        <div className="toggle-row">
          <i />
          <b>Aktif</b>
        </div>
      </div>
      <div className="empty-inline">
        <Icon name="settings" size={32} />
        <b>Pengaturan {section}</b>
        <span>Gunakan formulir ini untuk mengatur kebutuhan organisasi.</span>
      </div>
    </div>
  )
}
function ImportWizard() {
  return (
    <div className="import-wizard">
      <div className="steps">
        {["Unggah", "Pemetaan", "Dry-run", "Persetujuan", "Hasil"].map(
          (s, i) => (
            <span className={i < 3 ? "active" : ""}>
              <i>{i < 2 ? <Icon name="check" size={13} /> : i + 1}</i>
              {s}
            </span>
          ),
        )}
      </div>
      <div className="import-box">
        <Icon name="file" size={34} />
        <div>
          <b>Dry-run selesai</b>
          <span>Pratinjau 128 baris dari anggota.csv</span>
        </div>
        <Badge tone="success">120 VALID</Badge>
        <Badge tone="danger">8 ERROR</Badge>
      </div>
      <div className="error-list">
        <b>Error yang perlu diperbaiki</b>
        <span>Baris 14 • Email tidak valid</span>
        <span>Baris 28 • ID M-000123 sudah digunakan</span>
        <span>Baris 57 • Kategori “Murid” tidak ditemukan</span>
      </div>
      <div className="modal-actions">
        <Button variant="secondary">Unduh laporan error</Button>
        <Button>Setujui 120 baris valid</Button>
      </div>
    </div>
  )
}

function Components() {
  return (
    <>
      <PageTitle
        eyebrow="DESIGN SYSTEM • V1.0"
        title="Komponen Pustaka Bersama"
        description="Fondasi visual yang hangat, aksesibel, dan konsisten untuk seluruh produk."
      />
      <section className="token-strip">
        <div>
          <span>PRIMER</span>
          <i className="swatch primary" />
          <b>Teal 700</b>
          <small>#0F766E</small>
        </div>
        <div>
          <span>SLATE</span>
          <i className="swatch slate" />
          <b>Slate 900</b>
          <small>#0F172A</small>
        </div>
        <div>
          <span>SUKSES</span>
          <i className="swatch green" />
          <b>Green 600</b>
          <small>#16A34A</small>
        </div>
        <div>
          <span>PERINGATAN</span>
          <i className="swatch amber" />
          <b>Amber 500</b>
          <small>#F59E0B</small>
        </div>
        <div>
          <span>ERROR</span>
          <i className="swatch red" />
          <b>Red 600</b>
          <small>#DC2626</small>
        </div>
      </section>
      <div className="components-grid">
        <section className="card component-card">
          <div className="section-head">
            <div>
              <b>Tombol</b>
              <span>Primary, secondary, ghost, destructive</span>
            </div>
          </div>
          <div className="component-row">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>
        <section className="card component-card">
          <div className="section-head">
            <div>
              <b>Status barang</b>
              <span>Selalu gunakan teks bersama warna</span>
            </div>
          </div>
          <div className="component-row wrap">
            <Badge tone="success">TERSEDIA</Badge>
            <Badge tone="info">DIPINJAM</Badge>
            <Badge tone="purple">DITAHAN</Badge>
            <Badge tone="warning">RUSAK</Badge>
            <Badge tone="warning">DALAM_PERBAIKAN</Badge>
            <Badge tone="danger">HILANG</Badge>
            <Badge>DITARIK</Badge>
          </div>
        </section>
        <section className="card component-card">
          <div className="section-head">
            <div>
              <b>Form controls</b>
              <span>Label selalu terlihat dan focus ring kontras</span>
            </div>
          </div>
          <div className="form-demo">
            <Field label="Nama anggota" value="Sinta Putri" />
            <Field label="Pindai kode" placeholder="BK-000123" icon="scan" />
          </div>
        </section>
        <section className="card component-card">
          <div className="section-head">
            <div>
              <b>Feedback</b>
              <span>Success, warning, error, info</span>
            </div>
          </div>
          <div className="feedback-demo">
            <div className="alert alert-success">
              <Icon name="check" />
              <div>
                <b>Berhasil disimpan</b>
                <span>Perubahan sudah diterapkan.</span>
              </div>
            </div>
            <div className="alert alert-warning">
              <Icon name="warning" />
              <div>
                <b>Perlu diperiksa</b>
                <span>Ada data yang belum lengkap.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

type PortalPage = "home" | "search" | "detail" | "loans" | "reservations" | "profile"
function Portal({ onAdmin }: { onAdmin: () => void }) {
  const [page, setPage] = useState<PortalPage>("home")
  const [reserved, setReserved] = useState(false)
  const [renewed, setRenewed] = useState(false)
  const mobileNav = [
    ["home", "Beranda", "home"],
    ["search", "Cari", "search"],
    ["loans", "Pinjaman", "book"],
    ["reservations", "Reservasi", "calendar"],
    ["profile", "Profil", "users"],
  ] as const
  return (
    <div className="portal-page">
      <div className="portal-shell">
        <header className="portal-head">
          <div className="portal-brand">
            <div className="logo">
              <Icon name="book" />
            </div>
            <span>
              <b>Pustaka Bersama</b>
              <small>Perpustakaan Cendekia</small>
            </span>
          </div>
          <div>
            <button className="icon-btn">
              <Icon name="bell" />
              <i />
            </button>
            <Avatar name="Sinta Putri" small />
          </div>
        </header>
        <main className="portal-content">
          {page === "home" && <PortalHome navigate={setPage} />}
          {page === "search" && <PortalSearch navigate={setPage} />}
          {page === "detail" && (
            <PortalDetail
              reserved={reserved}
              onReserve={() => setReserved(true)}
              navigate={setPage}
            />
          )}
          {page === "loans" && (
            <PortalLoans renewed={renewed} onRenew={() => setRenewed(true)} />
          )}
          {page === "reservations" && <PortalReservations ready={reserved} />}
          {page === "profile" && <PortalProfile onAdmin={onAdmin} />}
        </main>
        <nav className="bottom-nav">
          {mobileNav.map(([id, label, icon]) => (
            <button
              className={
                page === id || (page === "detail" && id === "search")
                  ? "active"
                  : ""
              }
              onClick={() => setPage(id)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === "reservations" && reserved && <i />}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
function PortalHome({ navigate }: { navigate: (p: PortalPage) => void }) {
  return (
    <>
      <div className="portal-greeting">
        <span>Selamat pagi,</span>
        <b>Sinta Putri</b>
        <p>Apa yang ingin kamu pinjam hari ini?</p>
      </div>
      <button className="portal-search" onClick={() => navigate("search")}>
        <Icon name="search" />
        <span>Cari buku, alat, atau barang...</span>
      </button>
      <div className="portal-alert">
        <div>
          <Icon name="clock" />
        </div>
        <span>
          <small>SEGERA JATUH TEMPO</small>
          <b>Laskar Pelangi</b>
          <p>Jatuh tempo besok, 14 Okt 2026</p>
        </span>
        <Icon name="chevron" />
      </div>
      <div className="fine-banner">
        <Icon name="wallet" />
        <span>
          <b>Kamu punya tunggakan Rp2.500</b>
          <small>Lihat rincian dan riwayat pembayaran</small>
        </span>
        <Icon name="chevron" />
      </div>
      <div className="mobile-section-head">
        <b>Jelajahi kategori</b>
        <button>Lihat semua</button>
      </div>
      <div className="category-scroll">
        {[
          ["book", "Buku"],
          ["spark", "Perkakas"],
          ["file", "Multimedia"],
          ["calendar", "Acara"],
        ].map((x) => (
          <button>
            <span>
              <Icon name={x[0] as IconName} />
            </span>
            {x[1]}
          </button>
        ))}
      </div>
      <div className="mobile-section-head">
        <b>Baru ditambahkan</b>
        <button onClick={() => navigate("search")}>Lihat semua</button>
      </div>
      <div className="mobile-items">
        <MobileItem
          title="Laskar Pelangi"
          meta="Andrea Hirata"
          available="2 tersedia"
        />
        <MobileItem
          title="Tenda Pesta 4×6"
          meta="Perlengkapan acara"
          available="1 tersedia"
        />
      </div>
    </>
  )
}
function MobileItem({
  title,
  meta,
  available,
  onClick,
}: {
  title: string
  meta: string
  available: string
  onClick?: () => void
}) {
  return (
    <button className="mobile-item" onClick={onClick}>
      <div className="mobile-cover">
        <Icon name="book" size={28} />
      </div>
      <span>
        <b>{title}</b>
        <small>{meta}</small>
        <Badge tone={available.startsWith("0") ? "danger" : "success"}>
          {available}
        </Badge>
      </span>
      <Icon name="chevron" />
    </button>
  )
}
function PortalSearch({ navigate }: { navigate: (p: PortalPage) => void }) {
  return (
    <>
      <div className="mobile-title">
        <b>Cari koleksi</b>
        <span>Temukan buku dan barang komunitas.</span>
      </div>
      <div className="portal-search active">
        <Icon name="search" />
        <input placeholder="Cari judul atau barang..." autoFocus />
        <Icon name="filter" />
      </div>
      <div className="filter-chips">
        <button className="active">Semua</button>
        <button>Buku</button>
        <button>Peralatan</button>
        <button>Lainnya</button>
      </div>
      <span className="result-count">24 hasil ditemukan</span>
      <div className="search-results">
        <MobileItem
          title="Laskar Pelangi"
          meta="Buku • Andrea Hirata"
          available="2 dari 5 tersedia"
          onClick={() => navigate("detail")}
        />
        <MobileItem
          title="Proyektor Epson"
          meta="Multimedia • Ruang AV"
          available="0 dari 2 tersedia"
          onClick={() => navigate("detail")}
        />
        <MobileItem
          title="Bor Listrik Bosch"
          meta="Perkakas • Gudang B"
          available="1 dari 3 tersedia"
        />
        <MobileItem
          title="Tenda Pesta 4×6"
          meta="Acara • Gudang C"
          available="1 dari 1 tersedia"
        />
      </div>
    </>
  )
}
function PortalDetail({
  reserved,
  onReserve,
  navigate,
}: {
  reserved: boolean
  onReserve: () => void
  navigate: (p: PortalPage) => void
}) {
  return (
    <>
      <button className="mobile-back" onClick={() => navigate("search")}>
        <Icon name="arrow" /> Kembali
      </button>
      <div className="detail-hero">
        <div className="big-cover">
          <Icon name="book" size={56} />
        </div>
        <Badge tone="info">BUKU</Badge>
        <b>Laskar Pelangi</b>
        <span>Andrea Hirata • Bentang Pustaka</span>
      </div>
      <div className="availability-card">
        <div>
          <span>Ketersediaan</span>
          <b>0 dari 2 tersedia</b>
        </div>
        <Badge tone="danger">DIPINJAM</Badge>
        <div className="availability-bar">
          <i />
        </div>
        <small>
          <Icon name="clock" /> Perkiraan tersedia: <b>18 Okt 2026</b>
        </small>
        <em>Perkiraan dapat berubah sesuai waktu pengembalian.</em>
      </div>
      <div className="detail-copy">
        <b>Tentang koleksi</b>
        <p>
          Kisah inspiratif sepuluh anak dari Belitung yang berjuang mendapatkan
          pendidikan dalam segala keterbatasan.
        </p>
        <div>
          <span>
            Kategori<b>Novel Indonesia</b>
          </span>
          <span>
            Lokasi<b>Rak A-03</b>
          </span>
        </div>
      </div>
      {reserved ? (
        <div className="reserved-success">
          <Icon name="check" />
          <span>
            <b>Reservasi berhasil</b>
            <small>Kamu berada di posisi antrean ke-2.</small>
          </span>
          <Button onClick={() => navigate("reservations")}>Lihat</Button>
        </div>
      ) : (
        <div className="sticky-action">
          <div>
            <span>Posisi antrean berikutnya</span>
            <b>Ke-2 • sekitar 5 hari</b>
          </div>
          <Button onClick={onReserve}>Reservasi</Button>
        </div>
      )}
    </>
  )
}
function PortalLoans({
  renewed,
  onRenew,
}: {
  renewed: boolean
  onRenew: () => void
}) {
  const [blocked, setBlocked] = useState(false)
  return (
    <>
      <div className="mobile-title">
        <b>Pinjaman saya</b>
        <span>2 pinjaman aktif</span>
      </div>
      <div className="loan-card warning">
        <div className="loan-status">
          <Badge tone="warning">JATUH TEMPO BESOK</Badge>
          <span>BK-000123</span>
        </div>
        <div className="loan-main">
          <div className="mobile-cover">
            <Icon name="book" />
          </div>
          <span>
            <b>Laskar Pelangi</b>
            <small>Jatuh tempo 14 Okt 2026</small>
          </span>
        </div>
        {renewed ? (
          <div className="renewed">
            <Icon name="check" /> Diperpanjang hingga 21 Okt 2026
          </div>
        ) : (
          <Button variant="secondary" onClick={onRenew} className="wide">
            Perpanjang pinjaman
          </Button>
        )}
      </div>
      <div className="loan-card danger">
        <div className="loan-status">
          <Badge tone="danger">TERLAMBAT 3 HARI</Badge>
          <span>EQ-000045</span>
        </div>
        <div className="loan-main">
          <div className="mobile-cover tool">
            <Icon name="settings" />
          </div>
          <span>
            <b>Bor Listrik Bosch</b>
            <small>Jatuh tempo 10 Okt 2026</small>
            <strong>Estimasi denda Rp6.500</strong>
          </span>
        </div>
        {blocked ? (
          <div className="blocked">
            <Icon name="x" />
            <span>
              <b>Tidak dapat diperpanjang</b>
              <small>Ada anggota lain dalam antrean.</small>
            </span>
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setBlocked(true)}
            className="wide"
          >
            Coba perpanjang
          </Button>
        )}
      </div>
    </>
  )
}
function PortalReservations({ ready }: { ready: boolean }) {
  return (
    <>
      <div className="mobile-title">
        <b>Reservasi saya</b>
        <span>Reservasi aktif dan riwayat</span>
      </div>
      {ready && (
        <div className="ready-card">
          <div className="ready-top">
            <Badge tone="purple">SIAP DIAMBIL</Badge>
            <span>
              <Icon name="clock" /> 47j 28m
            </span>
          </div>
          <div className="loan-main">
            <div className="mobile-cover">
              <Icon name="book" />
            </div>
            <span>
              <b>Laskar Pelangi</b>
              <small>Rak Hold H-02</small>
            </span>
          </div>
          <div className="pickup">
            <Icon name="calendar" />
            <span>
              <small>Ambil sebelum</small>
              <b>15 Okt 2026, 16.00 WIB</b>
            </span>
          </div>
          <Button className="wide">Tampilkan kode pengambilan</Button>
        </div>
      )}
      <div className="queue-mobile">
        <Badge tone="warning">MENUNGGU</Badge>
        <div className="loan-main">
          <div className="mobile-cover tool">
            <Icon name="file" />
          </div>
          <span>
            <b>Proyektor Epson</b>
            <small>Posisi antrean ke-2</small>
          </span>
        </div>
        <div className="queue-track">
          <i />
          <i className="active" />
          <i />
          <i />
        </div>
        <span>Perkiraan tersedia 18 Okt 2026</span>
        <Button variant="ghost" className="wide">
          Batalkan reservasi
        </Button>
      </div>
    </>
  )
}
function PortalProfile({ onAdmin }: { onAdmin: () => void }) {
  return (
    <>
      <div className="mobile-title">
        <b>Profil</b>
        <span>Data diri dan preferensi akun.</span>
      </div>
      <div className="profile-card">
        <Avatar name="Sinta Putri" />
        <b>Sinta Putri</b>
        <span>Siswa • M-000123</span>
        <Badge tone="success">ANGGOTA AKTIF</Badge>
      </div>
      <div className="digital-card">
        <div className="id-brand">
          <div className="logo light">
            <Icon name="book" />
          </div>
          <span>
            PUSTAKA BERSAMA<small>Kartu Anggota Digital</small>
          </span>
        </div>
        <div className="qr white">
          <div className="qr-grid">
            {Array.from({ length: 64 }).map((_, i) => (
              <i className={(i * 7 + (i % 5)) % 3 === 0 ? "on" : ""} />
            ))}
          </div>
        </div>
        <b>M-000123</b>
      </div>
      <div className="profile-list">
        <button>
          <Icon name="users" />
          <span>
            <b>Data diri</b>
            <small>Nama, kontak, dan kategori</small>
          </span>
          <Icon name="chevron" />
        </button>
        <button>
          <Icon name="bell" />
          <span>
            <b>Preferensi notifikasi</b>
            <small>Email aktif • WhatsApp aktif</small>
          </span>
          <Icon name="chevron" />
        </button>
        <button onClick={onAdmin}>
          <Icon name="shield" />
          <span>
            <b>Kembali ke panel admin</b>
            <small>Mode prototipe</small>
          </span>
          <Icon name="chevron" />
        </button>
      </div>
    </>
  )
}

export default function App() {
  const [mode, setMode] = useState<"login" | "admin" | "portal">("login")
  const [demoMode, setDemoMode] = useState(!supabaseConfigured)
  const [authError, setAuthError] = useState<string | null>(null)

  async function openAdminFor(userId: string) {
    if (!supabase) return false
    const { data, error } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .in("role", ["SUPER_ADMIN", "ADMIN", "STEWARD"])
      .limit(1)
      .maybeSingle()
    if (error || !data) {
      setAuthError("Akun ini belum terdaftar sebagai staf aktif di organisasi.")
      await supabase.auth.signOut()
      return false
    }
    setDemoMode(false)
    setAuthError(null)
    setMode("admin")
    return true
  }

  useEffect(() => {
    if (!supabase) return
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void openAdminFor(data.session.user.id)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleLogin(email: string, password: string) {
    setAuthError(null)
    if (!supabase) {
      setDemoMode(true)
      setMode("admin")
      return
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setAuthError("Email atau kata sandi tidak cocok. Periksa kembali lalu coba lagi.")
      return
    }
    await openAdminFor(data.user.id)
  }

  if (mode === "login") {
    return (
      <Login
        onLogin={(email, password) => void handleLogin(email, password)}
        onPortal={() => setMode("portal")}
        errorMessage={authError}
      />
    )
  }
  if (mode === "portal") return <Portal onAdmin={() => setMode("admin")} />
  return (
    <AdminShell
      onPortal={() => setMode("portal")}
      onLogout={() => {
        void supabase?.auth.signOut()
        setMode("login")
      }}
      demoMode={demoMode}
    />
  )
}
