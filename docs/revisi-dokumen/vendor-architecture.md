# VENDOR ARCHITECTURE
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `vendor-architecture.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Arsitektur Dasar**| **Domain Terisolasi di `src/features/vendor/`** |

---

## A. SIKLUS HIDUP AKUN VENDOR (VENDOR LIFECYCLE)

```text
[ draft_vendor ] -> Pengisian data awal portofolio, kompetensi, dan profil usaha
       │
       ▼
[ kyc_validation ] -> Verifikasi kecocokan identitas pengelola/pemilik
       │
       ▼
[ kyb_validation ] -> Verifikasi legalitas hukum dokumen bisnis jika institusi
       │
       ▼
[ active_vendor ] -> Kelayakan berdagang aktif setelah role dan verifikasi Identity disetujui
```

---

## B. LEVEL VERIFIKASI REPUTASI (VERIFICATION LEVELS)
Verifikasi dan reputasi adalah atribut berbeda. `verification_status` (pending/verified/rejected) dimiliki Identity; status/listing vendor dimiliki Vendor; skor/reason code dimiliki Reputation. `Verified Vendor` berarti badan usaha lulus KYB, bukan tier reputasi. Jangan gunakan Bronze/Silver/Gold/Platinum sebagai role atau sebagai dasar payout. Payout ditentukan oleh kontrak Escrow dan `pricing-sustainability.md`.

---

## C. STRUKTUR SUB-MODUL & MANAJEMEN TIM
Modul vendor diisolasi penuh ke dalam sub-komponen berikut:
* `profiles/`: Menyimpan metadata deskripsi usaha, logo, tautan eksternal, dan kontak.
* `portfolio/` & `certifications/`: Bukti rekam jejak proyek masa lalu dan keahlian teruji.
* `teams/`: Mekanisme manajemen hak akses bagi staf operasional vendor (misal: admin pembalas pesan chat, staf pemroses order jasa).
* `reviews/` & `analytics/`: read model dari event domain Review/Analytics; bukan data tulis milik Vendor.

Folder implementasi fitur menggunakan `kebab-case`, misalnya `src/features/vendor/`; nama domain tetap Vendor. Pengelolaan anggota tim wajib dibatasi pada tenant/vendor owner dan tidak membuat akun Identity duplikat.
