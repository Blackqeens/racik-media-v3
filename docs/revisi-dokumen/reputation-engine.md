# MASTER REPUTATION ENGINE SPECIFICATION

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `reputation-engine.md` |
| **Versi** | 1.3 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Domain Owner** | Reputation |

## 1. MODEL SKOR DAN PEMILIK DATA

Reputation memiliki satu skor master per pengguna dalam rentang 0–1000. Skor awal adalah 100; skor akhir dibatasi dengan `max(0, min(1000, current_score + score_delta))`. `core_reputations` adalah read model yang dimiliki Reputation, sedangkan `reputation_events` adalah append-only ledger sumber kebenaran untuk perhitungan.

```text
core_reputations:
  id, tenant_id, user_id (UNIQUE), master_score, updated_at

reputation_events (append-only):
  id, tenant_id, user_id, reason_code, score_delta,
  source_event_id (UNIQUE), source_domain, created_at

reputation_decay_logs (append-only):
  id, tenant_id, user_id, score_delta, reason_code, created_at
```

Consumer Reputation memproses event idempoten berdasarkan `source_event_id`; setiap perubahan score emitu `reputation.score_updated`. Tidak ada domain lain yang boleh mengubah skor atau ledger reputasi langsung.

## 2. DAMPAK SKOR DAN ISOLASI PERAN

Skor master memengaruhi kepercayaan lintas platform dan ranking publik, tetapi tidak otomatis menonaktifkan semua peran maupun menyita dana. Kapabilitas transaksi yang dibatasi mengikuti `roles.status` dan `users.status` yang ditetapkan oleh Identity setelah keputusan Governance atau aturan sementara yang diizinkan. Reputasi hanya mengirim sinyal/score event; Search menggunakan skor sebagai salah satu faktor ranking.

Jika pelanggaran terkait satu listing atau peran, dampak tampilan dipersempit ke listing/peran terkait. Pembekuan global hanya dilakukan melalui Identity berdasarkan event/kewenangan yang ditetapkan di `governance-sanction-rules.md`.

## 3. KODE ALASAN DAN DELTA

| `reason_code` | Sumber | Delta | Kondisi |
| :--- | :--- | ---: | :--- |
| `knowledge_approved` | Content | +2 | Konten lolos kurasi dan dipublikasikan |
| `order_fulfilled` | Escrow | +1 | Tranche berhasil dicairkan setelah pemenuhan |
| `provenance_verified` | Provenance | +15 | Bukti asal-usul tervalidasi |
| `tracking_number_invalid` | Logistics | -250 | Resi terbukti palsu setelah validasi |
| `provenance_violation` | Provenance | -250 | Pemalsuan asal-usul terverifikasi |
| `penalty_reversed` | Governance | +250 atau nilai tercatat | Banding berhasil; tidak boleh melebihi skor 1000 |
| `inactivity_decay` | Reputation | -5 per bulan yang memenuhi aturan | Tidak ada aktivitas sah selama lebih dari 6 bulan |

Delta transaksi sengketa lain ditentukan keputusan Governance yang memiliki alasan, bukti, dan batas dampak yang terdokumentasi; tidak ada penalti default `-25` yang bertentangan dengan tabel ini. False positive tidak dikenakan penalti sampai verifikasi selesai. Pembalikan dibuat sebagai baris/event baru, tidak menghapus ledger.

## 4. INACTIVITY DECAY

Job Reputation menjalankan decay paling banyak satu kali per bulan setelah enam bulan tanpa aktivitas sah. Setiap penyesuaian dicatat pada `reputation_decay_logs` dan `reputation_events` dengan `reason_code = inactivity_decay`. Skor tidak boleh turun di bawah 0; job tidak mengubah status akun/peran.

## 5. INTEGRASI DAN PRIVASI

Input hanya berasal dari event owner yang tercatat pada `event-map.md`. Event reputasi ke consumer hanya memuat ID rujukan, skor, dan reason code; data pribadi tidak disalin ke ledger. `reputation_events` bersifat append-only dan tidak dihapus; pembetulan memakai event kompensasi baru.
