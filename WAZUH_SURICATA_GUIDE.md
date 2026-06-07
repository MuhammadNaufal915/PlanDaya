# WAZUH_SURICATA_GUIDE.md — Panduan Integrasi Wazuh & Suricata

## 🎯 Overview

Panduan ini menjelaskan cara mengintegrasikan Wazuh (SIEM) dan Suricata (IDS/IPS) dengan PlanDaya untuk monitoring keamanan jaringan secara real-time.

---

## 🔍 Wazuh — SIEM Integration

### Arsitektur

```
[PlanDaya Server]                    [Wazuh Manager]
  Laravel Logs        ────────►     Wazuh Agent
  security.log                       │
  laravel.log                        ▼
                                  Wazuh Dashboard (Kibana)
```

### 1. Install Wazuh Agent di Server PlanDaya

```bash
# Ubuntu/Debian
curl -so /tmp/wazuh-agent.deb \
  https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.7.0-1_amd64.deb
dpkg -i /tmp/wazuh-agent.deb

# Windows
# Download dari https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi
```

### 2. Konfigurasi Agent untuk Monitor PlanDaya Logs

Edit `/var/ossec/etc/ossec.conf`:

```xml
<ossec_config>
  <localfile>
    <log_format>syslog</log_format>
    <location>/path/to/PlanDaya/backend/storage/logs/security.log</location>
  </localfile>

  <localfile>
    <log_format>syslog</log_format>
    <location>/path/to/PlanDaya/backend/storage/logs/laravel.log</location>
  </localfile>
</ossec_config>
```

### 3. Custom Wazuh Rules untuk PlanDaya

Buat file `/var/ossec/etc/rules/plandaya_rules.xml`:

```xml
<group name="plandaya,security">

  <!-- Login Failed -->
  <rule id="100001" level="5">
    <match>[SECURITY] LOGIN_FAILED</match>
    <description>PlanDaya: Failed login attempt</description>
    <group>authentication_failed,pii</group>
  </rule>

  <!-- Brute Force Detection (5+ failed in 2 minutes) -->
  <rule id="100002" level="10" frequency="5" timeframe="120">
    <if_matched_sid>100001</if_matched_sid>
    <same_field>ip</same_field>
    <description>PlanDaya: Brute force attack detected from same IP</description>
    <group>authentication_failures,attack</group>
  </rule>

  <!-- Rate Limit Triggered -->
  <rule id="100003" level="7">
    <match>[SECURITY] RATE_LIMIT_TRIGGERED</match>
    <description>PlanDaya: Rate limit triggered - possible attack</description>
    <group>dos_attack</group>
  </rule>

  <!-- Suspicious Input (XSS/SQLi) -->
  <rule id="100004" level="12">
    <match>[SECURITY] SUSPICIOUS_INPUT</match>
    <description>PlanDaya: Malicious input detected (XSS/SQLi attempt)</description>
    <group>web_attack,injection</group>
  </rule>

  <!-- Admin Access Denied -->
  <rule id="100005" level="8">
    <match>[SECURITY] ADMIN_ACCESS_DENIED</match>
    <description>PlanDaya: Unauthorized admin access attempt</description>
    <group>access_control</group>
  </rule>

  <!-- Unauthorized Resource Access -->
  <rule id="100006" level="7">
    <match>[SECURITY] UNAUTHORIZED_ACCESS</match>
    <description>PlanDaya: Unauthorized resource access (possible IDOR)</description>
    <group>access_control</group>
  </rule>

</group>
```

### 4. Restart Wazuh Agent

```bash
systemctl restart wazuh-agent
```

---

## 🌐 Suricata — IDS/IPS Integration

### Install Suricata

```bash
# Ubuntu
sudo apt-get install suricata -y

# Windows (via MSYS2 atau WSL)
# Atau gunakan Suricata installer dari https://suricata.io/download/
```

### 1. Custom Suricata Rules untuk PlanDaya

Buat file `/etc/suricata/rules/plandaya.rules`:

