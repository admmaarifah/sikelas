"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getClasses } from "@/app/actions/classActions";
import { getStudents } from "@/app/actions/studentActions";
import { getDailyPayments, toggleDailyPayment, bulkPayDaily, getPaidDates } from "@/app/actions/paymentActions";
import { getSettings } from "@/app/actions/settingsActions";
import { format, isWeekend } from "date-fns";
import { id } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function IncomePage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [paidDates, setPaidDates] = useState<Date[]>([]);
  
  const getInitialDate = () => {
    let d = new Date();
    while (isWeekend(d)) {
      d.setDate(d.getDate() - 1);
    }
    return d.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getInitialDate());
  const [nominal, setNominal] = useState(0);

  // Bulk Pay State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStudent, setBulkStudent] = useState<any>(null);
  const [bulkAmount, setBulkAmount] = useState<string | number>("");

  useEffect(() => {
    getClasses().then(cls => {
      setClasses(cls);
      if (cls.length > 0 && !selectedClass) {
        setSelectedClass(cls[0].id);
      }
    });
  }, []);

  const loadData = async (classId: string, d: string) => {
    const studs = await getStudents(classId);
    const nominalRes = await getSettings(classId);
    setNominal(nominalRes?.dailyNominal || 0);
    const pays = await getDailyPayments(classId, new Date(d));
    const allPaidDates = await getPaidDates(classId);
    
    setStudents(studs);
    setPayments(pays);
    setPaidDates(allPaidDates.map(pd => new Date(pd)));
  };

  useEffect(() => {
    if (selectedClass) {
      loadData(selectedClass, date);
    } else {
      setStudents([]);
      setPayments([]);
    }
  }, [selectedClass, date]);

  const handleDateChange = (val: string) => {
    const selectedDate = new Date(val);
    if (isWeekend(selectedDate)) {
      alert("Hari Sabtu dan Minggu adalah hari libur. Silakan gunakan fitur 'Bayar Borongan' jika ini adalah pembayaran di muka.");
      return;
    }
    setDate(val);
  };

  const handleToggle = async (studentId: string, isCurrentlyPaid: boolean) => {
    if (!session?.user?.id) return;
    if (!selectedClass || nominal <= 0) return alert("Atur nominal dana kelas terlebih dahulu di menu Pengaturan!");

    if (isCurrentlyPaid) {
      setPayments(payments.filter(p => p.studentId !== studentId));
    } else {
      setPayments([...payments, { studentId, amount: nominal }]);
    }
    
    await toggleDailyPayment(studentId, new Date(date), nominal, session.user.id, !isCurrentlyPaid);
    loadData(selectedClass, date);
  };

  const openBulkModal = (student: any) => {
    if (nominal <= 0) return alert("Atur nominal dana kelas terlebih dahulu!");
    setBulkStudent(student);
    setBulkAmount("");
    setIsBulkModalOpen(true);
  };

  const submitBulkPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !bulkStudent) return;
    
    const amount = Number(bulkAmount);
    if (amount < nominal) {
      return alert(`Minimal pembayaran borongan adalah Rp ${nominal}`);
    }

    try {
      const res = await bulkPayDaily(
        selectedClass, 
        bulkStudent.id, 
        amount, 
        new Date(date), 
        nominal, 
        session.user.id
      );
      alert(`Berhasil menyimpan pembayaran borongan untuk ${res.daysPaid} hari ke depan (melewati hari libur)!`);
      setIsBulkModalOpen(false);
      loadData(selectedClass, date);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Setoran Pemasukan Dana Kelas</h1>
        <p className="mt-2 text-gray-500">Catat pemasukan kas harian dari siswa.</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-6 rounded-2xl bg-white p-7 shadow-sm border border-gray-100 items-end">
        {classes.length > 0 && (
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kelas</label>
            <div className="relative">
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        )}
        
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Mulai Berlaku</label>
          <div className="relative">
            <DatePicker 
              selected={new Date(date)}
              onChange={(d: Date | null) => d && handleDateChange(d.toISOString().split("T")[0])}
              highlightDates={paidDates}
              dateFormat="dd/MM/yyyy"
              className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all pr-10"
              wrapperClassName="w-full"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>
        
        <style jsx global>{`
          .react-datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker__day--highlighted {
            background-color: #22c55e !important;
            color: white !important;
            border-radius: 0.375rem;
          }
          .react-datepicker__day--highlighted:hover {
            background-color: #16a34a !important;
          }
        `}</style>

        <div className="w-full md:w-1/3">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center h-[50px] md:h-auto">
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">NOMINAL SETORAN PER HARI</span>
            <div className="text-xl font-extrabold text-blue-700 tracking-tight">Rp {nominal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {selectedClass ? (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
             <h2 className="font-bold text-gray-900 text-lg">Daftar Siswa - {format(new Date(date), "dd MMM yyyy", { locale: id })}</h2>
             <span className="text-sm bg-green-50 text-green-700 px-4 py-1.5 rounded-lg font-bold border border-green-100">
               Lunas Hari Ini: {payments.length} / {students.length}
             </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-16">NO</th>
                  <th className="px-6 py-4">NAMA SISWA</th>
                  <th className="px-6 py-4 text-center">STATUS HARI INI</th>
                  <th className="px-6 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-400">Belum ada siswa di kelas ini.</td></tr>
                ) : (
                  students.map((student, idx) => {
                    const isPaid = payments.some(p => p.studentId === student.id);
                    return (
                      <tr key={student.id} className={`transition-colors ${isPaid ? 'bg-green-50/20' : 'bg-white hover:bg-slate-50'}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center justify-center min-w-[80px] rounded-md bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Lunas</span>
                          ) : (
                            <span className="inline-flex items-center justify-center min-w-[80px] rounded-md bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Belum</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                          <button 
                            onClick={() => openBulkModal(student)}
                            className="inline-flex items-center px-4 py-2 rounded-lg font-bold text-xs transition-colors bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 border border-purple-100"
                            title="Bayar sekaligus untuk beberapa hari"
                          >
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Borongan
                          </button>
                          <button 
                            onClick={() => handleToggle(student.id, isPaid)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm ${
                              isPaid 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                              : 'bg-green-500 text-white hover:bg-green-600 border border-transparent'
                            }`}
                          >
                            {isPaid ? (
                              <>
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Batalkan
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Ceklis Harian
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px] text-center">
           <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-300 mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           </div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">Pilih Kelas Terlebih Dahulu</h3>
           <p className="text-sm text-gray-500 max-w-sm">Silakan pilih kelas untuk mulai mencatat setoran harian siswa.</p>
        </div>
      )}

      {/* Bulk Pay Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Bayar Kas Borongan
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={submitBulkPay} className="p-6 space-y-5">
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
                <div>
                  <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Nama Siswa</label>
                  <div className="font-extrabold text-purple-900 text-lg">{bulkStudent?.name}</div>
                </div>
                <div className="text-right">
                  <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Mulai Berlaku</label>
                  <div className="font-bold text-purple-900">{format(new Date(date), "dd MMM yyyy", { locale: id })}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nominal Uang Diterima (Rp)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(e.target.value)}
                    className="w-full rounded-xl border-gray-200 py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-bold text-gray-900 bg-gray-50"
                    placeholder="Misal: 50000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none font-bold text-gray-400">
                    IDR
                  </div>
                </div>
              </div>

              {Number(bulkAmount) >= nominal && nominal > 0 && Number(bulkAmount) % nominal === 0 && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-800 flex items-start space-x-3">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="leading-relaxed">Uang sejumlah <b>Rp {Number(bulkAmount).toLocaleString()}</b> setara dengan pembayaran kas penuh untuk <b>{Math.floor(Number(bulkAmount) / nominal)} hari kerja</b> ke depan. Sistem akan secara otomatis melompati hari libur (Sabtu/Minggu).</span>
                </div>
              )}

              {Number(bulkAmount) > 0 && Number(bulkAmount) % nominal !== 0 && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800 flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="leading-relaxed">Nominal setoran borongan <b>harus kelipatan dari Rp {nominal.toLocaleString()}</b>. Sisa uang tidak dapat dipecah untuk hitungan hari.</span>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transform transition-all font-bold flex items-center space-x-2">
                  <span>Proses Pembayaran</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
