# INFRASTRUCTURE ARCHITECTURE 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `infrastructure-architecture.md` |
| **Versi** | 1.1 (Tech Stack Baseline Harmonized) |
| **Status** | **In review; senior architect approval pending** |

---

## A. PILIHAN TEKNOLOGI INTI PLATFORM (CORE TECH STACK)

| Komponen Arsitektur | Teknologi Terpilih | Peran Utama & Fokus Implementasi |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** | Aplikasi antarmuka pengguna responsif dengan performa optimasi SEO tinggi via SSR. |
| **Backend Framework** | **NestJS (TypeScript)**| Framework modular terstruktur tingkat enterprise untuk mengisolasi Bounded Contexts. |
| **Primary Database** | **Supabase PostgreSQL** | Database relasional utama penjamin transaksi ACID untuk data pengguna, order, & master escrow. |
| **Cache & Key-Value** | **Redis** | Session/rate-limit/cache sementara; bukan master data dan dapat dibangun ulang. |
| **Object Storage** | **Supabase Storage / S3** | Cloudflare R2 / Supabase Object Storage / MinIO lokal untuk penyimpanan berkas fisik (KYC, Invoice, Chat). |
| **Message Broker** | **RabbitMQ** | Transport broker mengamankan antrean aliran event sistem secara asinkron (EDA backbone). |
| **Search Engine** | **Meilisearch** | Mesin pencarian teks cepat, ringan, ramah performa untuk produk, jasa, & artikel. |
| **AI Integration** | **Langflow + Google Cloud Vertex AI** | Adapter AI tanpa akses database langsung; output rekomendasi saja. |
| **Monitoring Stack** | **Prometheus & Grafana**| Pengumpul metrik sistem, beban kerja infrastruktur, dan dasbor visualisasi visual. |


---
