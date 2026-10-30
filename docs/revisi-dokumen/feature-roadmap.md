# FEATURE ROADMAP
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `feature-roadmap.md` |
| **Versi** | 1.1 (Aligned with Release Versioning V3) |
| **Status** | **In review; senior architect approval pending** |

---

## A. TAHAPAN STRATEGI PENGEMBANGAN FITUR (PHASED IMPLEMENTATION)

Untuk mencegah terjadinya perluasan ruang lingkup kerja (*scope creep*), pengembangan Racik Media V3 dikunci ke dalam 5 tahapan rilis terpadu yang selaras dengan `release-versioning.md`:

```text
[ PHASE 1: FOUNDATION (V3.0 FOUNDATION) ]
├── Identity, Security, Single Account Policy, RBAC/RLS, dan KYC/KYB workflow
├── Membership, Vendor, Content, Marketplace, dan Service listing dasar
├── Moderation dasar (empat antrean), Audit CRITICAL, dan Notification OTP
├── Search dasar (Meilisearch) dan Reputation dasar (event +2)
└── Object storage, observability, dan fondasi deployment/recovery
        │
        ▼
[ PHASE 2: COMMERCE & FINANCIAL ESCROW ]
├── Order, B2B RFQ, Payment, dan Escrow dengan tranche jasa
├── Anti-Price-War Engine dan AML review
├── Logistics & Provenance dan settlement bank langsung tanpa wallet
├── Order Chat & Support Chat sebagai bukti transaksi/sengketa
└── Notification transaksional WhatsApp/Email
        │
        ▼
[ PHASE 3: COMMUNITY & TRUST REPUTATION ]
├── Community: forum, grup, feed; Private Chat & Vendor Chat (produk V3.1)
├── Search lanjutan dan ranking berbasis trust/knowledge/geolokasi
├── Review, Reputation lanjutan, dan Analytics
└── Observability dashboards lanjutan
        │
        ▼
[ PHASE 4: AI CENTER INTEGRATION ]
├── Automasi Deteksi & Skrining Konten Teks Forum (AI Content Moderation)
├── Optimasi Deskripsi & Metadata Produk Otomatis (AI SEO Tools)
└── Fitur Penerjemah Konten Pengetahuan Multi-Bahasa (AI Translation)
        │
        ▼
[ PHASE 5: ENTERPRISE ECOSYSTEM ]
├── Kesiapan Arsitektur Multi-Tenant Skala Korporasi (Future-Ready Tenancy)
├── Akses Jalur Integrasi API Pihak Ketiga Terotentikasi & Developer Portal
└── Manajemen Sub-Akun Tim Organisasi Berjenjang Tanpa Batas Kuota
```


## B. KETENTUAN REVISI (ADR-001 D2)
* **Phase 1**: Moderation dasar (4 antrean), Security, Audit CRITICAL, Notification OTP, Search dasar, Reputation dasar.
* **Phase 2**: Order Chat/Support Chat, B2B RFQ, Anti-Price-War, AML, Escrow, Logistics & Provenance.
* **Phase 3**: Community (forum/grup/feed), Private/Vendor Chat, Search lanjutan, Review, Reputation, Analytics.
* **Phase 5:** Enterprise multi-tenant penuh (tier Enterprise dijual setelah fase ini).


---

Produk bernama Racik Media V3; V3.0 adalah rilis produk fase 1–2 dan V3.1 adalah rilis fase 3. Versi aplikasi/API menggunakan SemVer secara terpisah sebagaimana `release-versioning.md`.
