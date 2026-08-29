"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getClasses } from "@/app/actions/classActions";
import { getExpenses, addExpense } from "@/app/actions/transactionActions";
import { updateTransaction, deleteTransaction } from "@/app/actions/historyActions";
import { format } from "date-fns";

export default function ExpensePage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editProofLink, setEditProofLink] = useState("");

  useEffect(() => {
    getClasses().then(cls => {
      setClasses(cls);
      if (cls.length > 0 && !selectedClass) {
        setSelectedClass(cls[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getExpenses(selectedClass).then(setExpenses);
    } else {
      setExpenses([]);
    }
  }, [selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return alert("Pilih kelas terlebih dahulu");
    if (!session?.user?.id) return;
    
    await addExpense({
      classId: selectedClass,
      amount: Number(amount),
      description,
      proofLink,
      date: new Date(date),
      userId: session.user.id
    });

    setAmount("");
    setDescription("");
    setProofLink("");
    
    getExpenses(selectedClass).then(setExpenses);
    alert("Pengeluaran berhasil dicatat!");
  };

  const handleEditClick = (tx: any) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditDesc(tx.description);
    setEditDate(new Date(tx.date).toISOString().split("T")[0]);
    setEditProofLink(tx.proofLink || "");
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    await updateTransaction(editingTx.id, {
      amount: Number(editAmount),
      description: editDesc,
      date: new Date(editDate),
      proofLink: editProofLink
    });
    setEditingTx(null);
    getExpenses(selectedClass).then(setExpenses);
    alert("Pengeluaran berhasil diperbarui!");
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan pengeluaran ini secara permanen? Saldo kelas akan otomatis dikembalikan.")) {
      await deleteTransaction(id);
      getExpenses(selectedClass).then(setExpenses);
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Catat Pengeluaran Dana Kelas</h1>
        <p className="mt-2 text-gray-500">Catat setiap pengeluaran kas kelas dengan rapi dan transparan.</p>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-7 shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Kelas</label>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none bg-white font-medium"
          >
            <option value="">-- Pilih Kelas --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI: FORM PENGELUARAN */}
          <div className="col-span-1 lg:col-span-4 h-fit">
            <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                 <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Form Pengeluaran</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e=>setDate(e.target.value)} 
                      required 
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-gray-600" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nominal (Rp)</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12 bg-gray-50 border-r border-gray-200 rounded-l-xl text-gray-500 text-sm font-bold">
                      Rp
                    </div>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={e=>setAmount(e.target.value)} 
                      required 
                      placeholder="Contoh: 50.000"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-14 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 font-bold text-gray-900" 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex flex-col items-center justify-center pointer-events-none">
                       <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                       <svg className="w-3 h-3 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan / Tujuan</label>
                  <div className="relative">
                    <textarea 
                      value={description} 
                      onChange={e=>setDescription(e.target.value)} 
                      required 
                      maxLength={200}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 min-h-[100px] resize-none" 
                      placeholder="Masukkan keterangan atau tujuan pengeluaran..."
                    ></textarea>
                    <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-400">
                      {description.length} / 200
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link Bukti (Google Drive) <span className="text-gray-400 font-normal">(Opsional)</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <input 
                      type="url" 
                      value={proofLink} 
                      onChange={e=>setProofLink(e.target.value)} 
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-blue-600 placeholder:text-gray-400" 
                      placeholder="https://drive.google.com/..." 
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">Disarankan untuk transparansi dan arsip yang rapi.</p>
                </div>
                
                <div className="pt-2">
                  <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    <span>Simpan Pengeluaran</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* KOLOM KANAN: RIWAYAT */}
          <div className="col-span-1 lg:col-span-8">
            <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                   </div>
                   <h2 className="text-lg font-bold text-gray-900">Riwayat Pengeluaran</h2>
                </div>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Cari keterangan..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full sm:w-56 rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-5 py-4 rounded-tl-xl w-32">TANGGAL</th>
                      <th className="px-5 py-4">KETERANGAN</th>
                      <th className="px-5 py-4 text-right">NOMINAL</th>
                      <th className="px-5 py-4 text-center">BUKTI</th>
                      <th className="px-5 py-4 text-center rounded-tr-xl">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative mb-6">
                               <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center">
                                  <svg className="w-16 h-16 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                               </div>
                               <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-100 rounded-lg shadow-sm border border-white flex items-center justify-center text-blue-500 rotate-12">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                               </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Belum ada pengeluaran tercatat</h3>
                            <p className="text-sm text-gray-500">Catat pengeluaran pertama untuk melihat riwayat di sini.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-gray-900 font-medium">{format(new Date(exp.date), "dd/MM/yyyy")}</td>
                          <td className="px-5 py-4 text-gray-700">{exp.description}</td>
                          <td className="px-5 py-4 font-bold text-gray-900 text-right">Rp {exp.amount.toLocaleString()}</td>
                          <td className="px-5 py-4 text-center">
                            {exp.proofLink ? (
                              <a href={exp.proofLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                Lihat
                              </a>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleEditClick(exp)} 
                                className="w-8 h-8 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(exp.id)} 
                                className="w-8 h-8 rounded-lg border border-red-100 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                                title="Hapus"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
           <p className="text-sm text-gray-500 max-w-sm">Silakan pilih kelas pada menu di atas untuk mulai mencatat pengeluaran kas.</p>
        </div>
      )}

      {/* Footer Text */}
      <div className="mt-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
        &copy; 2025 SIKELAS. Semua hak dilindungi.
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Edit Pengeluaran</h3>
              <button onClick={() => setEditingTx(null)} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Berlaku</label>
                <input type="date" required value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Keterangan</label>
                <input type="text" required value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nominal (Rp)</label>
                <input type="number" required value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Link Bukti (Opsional)</label>
                <input type="url" value={editProofLink} onChange={e => setEditProofLink(e.target.value)} className="w-full rounded-xl border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-600" />
              </div>
              <div className="pt-3 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingTx(null)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-sm">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
