# API STANDARDS 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `api-standards.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |

---

## A. BASE URL & VERSIONING
* **Format:** `/api/v{version}`
* **Default Active:** `/api/v1`
* **Prinsip:** Perubahan minor tidak boleh merusak fungsi klien lama (*never break old clients*). Perubahan besar yang merusak kompatibilitas (*breaking changes*) wajib menaikkan versi rute menjadi `/api/v2`.

---

## B. RESOURCE NAMING CONVENTIONS
Penamaan endpoint wajib menggunakan kata benda jamak (*plural noun*) dengan format tulisan huruf kecil semua (*lowercase*). Dilarang memasukkan kata kerja dalam jalur rute URL.

| Jenis Aksi | ✅ Benar (RESTful) | ❌ Salah (RPC Style) |
| :--- | :--- | :--- |
| **Ambil Data** | `GET /api/v1/users` | `GET /api/v1/getUsers` |
| **Buat Data** | `POST /api/v1/products` | `POST /api/v1/createProduct` |
| **Sub-Resource** | `POST /api/v1/orders/{id}/payments` | `POST /api/v1/payOrder` |

---

## C. HTTP METHODS USE CASE
* `GET`: Membaca data resource (Idempotent, aman dari mutasi data).
* `POST`: Membuat data resource baru atau memicu aksi autentikasi/perintah khusus. Pengecualian kata kerja hanya untuk action endpoint yang tidak merepresentasikan resource, misalnya `/api/v1/auth/login`, `/api/v1/auth/logout`, dan `/api/v1/auth/refresh`.
* `PUT`: Mengganti seluruh data resource secara total.
* `PATCH`: Mengubah sebagian properti data resource secara spesifik.
* `DELETE`: Menghapus resource secara logis hanya bila entitas memiliki `deleted_at` dan kebijakan retensinya mengizinkan. Endpoint tidak boleh menghapus baris append-only atau audit; purge retensi hanya melalui job terjadwal.

---

## D. STANDAR FORMAT PAYLOAD RESPONS

### 1. Respons Berhasil (Success Response - HTTP 200/201)
```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

### 2. Respons Gagal (Error Response - HTTP 4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": []
  }
}
```

---

## E. HTTP STATUS CODES STANDARD
* `200 OK`: Permintaan berhasil diproses.
* `201 Created`: Resource baru berhasil dibuat.
* `400 Bad Request`: Format payload salah atau tidak terbaca oleh server.
* `401 Unauthorized`: Autentikasi gagal atau token tidak valid/kedaluwarsa.
* `403 Forbidden`: Token valid tetapi user tidak memiliki izin akses (RBAC/ABAC gagal).
* `404 Not Found`: Resource yang diminta tidak ditemukan di database.
* `409 Conflict`: Konflik status data (contoh: email sudah terdaftar).
* `422 Validation Error`: Validasi skema input gagal (contoh: format email salah). Aturan: 400 = body tidak terbaca/JSON rusak; 422 = body terbaca tetapi gagal validasi.
* `429 Too Many Requests`: Batas rate limit (API Gateway/AI) terlampaui; sertakan header `Retry-After`.
* `500 Internal Error`: Kesalahan sistem internal pada sisi backend.
