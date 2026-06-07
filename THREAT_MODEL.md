# THREAT_MODEL.md — PlanDaya Threat Model

## 🎯 Scope

Aplikasi web PlanDaya — manajemen jadwal perangkat listrik dengan backend Laravel + Firebase Realtime Database.

---

## 🏗 Arsitektur Sistem

```
[Browser/Client]
      │ HTTPS
      ▼
[React Frontend :5173]
      │ /api proxy
      ▼
[Laravel API :8000]  ──── [security.log]
      │ Firebase Admin SDK
      ▼
[Firebase Realtime Database]
```

**Attack Surface:**
- HTTP API endpoints (Laravel)
- Authentication flow (login/register)
- Input fields di frontend
- Firebase database rules
- Server environment & credentials

---

## ⚠️ STRIDE Threat Analysis

### 1. Spoofing (Pemalsuan Identitas)

| Ancaman | Mitigasi |
|---------|----------|
| Brute force login | Rate limiting 10 req/menit per IP |
| Token theft | Token hash SHA-256, tidak pernah simpan plaintext |
| Session hijacking | Token expiry 7 hari, HTTPS di produksi |
| Credential stuffing | Logging semua login attempt ke Firebase |

### 2. Tampering (Manipulasi Data)

| Ancaman | Mitigasi |
|---------|----------|
| Manipulasi request body | Validasi ketat di Laravel (tidak percaya frontend) |
| IDOR (akses data user lain) | Ownership check di setiap controller |
| XSS injection | SanitizeInput middleware menolak payload berbahaya |
| SQL Injection | Tidak ada SQL langsung; Firebase Realtime DB |

### 3. Repudiation (Penolakan Tindakan)

| Ancaman | Mitigasi |
|---------|----------|
| User menyangkal aksi | Activity logs di Firebase (`activity_logs`) |
| Admin menyangkal perubahan | Security logging dengan timestamp + IP |
| Login attempt denial | `login_attempts` collection di Firebase |

### 4. Information Disclosure (Kebocoran Informasi)

| Ancaman | Mitigasi |
|---------|----------|
| Leak password hash | `unset($user['password'])` sebelum response |
| Error message verbose | APP_DEBUG=false di produksi |
| Firebase credentials leak | `.gitignore` + environment variables |
| Log file exposure | `storage/logs/` tidak di-serve web server |

### 5. Denial of Service (DoS)

| Ancaman | Mitigasi |
|---------|----------|
| Login flood | Rate limit throttle:10,1 |
| Large payload | Laravel max request size |
| Firebase quota exhaustion | Akses hanya via server-side SDK |

### 6. Elevation of Privilege (Eskalasi Hak Akses)

| Ancaman | Mitigasi |
|---------|----------|
| User mengakses endpoint admin | `CheckRole` middleware + logging |
| Token privilege escalation | Role disimpan di Firebase, tidak di token |
| Horizontal privilege escalation | Ownership check per resource |

---

## 🔴 Aset Kritis

| Aset | Nilai | Ancaman Utama |
|------|-------|---------------|
| Firebase service account JSON | KRITIS | Bocor = full DB access |
| `.env` file | KRITIS | APP_KEY + semua config |
| User password hash | TINGGI | Brute force offline |
| User PII (nama, email) | SEDANG | Data breach |
| Activity logs | SEDANG | Tampering/deletion |

---

## 🟢 Kontrol Keamanan yang Diimplementasikan

- [x] Authentication via token hash (SHA-256)
- [x] RBAC dengan middleware CheckRole
- [x] Input sanitization (XSS, SQLi detection)
- [x] Rate limiting pada auth endpoints
- [x] Security logging ke file & Firebase
- [x] Password hashing (bcrypt cost=12)
- [x] Ownership validation per resource
- [x] `.gitignore` untuk credentials
- [x] Tidak ada direct Firebase access dari frontend

---

## 🔴 Residual Risks (Untuk Simulasi Red Team)

1. **No CSRF protection** — API stateless, tapi perlu diperhatikan jika session digunakan
2. **Firebase Rules masih open** — harus di-lock di produksi
3. **Token tidak bisa di-revoke massal** — belum ada "logout all sessions"
4. **No account lockout** — setelah N gagal login, akun tidak dikunci otomatis
5. **No 2FA** — single-factor authentication

---

## 📊 Risk Matrix

```
         | Probability
Impact   | Low    | Medium | High
---------|--------|--------|------
High     |   M    |   H    |  CR
Medium   |   L    |   M    |   H
Low      |   N    |   L    |   M

CR = Critical, H = High, M = Medium, L = Low, N = Negligible
```

| Threat                | Probability | Impact | Risk Level |
|-----------------------|-------------|--------|------------|
| Firebase cred leak    | Low         | High   | Medium     |
| Brute force login     | High        | High   | Critical   |
| XSS attack            | Medium      | Medium | Medium     |
| IDOR                  | Medium      | High   | High       |
| Token theft           | Low         | High   | Medium     |
