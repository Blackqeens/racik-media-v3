# SYSTEM OVERVIEW & ARCHITECTURE BLUEPRINT

Status Document: In review | VERSION: 1.1
System Core: Knowledge + Community + Culture + Commerce + Services
Master Ledger: Supabase PostgreSQL (Relational Master Ledger) | Redis (Cache) | Meilisearch (Search Read Model)

---

## 1. EXECUTIVE HIGH-LEVEL SYSTEM CONTEXT

Racik Media V3 adalah platform hibrida berskala perusahaan (*enterprise-grade*) yang dirancang khusus untuk mengintegrasikan pertukaran pengetahuan, interaksi sosial berbasis kepercayaan tinggi, serta saluran komersial profesional terkurasi. 

Sistem ini berdiri di atas tiga filosofi mutlak: **Anti-Price-War Directive** (penahanan perang harga otomatis), **Community First & Curation Principle** (kurasi wajib sebelum ekspos publik), dan **No-Wallet Financial Architecture** (isolasi dana aman tanpa saldo virtual internal platform).

```mermaid
graph TD
    %% Core Infrastructure
    subgraph Client Application Layer
        UI[Frontend UI Web / Mobile]
    end

    subgraph API Perimeter Gateway
        GW[Zero-Trust Security Gateway]
    end

    subgraph Feature Domains Bounded Context
        ID[Identity Domain]
        CT[Content Domain]
        MC[Marketplace Domain]
        SV[Service Domain]
        MD[Moderation Domain]
        TR[Trust & Reputation Domain]
        ES[Escrow & Finance Domain]
    end

    subgraph Persistent Storage Ledger
        REDIS[(Redis: Cache)]
        MS[(Meilisearch: Search Read Model)]
        SBA[(Supabase PostgreSQL: Relational Master Ledger)]
        OBJ[(Supabase Storage / S3-Compatible Object Store)]
    end

    %% Flow Connections
    UI -->|Authenticated API Token / MFA| GW
    GW -->|Least Privilege Access| Feature Domains Bounded Context
    ID -->|Single Account Anchor| SBA
    CT -->|Content Before Commerce| SBA
    MC -->|Provenance & Floor Price Engine| SBA
    SV -->|Geofencing Spasial| SBA
    MD -->|4 Curation Queues| SBA
    TR -->|Trust Spillover / Append-Only| SBA
    ES -->|Isolated Order Escrow Contracts| SBA
    SBA -->|Outbox Events| BUS[(RabbitMQ)]
    BUS -->|Index Events| MS
    SBA -->|Cache invalidation| REDIS
    UI -->|Private/public files| OBJ
```

---

## 2. THE FOUR SYSTEM PILLARS

Sistem membagi batas tanggung jawab operasional menjadi empat saluran utama yang saling terinterlinking secara programmatik:

1.  **Knowledge Platform (CMS & Publication)**: Ekosistem penulisan terkemuka untuk Artikel, Jurnal ilmiah (*Papers*), dan Kegiatan (*Events*) lokal. Menegakkan aturan sitasi wajib akademik baku (APA/MLA) untuk memotong rantai sebaran spam AI otomatis tanpa suntingan manusia.
2.  **Hybrid Marketplace**: Penyederhanaan data katalog tunggal yang merangkum perdagangan Retail langsung (B2C/C2C) dengan harga tetap, serta perdagangan Grosir Institusional (B2B) yang dikendalikan oleh formulir pengajuan Request for Quote (RFQ) dan kontrak mileston dinamis.
3.  **Service Marketplace**: Hub perdagangan keahlian yang membagi operasi menjadi jasa digital jarak jauh (*Remote Services*) via pengiriman file aman, serta jasa geolocated fisik lapangan (*Geolocated Physical Services*) yang dikunci oleh koordinat pusat dan radius operasi nyata.
4.  **Social Ecosystem**: Ruang interaksi sosial (Forum, Grup, Chat, Feed) khusus untuk membangun kepercayaan pengguna sebelum transaksi komersial dilakukan. Sistem mengisolasi platform secara paksa dari metrik vanity adiktif kosmetik (seperti tombol Like, hitungan Follower, daily streaks, atau viral scores yang dilarang keras di seluruh aplikasi).

---

## 3. INTEGRATED CROSS-DOMAIN BOUNDARY WORKFLOW

Setiap domain fitur berinteraksi menggunakan jalur asinkronus asynchronous event-bus (`src/core/events/`) dan Public API Barrel Export (`src/features/FeatureName/index.ts`) untuk mencegah keterikatan folder internal secara langsung (*cross-feature direct import lockout*).

```mermaid
sequenceDiagram
    autonumber
    actor Author as Author / Creator
    participant Content as Content Domain (CMS)
    participant Mod as Moderation Domain (KnowledgeQueue)
    participant Rep as Trust & Reputation Domain
    participant Market as Marketplace Domain (Catalog)

    Author->>Content: Submit Paper with Structured Citations
    Content->>Mod: Enqueue Ticket (entity_type: 'Article', queue: 'KnowledgeQueue')
    Mod->>Mod: Verify Peer Citations & Human Authorship (SLA 48 jam Article/Event; 7 hari Paper/Journal)
    Mod->>Content: Emit moderation.decision_made
    Content->>Content: Content owner updates status = 'published'
    Content->>Rep: Emit Event 'content.published' (authorId)
    Rep->>Rep: INSERT reputation_events ('KnowledgeApproved', score_delta: +2)
    Rep->>Market: Emit Event 'reputation.score_updated' (userId, score)
    Search->>Search: Recalculate trust and knowledge multipliers in index
```

### 3.1 Global Ledger Auditability Chain
Platform menjamin transparansi forensik hukum secara mutlak dengan memisahkan log audit menjadi sub-ledgers spesifik domain yang independen:
*   `identity_audit_logs`: Mutasi akun, pengaktifan peran, dan evaluasi berkas KYC/KYB.
*   `security_audit_logs`: Telemetri anomali login, kegagalan MFA, dan peristiwa auto-lockdown.
*   `moderation_audit_logs`: Putusan kurasi mandiri, hasil voting panel 3 kurator, dan resolusi banding.
*   `financial_audit_logs`: Penguncian, pemotongan komisi platform, dan pelepasan dana escrow per order.
*   `logistics_change_logs`: Pembaruan status fisik pengiriman paket via webhook kurir 3PL resmi.

Seluruh tabel log ini dilindungi oleh fungsi penahan database (*trigger blocker*) agar tidak dapat dimanipulasi, diubah (`UPDATE`), ataupun dihapus (`DELETE`) oleh pihak mana pun demi menjaga kedaulatan data ekosistem Racik Media V3.



---
