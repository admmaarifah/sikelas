"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getClasses } from "@/app/actions/classActions";
import { getTransactionHistory, updateTransaction, deleteTransaction } from "@/app/actions/historyActions";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function HistoryPage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editProofLink, setEditProofLink] = useState("");

  const loadTransactions = () => {
    if (selectedClass) {
      getTransactionHistory(selectedClass).then(setTransactions);
    }
  };

  useEffect(() => {
    getClasses().then(cls => {
      setClasses(cls);
      if (cls.length > 0 && !selectedClass) {
        setSelectedClass(cls[0].id);
      }
    });
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [selectedClass]);

  const handleEdit = (tx: any) => {
    setEditTx(tx);
    setEditDesc(tx.description);
    setEditAmount(Math.abs(tx.amount).toString());
    setEditDate(new Date(tx.date).toISOString().split("T")[0]);
    setEditProofLink(tx.proofLink || "");
    setIsEditModalOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTx) return;

    let finalAmount = Number(editAmount);
    if (editTx.amount < 0) {
      finalAmount = -finalAmount;
    }

    await updateTransaction(editTx.id, {
      description: editDesc, 
      amount: finalAmount, 
      date: new Date(editDate),
      proofLink: editProofLink
    });
    setIsEditModalOpen(false);
    loadTransactions();
    alert("Transaksi berhasil diperbarui!");
  };

  const handleDelete = async (tx: any) => {
    let msg = "Apakah Anda yakin ingin menghapus catatan transaksi ini secara permanen? Saldo kelas akan otomatis dikembalikan.";
    if (tx.type === "INCOME") {
      msg = "⚠️ PERINGATAN: Ini adalah transaksi PEMASUKAN.\nJika Anda menghapus transaksi ini, BUKAN HANYA saldo kas yang akan berkurang, TETAPI seluruh ceklis lunas siswa yang terkait dengan transaksi ini (baik harian maupun borongan) juga akan IKUT TERHAPUS secara otomatis!\n\nApakah Anda benar-benar yakin ingin menghapus transaksi beserta ceklis lunasnya?";
    }

    if (confirm(msg)) {
      await deleteTransaction(tx.id);
      loadTransactions();
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) || 
    t.recordedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.amount.toString().includes(search)
  );

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Riwayat Transaksi Sistem</h1>
      </div>

      <div className="mb-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-start space-x-3">
        <div className="text-blue-500 mt-0.5 shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <p className="text-sm text-blue-800 leading-relaxed">
            Halaman ini mencatat semua transaksi secara kronologis berdasarkan <b>waktu input di sistem</b>.<br/>Anda dapat mengedit atau menghapus transaksi jika terjadi kesalahan pencatatan.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-7 shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Kelas</label>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none bg-white font-medium"
          >
            <option value="">-- Pilih Kelas --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {selectedClass ? (
        <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-4">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </div>
               <h2 className="text-lg font-bold text-gray-900">Daftar Riwayat Transaksi</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Cari keterangan, nominal, atau pencatat..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-72 rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter
              </button>
              <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-5 py-4 rounded-tl-xl">NO</th>
                  <th className="px-5 py-4">WAKTU INPUT</th>
                  <th className="px-5 py-4">TGL BERLAKU</th>
                  <th className="px-5 py-4">KETERANGAN</th>
                  <th className="px-5 py-4 text-center">JENIS</th>
                  <th className="px-5 py-4 text-right">NOMINAL</th>
                  <th className="px-5 py-4">DICATAT OLEH</th>
                  {session?.user?.role !== "TEACHER" && <th className="px-5 py-4 text-center rounded-tr-xl">AKSI</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={session?.user?.role !== "TEACHER" ? 8 : 7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Belum ada riwayat transaksi</h3>
                        <p className="text-sm text-gray-500">Semua aktivitas keuangan kelas akan tercatat di sini.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t, idx) => (
                    <tr key={t.id} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-gray-900 font-medium">{idx + 1}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                        {format(new Date(t.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                        {format(new Date(t.date), "dd MMM yyyy", { locale: localeId })}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-medium">{t.description}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          t.type === 'INCOME' 
                            ? (t.amount < 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {t.type === 'INCOME' ? (t.amount < 0 ? 'KOREKSI' : 'PEMASUKAN') : 'PENGELUARAN'}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right font-bold whitespace-nowrap ${t.type === 'EXPENSE' || t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {t.type === 'EXPENSE' ? '-' : ''}
                        Rp {Math.abs(t.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{t.recordedBy?.name || '-'}</td>
                      {session?.user?.role !== "TEACHER" && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => handleEdit(t)} 
                              className="w-8 h-8 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(t)} 
                              className="w-8 h-8 rounded-lg border border-red-100 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                              title="Hapus"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 font-medium">
              Menampilkan 1 - {Math.min(filteredTransactions.length, 5)} dari {filteredTransactions.length} transaksi
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select className="border border-gray-200 text-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-blue-500 appearance-none bg-white pr-8 relative cursor-pointer">
                  <option>10 / halaman</option>
                  <option>20 / halaman</option>
                  <option>50 / halaman</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="w-8 h-8 rounded bg-blue-600 text-white font-medium flex items-center justify-center shadow-sm">
                  1
                </button>
                {filteredTransactions.length > 5 && (
                  <>
                    <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                      2
                    </button>
                    <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                      3
                    </button>
                  </>
                )}
                <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] text-center">
           <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-300 mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
           </div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">Pilih Kelas Terlebih Dahulu</h3>
           <p className="text-sm text-gray-500 max-w-sm">Silakan pilih kelas pada menu di atas untuk melihat riwayat transaksi.</p>
        </div>
      )}

      {/* Footer Text */}
      <div className="mt-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
        &copy; 2025 SIKELAS. Semua hak dilindungi.
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Edit Transaksi</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Berlaku</label>
                <input 
                  type="date" 
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Keterangan Transaksi</label>
                <input 
                  type="text" 
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {editTx?.amount < 0 && (
                  <p className="text-[11px] text-orange-600 mt-2 font-medium">Sistem akan otomatis mengubahnya menjadi minus setelah disimpan karena ini adalah transaksi koreksi.</p>
                )}
                {editTx?.type === "EXPENSE" && (
                  <p className="text-[11px] text-red-600 mt-2 font-medium">Ini adalah transaksi pengeluaran (bernilai negatif pada saldo).</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Link Bukti (Opsional)</label>
                <input 
                  type="url" 
                  value={editProofLink}
                  onChange={(e) => setEditProofLink(e.target.value)}
                  className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}