# Dashboard Status Kemampanan Bandar (MURNInets) Negeri Selangor 2026 — Versi Premium

Versi ini dikemas kini supaya lebih hampir dengan contoh dashboard rujukan pengguna, termasuk:

- tema warna premium putih–oren–merah,
- sidebar kiri seperti gaya dashboard korporat,
- logo bergaya **SUO** dan **PLANMalaysia Selangor**,
- peta utama dengan **sempadan setiap PBT beserta nama PBT**, dan
- carta ranking serta status prestasi.

## Ciri utama
1. **Peta embedded tanpa kebergantungan servis luaran**
   - peta dibina secara terus dalam SVG di dalam fail dashboard;
   - setiap PBT mempunyai sempadan visual sendiri;
   - nama PBT dipaparkan terus pada peta;
   - pengguna boleh klik kawasan PBT untuk menapis analisis.

2. **Paparan premium**
   - KPI cards
   - filter bar
   - peta utama besar
   - ranking PBT
   - carta status prestasi
   - profil PBT dipilih
   - taburan 48 indikator dan senarai indikator

3. **Sedia untuk GitHub Pages**
   - tiada build process diperlukan
   - hanya upload ke repository dan aktifkan Pages

## Kandungan fail
- `index.html`
- `styles.css`
- `data.js`
- `app.js`
- `source/slides_murninets_dashboard_SUO.pdf`

## Cara publish ke GitHub Pages
1. Upload semua fail ke root repository GitHub anda.
2. Pergi ke **Settings → Pages**.
3. Pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/(root)`.
5. Klik **Save**.
6. Tunggu 1–3 minit dan buka pautan GitHub Pages anda.

## Nota
- Data indikator masih berpandukan dokumen verifikasi MURNInets 2026 yang anda beri.
- Peta embedded dibina untuk memastikan label nama PBT dan sempadan sentiasa keluar stabil pada GitHub Pages.
- Jika anda mahu versi seterusnya yang lebih dekat kepada peta GIS sebenar, fail ini boleh dinaik taraf lagi dengan GeoJSON rasmi apabila data sempadan rasmi tersedia dalam bentuk yang mudah dicapai.
