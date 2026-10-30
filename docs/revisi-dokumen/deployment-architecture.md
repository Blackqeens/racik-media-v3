# DEPLOYMENT ARCHITECTURE 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `deployment-architecture.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |

---

## A. ALUR TOPOLOGI DISTRIBUSI (TRAFFIC FLOW)

```text
[ Klien / Pengguna ]
         │
         ▼
[ Jaringan CDN (Edge Nodes) ] -> Mengamankan aset statis & proteksi DDoS
         │
         ▼
[ Aplikasi Frontend (Next.js) ] -> Sisi server rendering & interaksi UI
         │
         ▼
[ Gerbang API Gateway ] -> Manajemen rute, pembatasan akses (Rate Limiting), & CORS
         │
         ▼
[ Layanan Backend (NestJS) ] -> Pemrosesan logika bisnis & transaksi inti
         │
         ▼
[ Lapisan Penyimpanan Data ] -> Supabase PostgreSQL, RabbitMQ, Redis, Meilisearch, Object Storage
```

---

## B. TATA KELOLA LINGKUNGAN KERJA (ENVIRONMENTS)
1. `local`: Lingkungan kerja komputer pribadi developer untuk proses penulisan kode.
2. `development`: Server integrasi otomatis untuk pengujian fitur baru pasca penggabungan repositori.
3. `staging`: Replika lingkungan produksi dengan kapasitas data terbatas untuk proses QA (*Quality Assurance*).
4. `production`: Lingkungan live komersial skala penuh yang diakses langsung oleh pengguna publik.

---

## C. STRATEGI DEPLOYMENT
Sistem wajib menerapkan strategi **Blue/Green Deployment** atau *Rolling Updates* yang didukung penuh oleh kontainerisasi Docker/Kubernetes. Proses pembaruan versi aplikasi ke server produksi wajib menjamin kondisi **Zero Downtime Deployment** tanpa menginterupsi jalannya transaksi niaga atau escrow yang sedang berlangsung.

WebSocket chat memakai connection draining dan reconnect/resume token ketika pergantian deployment; pesan belum terkirim tetap di queue persisten. Migrasi database mengikuti expand/contract dan tidak membatalkan kontrak Escrow aktif.


---
