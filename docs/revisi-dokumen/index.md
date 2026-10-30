# 🗺️ Master Architecture Hub (V3.0 Foundation)

Selamat datang di pusat kendali dokumentasi proyek. File ini bertindak sebagai jangkar integrasi dan navigasi utama untuk melacak arsitektur, aturan bisnis, dan spesifikasi data sistem secara terstruktur.

---

## 🏗️ 1. Pondasi Utama & Standardisasi (Phase 1)
Dokumen yang mengunci standar fundamental sistem sebelum masuk ke tahap implementasi SQL dan Coding.
* **Roadmap:** [Feature Roadmap](./feature-roadmap.md) | [Release Versioning](./release-versioning.md) | [Future Considerations](./future-considerations.md)
* **Standardisasi:** [Glossary & Kamus Data](./glossary.md) | [Database Conventions](./database-conventions.md) | [Coding Standards](./coding-standards.md) | [API Standards](./api-standards.md)
* **Arsitektur Data:** [Data Models](./data-models.md) | [Master ERD](./master-erd.md)
* **Keputusan:** [Usulan Keputusan Proyek](./00-keputusan-usulan.md) | [ADR-001 Keputusan Arsitektur](./ADR-001-keputusan-arsitektur.md) | [Decision Record Architecture](./decision-record-architecture.md)

## 🔐 2. Keamanan, Identitas & Hak Akses (RBAC / RLS)
Spesifikasi keamanan data, autentikasi, serta pembatasan akses data di level repositori dan database.
* [Matriks Hak Akses / Permission Matrix](./permission-matrix.md)
* [Arsitektur Keamanan / Security Architecture](./security-architecture.md)
* [Model Multi-Tenancy / Tenancy Model](./tenancy-model.md)
* [Kepemilikan Data & Tenant Isolation](./data-ownership.md)
* [Kebijakan Tata Kelola AI](./ai-governance.md)

## 🔄 3. Alur Data & Siklus Hidup Sistem (State Machine)
Dokumen logika bisnis dinamis yang mengatur mutasi status entitas utama di dalam sistem.
* [Siklus Hidup Pengguna / User Lifecycle](./user-lifecycle.md)
* [Siklus Hidup Konten](./content-lifecycle.md)
* [Siklus Hidup Escrow](./escrow-lifecycle.md)
* [Siklus Hidup Marketplace](./marketplace-lifecycle.md)
* [Siklus Hidup Keanggotaan / Membership Architecture](./membership-architecture.md)
* [Siklus Hidup Layanan / Service Lifecycle](./service-lifecycle.md)
* [Mekanisme Moderasi / Moderation Lifecycle](./moderation-lifecycle.md)
* [Arsitektur Vendor / Vendor Architecture](./vendor-architecture.md)

## 📡 4. Arsitektur Komunikasi & Integrasi (Event-Driven)
Spesifikasi teknis mengenai bagaimana antar komponen berinteraksi dan bertukar data.
* [Arsitektur Chat](./chat-architecture.md)
* [Kontrak Integrasi Server](./ai-integration-contracts.md)
* [Kontrak Event Messaging](./event-contracts.md)
* [Peta Distribusi Event](./event-map.md)
* [Peta Integrasi Sistem](./integration-map.md)
* [Notifikasi & Aliran Pesan / Notification Architecture](./notification-architecture.md)

## 🛠️ 5. Infrastruktur, Keandalan & Operasional
Dokumen yang mengatur arsitektur server, skalabilitas, dan skenario pemulihan bencana.
* [Arsitektur Deployment](./deployment-architecture.md)
* [Arsitektur Infrastruktur & Network](./infrastructure-architecture.md)
* [Arsitektur Penyimpanan / Storage Architecture](./storage-architecture.md)
* [Strategi Audit Sistem](./audit-strategy.md)
* [Strategi Pemulihan Bencana / Disaster Recovery Strategy](./disaster-recovery-strategy.md)
* [Peta Domain & Routing / Domain Map](./domain-map.md)
* [Logistik & Provenance / Logistics Provenance](./logistics-provenance.md)
* [Aturan Logistik & Provenance / Logistics Provenance Rules](./logistics-provenance-rules.md)
* [Observabilitas & Pemantauan / Observability Architecture](./observability-architecture.md)
* [Mesin Reputasi & Analytics / Reputation Engine](./reputation-engine.md)
* [Arsitektur Pencarian Data / Search Architecture](./search-architecture.md)
* [Keberlanjutan Skema Harga / Pricing Sustainability](./pricing-sustainability.md)
* [Aturan Sanksi Tata Kelola / Governance Sanction Rules](./governance-sanction-rules.md)
* [Ketergantungan Modul / Module Dependency](./module-dependency.md)
* [Konteks Sistem / System Context](./system-context.md)
* [Ikhtisar Sistem / System Overview](./system-overview.md)
* [Diagram Alur Kerja / Workflow Diagrams](./workflow-diagrams.md)

---
*Dokumentasi ini diverifikasi otomatis menggunakan Markdown Links Pipeline.*
