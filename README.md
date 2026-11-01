# PMW POLSRI STORE - Marketplace Produk Kewirausahaan Mahasiswa
> **Aplikasi Web E-Commerce Resmi Produk Kewirausahaan Mahasiswa Politeknik Negeri Sriwijaya (Polsri)**

Desain modern, minimalis, responsif, dan mudah digunakan (mengadopsi pengalaman belanja seperti Tokopedia & Shopee) dengan palet warna utama **Biru Khas Polsri**.

---

## 🚀 Fitur Utama & Arsitektur

### 1. Dua Role Pengguna Sesuai Ketentuan
1. **Admin (Pengelola PMW Polsri):**
   - Bertindak sebagai **satu-satunya penjual resmi** sekaligus **penerima seluruh dana transaksi** melalui akun merchant Midtrans terpusat.
   - Manajemen katalog produk & kategori (CRUD produk dan kategori).
   - Pengelolaan persediaan stok secara real-time dengan visual alert stok menipis.
   - Manajemen pesanan pelanggan (verifikasi pembayaran, pembaruan status: Menunggu Bayar &rarr; Diproses &rarr; Dikirim [Input Nomor Resi / ID Pickup Kampus] &rarr; Selesai).
   - Pengelolaan data pelanggan.
   - Laporan transaksi keuangan, omzet kotor, pendapatan bersih produk mahasiswa, serta ekspor file CSV.

2. **Pelanggan (Mahasiswa, Dosen & Masyarakat):**
   - Landing page modern dengan hero banner carousel dan produk unggulan.
   - Katalog produk lengkap dengan live search, filter kategori, filter jurusan pembuat (D4 TI, D4 Teknik Kimia, D3 Mesin, Akuntansi, dll.), serta sorting harga/terlaris/rating.
   - Detail produk dengan identitas mahasiswa pembuat (Nama, NIM, Jurusan), foto galeri, badge verifikasi wirausaha muda, dan ulasan.
   - Keranjang belanja interaktif dengan penyesuaian kuantitas terhadap stok.
   - Checkout pesanan dengan pilihan pengiriman:
     - *Ambil di Gerai PMW Kampus Bukit Besar (Gratis Ongkir)*
     - *Kurir Lokal Palembang Area*
     - *JNE / J&T Regular*
   - Integrasi pembayaran **Midtrans Snap** (QRIS, BCA Virtual Account, Mandiri, E-Wallet) dengan verifikasi otomatis server-side.
   - Riwayat transaksi belanja dengan status stepper, nomor resi pengiriman, serta cetak bukti pembayaran (Invoice).
   - Pengelolaan profil dan alamat pengiriman.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Database & Autentikasi:** Supabase (PostgreSQL, Supabase Auth, Row Level Security / RLS).
- **Penyimpanan Gambar:** Supabase Storage.
- **Payment Gateway:** Midtrans Snap (`midtrans-client`) dengan webhook verifikasi signature SHA-512.
- **Backend:** Next.js Route Handlers (`/api/payment/create-snap-token`, `/api/webhooks/midtrans`).

---

## 📦 Struktur Folder Proyek

```
PMW-ECommerce/
├── src/
│   ├── app/
│   │   ├── (customer storefront)
│   │   │   ├── page.tsx               # Landing page & produk unggulan
│   │   │   ├── products/              # Katalog & filter produk
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx      # Detail produk & buy box
│   │   │   ├── cart/page.tsx          # Keranjang belanja
│   │   │   ├── checkout/page.tsx      # Checkout & Midtrans Snap popup
│   │   │   ├── orders/                # Riwayat pesanan & status
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx      # Invoice & tracking nomor resi
│   │   │   ├── profile/page.tsx       # Profil pelanggan & alamat
│   │   │   ├── login/page.tsx         # Halaman login & demo switch
│   │   │   └── register/page.tsx      # Registrasi pelanggan
│   │   ├── admin/                     # Dashboard Pengelola PMW Polsri
│   │   │   ├── layout.tsx             # Sidebar & otentikasi role admin
│   │   │   ├── page.tsx               # Ringkasan KPI & grafik omzet
│   │   │   ├── products/page.tsx      # CRUD produk mahasiswa
│   │   │   ├── categories/page.tsx    # CRUD kategori
│   │   │   ├── orders/page.tsx        # Kelola pesanan & input resi
│   │   │   ├── stock/page.tsx         # Manajemen stok cepat
│   │   │   ├── customers/page.tsx     # Data pelanggan
│   │   │   └── reports/page.tsx       # Laporan transaksi & export CSV
│   │   ├── api/
│   │   │   ├── payment/create-snap-token/route.ts  # Endpoint token Snap
│   │   │   └── webhooks/midtrans/route.ts          # Webhook notifikasi
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── navbar.tsx                 # Header, search & 1-click role switcher
│   │   ├── footer.tsx                 # Kontak Polsri & merchant info
│   │   ├── product-card.tsx           # Kartu produk Tokopedia/Shopee style
│   │   ├── banner-slider.tsx          # Banner carousel PMW Polsri
│   │   └── admin/
│   │       ├── sidebar.tsx            # Menu navigasi admin
│   │       └── admin-header.tsx
│   ├── context/
│   │   └── AppContext.tsx             # State cart, orders, role & persistence
│   ├── lib/
│   │   ├── midtrans.ts                # Client Midtrans & SHA-512 verification
│   │   ├── mock-data.ts               # Data contoh produk PMW Polsri asli
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser Supabase client
│   │   │   └── server.ts              # Server Supabase client
│   │   └── utils.ts                   # Format Rupiah & styling helper
│   └── types/
│       └── index.ts                   # Definisi tipe data TypeScript
├── supabase/
│   └── schema.sql                     # Full SQL DDL, RLS, triggers & seed
├── .env.example
├── .env.local
├── package.json
└── tailwind.config.js
```

