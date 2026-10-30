# DATA OWNERSHIP MATRIX 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `data-ownership.md` |
| **Versi** | 2.1 (22 Domain Granular, DDD Aligned & No-Wallet Compliant) |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Prinsip Utama** | **1 Data = 1 Owner Domain (Single Source of Truth)** |

---

## A. PRINSIP TATA KELOLA DATA

1. **Single Source of Truth (SSoT):**
   Setiap entitas data hanya boleh dimiliki, dimutasi (*Write/Update/Delete*), dan divalidasi oleh satu domain tunggal (*Owner*).
2. **Read-Only Cross-Domain via Contracts/Events:**
   Domain luar yang membutuhkan data dari domain lain wajib mengaksesnya melalui *Shared Interface*, DTO, atau sinkronisasi asinkron berbasis *Event-Driven*. Dilarang keras melakukan *Direct Database Join* lintas batas domain (misal: tabel `orders` men-join langsung tabel internal `escrow_ledgers` atau `kyc_records`).
3. **Pemisahan Entitas & Tanpa Replikasi Liar:**
   Dilarang menduplikasi entitas domain lain (contoh: membuat tabel `marketplace_vendors` lokal di dalam domain Marketplace; data wajib merujuk secara ketat pada `vendor_id (UUID)` dari domain `Vendor`).
4. **No-Wallet Financial Isolation:**
   Platform tidak memiliki entitas saldo/dompet pengguna (*user wallet/balance*). Seluruh data finansial diisolasi pada entitas kontrak transaksi independen (*Order-based Escrow Contract*) dan catatan transfer langsung (*Direct Bank Settlement*).

---

## B. MATRIKS KEPEMILIKAN DATA (*DATA OWNERSHIP MATRIX*)

| Domain Asal (*Owner*) | Entitas Inti yang Dikelola | Hak Mutasi (*Write*) | Akses Konsumsi (*Read-Only Allowed*) |
| :--- | :--- | :--- | :--- |
| **Identity** | `User`, `UserProfile`, `KycRecord`, `KybRecord`, `AuthSession` | `Identity` | Semua Domain (terbatas sesuai konteks privasi) |
| **Membership** | `MembershipTier`, `Subscription`, `Benefit`, `QuotaLedger` | `Membership` | `Identity`, `Vendor`, `Marketplace`, `Admin` |
| **Vendor** | `VendorProfile`, `Portfolio`, `Certification`, `VendorTeam`, `VendorStat` | `Vendor` | `Marketplace`, `Service-Marketplace`, `Order`, `Search` |
| **Marketplace** | `CatalogItem`, `ProductCategory`, `ProductVariant`, `InventoryItem`, `PriceAnomalyRegistry`, `CatalogChangeLog` | `Marketplace` | `Order`, `Search`, `Analytics`, `Moderation`, `Provenance` |
| **Service-Marketplace**| `ServiceListing`, `MilestoneTemplate`, `RevisionPolicy` | `Service-Marketplace` | `Order`, `Search`, `Analytics`, `Moderation`, `Review` |
| **Order** | `OrderHeader`, `OrderItem`, `Quotation`, `RfqContract`, `OrderMilestone` | `Order` | `Payment`, `Escrow`, `Notification`, `Chat`, `Analytics`, `Logistics` |
| **Payment** | `Invoice`, `TransactionReceipt`, `PaymentGatewayLog`, `RefundRecord` | `Payment` | `Order`, `Escrow`, `Admin`, `Analytics` |
| **Escrow** | `EscrowContract`, `EscrowMilestoneTranche`, `DisputeHoldRecord`, `MediationResolution`, `BankSettlementDisbursement` | `Escrow` | `Payment`, `Order`, `Governance`, `Admin` |
| **Content** | `Article`, `Journal`, `Paper`, `EventItem` | `Content` | `Community`, `Reputation`, `Search`, `Analytics` |
| **Community** | `ForumTopic`, `ForumReply`, `Group`, `DiscussionThread` | `Community` | `Identity`, `Reputation`, `Moderation` |
| **Chat** | `ChatRoom`, `ChatMessage`, `ChatAttachment`, `OrderChatBinding` | `Chat` | `Order`, `Moderation`, `Notification` |
| **Notification** | `NotificationRecord`, `NotificationTemplate`, `DispatchQueue` | `Notification` | `Identity`, `Order`, `Payment`, `Admin` |
| **Reputation** | `ReputationScore`, `BadgeAssignment`, `MeritHistory`, `TrustMetric` | `Reputation` | `Identity`, `Vendor`, `Search`, `Community` |
| **Moderation** | `ModerationTicket`, `ModerationAssignment`, `PanelReview`, `ReportTicket`, `SanctionRecord`, `AppealTicket`, `AiScreeningLog` | `Moderation` | `Content`, `Community`, `Marketplace`, `Service-Marketplace`, `Identity`, `Admin` |
| **Security** | `SecurityIncident`, `AmlCheckRecord`, `FraudSignal`, `RateLimitPolicy` | `Security` | `Admin`, `Governance`, `Escrow` |
| **Analytics** | `DailyMetricAggregate`, `SalesSnapshot`, `FunnelAnalysis` | `Analytics` | `Dashboard`, `Admin`, `Vendor` |
| **Logistics** | `LogisticsChangeLog`, `TrackingRecord` | `Logistics` | `Order`, `Escrow`, `Moderation`, `Reputation` |
| **Provenance** | `CatalogProvenance` | `Provenance` | `Marketplace`, `Search`, `Moderation`, `Reputation` |
| **Governance** | `GovernanceDecision` | `Governance` | `Marketplace`, `Escrow`, `Admin`, `Audit` |
| **Audit** | `IdentityAuditLog`, `SecurityAuditLog`, `ModerationAuditLog`, `FinancialAuditLog` | `Audit` (append-only, ditulis lewat event) | `Admin`, `Governance` |
| **Search** | `SearchIndexDocument`, query/index read models | `Search` (read models; sumber dari event owner) | `Marketplace`, `Service-Marketplace`, `Content`, `Vendor`, `Community`, `Reputation` |
| **Review** | `ProductReview`, `ServiceReview` | `Review` | `Vendor`, `Search`, `Reputation` |
| **Service-Performance** | `ProviderPerformanceLog` | `Service-Performance` | `Governance`, `Search` |

