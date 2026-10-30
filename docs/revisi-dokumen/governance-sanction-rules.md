# GOVERNANCE SANCTION RULES 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `governance-sanction-rules.md` |
| **Versi** | 1.2 (Fake Tracking Rule Extension) |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Prinsip** | **Skalabilitas Sanksi Otomatis Berbasis Bukti Audit** |

---

## A. MATRIKS KLASIFIKASI PELANGGARAN & SANKSI
Setiap pelanggaran terverifikasi dapat memicu tindakan berdasarkan tingkat berikut. Mesin aturan deterministik hanya boleh melakukan pembatasan sementara; status akun permanen dan pemulihan memerlukan keputusan Admin yang tercatat.

| Level | Kategori Pelanggaran | Tindakan Otomatis Sistem (*Sanction Action*) | Batasan Fitur (*Feature Restricting*) |
| :--- | :--- | :--- | :--- |
| **Level 1** | *Spamming* ringan di forum, perang komentar, ulasan produk tidak relevan. | **Warning & Takedown** | Larangan menulis konten baru selama 24 jam. |
| **Level 2** | Deskripsi produk/jasa menyesatkan, pelanggaran SLA pengiriman berulang. | **Scoped Temporary Restriction** | Peran/listing terkait dibatasi sementara; tinjauan manusia menentukan sanksi final dan durasi. |
| **Level 2.5**| Upaya manipulasi infrastruktur audit (`audit-rules.md`). | **Critical Escalation** | Investigasi keamanan dipicu. Akses transaksi keuangan dikunci penuh. |
| **Level 2.8**| **Input Resi Palsu (`Fake Tracking Number`)** | **Temporary payout/listing hold after revalidation** | Order terkait dan peran komersial relevan ditahan sementara; kasus diverifikasi Moderator/panel. |
| **Level 3** | Penipuan transaksi, pencucian uang, eksploitasi celah keamanan sistem, fraud berat. | **Admin decision required** | `users.status = permanently_revoked` hanya melalui keputusan Admin. Dana ditahan hanya bila diwajibkan proses sengketa/hukum. |

---

## B. SPESIFIKASI SANKSI NOMOR RESI PALSU (*FAKE TRACKING NUMBER POLICY*)
*   **Tingkat Keparahan (*Severity*):** **CRITICAL**
*   **Ketentuan Penegakan:** Event `logistics.tracking_invalid` hanya pemicu investigasi. Sistem melakukan verifikasi ulang pada provider cadangan; jika provider gagal, kasus masuk review manual dan tidak dikenai sanksi otomatis. Freeze sementara hanya berlaku pada order/listing/peran terkait sampai review.
*   **Prosedur Banding:** Pengguna dapat mengajukan banding dalam 7 hari. Moderator memeriksa bukti; Admin memutuskan banding maksimal 14 hari kerja. Pemulihan status hanya oleh Identity setelah event/keputusan Admin.


## C. KETENTUAN REVISI (ADR-001 D8)

| Level | Efek pada `users.status` / `roles.status` | Penetap |
| :--- | :--- | :--- |
| 1 | Pembatasan menulis 24 jam (flag fitur, status tidak berubah) | Mesin aturan |
| 2 | `roles.status = suspended` untuk peran terkait; `users.status = restricted` bila lintas peran; durasi sesuai review | Freeze sementara oleh mesin aturan; ditinjau Moderator |
| 2.5 | `users.status = under_review`; akses transaksi dikunci | Security (event), dipulihkan Admin |
| 2.8 | `roles.status = suspended` pada peran komersial terkait + freeze payout order terkait | Freeze sementara; penetapan akhir Admin |
| 3 | `users.status = permanently_revoked` | **Hanya Admin** (`governance_decisions`) |

* **Guard false positive (Level 2.8):** sebelum freeze sementara, sistem memverifikasi ulang resi ke agregator cadangan; bila agregator down, kasus masuk review manual dan sanksi tidak dijatuhkan otomatis.
* **Banding 2.8:** mengikuti banding standar (ajukan 7 hari, putusan Admin maksimal 14 hari kerja).
* Level 1: fitur menulis terkait dibatasi 24 jam; Level 2: peran terkait `suspended` selama keputusan berlaku; Level 2.5: `under_review` dan transaksi baru ditahan sementara; Level 2.8: peran komersial terkait `suspended` sementara. Level 3 memerlukan keputusan Admin dan `permanently_revoked`.
* Semua perubahan status akun/peran dilakukan oleh Identity; Governance menyimpan keputusan. Freeze mesin aturan memiliki TTL, alasan, scope, dan jalur eskalasi eksplisit.
