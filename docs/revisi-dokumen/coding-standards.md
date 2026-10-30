# CODING STANDARDS 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `coding-standards.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |

---

## A. ARSITEKTUR KODE & PRINSIP UTAMA
Aplikasi dibangun di atas pondasi kokoh empat pilar: **Clean Code**, **SOLID**, **DRY** (Don't Repeat Yourself), dan **KISS** (Keep It Simple, Stupid).

---

## B. KONVENSI PENAMAAN BERKAS & FOLDER
* **Nama Folder:** Wajib menggunakan format huruf kecil dipisah tanda hubung (`kebab-case`). Folder domain menggunakan nama domain kanonik, misalnya `src/features/vendor/`, `src/features/service-marketplace/`, dan `src/features/escrow/`.
* **Nama Berkas (File Naming):** Menggunakan pola komponen titik. Format: `{resource}.{type}.ts`.
  * *Contoh:* `user.service.ts`, `order.repository.ts`, `vendor.controller.ts`.

---

## C. STANDAR PENULISAN FUNGSI (FUNCTIONS)
Fungsi wajib ditulis secara deskriptif menggunakan format camelCase dan diawali dengan kata kerja aksi yang jelas.

* **✅ Benar:** `createOrder()`, `approveVendor()`, `calculateEscrowFee()`.
* **❌ Salah:** `doStuff()`, `run()`, `processData()`, `handle()`.

---

## D. ATURAN PEMISAHAN TANGGUNG JAWAB (RULES OF RESPONSIBILITY)
1. **One Purpose Module:** Satu modul atau kelas hanya boleh bertanggung jawab untuk satu fungsi bisnis khusus.
2. **Fat Service, Skinny Controller:** Dilarang keras menulis logika bisnis (*business logic*), kueri database, atau aturan validasi mendalam di dalam berkas Controller. Controller hanya bertugas menerima input request, memeriksa skema dasar, dan melempar eksekusi ke lapisan Service.
