# MEMBERSHIP ARCHITECTURE

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `membership-architecture.md` |
| **Versi** | 1.1 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Domain Owner** | Membership |

## A. MODEL AKUN DAN PERAN

Membership tier dan role adalah dua konsep terpisah. Satu user memiliki akun `Member` dan dapat memperoleh tier langganan `Free`, `Pro`, atau `Enterprise`; kapabilitas profesi/komersial diberikan melalui role aditif yang dikelola Identity (`Author`, `Seller`, `Distributor`, `ServiceProvider`, `Moderator`, `Admin`). Tier tidak otomatis memberikan status KYC/KYB atau role jual.

```text
Account: one Identity user
Membership tier: Free -> Pro (subscription); Enterprise after Phase 5
Additive roles: Member + any approved roles permitted by Identity policy
```

## B. KELAYAKAN DAN PERUBAHAN

* Tier Free berlaku saat pendaftaran. Pro aktif melalui langganan; kedaluwarsa hanya mengubah benefit/kuota membership, bukan menghapus role atau histori transaksi.
* Enterprise membership dan fitur multi-tenant baru aktif pada Phase 5; sebelum fase tersebut, tenant tetap single-tenant.
* Seller/ServiceProvider memerlukan KYC dan MFA; Distributor memerlukan KYB, MFA, dan wakil organisasi. Moderator merekomendasikan pemeriksaan; Admin mengesahkan final.
* Pengajuan role, verifikasi, suspensi, dan pemulihan akun mengikuti `user-lifecycle.md` dan `permission-matrix.md`; Membership tidak menulis status Identity.

## C. BENEFIT DAN KUOTA

| Fitur | Free | Pro | Enterprise (Phase 5) |
| :--- | :---: | :---: | :---: |
| Baca konten publik | ✔ | ✔ | ✔ |
| Materi premium dan benefit subscription | ✖ | ✔ | ✔ |
| Kapabilitas author/seller/provider | Berdasarkan role Identity, bukan tier | Berdasarkan role Identity, bukan tier | Berdasarkan role Identity, bukan tier |
| Kuota produk Seller | Maks. 10 aktif | Maks. 10 aktif | Mengikuti role/vendor dan kontrak |
| Akses tim vendor | Tidak otomatis | Tidak otomatis | Tergantung verifikasi vendor dan fitur Phase 5 |
| Multi-tenant/API korporasi | ✖ | ✖ | ✔ setelah Phase 5 |

Benefit/kuota subscription dikelola Membership melalui `subscriptions` dan `quota_ledgers`; akses jual/jasa tetap bergantung role dan verifikasi Identity.