```
# ── Brute Force Detection ─────────────────────────────────────────────────────
alert http any any -> $HOME_NET 8000 (
  msg:"PLANDAYA Brute Force Login Attempt";
  flow:established,to_server;
  http.method; content:"POST";
  http.uri; content:"/api/auth/login";
  threshold:type threshold, track by_src, count 10, seconds 60;
  classtype:attempted-admin;
  sid:9000001; rev:1;
)

# ── XSS Attempt ───────────────────────────────────────────────────────────────
alert http any any -> $HOME_NET 8000 (
  msg:"PLANDAYA XSS Attempt in Request Body";
  flow:established,to_server;
  http.request_body;
  content:"<script>";
  nocase;
  classtype:web-application-attack;
  sid:9000002; rev:1;
)

# ── SQL Injection Attempt ─────────────────────────────────────────────────────
alert http any any -> $HOME_NET 8000 (
  msg:"PLANDAYA SQL Injection Attempt";
  flow:established,to_server;
  http.request_body;
  pcre:"/UNION\s+SELECT|DROP\s+TABLE|INSERT\s+INTO/i";
  classtype:web-application-attack;
  sid:9000003; rev:1;
)

# ── Admin Endpoint Scan ───────────────────────────────────────────────────────
alert http any any -> $HOME_NET 8000 (
  msg:"PLANDAYA Admin Endpoint Access Attempt";
  flow:established,to_server;
  http.uri; content:"/api/admin";
  threshold:type threshold, track by_src, count 5, seconds 30;
  classtype:attempted-admin;
  sid:9000004; rev:1;
)

# ── Path Traversal Attempt ────────────────────────────────────────────────────
alert http any any -> $HOME_NET 8000 (
  msg:"PLANDAYA Path Traversal Attempt";
  flow:established,to_server;
  http.uri; content:"../";
  classtype:web-application-attack;
  sid:9000005; rev:1;
)

# ── Firebase Direct Access Attempt (bypass Laravel) ──────────────────────────
alert http any any -> any 443 (
  msg:"PLANDAYA Direct Firebase Access Attempt";
  flow:established,to_server;
  http.host; content:"firebaseio.com";
  classtype:policy-violation;
  sid:9000006; rev:1;
)
```

### 2. Konfigurasi Suricata Interface

Edit `/etc/suricata/suricata.yaml`:

```yaml
af-packet:
  - interface: eth0  # Ganti dengan interface Anda

default-log-dir: /var/log/suricata/

rule-files:
  - suricata.rules
  - plandaya.rules
```

### 3. Jalankan Suricata

```bash
suricata -c /etc/suricata/suricata.yaml -i eth0

# Monitor alerts real-time
tail -f /var/log/suricata/fast.log
tail -f /var/log/suricata/eve.json | jq 'select(.event_type=="alert")'
```

---

## 📊 Dashboard Integration

### Wazuh + Kibana Dashboard

1. Buka Wazuh Dashboard di `http://WAZUH_IP:5601`
2. Navigasi ke **Security Events**
3. Filter by `rule.groups: plandaya`
4. Buat visualisasi:
   - Login attempts per IP per hari
   - XSS/SQLi alerts over time
   - Admin access attempts

### Eve.json → Elasticsearch (Suricata)

```bash
# Kirim Suricata eve.json ke Elasticsearch
filebeat modules enable suricata
filebeat setup
systemctl start filebeat
```

---

## 🔔 Alert Notification

### Kirim alert ke Telegram/Slack (Wazuh)

Edit `/var/ossec/etc/ossec.conf`:

```xml
<integration>
  <name>slack</name>
  <hook_url>https://hooks.slack.com/services/YOUR/WEBHOOK/URL</hook_url>
  <level>10</level>
  <rule_id>100002,100004</rule_id>
  <alert_format>json</alert_format>
</integration>
```

---

## 📋 Monitoring Checklist

**Harian:**
- [ ] Cek `security.log` untuk anomali
- [ ] Review Wazuh alerts level ≥ 7
- [ ] Cek Firebase `login_attempts` untuk pattern brute force

**Mingguan:**
- [ ] Review Suricata `fast.log`
- [ ] Analisis top attacker IPs
- [ ] Update rules berdasarkan pattern baru

**Insiden:**
- [ ] Isolasi IP penyerang
- [ ] Preserve logs untuk forensik
- [ ] Rotate credentials jika perlu
- [ ] Update firewall rules
