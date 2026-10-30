# AI GOVERNANCE 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `ai-governance.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Kebijakan Utama** | **Human-in-the-Loop (HITL) untuk Aksi Kritis** |

---

## A. BATASAN OTORITAS TINDAKAN AI (AI AUTHORITY BOUNDARIES)

Mengatur batasan etika dan otorisasi apa saja yang boleh dijalankan oleh kecerdasan buatan secara otonom, dan tindakan apa saja yang wajib melibatkan keputusan manusia.

### 1. Tindakan yang Boleh Dieksekusi AI Secara Otomatis (*Fully Automated Allowed*)
* Menerjemahkan bahasa pada teks artikel publik (`AI Translation`).
* Menyusun saran optimasi pencarian kata kunci deskripsi produk (`AI SEO Tools`).
* Menandai konten berisiko melalui `AI Content Moderation` sebagai saran untuk antrean Moderation. AI tidak memutuskan publikasi atau sanksi.

### 2. Tindakan yang Dilarang Keras Dieksekusi Oleh AI (*Strictly Forbidden*)
* Memberikan status persetujuan atau penolakan pada dokumen verifikasi sipil (`Approve/Reject KYC`).
* Mengeksekusi penarikan uang atau pelepasan dana dari rekening bersama (`Approve Payment / Release Escrow`).
* Mengubah status akun/peran, menyetujui atau menolak konten/verifikasi/sengketa, menahan atau mencairkan dana, atau menjatuhkan sanksi apa pun.

---

## B. PERSYARATAN TINJAUAN MANUSIA (HUMAN REVIEW REQUIRED)
Hasil AI yang sensitif hanya berupa rekomendasi dan harus dicatat oleh domain Moderation pada antrean terkait sebelum ada keputusan manusia. Moderator dapat merekomendasikan; Admin mengesahkan KYC/KYB, Level 3, pemulihan akun, dan keputusan final berisiko tinggi. Berlaku khusus pada:
* Pengajuan keberatan atas penangguhan akun pengguna (*Sanction Appeals*).
* Resolusi penentuan pemenang sengketa finansial transaksi (`Escrow Dispute Arbitration`).
* Penolakan pendaftaran legalitas badan usaha vendor (`Vendor Rejection Rationale`).

Mesin aturan deterministik untuk freeze sementara adalah komponen terpisah dari AI; kewenangan dan batas waktunya mengikuti `governance-sanction-rules.md`. `ai_screening_logs` dimiliki dan ditulis hanya oleh Moderation.


---
