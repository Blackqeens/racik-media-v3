# USULAN KEPUTUSAN ARSITEKTUR (untuk disetujui senior)

Status: Usulan sinkronisasi disetujui pemohon; pengesahan resmi arsitek senior menunggu. Detail normatif ada di ADR-001-keputusan-arsitektur.md.

| # | Keputusan | Usulan default | Ref |
|---|---|---|---|
| 1 | Acuan peta domain | `data-ownership` menjadi acuan domain granular; `domain-map` memetakan konteks tingkat atas ke 23 domain granular | K-01 |
| 2 | Chat & Community | Order/Support Chat di V3.0 (bukti sengketa); forum, grup, feed di V3.1 | K-02 |
| 3 | Event | Satu katalog di `event-map`; nama kanonik `domain.action`; wire format = huruf besar, titik jadi `_`; satu publisher per event (owner aggregate) | K-05, K-19 |
| 4 | Penulis tabel | Hanya domain owner yang menulis; domain lain lewat event/API | K-04, K-36 |
| 5 | Escrow | Satu kontrak per order; jasa memakai tranche per milestone; auto-release fisik 7 hari dari Delivered, jasa 72 jam dari Submitted | K-20 |
| 6 | KYC/KYB | Moderator verifikasi via IdentityQueue, Admin mengesahkan; AI hanya saran | K-24, K-35 |
| 7 | Format status | Kolom `status`, nilai lowercase snake_case di DB; PascalCase hanya label | K-03 |
| 8 | Sanksi otomatis | Mesin aturan (non-AI) boleh freeze sementara; Level 3 dan pemulihan wajib Admin | K-22, K-37 |
| 9 | Retensi vs immutability | Purge terjadwal sebagai pengecualian; INFORMATIONAL 180 hari dan chat privat 1 tahun; CRITICAL minimum 7 tahun; anonimisasi PII | K-33 |
