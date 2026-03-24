# Yatırım Şirketi Backoffice Web Uygulaması — Teknik Spesifikasyon

## 1. PROJE GENEL BAKIŞI

### 1.1 Amaç
Çok kiracılı (multitenant) mimariyle birden fazla yatırım şirketini (İş Yatırım, İş Bankası vb.) barındıran, borsa işlemlerini takip eden, raporlayan ve yöneten kurumsal bir backoffice platformu.

### 1.2 Teknoloji Stack

**Frontend**
- Framework: React 18 + TypeScript
- Styling: Tailwind CSS v4 + CSS Variables (dark/light theme)
- State Management: Zustand
- Data Grid: AG-Grid Enterprise (1M+ satır, server-side row model)
- Charts: TradingView Lightweight Charts + Recharts
- Router: React Router v7
- Form: React Hook Form + Zod
- HTTP: Axios + React Query (TanStack Query v5)
- Realtime: Socket.io-client (piyasa verileri için)
- Date: Day.js
- Icons: Lucide React
- Notifications: Sonner (toast)
- UI Primitives: Radix UI

**Backend (Vibe Coding için referans)**
- Runtime: Node.js 22 / Bun
- Framework: Fastify veya NestJS
- ORM: Prisma (PostgreSQL)
- Auth: JWT + Refresh Token (Redis'te saklanır)
- Cache: Redis
- Queue: BullMQ
- Realtime: Socket.io

**Veritabanı**
- Primary: PostgreSQL 16
- Cache: Redis 7
- Time-Series (piyasa verisi): TimescaleDB (PostgreSQL extension)

---

## 2. MULTİTENANT MİMARİ

### 2.1 Tenant Yapısı
```
tenant_id (UUID) → her şirket ayrı bir tenant
  ├── users (müşteriler + traderlar)
  ├── accounts (hesaplar)
  ├── assets (kıymet tanımları)
  ├── orders (emirler)
  └── transactions (gerçekleşmeler)
```

### 2.2 Tenant Tespiti
- **Subdomain bazlı:** `isbankasi.platform.com`, `isyatirim.platform.com`
- **Login ekranında şirket seçimi:** Dropdown + logo değişimi
- **URL parametresi:** `?tenant=isyatirim` (fallback)

### 2.3 Tenant Tablosu (DB)
```sql
tenants
  id UUID PK
  slug VARCHAR UNIQUE  -- 'isyatirim', 'isbankasi'
  name VARCHAR         -- 'İş Yatırım', 'İş Bankası'
  logo_url TEXT
  primary_color VARCHAR -- tema rengi
  is_active BOOLEAN
  settings JSONB       -- tenant bazlı konfigürasyon
  created_at TIMESTAMP
```

---

## 3. KİMLİK DOĞRULAMA & YETKİLENDİRME

### 3.1 Kullanıcı Türleri

| Tür | Kod | Açıklama |
|-----|-----|----------|
| Müşteri | CUSTOMER | Son kullanıcı, kendi portföyünü görür |
| Trader | TRADER | Şirket çalışanı, emir iletir |
| Backoffice Yöneticisi | BO_ADMIN | Tüm raporlar, hesap yönetimi |
| Süper Admin | SUPER_ADMIN | Tenant yönetimi, rol tanımı |

### 3.2 Login Akışı
```
1. Kullanıcı şirket seçer (tenant)
2. Müşteri / Trader girişi seçer
3. Müşteri No + Şifre girer
4. Backend: tenant_id + user_type + credentials doğrular
5. JWT (15dk) + RefreshToken (7gün) döner
6. Frontend: role bazlı dashboard yönlendirmesi
```

### 3.3 JWT Payload
```json
{
  "sub": "user_uuid",
  "tenantId": "tenant_uuid",
  "tenantSlug": "isyatirim",
  "userType": "TRADER",
  "roles": ["VIEW_REPORTS", "CREATE_ORDER"],
  "iat": 1700000000,
  "exp": 1700000900
}
```

### 3.4 Şifre Güvenliği
- bcrypt (cost factor 12)
- İlk girişte şifre değişimi zorunda
- Şifre geçmişi (son 5 şifre tekrar edilemez)
- 5 hatalı denemede hesap kilitleme (15 dakika)

---

## 4. VERİTABANI ŞEMASI

### 4.1 Kullanıcılar
```sql
users
  id UUID PK
  tenant_id UUID FK → tenants
  customer_no VARCHAR     -- müşteri no (login için)
  user_type ENUM('CUSTOMER','TRADER','BO_ADMIN','SUPER_ADMIN')
  full_name VARCHAR
  email VARCHAR
  phone VARCHAR
  password_hash VARCHAR
  is_active BOOLEAN DEFAULT true
  last_login_at TIMESTAMP
  failed_login_count INT DEFAULT 0
  locked_until TIMESTAMP
  created_at TIMESTAMP
  updated_at TIMESTAMP
  
  UNIQUE(tenant_id, customer_no)
```

### 4.2 Roller ve İzinler
```sql
roles
  id UUID PK
  tenant_id UUID FK
  name VARCHAR           -- 'Müşteri Temsilcisi', 'Risk Yöneticisi'
  description TEXT
  is_system BOOLEAN      -- sistem rolü silinemez
  
permissions
  id UUID PK
  code VARCHAR UNIQUE    -- 'REPORT_VIEW', 'ORDER_CREATE'
  name VARCHAR
  module VARCHAR         -- 'REPORTS', 'ORDERS', 'SETTINGS'
  
role_permissions
  role_id UUID FK
  permission_id UUID FK
  
user_roles
  user_id UUID FK
  role_id UUID FK
```

### 4.3 Kıymet Tanımları
```sql
assets
  id UUID PK
  tenant_id UUID FK
  asset_type ENUM('EQUITY','BOND','FUND','VIOP')
  code VARCHAR           -- 'THYAO', 'TR220520T13', 'IPB'
  name VARCHAR           -- 'Türk Hava Yolları'
  isin VARCHAR
  currency ENUM('TRY','USD','EUR')
  exchange VARCHAR       -- 'BIST', 'VİOP'
  lot_size DECIMAL
  tick_size DECIMAL
  is_active BOOLEAN
  -- SGMK için ek alanlar
  maturity_date DATE
  coupon_rate DECIMAL
  coupon_frequency INT   -- yıllık kupon sayısı
  -- VIOP için ek alanlar
  underlying_asset_id UUID FK
  contract_size DECIMAL
  expiry_date DATE
  option_type ENUM('CALL','PUT')
  strike_price DECIMAL
  -- Fon için
  fund_type VARCHAR
  nav_frequency VARCHAR  -- 'DAILY', 'WEEKLY'
  extra_data JSONB
  created_at TIMESTAMP
```

### 4.4 Hesap Tanımları
```sql
accounts
  id UUID PK
  tenant_id UUID FK
  user_id UUID FK → users
  account_no VARCHAR UNIQUE
  account_type ENUM('CASH','MARGIN','CUSTODY','FUND')
  currency ENUM('TRY','USD','EUR')
  status ENUM('ACTIVE','PASSIVE','FROZEN','CLOSED')
  cash_balance DECIMAL(20,4)
  available_balance DECIMAL(20,4)
  blocked_balance DECIMAL(20,4)
  risk_class ENUM('LOW','MEDIUM','HIGH')
  iban VARCHAR
  opened_at DATE
  closed_at DATE
  created_at TIMESTAMP
  
account_positions   -- portföy bakiyeleri
  id UUID PK
  account_id UUID FK
  asset_id UUID FK
  quantity DECIMAL(20,6)
  avg_cost DECIMAL(20,6)
  current_price DECIMAL(20,6)
  pnl DECIMAL(20,4)
  pnl_pct DECIMAL(8,4)
  updated_at TIMESTAMP
```

### 4.5 Emirler ve Gerçekleşmeler
```sql
orders
  id UUID PK
  tenant_id UUID FK
  account_id UUID FK
  asset_id UUID FK
  trader_id UUID FK       -- emri giren trader
  order_no VARCHAR UNIQUE
  order_type ENUM('MARKET','LIMIT','STOP','STOP_LIMIT')
  side ENUM('BUY','SELL')
  quantity DECIMAL(20,6)
  price DECIMAL(20,6)
  stop_price DECIMAL(20,6)
  filled_quantity DECIMAL(20,6) DEFAULT 0
  status ENUM('PENDING','PARTIAL','FILLED','CANCELLED','REJECTED')
  validity ENUM('DAY','GTC','GTD','FOK','IOC')
  valid_until DATE
  source ENUM('MANUAL','API','SYSTEM')
  rejection_reason TEXT
  created_at TIMESTAMP
  updated_at TIMESTAMP

executions          -- gerçekleşmeler
  id UUID PK
  tenant_id UUID FK
  order_id UUID FK
  account_id UUID FK
  asset_id UUID FK
  execution_no VARCHAR UNIQUE
  side ENUM('BUY','SELL')
  quantity DECIMAL(20,6)
  price DECIMAL(20,6)
  amount DECIMAL(20,4)   -- quantity * price
  commission DECIMAL(20,4)
  tax DECIMAL(20,4)
  net_amount DECIMAL(20,4)
  exchange_ref VARCHAR    -- borsa referans no
  executed_at TIMESTAMP
  settlement_date DATE    -- valör
  created_at TIMESTAMP
```

---

## 5. SAYFA & MODÜL YAPISI

### 5.1 URL Yapısı
```
/login                          → Multitenant login
/dashboard                      → Ana panel
/orders
  /orders/new                   → Emir girişi
  /orders/list                  → Emir listesi
  /orders/:id                   → Emir detayı
/portfolio
  /portfolio/positions          → Pozisyonlar
  /portfolio/pnl                → Kâr/Zarar
/reports
  /reports/daily-executions     → Bugünün gerçekleşmeleri
  /reports/account-statement    → Hesap ekstresi
  /reports/portfolio-report     → Portföy raporu
  /reports/risk-report          → Risk raporu
  /reports/commission-report    → Komisyon raporu
  /reports/tax-report           → Vergi raporu
/definitions
  /definitions/assets           → Kıymet tanımları
  /definitions/accounts         → Hesap tanımları
  /definitions/markets          → Piyasa tanımları
/admin
  /admin/users                  → Kullanıcı yönetimi
  /admin/roles                  → Rol tanımlama
  /admin/permissions            → İzin yönetimi
  /admin/tenants                → Tenant yönetimi (SUPER_ADMIN)
/settings
  /settings/profile             → Profil
  /settings/security            → Güvenlik
  /settings/notifications       → Bildirimler
```

---

## 6. EKRAN DETAYLARI

### 6.1 Login Ekranı

**Bileşenler:**
- Sol panel: Şirket logosu + animasyonlu piyasa grafiği (sahte sparkline)
- Sağ panel: Form alanları
- Şirket seçici: Dropdown (slug bazlı tenant seçimi), logo dinamik değişir
- Kullanıcı türü toggle: "Müşteri Girişi" / "Trader Girişi" (iki buton/tab)
- Müşteri No input
- Şifre input (göster/gizle toggle)
- "Beni Hatırla" checkbox
- Giriş butonu
- Şifremi Unuttum link
- Footer: versiyon numarası

**Validasyon:**
- Müşteri No: boş olamaz, alfanümerik
- Şifre: min 8 karakter
- Kilitli hesap mesajı: kalan süre countdown

**Responsive:** Mobil → tek sütun, sol panel gizlenir

---

### 6.2 Dashboard (Ana Panel)

**Layout:** Sol sidebar + üst header + ana içerik

**Header:**
- Tenant logosu
- Global arama (hesap no, müşteri adı, kıymet kodu)
- Bildirim zili (unread count badge)
- Kullanıcı avatar dropdown (profil, ayarlar, çıkış)
- Piyasa saati (BIST açık/kapalı göstergesi)

**Sidebar:**
- Rol bazlı dinamik menü (izni olmayan menüler gizlenir)
- Collapsible gruplar
- Aktif sayfa highlight
- Mini mod (collapsed, sadece ikonlar)

**Dashboard Widget'ları (sürükle-bırak ile düzenlenebilir):**
1. Portföy özet kartı (toplam değer, günlük P&L)
2. Bugünün gerçekleşme sayısı + hacmi
3. Bekleyen emirler tablosu (mini ag-grid)
4. Top 5 kazanan/kaybeden kıymetler
5. Hesap bakiyesi özeti
6. Piyasa özeti (BIST 100 mini grafik)
7. Son aktiviteler timeline

---

### 6.3 Kıymet Tanımı Ekranı

**Sekmeler:** Hisse | SGMK | Fon | VIOP

**Liste (AG-Grid):**
- Sütunlar: Kod, ISIN, Ad, Borsa, Para Birimi, Durum, İşlemler
- Filtre: her sütun için column filter
- Sıralama: tüm sütunlar
- Export: Excel, CSV (AG-Grid built-in)
- Sayfalama: server-side

**Yeni/Düzenle Form (Modal/Drawer):**

Hisse alanları:
- Kod* (BIST kodu, büyük harf)
- ISIN
- Şirket Adı*
- Sektör (dropdown)
- Lot Büyüklüğü*
- Fiyat Adımı (tick size)*
- Para Birimi*
- Borsa*
- Durum toggle

SGMK ek alanları:
- İhraçcı
- Vade Tarihi*
- Kupon Oranı
- Kupon Frekansı (3,6,12 ay)
- Nominal Değer
- Tahvil / Bono seçimi

Fon ek alanları:
- Fon Türü (Hisse, Karma, Para Piyasası, Tahvil, Altın vb.)
- Fon Kodu (TEFAS)
- Birim Pay Fiyatı Güncellenme Saati
- Alım Valörü / Satım Valörü

VIOP ek alanları:
- Dayanak Varlık (asset arama)
- Kontrat Büyüklüğü
- Vade (dropdown: mevcut vadeler)
- Uzlaşma Şekli (Nakdi/Fiziki)
- Opsiyon ise: Call/Put, Strike Fiyatı

---

### 6.4 Hesap Tanımlama Ekranı

**Liste (AG-Grid):**
- Sütunlar: Hesap No, Müşteri, Hesap Türü, Para Birimi, Nakit Bakiye, Kullanılabilir, Durum
- Quick filter (search box)
- Durum filtresi (chip'ler: Aktif/Pasif/Dondurulmuş/Kapalı)
- Satır renk kodlaması: Dondurulmuş → sarı, Kapalı → gri

**Yeni Hesap Form:**
- Müşteri Seçimi (autocomplete, müşteri no veya isim ile arama)
- Hesap Türü* (Nakit/Marjin/Saklama/Fon)
- Para Birimi*
- Risk Sınıfı*
- IBAN (Türkiye IBAN formatı validasyonu)
- Başlangıç Bakiyesi
- Açılış Tarihi (varsayılan: bugün)

**Hesap Detay Sayfası (Hesap No'ya tıklayınca):**
- Hesap bilgileri kartı
- Bakiye özeti (nakit, bloke, kullanılabilir)
- Pozisyonlar tablosu
- Emir geçmişi tablosu
- Gerçekleşme geçmişi tablosu
- Ekstre görüntüleme

---

### 6.5 Günlük Gerçekleşmeler Raporu

**Filtreler (üst bar):**
- Tarih seçici (varsayılan: bugün)
- Hesap No (autocomplete)
- Kıymet Kodu (autocomplete)
- Alış/Satış (All/Buy/Sell)
- Kıymet Türü (All/Hisse/SGMK/Fon/VIOP)

**AG-Grid Konfigürasyonu:**
```javascript
// Server-side row model (1M+ satır için şart)
rowModelType: 'serverSide'
// Infinite scrolling
infiniteInitialRowCount: 100
cacheBlockSize: 200

// Sütunlar:
[
  { field: 'execution_no', headerName: 'Gerçekleşme No', width: 160, pinned: 'left' },
  { field: 'executed_at', headerName: 'Saat', width: 90, valueFormatter: 'HH:mm:ss' },
  { field: 'account_no', headerName: 'Hesap No', width: 120 },
  { field: 'customer_name', headerName: 'Müşteri', width: 200 },
  { field: 'asset_code', headerName: 'Kıymet', width: 100 },
  { field: 'asset_name', headerName: 'Kıymet Adı', width: 200 },
  { field: 'asset_type', headerName: 'Tür', width: 80 },
  { field: 'side', headerName: 'A/S', width: 60, cellRenderer: 'SideBadge' },
  { field: 'quantity', headerName: 'Adet', width: 100, type: 'numericColumn' },
  { field: 'price', headerName: 'Fiyat', width: 100, type: 'numericColumn' },
  { field: 'amount', headerName: 'Tutar', width: 130, type: 'numericColumn' },
  { field: 'commission', headerName: 'Komisyon', width: 110, type: 'numericColumn' },
  { field: 'tax', headerName: 'Vergi', width: 100, type: 'numericColumn' },
  { field: 'net_amount', headerName: 'Net Tutar', width: 130, type: 'numericColumn', pinned: 'right' },
  { field: 'settlement_date', headerName: 'Valör', width: 100 },
  { field: 'exchange_ref', headerName: 'Borsa Ref', width: 130 }
]
```

**Alt Bar (Aggregate):**
- AG-Grid pinnedBottomRowData ile: Toplam Tutar, Toplam Komisyon, Toplam Vergi, Net Toplam
- Kayıt sayısı
- Export: Excel (streaming, büyük veri için), CSV, PDF (özet)

**Performans:**
- Debounced filter (400ms)
- Server-side filtering + sorting
- Sanal sayfalama (virtual pagination)

---

### 6.6 Diğer Raporlar

**Hesap Ekstresi:**
- Hesap seçimi + tarih aralığı
- Açılış bakiyesi
- Her gün/işlem için satır
- Kapanış bakiyesi
- PDF export (A4 formatında kurumsal şablon)

**Portföy Raporu:**
- Anlık veya tarihli (EOD) seçimi
- Hesap bazlı veya konsolidasyon
- Kıymet türüne göre gruplama (AG-Grid row grouping)
- Pie chart (kıymet dağılımı)
- Maliyet / Piyasa değeri / P&L sütunları

**Risk Raporu:**
- Konsantrasyon riski (tek kıymette %X'i aşan pozisyonlar)
- Marjin hesabı durumu
- VaR gösterimi (basit historik)
- Kaldıraç oranı

**Komisyon Raporu:**
- Trader bazlı komisyon
- Kıymet türüne göre breakdown
- Aylık/günlük karşılaştırma

**Vergi Raporu:**
- BSMV, damga vergisi
- VIOP stopaj
- Yıllık özet

---

### 6.7 Rol Tanımlama Ekranı

**Sol panel:** Rol listesi (CRUD)
- Rol adı
- Açıklama
- Sistem rolü badge'i (silinemez)
- Kullanıcı sayısı badge'i

**Sağ panel:** İzin matrisi
- Modüllere göre gruplandırılmış tree
- Her satır: izin kodu + açıklaması + checkbox
- Toplu seç (modül başlığındaki checkbox)
- Değişiklik sonrası "Kaydet" butonu aktif olur

**İzin Modülleri:**
```
DASHBOARD
  - DASHBOARD_VIEW

ORDERS (Emirler)
  - ORDER_VIEW
  - ORDER_CREATE
  - ORDER_CANCEL
  - ORDER_AMEND

PORTFOLIO (Portföy)
  - PORTFOLIO_VIEW
  - PORTFOLIO_EXPORT

REPORTS (Raporlar)
  - REPORT_DAILY_EXEC_VIEW
  - REPORT_ACCOUNT_STMT_VIEW
  - REPORT_PORTFOLIO_VIEW
  - REPORT_RISK_VIEW
  - REPORT_COMMISSION_VIEW
  - REPORT_TAX_VIEW
  - REPORT_EXPORT

DEFINITIONS (Tanımlar)
  - ASSET_VIEW
  - ASSET_CREATE
  - ASSET_EDIT
  - ASSET_DELETE
  - ACCOUNT_VIEW
  - ACCOUNT_CREATE
  - ACCOUNT_EDIT
  - ACCOUNT_STATUS_CHANGE

ADMIN (Yönetim)
  - USER_VIEW
  - USER_CREATE
  - USER_EDIT
  - USER_DELETE
  - ROLE_VIEW
  - ROLE_CREATE
  - ROLE_EDIT
  - ROLE_DELETE
  - PERMISSION_ASSIGN

SETTINGS (Ayarlar)
  - SETTINGS_VIEW
  - SETTINGS_EDIT
  - TENANT_MANAGE (sadece SUPER_ADMIN)
```

---

## 7. TEMA & TASARIM SİSTEMİ

### 7.1 Genel Yön
- **Aesthetic:** TradingView tarzı — koyu tema dominant, yoğun data-rich layout
- **Font:** JetBrains Mono (sayısal veriler) + IBM Plex Sans (UI metinleri)
- **Renk Sistemi:**

```css
:root {
  /* Dark Theme (default) */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --bg-hover: #30363d;
  --border: #30363d;
  --border-subtle: #21262d;
  
  /* Text */
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  
  /* Accent */
  --accent-blue: #58a6ff;
  --accent-green: #3fb950;     /* al/yükseliş */
  --accent-red: #f85149;       /* sat/düşüş */
  --accent-yellow: #d29922;    /* uyarı */
  --accent-orange: #db6d28;
  --accent-purple: #bc8cff;
  
  /* Tenant override (dinamik) */
  --tenant-primary: #0f62fe;   /* İş Bankası: mavi */
  --tenant-secondary: #6929c4;
  
  /* Grid */
  --grid-row-even: #161b22;
  --grid-row-odd: #0d1117;
  --grid-row-hover: #1f2937;
  --grid-row-selected: #1d3461;
}
```

### 7.2 AG-Grid Teması
```javascript
// ag-grid custom theme — dark, compact
themeClass: 'ag-theme-custom-dark'
rowHeight: 32
headerHeight: 36
```

### 7.3 Tenant Bazlı Tema
Her tenant için `--tenant-primary` CSS variable backend'den gelir ve runtime'da inject edilir:
```javascript
document.documentElement.style.setProperty('--tenant-primary', tenant.primaryColor)
```

---

## 8. LAYOUT KOMPONENTLERİ

### 8.1 AppShell
```
┌─────────────────────────────────────────────────────┐
│ Header (64px): Logo | Breadcrumb | Search | Actions │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                       │
│ (240px)  │                                          │
│          │  ┌──────────────────────────────────┐    │
│ NavItem  │  │ Page Header (title + actions)    │    │
│ NavItem  │  ├──────────────────────────────────┤    │
│ NavItem  │  │                                  │    │
│ NavGroup │  │  Content                         │    │
│  NavItem │  │                                  │    │
│  NavItem │  │                                  │    │
│          │  └──────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────┘
```

### 8.2 Ortak Komponentler

**DataGrid Wrapper:**
- AG-Grid sarmalayıcısı
- Loading skeleton
- Empty state
- Error state
- Toolbar (filtre + export butonları)
- Kayıt sayısı göstergesi

**FilterBar:**
- Yatay filtre çubuğu
- Her filtre bir chip olarak gösterilir
- "Temizle" butonu

**StatusBadge:**
- `variant: success | warning | danger | info | neutral`
- Renk kodlanmış pill

**CurrencyCell / NumericCell:**
- Sağa hizalanmış
- Pozitif: yeşil, Negatif: kırmızı
- Bin ayracı + ondalık

**SideBadge:**
- AL: yeşil arka plan
- SAT: kırmızı arka plan

**ConfirmDialog:**
- Radix Dialog üzerine
- İşlem açıklaması
- Tehlikeli işlemler için kırmızı confirm butonu

---

## 9. API ENDPOINT TASARIMI

### 9.1 Auth
```
POST /api/v1/auth/login
  body: { tenantSlug, userType, customerNo, password }
  res:  { accessToken, refreshToken, user, permissions }

POST /api/v1/auth/refresh
  body: { refreshToken }
  res:  { accessToken }

POST /api/v1/auth/logout
DELETE /api/v1/auth/sessions/:id
```

### 9.2 Assets (Kıymetler)
```
GET    /api/v1/assets?type=EQUITY&page=1&pageSize=50&sort=code&search=THY
POST   /api/v1/assets
GET    /api/v1/assets/:id
PUT    /api/v1/assets/:id
DELETE /api/v1/assets/:id
PATCH  /api/v1/assets/:id/status
```

### 9.3 Accounts (Hesaplar)
```
GET    /api/v1/accounts
POST   /api/v1/accounts
GET    /api/v1/accounts/:id
PUT    /api/v1/accounts/:id
PATCH  /api/v1/accounts/:id/status
GET    /api/v1/accounts/:id/positions
GET    /api/v1/accounts/:id/orders
GET    /api/v1/accounts/:id/executions
GET    /api/v1/accounts/:id/statement?from=&to=
```

### 9.4 Reports
```
GET /api/v1/reports/daily-executions
  query: date, accountNo, assetCode, side, assetType
  query: page, pageSize, sort, sortDir
  res: { data: [...], total, aggregates: { totalAmount, commission, tax } }

GET /api/v1/reports/portfolio?accountId=&date=
GET /api/v1/reports/commission?from=&to=&traderId=
GET /api/v1/reports/tax?year=&accountId=
GET /api/v1/reports/export/:type  (stream, xlsx/csv)
```

### 9.5 Admin
```
GET    /api/v1/admin/users
POST   /api/v1/admin/users
GET    /api/v1/admin/roles
POST   /api/v1/admin/roles
PUT    /api/v1/admin/roles/:id/permissions  body: { permissionIds: [] }
GET    /api/v1/admin/permissions
```

### 9.6 Realtime (WebSocket Events)
```javascript
// Client subscribe
socket.emit('subscribe:prices', ['THYAO', 'ASELS', 'GARAN'])
socket.emit('subscribe:executions', { accountId })

// Server → Client
socket.on('price:update', { assetCode, price, change, changePct, time })
socket.on('execution:new', { executionId, accountId, ... })
socket.on('order:status', { orderId, status })
```

---

## 10. FRONTEND PROJE YAPISI

```
src/
├── app/
│   ├── routes/                    # React Router lazy routes
│   ├── providers/                 # QueryClient, Auth, Theme
│   └── App.tsx
├── features/
│   ├── auth/
│   │   ├── components/LoginForm.tsx
│   │   ├── hooks/useAuth.ts
│   │   └── stores/authStore.ts
│   ├── dashboard/
│   ├── orders/
│   ├── portfolio/
│   ├── reports/
│   │   ├── daily-executions/
│   │   │   ├── DailyExecutionsPage.tsx
│   │   │   ├── ExecutionsGrid.tsx    # AG-Grid config
│   │   │   ├── ExecutionFilters.tsx
│   │   │   └── hooks/useExecutions.ts
│   │   ├── portfolio-report/
│   │   └── account-statement/
│   ├── definitions/
│   │   ├── assets/
│   │   │   ├── AssetsPage.tsx
│   │   │   ├── AssetGrid.tsx
│   │   │   ├── AssetForm/
│   │   │   │   ├── AssetFormModal.tsx
│   │   │   │   ├── EquityFields.tsx
│   │   │   │   ├── BondFields.tsx
│   │   │   │   ├── FundFields.tsx
│   │   │   │   └── VIOPFields.tsx
│   │   │   └── hooks/useAssets.ts
│   │   └── accounts/
│   └── admin/
│       ├── users/
│       ├── roles/
│       │   ├── RolesPage.tsx
│       │   ├── RoleList.tsx
│       │   └── PermissionMatrix.tsx
│       └── tenants/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumb.tsx
│   ├── data-grid/
│   │   ├── DataGrid.tsx            # AG-Grid wrapper
│   │   ├── cell-renderers/
│   │   │   ├── CurrencyCell.tsx
│   │   │   ├── SideBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── ActionCell.tsx
│   │   └── toolbar/GridToolbar.tsx
│   ├── ui/                         # Radix-based primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── DatePicker.tsx
│   │   ├── Tabs.tsx
│   │   └── ConfirmDialog.tsx
│   └── charts/
│       ├── MiniSparkline.tsx
│       └── PieBreakdown.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts               # Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── assets.api.ts
│   │   ├── accounts.api.ts
│   │   └── reports.api.ts
│   ├── socket/
│   │   └── socket.ts
│   ├── formatters/
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── number.ts
│   └── constants/
│       ├── permissions.ts
│       └── enums.ts
├── hooks/
│   ├── usePermission.ts            # hasPermission('ORDER_CREATE')
│   ├── useCurrentUser.ts
│   └── useTenant.ts
├── stores/
│   ├── authStore.ts                # Zustand
│   └── uiStore.ts
└── styles/
    ├── globals.css                 # CSS variables
    ├── ag-grid-theme.css
    └── tailwind.config.ts
```

---

## 11. GÜVENLİK GEREKSİNİMLERİ

- **HTTPS:** Zorunlu (TLS 1.3)
- **CORS:** Sadece tenant domainlerine izin ver
- **Rate Limiting:** Login endpoint'i: 10 istek/dk/IP
- **CSRF:** Cookie tabanlı çift submit pattern
- **XSS:** DOMPurify ile sanitize, CSP header
- **SQL Injection:** Prisma ORM parametreli sorgular
- **Audit Log:** Tüm yazma işlemleri loglanır (kim, ne zaman, ne değişti)
- **Session:** Concurrent session limiti (max 3)
- **Sensitive Data:** Şifre hash'i hiçbir zaman response'a eklenmez

---

## 12. PERFORMANS GEREKSİNİMLERİ

- **AG-Grid:** Server-side row model, virtual scrolling — 1M satır sorunsuz
- **Code Splitting:** Route bazlı lazy loading
- **Bundle:** Vite + Rollup, chunk splitting
- **API:** Pagination, cursor-based büyük veri setleri
- **Cache:** React Query ile 5dk stale time (raporlar), 30sn (piyasa verisi)
- **Export:** Streaming Excel (exceljs streaming API), tarayıcıyı bloklamaz
- **Lighthouse Score:** >85 performans (FCP < 1.5s)

---

## 13. HATA YÖNETİMİ

**Global Error Boundary:** React ErrorBoundary
**API Hataları:**
```javascript
// Interceptor pattern
401 → Token refresh → Retry → Login yönlendirmesi
403 → "Bu işlem için yetkiniz yok" toast
422 → Form validation hataları field'lara map'lenir
500 → "Beklenmeyen bir hata oluştu" toast + Sentry log
Network Error → "Sunucuya bağlanılamıyor" banner
```

---

## 14. TEST STRATEJİSİ

**Unit:** Vitest — formatter fonksiyonları, hook'lar
**Integration:** React Testing Library — form submit, filter
**E2E:** Playwright — login flow, rapor filtrele, excel export
**API:** Supertest — endpoint'ler, auth, permissions

---

## 15. DEPLOYMENT

```
Frontend: Vercel veya AWS CloudFront + S3
Backend: Docker container → AWS ECS veya Railway
DB: AWS RDS PostgreSQL (Multi-AZ)
Cache: AWS ElastiCache Redis
CDN: CloudFront (static assets)
Env: dev → staging → production
```

---

## 16. VİBECODING ARAÇLARI İÇİN ÖZEL NOT

Bu spesifikasyonu bir vibe coding aracına (Lovable, Bolt, v0 vb.) verirken şu sırayı öner:

1. **Önce:** Auth + Tenant seçimi + Login ekranı
2. **Sonra:** AppShell (layout, sidebar, header)
3. **Sonra:** Rol/İzin sistemi
4. **Sonra:** Kıymet Tanımı CRUD
5. **Sonra:** Hesap Tanımı CRUD
6. **Sonra:** AG-Grid entegrasyonu + Günlük Gerçekleşmeler raporu
7. **Son:** Diğer raporlar, dashboard widget'ları

Her aşamada şunu ekle:
> "Tailwind CSS dark theme kullan. TradingView esintili, data-dense, koyu arka plan (#0d1117). Font: IBM Plex Sans. AG-Grid Enterprise server-side row model. TypeScript strict mod. React Query v5."
