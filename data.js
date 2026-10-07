const DIMENSIONS = [
  {id:1,name:'Ekonomi Berdaya Saing',count:2,color:'#ef612c'},
  {id:2,name:'Kualiti Persekitaran Mampan',count:7,color:'#f59a1b'},
  {id:3,name:'Komuniti Sejahtera',count:20,color:'#db3b49'},
  {id:4,name:'Guna Tanah dan Sumber Asli',count:6,color:'#7db56b'},
  {id:5,name:'Infrastruktur dan Pengangkutan Efisien',count:7,color:'#4ea0ac'},
  {id:6,name:'Urus Tadbir Efektif',count:6,color:'#7b67c9'}
];

const INDICATORS = [
  [2,1,'ET1 – P1','Kadar Pertumbuhan Tenaga Buruh'],[3,1,'ET2 – P1','Kadar Kemiskinan'],
  [4,2,'ST1 – P1','Status Kualiti Air Sungai'],[5,2,'ST1 – P2','Keadaan Kualiti Udara Persekitaran'],[6,2,'ST2 – P1','Bilangan Inisiatif Pelaksanaan dan Pengurusan Risiko Bencana'],[7,2,'ST2 – P2','Ketersediaan Pelan Ketahanan Bandar / Pelan Tindakan Rendah Karbon'],[8,2,'ST3 – P2','Bilangan Inisiatif Pelaksanaan dan Pengurusan Alam Sekitar'],[9,2,'ST3 – P4','Penyediaan Pelan Tindakan Berkaitan Mobiliti Rendah Karbon'],[10,2,'ST3 – P5','Peratus Aduan Kes Pencemaran Alam Sekitar yang Selesai Siasatan'],
  [11,3,'KT1 – P1','Peratus Pencapaian Penyediaan Rumah Mampu Milik Mengikut Sasaran Negeri'],[12,3,'KT2 – P2','Nisbah Bilangan Katil Hospital'],[13,3,'KT2 – P3','Nisbah Bilangan Klinik (Kerajaan & Swasta)'],[14,3,'KT2 – P4','Nisbah Sekolah Rendah Kepada Penduduk'],[15,3,'KT2 – P5','Nisbah Sekolah Menengah Kepada Penduduk'],[16,3,'KT2 – P6','Jumlah Pra Sekolah / Tadika / Tabika Bantuan Kerajaan dan Swasta'],[17,3,'KT2 – P7','Penyediaan Pendidikan Teknikal, Vokasional dan Pengajian Tinggi termasuk Universiti Awam'],[18,3,'KT3 – P1','Nisbah Kes Aduan Berkaitan Kacau Ganggu Awam Kepada 10,000 Penduduk'],[19,3,'KT3 – P2','Nisbah Kes Penyakit Bawaan Air Kepada 10,000 Penduduk'],[20,3,'KT3 – P3','Peratus Premis Perniagaan Makanan yang Mendapat Penarafan Gred B & Ke Atas'],[21,3,'KT3 – P4','Peratus Tandas Awam yang Mendapat Penarafan Empat dan Lima Bintang'],[22,3,'KT3 – P5','Indeks Kebahagiaan (Happiness Index)'],[23,3,'KT3 – P6','Nisbah Kes Penyakit Bawaan Vektor Kepada 10,000 Penduduk'],[24,3,'KT3 – P7','Penyediaan Pendidikan untuk Golongan Keperluan Khas di Peringkat Prasekolah, Rendah dan Menengah'],[25,3,'KT3 – P8','Peratus Peningkatan Penglibatan Komuniti Dalam Program Bersama PBT'],[26,3,'KT3 – P9','Peringkat Pengiktirafan / Kejayaan Program Berasaskan Komuniti'],[27,3,'KT4 – P1','Peratus Penurunan Jenayah Indeks'],[28,3,'KT6 – P2','Peratus Wanita di Peringkat Ketua Jabatan'],[29,3,'KT6 – P3','Peratus Premis Perniagaan / Lesen yang Dimiliki oleh Wanita'],[30,3,'KT6 – P4','Kelulusan Dasar atau Undang-Undang Kecil Berkaitan Kesaksamaan Gender di Peringkat PBT'],
  [31,4,'GT2 – P1','Kadar Perbandaran'],[32,4,'GT2 – P2','Nisbah Penyediaan Kawasan Lapang Awam Berbanding dengan 1,000 Penduduk'],[33,4,'GT2 – P4','Strategi ke Arah Hubungan Bandar-Luar Bandar Dalam Pelan Pembangunan Sedia Ada'],[34,4,'GT4 – P1','Hutan Simpan Kekal / Taman Awam'],[35,4,'GT4 – P2','Program / Aktiviti / Inisiatif Pembangunan Pelancongan'],[36,4,'GT5 – P1','Program Pengeluaran Makanan Tempatan'],
  [37,5,'IT1 – P1','Isipadu Penggunaan Air Domestik Harian Per Kapita'],[38,5,'IT1 – P2','Penggunaan Harian Elektrik Per Kapita'],[39,5,'IT1 – P4','Kadar Kehilangan Air Tidak Terhasil (NRW)'],[40,5,'IT1 – P6','Kadar Liputan Jalur Lebar'],[41,5,'IT2 – P3','Lokasi Kawasan Pembuangan Haram'],[42,5,'IT2 – P4','Bilangan Pusat Pengitaran Semula'],[43,5,'IT4 – P1','Peratus Kediaman Mendapat Perkhidmatan Pembentungan'],
  [44,6,'UT1 – P3','Bilangan Sesi Libat Urus / Town Hall Bersama Penduduk'],[45,6,'UT2 – P1','Peratusan Pencapaian Kutipan Hasil PBT'],[46,6,'UT2 – P2','Peratusan Perbelanjaan Penyelenggaraan Berbanding Jumlah Perbelanjaan PBT Keseluruhan'],[47,6,'UT2 – P3','Peratusan Perbelanjaan (Mengurus dan Pembangunan) Pihak Berkuasa Tempatan'],[48,6,'UT2 – P4','Penyediaan Pelan Pengurusan Risiko Rasuah'],[49,6,'UT2 – P5','Melaksanakan dan Menyediakan Pelaporan Pembangunan Mampan Selaras dengan Dasar Semasa Negara dan Negeri']
].map(([page,dimension,code,title])=>({page,dimension,code,title}));

