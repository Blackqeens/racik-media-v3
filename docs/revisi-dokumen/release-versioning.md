# RELEASE VERSIONING 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `release-versioning.md` |
| **Versi** | 1.0 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Aturan Versi**| **Semantic Versioning (MAJOR.MINOR.PATCH)** |

---

## A. TAHAPAN STRATEGI PETA RILIS BESAR (MAJOR REVISIONS MAP)

Peta rilis arsitektur Racik Media V3 dikunci ketat ke dalam pembagian modul berbasis urutan ketergantungan hilir:

```text
[ PRODUCT V3.0 / PHASE 1-2: FOUNDATION + COMMERCE ]
└── Identity, Security, Membership, Vendor, Content, Marketplace, Service,
    Moderation, Audit, Search dasar, Reputation dasar, Order, Payment, Escrow,
    Logistics, Provenance, Order/Support Chat, Notification

[ PRODUCT V3.1 / PHASE 3: COMMUNITY & TRUST ]
└── Forum, Groups, Feed, Private/Vendor Chat, Search lanjutan, Review,
    Reputation lanjutan, Analytics

[ PRODUCT V3.x / PHASE 4: AI CENTER ]
└── AI screening assistance, SEO suggestions, translation (human-in-the-loop)

[ PRODUCT V3.x / PHASE 5: ENTERPRISE ]
└── Multi-tenant, developer API, advanced team permissions
```

---

## B. ATURAN SEMANTIK PERUBAHAN VERSI (VERSIONING RULES)
* **PATCH (e.g., `1.0.1` -> `1.0.2`):** Rilis perbaikan bug (*Bug Fix Only*). Dilarang keras menambah properti data baru atau mengubah tanda metode API.
* **MINOR (e.g., `1.0.0` -> `1.1.0`):** Penambahan fitur baru yang berjalan searah (*Backward Compatible*). Klien versi lama wajib tetap berfungsi normal tanpa modifikasi kode.
* **MAJOR (e.g., `1.0.0` -> `2.0.0`):** Perubahan besar yang merusak kompatibilitas lama (*Breaking Changes*). Wajib menyertakan skema migrasi database (`migration notes`) dan prosedur pembatalan rilis (*rollback plan*).

---

## C. STRATEGI MANAJEMEN CABANG KODE (GIT BRANCH STRATEGY)
* `main`: Cabang suci produksi live (*Production Stable*). Hanya menerima penggabungan kode dari cabang `staging` atau `hotfix/*`.
* `develop`: Pusat integrasi harian pengembang (*Development Zone*).
* `feature/*`: Cabang isolasi mandiri untuk penulisan fitur baru. Bermuara kembali ke cabang `develop`.
* `hotfix/*`: Cabang darurat perbaikan kutu produksi live. Wajib digabungkan kembali secara instan ke `main` dan `develop`.



## D. PEMBEDA VERSI PRODUK DAN SEMVER
`V3` adalah nama produk dan `V3.0`/`V3.1` adalah milestone rilis produk, bukan versi SemVer. Build/API memakai SemVer (`MAJOR.MINOR.PATCH`); perubahan breaking menaikkan MAJOR dan versi API (`/api/v2` bila kontrak API rusak), sementara penambahan kompatibel menaikkan MINOR dan perbaikan kompatibel menaikkan PATCH.

## E. STRATEGI CABANG
`main` berisi produksi; `develop` integrasi harian; `feature/*` bergabung ke `develop`; `staging` adalah pra-produksi yang dibuat dari `develop` dan satu-satunya sumber merge reguler ke `main`; `hotfix/*` dapat merge ke `main` dan wajib disinkronkan kembali ke `develop`.
