# Pustaka Bersama

Web app berbahasa Indonesia untuk manajemen katalog buku dan barang komunal, anggota, sirkulasi, reservasi, dan denda. Zona waktu awal: `Asia/Jakarta`; seluruh nominal Rupiah disimpan sebagai integer.

## Status implementasi

**UI dan fondasi backend sudah berada di repository. Belum siap untuk transaksi produksi sampai proyek Supabase dibuat, kredensial dikonfigurasi, migrasi/bootstrap dijalankan, dan pengujian penerimaan dilakukan.**

- Login Supabase Auth dan pemeriksaan membership staf aktif.
- Dashboard: kartu ringkasan mengambil statistik dari Supabase setelah pengguna staf berhasil login.
- Katalog: membaca judul dan eksemplar aktual; tambah koleksi memakai RPC database.
- Anggota: daftar aktual dan pendaftaran via RPC; kategori anggota dibaca dari database.
- Meja sirkulasi: alur scan; checkout atomik, return, renew memakai RPC yang memvalidasi keanggotaan, denda, kuota, status eksemplar, kebijakan dan antrian hold.
- Migrasi database: RLS, batas unik peminjaman aktif per copy, audit log melalui trigger, organisasi/anggota, koleksi, kebijakan, denda/pembayaran/outbox notifikasi.
- Static checks untuk tabel, RLS dan RPC; GitHub Actions menjalankan typecheck dan build.

Bagian portal anggota, UI pembayaran denda, laporan, ekspor/impor CSV, job terjadwal, dan pengiriman email masih perlu integrasi lanjutan. Ringkasan/grafik non-inti yang belum bersumber dari backend tetap bersifat contoh UI. Jangan gunakan angka demo sebagai data operasional.

## Menjalankan lokal

Gunakan Node.js 22.12+ dan npm:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan URL project dan publishable key Supabase. Jangan pernah memasukkan `service_role`, `sb_secret`, atau kredensial server ke variabel `VITE_*` karena variabel Vite terekspos ke browser.

```sh
npm run test:schema
npm run typecheck
npm run build
```

## Supabase

Jalankan berurutan pada proyek kosong:

1. Buat proyek Supabase dan siapkan akun admin melalui Authentication.
2. Terapkan `supabase/migrations/20261014000000_initial_schema.sql`.
3. Terapkan `supabase/migrations/20261014010000_domain_transactions.sql`.
4. Buka `supabase/bootstrap.sql`, ganti email placeholder `admin@example.com` dengan email admin yang benar, lalu jalankan **satu kali** melalui SQL Editor. Script ini membuat organisasi, akses Super Admin, kategori anggota/koleksi, lokasi, kebijakan pinjam, dan template notifikasi.
5. Simpan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di `.env.local` dan di Environment Variables Vercel untuk Preview/Production.
6. Verifikasi akses/RLS dengan akun admin dan akun anggota terpisah. Jangan masukkan data nyata sampai seluruh test concurrency dan acceptance selesai.

RPC transaksi kritis: `checkout_copies`, `return_copy`, `renew_copy`, `record_payment`. Database menolak salinan kode eksemplar duplikat untuk pinjaman aktif serta menulis audit log otomatis. Fungsi pembayaran tersedia di database; integrasi UI dan struk pembayaran masih tahap berikutnya.

## Deployment

Repository: https://github.com/Nawfal30/Perpustakaan_New

Konfigurasi build Vite: perintah `npm run build`, output `dist`. Push pada branch `main` akan membangun ulang deployment jika repository terhubung ke Vercel. Set variabel Supabase pada Vercel setelah proyek Supabase dibuat; jangan pernah commit file `.env.local`.

## Catatan produk

PRD sumber menetapkan satu eksemplar tidak boleh dipinjam bersamaan, kebijakan berbeda per kategori anggota dan jenis barang, denda deterministik, antrean reservasi FIFO, notifikasi dengan deduplikasi, dan audit. Perlu integration test PostgreSQL nyata serta UAT sebelum MVP dipakai di lokasi pilot.
