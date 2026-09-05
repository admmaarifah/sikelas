"use client";

import { useState, useEffect } from "react";
import { getClasses } from "@/app/actions/classActions";
import { getPassbookTransactions } from "@/app/actions/passbookActions";
import { format } from "date-fns";

export default function PassbookPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);

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
      getPassbookTransactions(selectedClass).then(setTransactions);
    } else {
      setTransactions([]);
    }
  }, [selectedClass]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl pb-16">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">Cetak Buku Rekening</h1>
          <p className="text-gray-500">Pilih kelas untuk mencetak buku rekening kas kelas.</p>
        </div>
        
        {selectedClass && (
          <button 
            onClick={handlePrint} 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 hover:shadow transition-all flex items-center justify-center shrink-0"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Cetak Buku Rekening
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 print:hidden mb-8">
        <div className="flex items-center space-x-3 mb-6">
           <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <h2 className="text-sm font-bold text-gray-700">Pilih Kelas</h2>
        </div>

        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border-2 border-blue-500 py-3 pl-12 pr-10 text-sm focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none bg-white font-bold text-gray-900"
          >
            <option value="" disabled>-- Pilih Kelas --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-blue-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {selectedClass ? (
        <div className="bg-white p-8 shadow-lg rounded-2xl print:shadow-none print:p-0 print:border-none font-mono text-sm border-2 border-gray-200">
          <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            .bank-font { font-family: 'VT323', monospace; font-size: 1.2rem; letter-spacing: 1px; }
            @media print {
              body * { visibility: hidden; }
              .print-area, .print-area * { visibility: visible; }
              .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            }
          `}} />
          
          <div className="print-area bank-font">
            <div className="text-center mb-8 border-b-2 border-dashed border-gray-400 pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest">Buku Rekening Kelas</h2>
              <p>ID Kelas: {selectedClass}</p>
              <p>Dicetak pada: {format(new Date(), "dd-MM-yyyy HH:mm")}</p>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-dashed border-gray-400">
                  <th className="py-2">TANGGAL</th>
                  <th className="py-2">KETERANGAN</th>
                  <th className="py-2 text-right">DEBET (OUT)</th>
                  <th className="py-2 text-right">KREDIT (IN)</th>
                  <th className="py-2 text-right">SALDO</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t.id}>
                    <td className="py-1">{format(new Date(t.date), "dd/MM/yy")}</td>
                    <td className="py-1 break-words">{t.description}</td>
                    <td className="py-1 text-right">{t.type === "EXPENSE" ? t.amount.toLocaleString() : ""}</td>
                    <td className="py-1 text-right">{t.type === "INCOME" ? t.amount.toLocaleString() : ""}</td>
                    <td className="py-1 text-right font-bold">{t.balance.toLocaleString()}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">TIDAK ADA TRANSAKSI</td></tr>
                )}
              </tbody>
            </table>
            <div className="mt-8 border-t-2 border-dashed border-gray-400 pt-4 text-center text-xs tracking-widest">
              *** AKHIR DARI MUTASI ***
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px] text-center print:hidden">
           <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-300 mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
           </div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">Pilih Kelas Terlebih Dahulu</h3>
           <p className="text-sm text-gray-500 max-w-sm">Silakan pilih kelas pada opsi di atas untuk mencetak buku mutasi kas.</p>
        </div>
      )}

      {/* Footer Text */}
      <div className="mt-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest print:hidden">
        &copy; 2026 Bukukas Kelas. Semua hak dilindungi.
      </div>

    </div>
  );
}