---

## C. KETENTUAN REFERENSI SILANG (*CROSS-REFERENCE RULES*)

### 1. Data Pengguna (`User`)
* **Milik:** Domain `Identity`.
* **Aturan:** Domain luar dilarang keras menyalin properti sensitif user (`email`, `phone`, `password_hash`, data KTP/NPWP). Domain luar hanya diizinkan menyimpan `user_id (UUID)` sebagai kunci referensi (*foreign key reference*).

### 2. Data Profil Vendor (`VendorProfile`)
* **Milik:** Domain `Vendor`.
* **Aturan:** Domain `Marketplace` (produk fisik) dan `Service-Marketplace` (jasa) wajib mengambil relasi `vendor_id` langsung dari entitas yang disediakan domain Vendor. Modifikasi portofolio, sertifikasi, dan struktur tim hanya diisolasi di dalam domain Vendor.

### 3. Data Nilai Finansial & Escrow (`EscrowContract` & `BankSettlementDisbursement`)
* **Milik:** Domain `Escrow`.
* **Aturan:**
  * Status dana hanya dimiliki Escrow. Order menyimpan status order-nya sendiri (misalnya `paid`, `in_fulfillment`, `completed`) yang diperbarui oleh Order Service setelah menerima event Escrow; status Escrow tidak disalin ke tabel Order.
  * Hanya Escrow Service yang menulis `escrow_contracts` dan `escrow_milestone_tranches`; milestone pekerjaan dimiliki Service-Marketplace.
  * Saat order selesai, domain `Escrow` tidak menambahkan angka ke saldo dompet (karena platform menganut **No-Wallet Architecture**). Domain `Escrow` menerbitkan instruksi `BankSettlementDisbursement` ke Payment Gateway untuk ditransfer langsung ke rekening bank vendor yang telah terverifikasi.

### 4. Data Sengketa (*Dispute*)
* **Milik:** Data hold dan resolusi finansial milik `Escrow`; tiket, panel, dan keputusan moderasi milik `Moderation`; keputusan administrasi final dicatat `Governance`.
* **Aturan:** Domain `Order` tidak boleh memutuskan sengketa secara mandiri. Ketika sengketa dipicu melalui `DisputeTriggerButton`, tiket sengketa dikunci di domain `Escrow` (`DisputeHoldRecord`) dan diinvestigasi oleh domain `Moderation`.


## D. ATURAN TAMBAHAN (ADR-001 D4)
* Hanya domain owner pada matriks §B yang boleh menulis tabelnya. Moderation, Security, Orders, dan Logistics tidak meng-UPDATE tabel domain lain; mereka menerbitkan event/memanggil API kontrak owner.
* Payload event hanya memuat ID rujukan; NIK, nomor rekening, email tidak boleh keluar dari domain Identity/Escrow.


---

## E. KETENTUAN TAMBAHAN
* Jumlah domain granular adalah 23, sesuai matriks §B. `data-ownership.md` adalah sumber kebenaran nama domain dan kepemilikan entitas.
* Antrean kurasi (`KnowledgeQueue`, `CatalogQueue`, `ServiceQueue`, `IdentityQueue`, serta tiket fraud/sengketa) adalah nilai `queue_type` pada `moderation_tickets`, bukan domain atau tabel milik pemohon.
* Audit merupakan domain pemilik sub-log audit. Domain bisnis mengirim event; hanya Audit yang menulis log audit.
* Payload event tidak boleh memuat NIK, nomor rekening, email, kredensial, atau dokumen mentah; gunakan ID rujukan.
