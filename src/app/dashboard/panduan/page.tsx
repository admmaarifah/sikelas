"use client";

export default function PanduanPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Panduan Penggunaan SIKELAS</h1>
          <p className="mt-2 text-gray-500">Buku Manual dan Deskripsi Fitur Sistem Informasi Keuangan Kelas.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 font-medium flex items-center transition-all print:hidden"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Cetak Panduan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <article className="prose prose-slate max-w-none">
          <div className="text-center mb-10 pb-8 border-b border-gray-100">
            <h1 className="text-4xl font-extrabold text-blue-700 mb-4">SIKELAS: BukuKas Kelas Modern</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              SIKELAS adalah sebuah platform web inovatif yang dirancang secara khusus untuk memodernisasi dan mendigitalisasi pengelolaan keuangan (kas) di tingkat kelas sekolah. Sistem ini mempertemukan Admin Sekolah, Wali Kelas, dan Bendahara Kelas dalam satu ekosistem yang transparan, efisien, dan minim kesalahan.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 text-sm">🌟</span>
              Nilai Kebaruan (Novelty)
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Berbeda dengan sistem manajemen keuangan sekolah pada umumnya yang berfokus pada skala institusi (SPP/Uang Gedung), <strong>SIKELAS</strong> menawarkan kebaruan (<em>novelty</em>) berupa:
            </p>
            <ul className="space-y-3 text-gray-600 list-disc pl-5">
              <li><strong>Fokus Mikro (Tingkat Kelas):</strong> Menargetkan penyelesaian masalah pengelolaan kas harian kelas yang selama ini masih dicatat secara konvensional di buku tulis.</li>
              <li><strong>Matriks Pembayaran Harian Interaktif:</strong> Pendekatan visual unik menggunakan tabel matriks kehadiran/pembayaran, memudahkan identifikasi status pembayaran harian per siswa secara instan.</li>
              <li><strong>Validasi Berjenjang berbasis Role:</strong> Memisahkan hak akses antara Bendahara (Pencatat), Wali Kelas (Pemantau), dan Admin (Pengelola Data Inti), menciptakan lingkungan saling percaya <em>(trust-based environment)</em> tanpa manipulasi data.</li>
              <li><strong>Sistem Setoran Borongan Terintegrasi:</strong> Logika cerdas yang secara otomatis mengonversi setoran nominal besar menjadi rentetan pembayaran harian (melewati hari libur/akhir pekan secara otomatis).</li>
              <li><strong>Keterbukaan Publik (Public Dashboard):</strong> Sistem ini tidak tertutup di ruang pengurus saja, melainkan memberikan hak akses publik kepada seluruh siswa dan orang tua untuk mengecek rekening kas secara mandiri dari luar (tanpa perlu login).</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">🚀</span>
              Keunggulan Sistem
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">1. Transparansi Penuh & Melibatkan Orang Tua</h3>
                <p className="text-sm text-slate-600">Menghilangkan kebingungan "uang kas menguap" karena seluruh arus masuk dan keluar dicatat secara <em>real-time</em> dan dapat dipantau langsung oleh wali murid kapan pun dari rumah.</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">2. Paperless & Siap Cetak (Export)</h3>
                <p className="text-sm text-slate-600">Menyediakan fitur mutasi ala Buku Tabungan Bank (Buku Rekening) dan ekspor laporan Excel berformat A4 Landscape yang siap cetak untuk laporan.</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">3. Aman & Terpusat</h3>
                <p className="text-sm text-slate-600">Dibangun di atas sistem otentikasi aman bagi pengurus. Kesalahan pencatatan kas dapat dikoreksi dan tercatat jejak koreksinya.</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">4. Antarmuka Premium (User Friendly)</h3>
                <p className="text-sm text-slate-600">Desain visual yang sangat rapi, menggunakan indikator warna (Hijau lunas, Merah belum lunas), sehingga tidak perlu <em>training</em> rumit untuk menggunakannya.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">⚙️</span>
              Penjelasan Fitur Utama
            </h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Public Dashboard:</strong> Halaman beranda sistem (tanpa perlu login) yang memuat fitur cek Buku Rekening individu berbasis NISN, dan fitur pengecekan Rekap Keuangan Kelas (Umum).</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Dashboard Internal:</strong> Pusat informasi visual <em>(widget)</em> yang merangkum Total Saldo, Pemasukan, Pengeluaran, serta grafik sederhana dari kondisi keuangan kelas bagi pengurus.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Manajemen Akun & Kelas (Eksklusif Admin):</strong> Menu terpadu untuk mendaftarkan akun (Admin, Bendahara, Wali Kelas) serta mengelola relasi penugasan mereka ke suatu kelas.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Data Siswa:</strong> Fitur pengelolaan nama-nama siswa. Mendukung metode input manual (satu per satu) maupun impor massal dari file Excel secara otomatis.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Pengaturan Dana:</strong> Tempat Bendahara menetapkan nominal standar kas harian (misal: Rp 2.000/hari). Fitur ini dilengkapi "Zona Bahaya" untuk mereset data keuangan di akhir semester.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Setoran Pemasukan:</strong> Layar kasir <em>(Point of Sale)</em> bagi bendahara. Bendahara dapat menekan tombol harian, atau memasukkan "Uang Borongan" di mana sistem akan otomatis melunasi hari-hari ke depan.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Catat Pengeluaran:</strong> Formulir untuk mencatat uang yang terpakai (misal: beli sapu, fotokopi), lengkap dengan tanggal, deskripsi, dan nominal.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Riwayat Transaksi:</strong> Buku besar (Buku Kas Umum) yang mencatat kronologi seluruh uang masuk, uang keluar, hingga koreksi pembatalan kas, lengkap dengan jam, tanggal, dan nama pencatat.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Rekap Laporan:</strong> Laporan komprehensif berwujud matriks silang antara Nama Siswa dan Tanggal dalam sebulan. Sistem otomatis menghitung total uang. Tersedia tombol Unduh Excel.</div></li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-1">🔹</span> <div><strong>Cetak Buku Rekening:</strong> Mengubah daftar transaksi menjadi tampilan cetak persis seperti buku mutasi bank (VT323 Font) untuk transparansi mutlak.</div></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm">📖</span>
              Pedoman Penggunaan
            </h2>
            
            <div className="space-y-8">
              {/* 1 */}
              <div className="bg-white border-l-4 border-green-500 p-5 shadow-sm rounded-r-xl border-y border-r border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">1. Untuk Akses Publik (Siswa & Orang Tua / Wali Murid)</h3>
                <p className="text-sm text-green-700 font-medium mb-3">Tugas Utama: Pemantauan Transparansi Mandiri</p>
                <ol className="list-decimal pl-5 text-gray-600 space-y-1.5 text-sm">
                  <li>Buka halaman utama aplikasi SIKELAS dari perangkat apa saja tanpa harus login.</li>
                  <li>Untuk cek uang saku/kas individu: Klik <strong>DASHBOARD PENGUNJUNG</strong>, pilih tab <strong>Cek Buku Rekening Siswa</strong>, pilih nama Kelas anak Anda, lalu ketikkan <strong>NISN</strong>-nya. Klik tombol <strong>Cari</strong>.</li>
                  <li>Untuk cek kondisi uang kas kelas secara keseluruhan: Masuk ke tab <strong>Rekap Keuangan Kelas (Umum)</strong>, lalu pilih kelas.</li>
                </ol>
              </div>

              {/* 2 */}
              <div className="bg-white border-l-4 border-purple-500 p-5 shadow-sm rounded-r-xl border-y border-r border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">2. Untuk Administrator (Admin)</h3>
                <p className="text-sm text-purple-700 font-medium mb-3">Tugas Utama: Penyiapan Data Awal (Setup)</p>
                <ol className="list-decimal pl-5 text-gray-600 space-y-1.5 text-sm">
                  <li>Login menggunakan akun <code>admin</code>.</li>
                  <li>Masuk ke <strong>Manajemen Kelas</strong>, buat kelas baru (misal: "Kelas X.1").</li>
                  <li>Masuk ke <strong>Manajemen Akun</strong>, buatkan akun untuk <em>Wali Kelas</em> dan <em>Bendahara</em>, lalu tugaskan mereka ke kelas "X.1" tersebut.</li>
                  <li>Masuk ke <strong>Data Siswa</strong>, unduh <em>template</em> Excel, isi nama-nama siswa, lalu unggah kembali untuk memasukkan data siswa secara massal.</li>
                </ol>
              </div>

              {/* 3 */}
              <div className="bg-white border-l-4 border-blue-500 p-5 shadow-sm rounded-r-xl border-y border-r border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">3. Untuk Bendahara Kelas</h3>
                <p className="text-sm text-blue-700 font-medium mb-3">Tugas Utama: Operasional Keuangan Harian</p>
                <ol className="list-decimal pl-5 text-gray-600 space-y-1.5 text-sm">
                  <li>Login dengan akun Bendahara.</li>
                  <li>Masuk ke <strong>Pengaturan Dana</strong>, atur nominal kas harian (Misal: Rp 2.000).</li>
                  <li><strong>Menerima Kas:</strong> Saat jam istirahat, buka menu <strong>Setoran Pemasukan</strong>. Cari nama siswa, tekan ikon uang. Jika bayar Rp 10.000, ketik 10000 di Setoran Borongan.</li>
                  <li><strong>Mencatat Belanja:</strong> Jika uang kas digunakan, buka menu <strong>Catat Pengeluaran</strong>. Ketik nominal dan keterangannya.</li>
                  <li><strong>Koreksi:</strong> Jika salah tekan, buka menu <strong>Riwayat Transaksi</strong> lalu hapus transaksi yang salah.</li>
                </ol>
              </div>

              {/* 4 */}
              <div className="bg-white border-l-4 border-orange-500 p-5 shadow-sm rounded-r-xl border-y border-r border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">4. Untuk Wali Kelas</h3>
                <p className="text-sm text-orange-700 font-medium mb-3">Tugas Utama: Pengawasan & Pelaporan (Monitoring)</p>
                <ol className="list-decimal pl-5 text-gray-600 space-y-1.5 text-sm">
                  <li>Wali Kelas memiliki <strong>akses baca saja (Read-Only)</strong> pada sistem ini.</li>
                  <li>Login dengan akun Wali Kelas.</li>
                  <li>Buka <strong>Rekap Laporan</strong> di akhir bulan untuk memantau siapa saja siswa yang menunggak atau rajin.</li>
                  <li>Tekan <strong>Download Excel</strong> untuk mencetak laporan tersebut saat pembagian rapor.</li>
                  <li>Buka <strong>Cetak Buku Rekening</strong> jika ingin menempelkan arus keluar masuk uang kas di mading kelas.</li>
                </ol>
              </div>
            </div>
          </section>

        </article>
      </div>
    </div>
  );
}