---

## ⚡ Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
- Node.js versi 18+ atau 20+ (Direkomendasikan Node.js v22)
- npm atau yarn

### 2. Clone atau Buka Folder Proyek
```bash
cd "e:\All Program\PMW-ECommerce"
```

### 3. Install Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Isi konfigurasi pada `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Midtrans Configuration (Mode Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

# App Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Catatan Pengujian:** Aplikasi telah dirancang dengan **Dual-Mode (Live & Interactive Sandbox Simulator)**. Anda dapat langsung menjalankan dan menguji seluruh alur (katalog, keranjang, checkout, pop-up pembayaran simulasi Midtrans, hingga update resi di dashboard admin) secara lancar bahkan sebelum memasukkan kunci API live!

### 5. Menyiapkan Database Supabase (Opsional untuk Mode Live)
1. Buka [Supabase Dashboard](https://supabase.com).
2. Buat proyek baru.
3. Buka menu **SQL Editor**.
4. Salin dan jalankan seluruh isi berkas `supabase/schema.sql`.
   - Skrip ini akan membuat tabel `profiles`, `categories`, `products`, `orders`, `order_items`, `cart_items`.
   - Mengaktifkan Row Level Security (RLS) serta function `is_admin()`.
   - Memasukkan data awal (seed) produk kewirausahaan mahasiswa Polsri.

### 6. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Panduan Uji Coba Demonstrasi (Testing Guide)

1. **Ganti Role Pengguna Seketika (1-Click Switcher):**
   - Pada bagian atas Navbar terdapat tombol **Role Aktif: [Pelanggan] [Admin PMW]**.
   - Klik **Pelanggan** untuk mencoba alur belanja pembeli.
   - Klik **Admin PMW** untuk langsung masuk ke Panel Pengelola PMW Polsri (`/admin`).

2. **Alur Pelanggan:**
   - Telusuri halaman utama, klik produk unggulan (misal: *Pempek Crispy Tenggiri* atau *Hoodie Polsri*).
   - Masukkan ke keranjang belanja atau klik **Beli Sekarang**.
   - Buka halaman **Checkout**, pilih metode pengiriman (*Ambil di Gerai PMW Polsri* / *Kurir Lokal*).
   - Klik **Bayar Sekarang (Midtrans Snap)** &rarr; modal pembayaran Midtrans akan terbuka (pilih QRIS atau BCA Virtual Account) &rarr; klik konfirmasi pembayaran &rarr; efek confetti akan merayakan keberhasilan transaksi & dialihkan ke halaman Invoice.
   - Buka menu **Pesanan Saya** untuk melihat status pesanan.

3. **Alur Admin:**
   - Klik **Dashboard Admin** di navbar atas.
   - Periksa ringkasan penjualan, transaksi lunas, dan stok menipis.
   - Masuk ke menu **Kelola Produk** untuk mencoba CRUD (tambah produk baru karya mahasiswa lengkap dengan nama mahasiswa & jurusan).
   - Masuk ke menu **Kelola Pesanan**, klik **Update Status** pada pesanan yang baru masuk, ubah status menjadi *Sedang Dikirim*, dan masukkan **Nomor Resi / ID Pickup**.
   - Masuk ke menu **Pengelolaan Stok** untuk menaikkan atau menurunkan kuantitas stok produk secara inline.
   - Masuk ke menu **Laporan Penjualan** dan klik tombol **Ekspor Laporan (CSV)** untuk mengunduh rekap transaksi.

---

## 🔒 Keamanan & Praktik Terbaik
- Seluruh Secret Key (seperti `MIDTRANS_SERVER_KEY` dan `SUPABASE_SERVICE_ROLE_KEY`) hanya berjalan di sisi server (Server Actions / Route Handlers) dan tidak pernah diekspos ke browser pelanggan.
- Webhook Midtrans diverifikasi menggunakan enkripsi hash `SHA-512` dari order id, status code, gross amount, dan server key.
- Row Level Security (RLS) memastikan pelanggan hanya dapat membaca dan mengelola data transaksi miliknya sendiri.
