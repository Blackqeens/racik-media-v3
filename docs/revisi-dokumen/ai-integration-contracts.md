# AI INTEGRATION CONTRACTS
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `ai-integration-contracts.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Prinsip** | **AI sebagai Processor Tanpa Akses Mutasi Langsung** |

---

## A. PEMBATASAN AKSES INTEGRASI AI (CONTEXT BOUNDARY)
Modul AI menggunakan Langflow sebagai orkestrator dan Google Cloud Vertex AI sebagai provider model; integrasi dibatasi ketat:
* **Anti-Mutation Law:** AI dilarang keras melakukan manipulasi data atau mengubah status tabel inti (seperti mengubah status `order_id` menjadi selesai, atau mengubah status `escrow_contracts`) secara langsung.
* **API Gateway Only:** Seluruh interaksi data melewati API Gateway terautentikasi dan service owner; tidak ada akses DB langsung. Permintaan hanya membawa data minimum yang telah disanitasi.

---

## B. SKEMA KONTRAK DATA INTEGRASI AI (*API INTEGRATION MAP*)

| Nama Layanan AI | Skema Masukan (*Input Payload*) | Skema Keluaran (*Output Payload*) | Batasan Skala (*Rate Limits*) | Target Audit Log |
| :--- | :--- | :--- | :--- | :--- |
| **AI Translation** | `{ text: String, targetLang: String }` | `{ suggestion: String, modelVersion: String }` | Maks 5,000 karakter/request | Audit usage; Content tetap pemilik hasil |
| **AI SEO Generator**| `{ productTitle: String, tags: Array }`| `{ suggestion: String, modelVersion: String }` | 10 request/menit/user | Audit usage; Marketplace tetap pemilik hasil |
| **AI Content Moderation**| `{ entityId: UUID, text: String }` | `{ riskLevel: String, reasonCodes: Array, confidence: Number }`| Rate-limited per entity | `moderation.ai_screening_logs` |
| **Sanction Appeal Assistance** | `{ appealId: UUID, evidenceText: String }` | `{ recommendation: String, reasonCodes: Array }` | Dipanggil saat dibutuhkan | `moderation.ai_screening_logs` |
| **Escrow Dispute Assistance** | `{ disputeId: UUID, evidenceReferences: Array }` | `{ recommendation: String, reasonCodes: Array }` | Dipanggil saat dibutuhkan | `moderation.ai_screening_logs` |
| **Vendor Rejection Assistance** | `{ verificationId: UUID, documentReviewReferences: Array }` | `{ recommendation: String, reasonCodes: Array }` | Dipanggil saat dibutuhkan | `moderation.ai_screening_logs` |

---

## C. KEBIJAKAN MANAJEMEN BIAYA (COST CONTROLS)
Sistem mencatat penggunaan/biaya AI tanpa menyimpan prompt sensitif secara default. Pada ambang anggaran 90%, fitur non-kritis dialihkan ke proses manual. Semua output adalah saran; tidak ada output AI yang mengubah data atau menjadi keputusan otomatis.
