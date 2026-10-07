# Dashboard Status Kemampanan Bandar (MURNInets) Negeri Selangor 2026

Dashboard statik responsif untuk GitHub Pages, dibina berdasarkan PDF **Mesyuarat Verifikasi Data Pelaksanaan Jaringan Penunjuk Pembangunan Mampan Bandar-Luar Bandar Malaysia (MURNInets 2.0) Tahun 2026**.

## Kandungan
- 12 PBT Negeri Selangor
- 6 dimensi MURNInets
- 48 indikator (halaman 2–49 PDF)
- Carta interaktif untuk indikator terpilih
- Penjelajah 48 indikator + pautan terus ke halaman PDF
- Tema visual smart-city / urban sustainability

## Cara publish ke GitHub Pages
1. Upload semua fail dalam folder ini ke root repository GitHub.
2. Buka **Settings → Pages**.
3. Di **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)` kemudian **Save**.
5. Tunggu 1–3 minit dan buka URL GitHub Pages yang diberikan.

## Fail
- `index.html` — struktur dashboard
- `styles.css` — reka bentuk dan responsif
- `data.js` — senarai 48 indikator dan set data carta terpilih
- `app.js` — logik carta, carian, filter dan modal PDF
- `source/slides_murninets_dashboard_SUO.pdf` — PDF rujukan

## Nota data
PDF sumber tidak menyediakan satu skor komposit akhir MURNInets bagi setiap PBT untuk mengklasifikasikan keseluruhan PBT sebagai Mampan / Sederhana Mampan / Kurang Mampan. Oleh itu dashboard ini tidak mencipta skor keseluruhan rekaan. Warna status pada carta hanya digunakan bagi indikator terpilih dan ambang paparan yang dinyatakan dalam kod.
