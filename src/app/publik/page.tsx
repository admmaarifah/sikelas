"use client";

import { useState, useEffect } from "react";

import { format } from "date-fns";
import { getStudentPassbook, getClassSummary, getAllClassesPublic } from "@/app/actions/publicActions";

export default function PublicDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"STUDENT" | "GENERAL">("STUDENT");

  // Student Tab State
  const [studentClassId, setStudentClassId] = useState("");
  const [nisn, setNisn] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // General Tab State
  const [generalClassId, setGeneralClassId] = useState("");
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    getAllClassesPublic().then(setClasses);
  }, []);

  const handleCekSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setStudentData(null);
    if (!studentClassId || !nisn) return;

    const data = await getStudentPassbook(studentClassId, nisn);
    if (!data) {
      setErrorMsg("Siswa dengan NISN tersebut tidak ditemukan di kelas yang dipilih.");
    } else {
      setStudentData(data);
    }
  };

  const handleCekGeneral = async () => {
    if (!generalClassId) return;
    const data = await getClassSummary(generalClassId);
    setSummaryData(data);
  };

  useEffect(() => {
    if (generalClassId) {
      handleCekGeneral();
    } else {
      setSummaryData(null);
    }
  }, [generalClassId]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#f2f6ff] overflow-y-auto font-sans p-4">
      {/* Background Abstract Shapes */}
      <svg className="fixed top-0 left-0 w-full h-full object-cover opacity-60 pointer-events-none z-0" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <path fill="#e0eaff" d="M0,0 C300,100 500,400 800,200 C1100,0 1300,300 1440,100 L1440,900 L0,900 Z" opacity="0.3"></path>
        <path fill="#dbeafe" d="M0,900 C400,600 600,800 900,500 C1200,200 1300,500 1440,400 L1440,900 L0,900 Z" opacity="0.4"></path>
      </svg>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center text-blue-600 font-bold hover:text-blue-800 bg-white/80 px-4 py-2 rounded-xl shadow-sm backdrop-blur-sm transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali ke Beranda
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-center md:space-x-4 space-y-2 md:space-y-0 mb-8 print:hidden">
          <button 
            onClick={() => setActiveTab("STUDENT")}
            className={`px-6 py-3 rounded-t-lg md:rounded-t-lg rounded-b-lg md:rounded-b-none font-medium md:border-b-4 transition-colors ${activeTab === "STUDENT" ? "md:border-blue-600 bg-blue-600 md:bg-white text-white md:text-blue-600" : "border-transparent text-gray-600 md:text-gray-500 hover:text-gray-900 md:hover:text-gray-700 bg-gray-200 md:bg-transparent hover:bg-gray-300 md:hover:bg-gray-100"}`}
          >
            Cek Buku Rekening Siswa
          </button>
          <button 
            onClick={() => setActiveTab("GENERAL")}
            className={`px-6 py-3 rounded-t-lg md:rounded-t-lg rounded-b-lg md:rounded-b-none font-medium md:border-b-4 transition-colors ${activeTab === "GENERAL" ? "md:border-blue-600 bg-blue-600 md:bg-white text-white md:text-blue-600" : "border-transparent text-gray-600 md:text-gray-500 hover:text-gray-900 md:hover:text-gray-700 bg-gray-200 md:bg-transparent hover:bg-gray-300 md:hover:bg-gray-100"}`}
          >
            Rekap Keuangan Kelas (Umum)
          </button>
        </div>

        {activeTab === "STUDENT" && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 print:hidden max-w-2xl mx-auto">
              <form onSubmit={handleCekSiswa} className="flex flex-col md:flex-row gap-4">
                <select 
                  value={studentClassId} 
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                  type="text" 
                  value={nisn} 
                  onChange={(e) => setNisn(e.target.value)} 
                  placeholder="Masukkan NISN" 
                  className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-blue-500"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Cari</button>
              </form>
              {errorMsg && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}
            </div>

            {studentData && (
              <div className="bg-white p-8 shadow-lg print:shadow-none font-mono text-sm border-2 border-gray-200">
                <style dangerouslySetInnerHTML={{__html: `
                  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
                  .bank-font { font-family: 'VT323', monospace; font-size: 1.2rem; letter-spacing: 1px; }
                  @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                  }
                `}} />
                
                <div className="flex justify-end mb-4 print:hidden">
                  <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">🖨️ Cetak</button>
                </div>

                <div className="print-area bank-font">
                  <div className="text-center mb-6 border-b-2 border-dashed border-gray-400 pb-4">
                    <h2 className="text-2xl font-bold">BUKU REKENING KAS KELAS</h2>
                    <p className="mt-2">Nama: {studentData.student.name}</p>
                    <p>NISN: {studentData.student.nis}</p>
                    <p className="text-xs mt-2">Dicetak pada: {format(new Date(), "dd-MM-yyyy HH:mm")}</p>
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
                      {studentData.passbookData.map((t: any, i: number) => (
                        <tr key={i}>
                          <td className="py-1">{format(new Date(t.date), "dd/MM/yy")}</td>
                          <td className="py-1">Setoran Harian</td>
                          <td className="py-1 text-right"></td>
                          <td className="py-1 text-right">{t.amount.toLocaleString()}</td>
                          <td className="py-1 text-right font-bold">{t.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                      {studentData.passbookData.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-4">BELUM ADA SETORAN</td></tr>
                      )}
                    </tbody>
                  </table>
                  <div className="mt-8 border-t-2 border-dashed border-gray-400 pt-4 text-center text-xs">
                    *** AKHIR BUKU REKENING ***
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "GENERAL" && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 text-center max-w-sm mx-auto">
               <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas untuk melihat rekapitulasi</label>
               <select 
                  value={generalClassId} 
                  onChange={(e) => setGeneralClassId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {summaryData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-blue-900">Rekapitulasi Transparansi Kelas</h3>
                  <span className="text-xs text-blue-700 bg-blue-200 px-2 py-1 rounded">Pemasukan digabung per hari</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3">Tanggal</th>
                        <th className="px-6 py-3">Keterangan</th>
                        <th className="px-6 py-3 text-right">Pemasukan (In)</th>
                        <th className="px-6 py-3 text-right">Pengeluaran (Out)</th>
                        <th className="px-6 py-3 text-right font-bold text-gray-900">Saldo Akhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.ledger.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada aktivitas mutasi untuk kelas ini.</td></tr>
                      ) : (
                        <>
                          {summaryData.ledger.map((item: any, i: number) => (
                            <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 whitespace-nowrap">{format(new Date(item.date), "dd MMM yyyy")}</td>
                              <td className="px-6 py-3">{item.description}</td>
                              <td className="px-6 py-3 text-right text-green-600">{item.income > 0 ? `+ ${item.income.toLocaleString()}` : "-"}</td>
                              <td className="px-6 py-3 text-right text-red-600">{item.expense > 0 ? `- ${item.expense.toLocaleString()}` : "-"}</td>
                              <td className="px-6 py-3 text-right font-bold text-gray-900">{item.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                            <td colSpan={2} className="px-6 py-4 text-right uppercase text-xs tracking-wider">Total Keseluruhan</td>
                            <td className="px-6 py-4 text-right text-green-600">
                              + {summaryData.ledger.reduce((acc: number, item: any) => acc + item.income, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-red-600">
                              - {summaryData.ledger.reduce((acc: number, item: any) => acc + item.expense, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {summaryData.ledger.length > 0 ? summaryData.ledger[summaryData.ledger.length - 1].balance.toLocaleString() : "0"}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
