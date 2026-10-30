# EVENT CONTRACTS 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `event-contracts.md` |
| **Versi** | 1.2 (Dual-Format EDA Mapping & Logistics Contract) |
| **Status** | **In review; senior architect approval pending** |

---

## A. KONVENSI PENAMAAN EVENT
* **Format Wire / Message Broker (RabbitMQ):** `DOMAIN_ACTION` (huruf kapital dengan pemisah garis bawah), diturunkan otomatis dari nama kanonik. Contoh: `IDENTITY_ROLE_ACTIVATED`, `CONTENT_PUBLISHED`, `ORDER_ESCROW_LOCKED`, `LOGISTICS_DELIVERED`.
* **Format In-Process Event-Bus (`src/core/events/`):** `domain.action` (Huruf kecil dengan pemisah titik). Contoh: `identity.role_activated`, `content.published`, `catalog.approved`, `order.escrow_locked`, `escrow.milestone_released`.
* **Aturan Pemetaan:** Keduanya merepresentasikan peristiwa yang sama. Nama wire diturunkan deterministik dari nama kanonik: huruf besar, titik menjadi `_` (`escrow.milestone_released` -> `ESCROW_MILESTONE_RELEASED`). Tabel resmi ada di `event-map.md §B`. Field payload memakai camelCase; payload tidak boleh membawa NIK, rekening, atau email (ADR-001 D3).

---

## B. SKEMA STRUKTUR DATA EVENT (MANDATORY FIELDS)
Setiap pesan event yang dialirkan ke Event Bus / Message Broker wajib mematuhi kontrak JSON minimum berikut:

```json
{
  "eventId": "String (UUID v4 - Unik untuk setiap pesan log event)",
  "correlationId": "String (UUID v4 - Pengikat rantai proses hulu-ke-hilir)",
  "eventType": "String (Nama wire turunan dari event-map, e.g., 'ORDER_CREATED')",
  "aggregateId": "String (UUID v4 - ID entitas utama yang berubah, e.g., order_id)",
  "timestamp": "ISO 8601 UTC (Waktu presisi kejadian)",
  "actorId": "String (UUID - pengguna/sistem pemicu)",
  "metadata": "Object (opsional)",
  "payload": {
    "type": "Object (field camelCase; ID rujukan dan data minimum non-sensitif)"
  }
}
```

---

## C. KONTRAK DATA LOGISTIK & ASAL-USUL (*LOGISTICS CONTRACT PAYLOADS*)

### 1. Kontrak Event Pengiriman Selesai (`LOGISTICS_DELIVERED`)
Setiap provider kurir terintegrasi wajib mengembalikan payload terstruktur saat paket diterima fisik oleh pengguna:
```json
{
  "eventId": "f83b21f9-4d6f-4740-b6a3-7d83490b4312",
  "correlationId": "a90b4312-4d6f-4740-b6a3-f83b21f922ab",
  "eventType": "LOGISTICS_DELIVERED",
  "aggregateId": "b921fa41-6123-4cba-8902-123456789abc",
  "timestamp": "2026-10-24T16:00:00Z",
  "actorId": null,
  "payload": {
    "orderId": "b921fa41-6123-4cba-8902-123456789abc",
    "trackingRecordId": "73f23a90-6123-4cba-8902-123456789abc",
    "deliveredAt": "2026-10-24T16:00:00Z"
  }
}
```

### 2. Kontrak Event Pelanggaran Validasi Resi (`LOGISTICS_TRACKING_INVALID`)
Dipicu setelah resi gagal diverifikasi ulang; kegagalan provider saja tidak cukup untuk menyatakan resi palsu:
```json
{
  "eventId": "e12c3456-789a-bcde-f012-3456789abcde",
  "correlationId": "a90b4312-4d6f-4740-b6a3-f83b21f922ab",
  "eventType": "LOGISTICS_TRACKING_INVALID",
  "aggregateId": "b921fa41-6123-4cba-8902-123456789abc",
  "timestamp": "2026-10-24T16:02:00Z",
  "actorId": null,
  "payload": {
    "orderId": "b921fa41-6123-4cba-8902-123456789abc",
    "trackingRecordId": "73f23a90-6123-4cba-8902-123456789abc",
    "vendorId": "78a1bc23-45ef-4789-8123-abcdef456789",
    "reasonCode": "provider_revalidation_failed"
  }
}
```

---

## D. PRINSIP ASINKRONUS (EVENT PRINCIPLES)
1. **Immutability:** Event yang sudah terbit menjadi catatan sejarah yang kekal. Tidak boleh diubah atau dihapus.
2. **At-Least-Once Delivery:** Penerima harus siap menangani potensi duplikasi dengan menerapkan konsumen idempoten (*Idempotent Consumer*).


---

Nama event, publisher, consumer, dan payload wajib mengikuti `event-map.md`; contoh wire di atas tidak mengandung nama penerima, nomor resi, alamat, foto, email, atau raw response provider. Event diterbitkan melalui outbox domain owner.
