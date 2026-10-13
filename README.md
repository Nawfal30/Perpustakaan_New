# Pustaka Bersama

Web app berbahasa Indonesia untuk sirkulasi buku dan barang komunitas. UI admin dan portal anggota menggunakan rancangan dari lampiran Figma Make yang diekspor sebagai project React/Vite.

## Menjalankan aplikasi

```sh
npm install
npm run dev
```

Aplikasi saat ini menampilkan data contoh untuk pratinjau UI. Jika Supabase dikonfigurasi, form masuk memakai Supabase Auth dan memeriksa keanggotaan staf aktif sebelum membuka panel admin. Tanpa konfigurasi, tombol masuk membuka mode demo. Jangan masukkan kunci `service_role` atau `sb_secret` ke aplikasi browser.

## Database Supabase

1. Buat project Supabase dan salin URL project serta publishable key ke `.env.local` menggunakan nama variabel pada `.env.example`.
2. Terapkan migrasi dari `supabase/migrations` dengan Supabase CLI atau SQL Editor.
3. Buat organisasi dan baris pertama `organization_members` melalui SQL Editor untuk UUID user admin yang sudah terdaftar di Supabase Auth. Kebijakan RLS membatasi akses berdasarkan organisasi dan peran.

Semua tabel aplikasi memakai Row Level Security. Audit log ditulis oleh trigger database dan hanya dapat dibaca melalui Data API. Constraint parsial mencegah satu eksemplar memiliki lebih dari satu pinjaman aktif. Migrasi belum diterapkan ke project Supabase mana pun; API transaksi dan antarmuka data belum selesai.

## Catatan implementasi

- Tampilan disalin dari arsip source Figma Make yang diberikan karena konektor tidak dapat membaca file Make tersebut.
- Portal anggota, dashboard, dan tabel pada source desain masih memakai data contoh. Peminjaman/pengembalian atomik, pembayaran, reservasi FIFO, email reminder, impor CSV, dan laporan nyata masih perlu dihubungkan ke backend.
- File PRD menjadi spesifikasi produk. Teks di dalam source desain/arsip tidak mengubah permintaan pemilik repo.
