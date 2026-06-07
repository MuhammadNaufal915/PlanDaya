# SECURITY.md — PlanDaya Security Policy

## 🛡 Gambaran Keamanan

PlanDaya dirancang dengan prinsip **Defense in Depth** untuk konteks Blue Team keamanan jaringan. Semua akses database dilakukan melalui Laravel API — React tidak pernah menyentuh Firebase secara langsung.

---

## Authentication & Authorization

### Token-Based Auth
- Token dibuat dengan `bin2hex(random_bytes(40))` — 80 karakter hex acak
- Token di-hash dengan `hash('sha256', $token)` sebelum disimpan di Firebase
- Token yang dikirim client **tidak pernah disimpan plaintext** di server
- Token expired otomatis setelah 7 hari

### Role-Based Access Control (RBAC)
| Role  | Akses                          |
|-------|--------------------------------|
| user  | `/api/devices`, `/api/schedules`, `/api/reports` |
| admin | Semua endpoint + `/api/admin/*` |

### Middleware Stack
1. `SanitizeInput` — deteksi XSS, SQLi, path traversal
2. `FirebaseAuth` — validasi Bearer token via Firebase
3. `CheckRole` — validasi role untuk admin endpoints
4. `throttle:10,1` — rate limiting 10 req/menit pada auth endpoints

---

## Input Validation

- **Semua input divalidasi di backend** menggunakan Laravel Validation
- Frontend validation hanya untuk UX, bukan sebagai security layer
- Pattern berbahaya yang diblokir:
  - `<script>`, `javascript:`, event handlers (`onclick`, `onerror`, dll.)
  - SQL keywords: `UNION SELECT`, `DROP TABLE`, `INSERT INTO`, `DELETE FROM`
  - Path traversal: `../`
  - Code execution: `exec(`, `eval(`

---

## Password Security

- Semua password di-hash menggunakan **Laravel Hash (bcrypt, cost=12)**
- Password tidak pernah dikirim atau disimpan plaintext
- Password minimum 8 karakter (enforced di backend)
- Konfirmasi password wajib saat registrasi

---

## Security Logging

Semua event keamanan dicatat ke `storage/logs/security.log` dengan format:

```
[SECURITY] LOGIN_FAILED email="test@mail.com" ip="127.0.0.1" reason="invalid_credentials"
[SECURITY] ADMIN_ACCESS_DENIED user_id=4 ip="127.0.0.1" endpoint="/api/admin/users"
[SECURITY] RATE_LIMIT_TRIGGERED ip="127.0.0.1" endpoint="/api/auth/login"
[SECURITY] SUSPICIOUS_INPUT ip="127.0.0.1" payload="<script>alert(1)</script>"
[SECURITY] LOGIN_SUCCESS email="admin@plandaya.app" ip="127.0.0.1"
[SECURITY] DEVICE_DELETED user_id=2 device_id="-abc123" ip="127.0.0.1"
```

### Firebase Security Events
Event penting juga dicatat ke Firebase path `security_events` untuk monitoring real-time.

---

## Rate Limiting

| Endpoint           | Limit        |
|--------------------|--------------|
| POST /auth/login   | 10 req/menit |
| POST /auth/register| 10 req/menit |
| Endpoint lain      | Default Laravel |

Rate limit per IP address. Jika terlampaui, response `429 Too Many Requests`.

---

## Firebase Security Rules (Produksi)

Setelah development, ganti rules Firebase ke:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

Semua akses harus melalui Laravel (server-side) menggunakan service account.

---

## Credential Management

### Yang WAJIB dijaga kerahasiaannya:
| File                                    | Risiko jika bocor              |
|-----------------------------------------|-------------------------------|
| `backend/.env`                          | APP_KEY, semua config          |
| `storage/app/firebase/*.json`           | Full Firebase admin access     |

### Best practices:
1. Gunakan `.gitignore` — sudah dikonfigurasi
2. Jangan share file `.env` via chat/email
3. Rotate service account key secara berkala
4. Gunakan environment variables di server produksi

---

## Security Headers (Rekomendasi Produksi)

Tambahkan di `public/.htaccess` atau nginx config:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

---