const PBT = ['MB Shah Alam','MB Petaling Jaya','MB Subang Jaya','MBD Klang','MP Ampang Jaya','MP Kajang','MP Selayang','MP Sepang','MP Kuala Langat','MP Kuala Selangor','MP Hulu Selangor','MD Sabak Bernam'];

const METRICS = {
  happiness:{label:'Indeks Kebahagiaan 2026',short:'Indeks Kebahagiaan',unit:'%',page:22,values:[92.293,100,94.98,96.691,99.167,95.66,99.98,90.884,100,87.773,98.76,96.606]},
  urbanisation:{label:'Kadar Perbandaran 2026',short:'Kadar Perbandaran',unit:'%',page:31,values:[99.50,100,99.10,87.51,100,96.23,88.80,93.00,87.90,85.53,72.62,72.45]},
  broadband:{label:'Kadar Liputan Jalur Lebar 2026',short:'Liputan Jalur Lebar',unit:'%',page:40,values:[100,100,100,100,100,100,100,99.99,99.98,100,99.94,99.99]},
  revenue:{label:'Pencapaian Kutipan Hasil PBT 2026',short:'Kutipan Hasil PBT',unit:'%',page:45,values:[99.30,105.86,104.89,110.46,108.07,113.59,128.74,116.01,115.65,94.82,988.12,101.78]},
  community:{label:'Peningkatan Penglibatan Komuniti 2026',short:'Penglibatan Komuniti',unit:'%',page:25,values:[10.80,36.87,12.63,33.18,7.86,21.99,61.86,6.95,6.48,217.06,40.40,297.73]}
};

const MAP_REGIONS = [
  {name:'MD Sabak Bernam', short:'Sabak Bernam', label:['Sabak','Bernam'], points:'126,52 246,70 264,142 208,170 124,152 92,104'},
  {name:'MP Kuala Selangor', short:'Kuala Selangor', label:['Kuala','Selangor'], points:'142,154 210,172 278,198 268,266 196,286 126,246 112,198'},
  {name:'MP Hulu Selangor', short:'Hulu Selangor', label:['Hulu','Selangor'], points:'270,78 448,92 526,166 482,256 370,240 280,198 260,144'},
  {name:'MBD Klang', short:'Klang', label:['Klang'], points:'132,248 194,288 222,352 184,394 116,372 94,314 104,276'},
  {name:'MB Shah Alam', short:'Shah Alam', label:['Shah Alam'], points:'198,286 274,286 306,330 266,382 222,352'},
  {name:'MB Petaling Jaya', short:'Petaling Jaya', label:['Petaling','Jaya'], points:'274,286 344,274 380,322 338,366 304,330'},
  {name:'MB Subang Jaya', short:'Subang Jaya', label:['Subang','Jaya'], points:'228,354 268,382 338,366 354,430 278,438 214,404'},
  {name:'MP Selayang', short:'Selayang', label:['Selayang'], points:'344,242 412,218 470,252 452,314 382,322 344,274'},
  {name:'MP Ampang Jaya', short:'Ampang Jaya', label:['Ampang','Jaya'], points:'452,268 520,248 574,304 542,366 468,362 452,314'},
  {name:'MP Kajang', short:'Kajang', label:['Kajang'], points:'356,366 466,362 542,366 564,438 486,500 378,484'},
  {name:'MP Kuala Langat', short:'Kuala Langat', label:['Kuala','Langat'], points:'156,396 214,404 278,438 260,520 170,512 112,452 116,402'},
  {name:'MP Sepang', short:'Sepang', label:['Sepang'], points:'278,438 378,484 486,500 456,540 312,542 260,520'}
];
