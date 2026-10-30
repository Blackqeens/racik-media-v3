# ADR-001: KEPUTUSAN ARSITEKTUR LINTAS DOKUMEN (D1–D9)

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `ADR-001-keputusan-arsitektur.md` |
| **Status** | **Disetujui pemohon; menunggu pengesahan resmi arsitek senior** |
| **Tanggal** | 2026-10-24 |
| **Berlaku untuk** | Seluruh dokumen CR-2026-10-24 |

## D1. Acuan peta domain
`data-ownership.md` adalah acuan kepemilikan data untuk **23 domain granular**. `domain-map.md` adalah tampilan bounded-context tingkat atas dan wajib memuat tabel pemetaan yang lengkap ke domain granular tersebut. Nama dan jumlah domain mengikuti matriks pada `data-ownership.md`.

## D2. Chat dan Community
Order Chat dan Support Chat masuk rilis Commerce (bukti sengketa escrow). Private Chat, Vendor Chat, Forum, Grup, dan Feed masuk rilis Community (V3.1 produk / Phase 3).

## D3. Event
1. Satu katalog resmi: `event-map.md`.
2. Nama kanonik: `domain.action` (huruf kecil). Nama wire (RabbitMQ) diturunkan otomatis: huruf besar, titik menjadi `_` (`escrow.milestone_released` -> `ESCROW_MILESTONE_RELEASED`).
3. Satu publisher per event: domain pemilik aggregate. Moderation hanya menerbitkan `moderation.decision_made`; domain pemilik entitas menerbitkan event bisnis (`content.published`, `catalog.approved`, `service.approved`).
4. Payload JSON memakai field camelCase dan hanya memuat ID rujukan serta data bisnis minimum yang diperlukan; dilarang membawa NIK, nomor rekening, email, kredensial, dokumen mentah, atau data sensitif lain.

## D4. Penulis tabel
Hanya domain owner (`data-ownership`) yang boleh INSERT/UPDATE/DELETE tabelnya. Domain lain mengirim event atau memanggil API kontrak domain owner.

## D5. Escrow
Satu `escrow_contracts` per order (`order_id UNIQUE`). Jasa bermilestone memakai tranche (`escrow_milestone_tranches`) dalam kontrak yang sama; kontrak menjadi `Released` setelah tranche terakhir cair. Timer auto-release: fisik = 7 hari sejak `Delivered`; jasa = 72 jam sejak `Submitted`. Escrow yang `Locked` tetapi penjual tidak memenuhi Fulfillment SLA berujung `Refunded` (jalur timeout). Hanya Escrow Service yang mengubah kontrak dan tranche.

## D6. KYC/KYB
Moderator memverifikasi dokumen via `IdentityQueue` (rekomendasi); Admin mengesahkan final. AI hanya memberi saran skrining, tidak pernah approve/reject.

## D7. Format status
Kolom bernama `status` (kecuali tabel domain yang sudah punya `status` ganda, diberi suffix eksplisit), nilai `lowercase_snake_case` di database (`under_review`). Penulisan PascalCase di dokumen adalah label tampilan.

## D8. Sanksi otomatis
Mesin aturan deterministik (bukan AI) boleh membekukan sementara (freeze) secara otomatis. Penetapan Level 3 (permanent ban), pembatalan sanksi, dan pemulihan akun wajib keputusan Admin manusia, dicatat di `governance_decisions`.

## D9. Retensi vs immutability
Tabel log tetap append-only. Purge terjadwal oleh job retensi (bukan aplikasi) adalah satu-satunya pengecualian DELETE, hanya untuk kelas INFORMATIONAL setelah 180 hari dan chat privat setelah 1 tahun; eksekusi purge dicatat. Log CRITICAL tidak dipurge sebelum 7 tahun, sedangkan log IMPORTANT mengikuti retensi 2 tahun. Permintaan hapus data pribadi dipenuhi dengan anonimisasi, bukan penghapusan baris log.
