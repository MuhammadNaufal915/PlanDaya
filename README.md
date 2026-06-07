# PlanDaya — Plan Smarter, Save Energy Better

PlanDaya adalah aplikasi web manajemen energi pintar yang aman dan berbasis peran (Role-Based Access Control). Aplikasi ini dirancang untuk memantau konsumsi listrik perangkat, mengatur jadwal penggunaan secara otomatis untuk efisiensi energi, serta dilengkapi dengan pengerasan keamanan tingkat tinggi guna mencegah eksploitasi siber.

Proyek ini dibangun menggunakan arsitektur **Decoupled (Decoupled Architecture)** dengan memisahkan backend API (Laravel 12) dan frontend Single Page Application (React Vite + Tailwind CSS), serta menggunakan **Firebase Realtime Database** sebagai media penyimpanan datanya.

---

## Fitur Utama

1. **Dashboard Pemantauan Energi**: Visualisasi konsumsi energi harian, mingguan, bulanan, dan identifikasi perangkat dengan penggunaan daya tertinggi.
2. **Manajemen Perangkat Pintar**: CRUD (Create, Read, Update, Delete) perangkat elektronik dengan pelindung kepemilikan.
3. **Jadwal Penggunaan (Schedules)**: Pengaturan otomatis waktu nyala/mati perangkat untuk menghemat energi.
4. **Keamanan & Logging Real-time**: Audit log aktivitas admin/user dan pencatatan peristiwa ancaman keamanan langsung ke Firebase dan log lokal.
5. **Panel Admin Khusus**: Manajemen pengguna, konfigurasi peran, audit log aktivitas, dan visualisasi ancaman keamanan secara real-time.

---

## Pengerasan Keamanan (Security Hardening)

Aplikasi ini diimplementasikan dengan mempertimbangkan prinsip keamanan terdepan:
* **Pencegahan XSS & SQL Injection**: Melalui middleware `SanitizeInput` global yang otomatis menyaring muatan HTML berbahaya dan pola query SQLi pada request body.
* **Otorisasi Berbasis Peran (RBAC)**: Pembatasan akses endpoint dan halaman admin sensitif menggunakan middleware `CheckRole`.
* **Proteksi IDOR (Insecure Direct Object Reference)**: Validasi kepemilikan perangkat dan jadwal di tingkat kontroler untuk mencegah modifikasi data milik pengguna lain.
* **Perlindungan Brute-Force**: Pembatasan laju permintaan (`Rate Limiting` 10 kali/menit) pada endpoint masuk/daftar.
* **Pencatatan Audit Log Khusus**: Pencatatan dual-logging ke `storage/logs/security.log` dan Firebase `/security_events` ketika terdeteksi aktivitas mencurigakan (XSS, SQLi, 403 Forbidden, 429 Too Many Requests).

---

## Struktur Proyek

```text
PlanDaya/
├── backend/                 # API Server Laravel 12
│   ├── app/                 # Kontroler, Middleware, Service Firebase
│   ├── bootstrap/app.php    # Registrasi Middleware & Handler Respon Keamanan
│   ├── config/              # Konfigurasi aplikasi, database, CORS, dan log
│   ├── tests/               # Pengujian Keamanan Backend (Feature Tests)
│   └── .env.example         # Template konfigurasi environment backend
├── frontend/                # Single Page Application React
│   ├── src/                 # Komponen, Halaman, Context, & API Wrapper
│   ├── tailwind.config.js   # Konfigurasi styling Tailwind CSS
│   └── .env.example         # Template konfigurasi environment frontend
├── WALKTHROUGH.md           # Panduan verifikasi aplikasi lengkap (Bahasa Indonesia)
├── SECURITY.md              # Kebijakan & praktik keamanan proyek
├── THREAT_MODEL.md          # Analisis model ancaman siber (STRIDE)
├── TESTING_SCENARIO.md      # Skenario pengujian brute force, XSS, SQLi, & IDOR
└── WAZUH_SURICATA_GUIDE.md  # Panduan integrasi Wazuh & Suricata untuk deteksi ancaman
```

---

## Panduan Instalasi & Menjalankan Aplikasi

Pastikan Anda telah menginstal **PHP >= 8.2**, **Composer**, dan **Node.js (LTS)** pada sistem Anda.

### 1. Setup Backend (Laravel)

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal dependensi PHP:
   ```bash
   composer install
   ```
3. Buat file `.env` dari template:
   ```bash
   cp .env.example .env
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
     ```
5. Jalankan server backend:
   ```bash
   php artisan serve --port=8000
   ```
   *Server backend akan aktif di `http://127.0.0.1:8000`.*

### 2. Setup Frontend (React Vite)

1. Masuk ke direktori frontend:
   ```bash
   cd ../frontend
   ```
2. Instal dependensi Node:
   ```bash
   npm install
   ```
3. Buat file `.env` dari template:
   ```bash
   cp .env.example .env
   ```
4. Pastikan variabel lingkungan mengarah ke URL backend Anda:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api
   ```
5. Jalankan server dev frontend:
   ```bash
   npm run dev
   ```
   *Aplikasi web akan aktif di `http://localhost:5173`.*

---

## Menjalankan Pengujian Otomatis

Untuk memverifikasi fungsionalitas dan ketangguhan fitur keamanan backend secara otomatis, jalankan perintah berikut di direktori `backend/`:

```bash
php artisan test
```

Perintah ini akan menjalankan 9 pengujian integrasi yang mencakup:
* Pengujian blokir input XSS (Cross-Site Scripting)
* Pengujian blokir input SQL Injection
* Otorisasi endpoint berbasis Token dan Peran (Admin vs User biasa)
* Pengujian pembatasan brute force laju login (429 Rate Limiting)

---

## Dokumen Pendukung Lainnya

Untuk detail implementasi, analisis ancaman, dan panduan pengawasan sistem, Anda dapat merujuk ke dokumen berikut:
* **[WALKTHROUGH.md](WALKTHROUGH.md)**: Demonstrasi visual berupa tangkapan layar dan rekaman alur verifikasi sistem.
* **[THREAT_MODEL.md](THREAT_MODEL.md)**: Pemetaan ancaman keamanan siber pada sistem berdasarkan metodologi STRIDE.
* **[SECURITY.md](SECURITY.md)**: Kebijakan penanganan kerentanan keamanan dan tata kelola credentials.
* **[TESTING_SCENARIO.md](TESTING_SCENARIO.md)**: Langkah pengujian penetrasi manual untuk memvalidasi sanitasi input, IDOR, dan brute force.
* **[WAZUH_SURICATA_GUIDE.md](WAZUH_SURICATA_GUIDE.md)**: Panduan langkah demi langkah untuk melakukan pemantauan log Laravel menggunakan Wazuh dan pengawasan lalu lintas jaringan menggunakan Suricata IDS.
