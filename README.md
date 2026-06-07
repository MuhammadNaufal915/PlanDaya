# PlanDaya 🔋

> **Plan Smarter, Save Energy Better.**

PlanDaya adalah aplikasi manajemen jadwal perangkat elektronik yang membantu pengguna mengatur konsumsi listrik secara efisien, hemat, dan terkontrol. Dibangun sebagai proyek **Blue Team keamanan jaringan**.

---

## 🧰 Stack Teknologi

| Layer       | Teknologi                          |
|-------------|------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS       |
| Backend     | Laravel 12 (REST API)              |
| Database    | Firebase Realtime Database         |
| Auth        | Token-based (Firebase-backed)      |
| Monitoring  | Wazuh + Suricata (opsional)        |

> ⚠️ Firebase diakses **hanya melalui Laravel**, bukan langsung dari React.

---

## 📁 Struktur Project

```
PlanDaya/
├── backend/     # Laravel 12 REST API
└── frontend/    # React + Vite + Tailwind
```

---

## ⚙️ Install Backend Laravel

### 1. Masuk ke direktori backend

```bash
cd backend
```

### 2. Install dependencies PHP

```bash
composer install
```

### 3. Copy file environment

```bash
cp .env.example .env
```

### 4. Generate application key

```bash
php artisan key:generate
```

### 5. Jalankan migrasi (untuk session/cache SQLite)

```bash
php artisan migrate
```

---

## 🔥 Setup Firebase Realtime Database

### 1. Buat project Firebase

- Buka [Firebase Console](https://console.firebase.google.com/)
- Buat project baru
- Aktifkan **Realtime Database** (bukan Firestore)
- Set rules ke mode `test` dulu untuk development:
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```

### 2. Generate Service Account

- Buka **Project Settings → Service Accounts**
- Klik **Generate New Private Key**
- Download file JSON

---

## 📄 Menaruh Service Account JSON

Taruh file JSON ke:

```
backend/storage/app/firebase/firebase-service-account.json
```

> ⚠️ **File ini TIDAK boleh di-push ke GitHub!** Sudah ada di `.gitignore`.

---

## 🔧 Konfigurasi .env

Edit `backend/.env`:

```env
APP_NAME=PlanDaya
APP_URL=http://localhost:8000

FIREBASE_CREDENTIALS=storage/app/firebase/firebase-service-account.json
FIREBASE_DATABASE_URL=https://NAMA-DATABASE.firebaseio.com/
```

Ganti `NAMA-DATABASE` dengan nama database Firebase Anda.

> ℹ️ Cek nama database di Firebase Console → Realtime Database → URL di atas editor.

---

## 🚀 Menjalankan Backend Laravel

```bash
cd backend
php artisan serve
```

Laravel akan berjalan di: **http://localhost:8000**

---

## 🧪 Test Endpoint Firebase

```bash
curl http://localhost:8000/api/firebase-test
```

Response sukses:

```json
{
  "success": true,
  "message": "Firebase connected successfully",
  "data": {
    "id": "-abc123xyz",
    "message": "Laravel connected to Firebase Realtime Database",
    "created_at": "2025-06-07 14:00:00"
  }
}
```

Jika berhasil, data akan muncul di Firebase Console → Realtime Database → `test_connections`.

---

## 🎨 Menjalankan Frontend React

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: **http://localhost:5173**

> Frontend berkomunikasi dengan Laravel via `/api` proxy (sudah dikonfigurasi di `vite.config.js`).

---

## 📡 Daftar Endpoint API

| Method | Endpoint                    | Auth    | Keterangan          |
|--------|-----------------------------|---------|---------------------|
| GET    | /api/firebase-test          | ❌      | Test koneksi        |
| POST   | /api/auth/register          | ❌      | Registrasi          |
| POST   | /api/auth/login             | ❌      | Login               |
| POST   | /api/auth/logout            | ✅      | Logout              |
| GET    | /api/auth/me                | ✅      | Info user           |
| GET    | /api/devices                | ✅      | List perangkat      |
| POST   | /api/devices                | ✅      | Tambah perangkat    |
| PUT    | /api/devices/{id}           | ✅      | Update perangkat    |
| DELETE | /api/devices/{id}           | ✅      | Hapus perangkat     |
| GET    | /api/schedules              | ✅      | List jadwal         |
| POST   | /api/schedules              | ✅      | Tambah jadwal       |
| GET    | /api/reports/daily          | ✅      | Laporan harian      |
| GET    | /api/reports/monthly        | ✅      | Laporan bulanan     |
| GET    | /api/reports/top-devices    | ✅      | Top perangkat boros |
| GET    | /api/admin/dashboard        | 🛡 Admin | Dashboard admin    |
| GET    | /api/admin/users            | 🛡 Admin | Manajemen user     |
| GET    | /api/admin/logs             | 🛡 Admin | Activity log       |
| GET    | /api/admin/security-events  | 🛡 Admin | Security events    |

---

## ⛔ File yang TIDAK boleh di-push ke GitHub

| File                                           | Alasan                    |
|------------------------------------------------|---------------------------|
| `backend/.env`                                 | App secrets & DB config   |
| `backend/storage/app/firebase/*.json`          | Firebase service account  |
| `backend/vendor/`                              | Composer packages         |
| `frontend/node_modules/`                       | NPM packages              |
| `backend/storage/logs/*`                       | Log sensitif              |

---

## 🛡 Keamanan

Lihat [SECURITY.md](SECURITY.md) untuk detail security requirements.  
Lihat [THREAT_MODEL.md](THREAT_MODEL.md) untuk threat modeling.  
Lihat [TESTING_SCENARIO.md](TESTING_SCENARIO.md) untuk skenario pengujian Red Team vs Blue Team.
