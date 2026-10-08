# 📱 NetTools Mobile

Aplikasi mobile-first network diagnostic suite bertenaga **Qwen AI (`qwen-plus`)** via Alibaba Cloud MaaS API.

## Fitur Utama
- **Public IP & ISP Telemetry**: Deteksi IP publik, ISP, ASN, dan geolokasi.
- **ICMP Ping Tester**: Pengukuran latency milidetik (ms) dan packet loss.
- **DNS Records Resolver**: Resolusi record A, AAAA, MX, NS, dan TXT langsung dari sistem.
- **TCP Port Scanner**: Audit status port umum (FTP, SSH, HTTP, HTTPS, DB, Node) dengan deteksi OPEN, CLOSED, FILTERED.
- **Traceroute Hop Inspection**: Pelacakan rute transmisi paket jaringan.
- **AI Network Security & Hygiene Audit**: Analisis mendalam risiko keamanan dan panduan optimasi jaringan menggunakan model `qwen-plus`.

## Konfigurasi & Menjalankan
```bash
cd 01-nettools-mobile
npm install
node server.js
```
Akses di browser: `http://localhost:3001`
