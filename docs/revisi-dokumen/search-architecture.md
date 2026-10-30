# SEARCH ARCHITECTURE 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `search-architecture.md` |
| **Versi** | 1.0 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Prinsip Utama** | **Asynchronous Read-Optimized Indexing** |

---

## A. ALUR PENCARIAN DATA (SEARCH FLOW)

```text
[ Input Pengguna ] -> Proses pembersihan string input teks (Sanitization)
       │
       ▼
[ Query Processing ] -> Pemecahan kata kunci (Tokenization & Stemming)
       │
       ▼
[ Meilisearch ] -> Pencocokan data di read model yang dibangun dari event owner
       │
       ▼
[ Ranking Engine ] -> Pembobotan skor relevansi berbasis parameter spesifik
       │
       ▼
[ Terjemahan Hasil ] -> Pengembalian payload data terklasifikasi ke antarmuka pengguna
```

---

## B. CAKUPAN DAN STRATEGI INDEKS DATA (INDEXING SCOPE)
Meilisearch mengelola indeks read model: `catalog_items`, `service_listings`, `content_items`, `community_public`, dan profil publik vendor. Data pribadi, dokumen identitas, percakapan privat, order, serta data rekening tidak diindeks.

---

## C. FAKTOR PEMBOBOTAN SKOR PERINGKAT (RANKING FACTORS)

### 1. Bobot Peringkat Katalog Marketplace
* **Relevansi teks:** prioritas utama untuk kecocokan judul/deskripsi.
* **Trust:** skor reputasi tervalidasi memengaruhi peringkat; pelanggaran terverifikasi dapat memberi multiplier minimum 0.1x hanya pada listing/peran terkait.
* **Knowledge-backed multiplier:** konten terverifikasi memberi faktor 1.00–2.00 pada listing terkait.
* **Review dan fulfillment:** sinyal kualitas berasal dari Review dan Logistics/Escrow event yang tervalidasi.
* **Pro Member:** dapat memperoleh benefit visibilitas terbatas, tetapi tidak mengalahkan status kurasi, trust, relevansi, atau keselamatan pengguna.
* Jasa `geolocated` difilter berdasarkan radius/jarak bila pengguna meminta lokasi.
* Dilarang menyediakan urutan harga termurah sebagai ranking default; filter rentang harga tetap diperbolehkan jika sesuai kebijakan produk.

### 2. Strategi Tembolok & Filtrasi (Caching & Filtering)
Hasil populer disimpan di Redis dengan TTL 10 menit. Redis dan Meilisearch adalah read/cache layer yang dapat dibangun ulang dari PostgreSQL + event/outbox; tidak menjadi sumber kebenaran.
