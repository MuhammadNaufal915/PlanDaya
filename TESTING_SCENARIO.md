# TESTING_SCENARIO.md — Red Team vs Blue Team

## 🎯 Tujuan Pengujian

Dokumen ini mendefinisikan skenario pengujian serangan (Red Team) dan pertahanan (Blue Team) untuk aplikasi PlanDaya dalam konteks mata kuliah Keamanan Jaringan.

---

## 🔧 Environment Setup

```
Target   : http://localhost:8000 (Laravel API)
Frontend : http://localhost:5173 (React)
Database : Firebase Realtime Database
Tools    : curl, Burp Suite, Postman, Wazuh, Suricata
```

---

## 🔴 SKENARIO RED TEAM

### TS-01: Brute Force Login

**Tujuan:** Mendapatkan akses dengan menebak password  
**Tools:** curl, Hydra, Burp Suite Intruder

```bash
# Percobaan brute force dengan curl
for i in {1..20}; do
  curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@plandaya.app","password":"password'$i'"}' | jq .
  sleep 0.1
done
```

**Expected Red Team Result:** Setelah 10 percobaan dalam 1 menit → HTTP 429

**Blue Team Detection:**
- Log di `storage/logs/security.log`:
  ```
  [SECURITY] RATE_LIMIT_TRIGGERED ip="127.0.0.1" endpoint="/api/auth/login"
  [SECURITY] LOGIN_FAILED email="admin@plandaya.app" ip="127.0.0.1" reason="invalid_credentials"
  ```
- Firebase `login_attempts` collection menampilkan pattern brute force
- Suricata rule bisa mendeteksi burst HTTP POST ke `/api/auth/login`

---

### TS-02: XSS Injection

**Tujuan:** Inject script berbahaya melalui field input

```bash
curl -X POST http://localhost:8000/api/devices \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(document.cookie)</script>","category":"AC","power_watt":900}'
```

**Expected Red Team Result:** HTTP 422 — request diblokir

**Blue Team Detection:**
```
[SECURITY] SUSPICIOUS_INPUT ip="127.0.0.1" payload="..."
```

---

### TS-03: IDOR (Insecure Direct Object Reference)

**Tujuan:** Mengakses perangkat milik user lain

```bash
# Login sebagai user biasa, dapatkan token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}' | jq -r '.data.token')

# Coba akses device milik user lain
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/devices/DEVICE_ID_USER_LAIN
```

**Expected Result:** HTTP 403 Forbidden

**Blue Team Detection:**
```
[SECURITY] UNAUTHORIZED_ACCESS user_id=2 ip="127.0.0.1" endpoint="/api/devices/abc123"
```

---

### TS-04: Admin Endpoint Access tanpa Role

**Tujuan:** User biasa mencoba akses endpoint admin

```bash
curl -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:8000/api/admin/users
```

**Expected Result:** HTTP 403 Forbidden

**Blue Team Detection:**
```
[SECURITY] ADMIN_ACCESS_DENIED user_id=3 ip="127.0.0.1" endpoint="/api/admin/users"
```

---

### TS-05: Invalid Token / Expired Token

**Tujuan:** Akses dengan token palsu atau expired

```bash
curl -H "Authorization: Bearer INVALID_TOKEN_12345" \
  http://localhost:8000/api/auth/me
```

**Expected Result:** HTTP 401 Unauthorized

---

### TS-06: Mass Assignment Attack

**Tujuan:** Inject field `role` saat registrasi untuk dapat akses admin

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker",
    "email": "hacker@test.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "admin"
  }'
```

**Expected Result:** Registrasi berhasil tapi role tetap `user` (Laravel validate() hanya ambil field yang terdaftar)

---

### TS-07: SQL Injection (Firebase)

Firebase Realtime Database tidak menggunakan SQL, sehingga SQLi tradisional tidak berlaku. Tapi SanitizeInput tetap mendeteksi pattern:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin'\'' OR 1=1--","password":"anything"}'
```

**Expected Result:** HTTP 422 atau 401

---

## 🔵 SKENARIO BLUE TEAM

### BT-01: Monitoring Security Log

```bash
# Pantau security log secara real-time
tail -f backend/storage/logs/security.log

# Filter hanya event tertentu
grep "LOGIN_FAILED" backend/storage/logs/security.log
grep "RATE_LIMIT" backend/storage/logs/security.log
grep "SUSPICIOUS" backend/storage/logs/security.log
```

---

### BT-02: Analisis Login Attempts di Firebase

1. Buka Firebase Console → Realtime Database
2. Navigate ke path `login_attempts`
3. Filter berdasarkan `status: failed`
4. Identifikasi IP dengan banyak percobaan gagal

---

### BT-03: Validasi Security Controls

```bash
# 1. Test rate limiting aktif
for i in {1..12}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}')
  echo "Request $i: HTTP $STATUS"
done

# 2. Test XSS protection
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@test.com","password":"pass123","password_confirmation":"pass123"}' | jq .

# 3. Test admin protection
curl -s -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:8000/api/admin/dashboard | jq .
```

---

### BT-04: Incident Response Checklist

Jika terjadi serangan:

- [ ] Identifikasi IP penyerang dari security.log
- [ ] Cek pattern di Firebase `login_attempts`
- [ ] Cek Firebase `security_events` untuk event terkait
- [ ] Block IP di firewall (iptables / Windows Firewall)
- [ ] Rotate Firebase service account jika dicurigai bocor
- [ ] Ganti APP_KEY Laravel jika perlu invalidasi semua token
- [ ] Review Firebase Database Rules
- [ ] Update Suricata rules berdasarkan pattern serangan

---

## 📊 Test Coverage Matrix

| Test ID | Jenis Serangan       | Status Implementasi | Deteksi Log |
|---------|---------------------|---------------------|-------------|
| TS-01   | Brute Force         | ✅ Diblokir          | ✅ Ya        |
| TS-02   | XSS Injection       | ✅ Diblokir          | ✅ Ya        |
| TS-03   | IDOR                | ✅ Diblokir          | ✅ Ya        |
| TS-04   | Privilege Escalation| ✅ Diblokir          | ✅ Ya        |
| TS-05   | Invalid Token       | ✅ Diblokir          | ❌ Tidak     |
| TS-06   | Mass Assignment     | ✅ Diblokir          | ❌ Tidak     |
| TS-07   | SQLi (Firebase)     | ✅ Diblokir          | ✅ Ya        |
