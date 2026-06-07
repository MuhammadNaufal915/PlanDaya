# Walkthrough - Pembangunan Aplikasi Web PlanDaya

PlanDaya adalah aplikasi manajemen energi yang aman dan menggunakan kontrol akses berbasis peran (role-based access control). Aplikasi ini memiliki backend Laravel yang terintegrasi dengan Firebase Realtime Database sebagai media penyimpanan, middleware khusus untuk pengerasan keamanan (XSS, SQLi, IDOR, dan RBAC), serta frontend React Vite yang responsif.

Berikut adalah ringkasan dari pencapaian, fitur, implementasi keamanan, hasil pengujian, dan media verifikasi.

---

## Tinjauan Teknis & Pencapaian

### 1. Arsitektur Backend & Pengerasan API
* **Database Driver**: Membangun wrapper service `FirebaseService` untuk memetakan query CRUD REST ke Firebase Realtime Database.
* **Autentikasi**: Autentikasi berbasis token dengan pelacakan token lokal yang di-hash menggunakan SHA-256.
* **Kontrol Akses Berbasis Peran (RBAC)**: Mengimplementasikan otorisasi peran pada tingkat rute untuk membatasi akses endpoint sensitif hanya bagi peran `admin` melalui middleware `CheckRole`.
* **Log Keamanan**: Mengonfigurasi pencatatan log ganda menggunakan `SecurityLogger` khusus yang menyimpan kejadian kritis ke file lokal `storage/logs/security.log` dan Firebase pada direktori `/security_events`.
* **Batasan CORS**: Mengonfigurasi dan memperketat pengaturan `config/cors.php` agar hanya mengizinkan permintaan dari asal frontend yang ditentukan (`FRONTEND_URL` pada variabel lingkungan/env).

### 2. Pengembangan & Desain Frontend
* **Sistem Desain**: Antarmuka dasbor responsif dengan tema gelap, transisi yang halus, dan panel bergaya glassmorphic.
* **Halaman yang Dikembangkan**:
  * **Landing Page**: Visualisasi berdampak tinggi yang menampilkan fitur-fitur aplikasi.
  * **Alur Autentikasi**: Halaman masuk (login) dan pendaftaran (register) yang terhubung dengan API Laravel.
  * **Dasbor**: Menampilkan rincian statistik konsumsi energi, perangkat terhubung langsung, dan aksi cepat.
  * **Manajemen Perangkat**: Membuat, melihat, memperbarui, dan menghapus perangkat pintar.
  * **Jadwal (Schedules)**: Mengatur rutinitas perencanaan energi/timer khusus untuk setiap perangkat.
  * **Analitik & Laporan**: Memvisualisasikan metrik energi dalam rentang harian, mingguan, bulanan, dan perangkat teratas.
  * **Panel Admin**: Halaman khusus admin untuk memeriksa log pengguna secara langsung, peran aktif, dan peristiwa keamanan secara real-time.

---

## Implementasi Pengerasan Keamanan

* **Pengerasan Terhadap XSS & SQL Injection**: Mengimplementasikan middleware sanitasi input global (`SanitizeInput`) yang memeriksa body request dan memblokir muatan HTML mentah, tag `<script>`, serta pola sintaksis SQLi umum dengan respons standar `422 Unprocessable Content`.
* **Perlindungan IDOR**: Memvalidasi kepemilikan perangkat dan jadwal di controller sebelum melakukan pembaruan atau penghapusan data.
* **Perlindungan Brute-Force**: Menambahkan batas `throttle:10,1` pada endpoint masuk (login) dan pendaftaran (register). Jika batas terlampaui, backend akan mengembalikan respons kustom 429 dan mencatat peristiwa pembatasan tersebut melalui `SecurityLogger` ke `/security_events` di Firebase serta `security.log`.

---

## Validasi dan Pengujian

### Pengujian Otomatis (Test Suite)
Menjalankan suite pengujian fitur otomatis untuk memvalidasi semua batasan keamanan dan autentikasi utama. Seluruh 9 pengujian berhasil dilalui:

```bash
php artisan test
```

**Hasil:**
* `XSS payload blocked by SanitizeInput` - **BERHASIL (PASS)**
* `SQLi payload blocked by SanitizeInput` - **BERHASIL (PASS)**
* `Clean registration passes middleware` - **BERHASIL (PASS)**
* `Protected route requires token` - **BERHASIL (PASS)**
* `Invalid token rejected` - **BERHASIL (PASS)**
* `Non-admin cannot access admin endpoints` - **BERHASIL (PASS)**
* `Brute-force login triggers 429 rate limit` - **BERHASIL (PASS)**

### Pengujian Koneksi Langsung
* Pengujian Firebase RTDB:
  * Mengakses `GET /api/firebase-test` menghasilkan respons `{"success":true,"message":"Firebase connected successfully"}` yang membuktikan kredensial konfigurasi Firebase telah terautentikasi dengan benar.

---

## Verifikasi Visual

Berikut adalah rekaman alur verifikasi aplikasi web dan tangkapan layar dari halaman frontend yang aktif.

### Rekaman Aplikasi
Rekaman walkthrough untuk memverifikasi navigasi landing page, perutean alur masuk (login), dan pemuatan tata letak awal:

![Verifikasi Aplikasi Walkthrough](C:\Users\Muhammad Naufal\.gemini\antigravity-ide\brain\c076e5bb-93b3-44e7-b5d1-9a25ff84ca3a\plandaya_app_verify_1780842912409.webp)

### Tangkapan Layar Antarmuka
- [Landing Page](C:\Users\Muhammad Naufal\.gemini\antigravity-ide\brain\c076e5bb-93b3-44e7-b5d1-9a25ff84ca3a\landing_page_1780842936927.png)
- [Login Page](C:\Users\Muhammad Naufal\.gemini\antigravity-ide\brain\c076e5bb-93b3-44e7-b5d1-9a25ff84ca3a\login_page_1780842952790.png)
