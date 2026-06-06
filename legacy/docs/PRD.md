# PRD - DOCX to JSON Converter

## 1. Project Overview

DOCX to JSON Converter adalah aplikasi lokal berbasis browser yang digunakan untuk mengubah dokumen Microsoft Word (`.docx`) menjadi file JSON sesuai format yang telah ditentukan.

Aplikasi dirancang untuk pengguna non-IT sehingga memiliki tampilan sederhana, mudah digunakan, dan tidak memerlukan instalasi server, database, maupun koneksi internet.

## 2. Project Goals

### Primary Goal

Mengubah dokumen Word (`.docx`) menjadi file JSON berdasarkan struktur dan mapping yang telah ditentukan.

### Secondary Goals

- Mempermudah proses ekstraksi data dari dokumen Word.
- Mengurangi proses input manual.
- Menstandarkan format data menjadi JSON.
- Memungkinkan penambahan template dokumen baru di masa depan.

## 3. Target Users

### Primary Users

- Admin
- Staff Operasional
- Business User
- Non-Technical User

### Technical Users

- Developer
- System Analyst

## 4. Out of Scope

Aplikasi TIDAK mencakup:

- Database
- REST API
- Authentication/Login
- Cloud Storage
- Auto-save file
- PDF Conversion
- DOC (Legacy Word Format)
- OCR / Image Recognition
- AI Extraction

## 5. User Flow

### Convert DOCX to JSON

1. User membuka aplikasi.
2. User memilih file `.docx`.
3. Sistem melakukan validasi file.
4. Sistem membaca isi dokumen.
5. Sistem melakukan mapping sesuai rule yang ditentukan.
6. Sistem menghasilkan JSON.
7. Sistem menampilkan preview JSON.
8. User mengunduh file JSON.

## 6. Functional Requirements

### FR-001 Upload DOCX

User dapat memilih file `.docx` dari komputer.

Validation:

- File wajib berekstensi `.docx`.
- File tidak boleh kosong.
- Maksimum ukuran file configurable.

### FR-002 Read DOCX Content

Sistem dapat membaca:

- Heading
- Paragraph
- Table
- List

### FR-003 Mapping Engine

Sistem dapat mengubah isi dokumen menjadi struktur JSON berdasarkan mapping yang telah ditentukan.

Contoh Word:

```text
Nama Customer : John Doe
```

Contoh JSON:

```json
{
  "customerName": "John Doe"
}
```

### FR-004 JSON Preview

Sistem menampilkan hasil JSON dalam format yang mudah dibaca (`pretty print`).

### FR-005 Download JSON

User dapat mengunduh hasil konversi sebagai file `.json`.

Nama file default:

```text
sample.docx
sample.json
```

## 7. Non Functional Requirements

### Performance

- Proses konversi < 5 detik untuk dokumen normal.
- Tidak melakukan upload ke server.
- Semua proses berjalan di browser.

### Usability

- Tampilan sederhana.
- Mudah digunakan oleh non-IT.
- Maksimal 3 klik untuk menghasilkan JSON.

### Security

- Tidak menyimpan file user.
- Tidak mengirim data keluar browser.
- Semua proses berjalan lokal.

### Maintainability

- Kode modular.
- Mudah menambah mapping baru.
- Mudah menambah template baru.

## 8. Technology Stack

### Frontend

- HTML5
- Bootstrap 5
- JavaScript ES6

### Library

- Mammoth.js

### Output

- JSON

### Runtime

- Browser (Chrome, Edge)

## 9. Project Structure

```text
docx-to-json-converter/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── parser.js
│       └── json-mapper.js
├── lib/
│   └── mammoth.browser.min.js
├── samples/
│   ├── word/
│   │   ├── sample_01.docx
│   │   ├── sample_02.docx
│   │   └── README.md
│   └── json/
│       ├── sample_01.json
│       ├── sample_02.json
│       └── README.md
├── docs/
│   ├── PRD.md
│   ├── JSON_SCHEMA.md
│   └── MAPPING_RULE.md
└── README.md
```

## 10. Mapping Configuration

### Source Document

Folder:

```text
samples/word/
```

Berisi contoh dokumen Word yang menjadi referensi parser.

### Expected JSON

Folder:

```text
samples/json/
```

Berisi JSON hasil yang diharapkan.

### Mapping Rule

File:

```text
docs/MAPPING_RULE.md
```

Contoh:

```text
Nama Customer
-> customerName

Tanggal Lahir
-> birthDate

Nominal Pinjaman
-> loanAmount

Tenor
-> loanTenor
```

## 11. JSON Output Structure

Contoh:

```json
{
  "customerName": "John Doe",
  "birthDate": "1990-01-01",
  "loanAmount": 10000000,
  "loanTenor": 12
}
```

Struktur final akan mengikuti contoh file yang tersedia pada:

```text
samples/json/
```

## 12. MVP Acceptance Criteria

Aplikasi dianggap selesai apabila:

- User dapat memilih file `.docx`.
- Sistem dapat membaca dokumen.
- Sistem dapat menghasilkan JSON.
- Sistem dapat menampilkan preview JSON.
- User dapat mengunduh file JSON.
- Tidak ada API.
- Tidak ada database.
- Tidak ada penyimpanan file.
- Seluruh proses berjalan lokal di browser.
- Mapping mengikuti contoh Word dan JSON yang disediakan.

## 13. Future Enhancement

Versi berikutnya dapat menambahkan:

- Multiple Template Support
- Drag & Drop Upload
- Batch Conversion
- JSON Schema Validation
- Template Configuration UI
- PDF Support
- AI-Based Mapping Assistant
