# MODULE DEPENDENCY RULES

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `module-dependency.md` |
| **Versi** | 2.1 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Prinsip Utama** | Domain owner tunggal; kontrak sinkron untuk command/query terbatas, event untuk propagasi |

## A. ATURAN DEPENDENSI

1. Setiap domain memiliki skema dan tabelnya sendiri sesuai `data-ownership.md`. Direct database access/join lintas domain dilarang.
2. Perintah sinkron yang memerlukan keputusan segera harus melewati API/port publik domain owner. Reaksi turunan, read model, notifikasi, audit, dan indeks dikonsumsi dari event resmi `event-map.md`.
3. Event bersifat satu arah dan satu publisher per aggregate. Event consumer menulis hanya read model/tabel yang dimilikinya.
4. Tidak ada import kode internal lintas feature. Folder feature menggunakan `kebab-case` (`src/features/service-marketplace/`); kontrak bersama berada pada package/core yang eksplisit.
5. Dependency graph tidak boleh berputar. Jika dua domain perlu saling bereaksi, gunakan event atau shared contract, bukan pemanggilan timbal balik.

## B. DOMAIN DAN LAPISAN LOGIS

| Lapisan | Domain |
| :--- | :--- |
| Identity & Control | Identity, Security, Governance |
| Access & Actors | Membership, Vendor |
| Knowledge & Discovery | Content, Marketplace, Service-Marketplace, Community, Search, Provenance |
| Transactions & Communication | Order, Logistics, Chat, Notification |
| Finance | Payment, Escrow |
| Trust & Operations | Moderation, Reputation, Review, Service-Performance, Analytics, Audit |

Lapisan adalah pengelompokan implementasi, bukan izin menulis data domain lain. Semua domain tetap mengikuti aturan owner §A.

## C. KONTRAK INTERAKSI UTAMA

| Initiator | Sinkron (command/query via owner API) | Event yang dikonsumsi / diterbitkan |
| :--- | :--- | :--- |
| Identity | Membership, Vendor | Menerbitkan status/role/verifikasi; mengonsumsi Security dan keputusan Governance |
| Marketplace / Content / Service-Marketplace | Identity role check, Vendor, Provenance | Menerbitkan submit/business events; mengonsumsi Moderation decisions |
| Order | Marketplace/Service quote, Identity, Payment | Menerbitkan order events; mengonsumsi Escrow, Logistics, Identity |
| Payment | Gateway adapter | Menerbitkan `payment.succeeded`; mengonsumsi instruksi Payment/Escrow |
| Escrow | Payment, bank disbursement provider | Menerbitkan seluruh event escrow; mengonsumsi Order confirmation, Logistics, Identity |
| Logistics | Carrier adapters, Order read contract | Menerbitkan fulfillment evidence; mengonsumsi order reference |
| Moderation | Identity verification API untuk akses dokumen terbatas | Mengonsumsi submit/report/dispute events; hanya menerbitkan `moderation.decision_made` |
| Reputation / Review / Analytics / Search | Read-only event consumers | Memproyeksikan event ke read model masing-masing |
| Audit | Tidak ada direct mutasi domain | Mengonsumsi event/audit envelope; menulis append-only audit logs |
| Notification / Chat | Identity & Order access check via owner API | Mengonsumsi domain event; menyimpan data miliknya sendiri |

## D. PEMBATASAN KRITIS

* Marketplace tidak menulis escrow, Provenance, Moderation, atau Reputation tables.
* Escrow tidak mengubah `orders`, `service_milestones`, atau `logistics_change_logs`; owner terkait mengonsumsi event Escrow dan memperbarui read model/status miliknya.
* Logistics tidak menentukan status kontrak, refund, payout, atau sanksi.
* Vendor tidak membaca tabel internal Order/Marketplace; ulasan dan analytics ditampilkan melalui read model event-based.
* Security menerbitkan incident event; Identity adalah satu-satunya penulis `users.status`/`roles.status`.
* Moderation tidak menerbitkan `catalog.approved`/`content.published`/`service.approved`; owner entity menerbitkan setelah menerapkan keputusan.
