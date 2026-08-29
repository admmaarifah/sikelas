"use client";

import { useState, useEffect } from "react";
import { getClasses } from "@/app/actions/classActions";
import { getSettings, updateSettings } from "@/app/actions/settingsActions";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [nominal, setNominal] = useState<string | number>(0);
  const [isEditing, setIsEditing] = useState(true);

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
      getSettings(selectedClass).then(settings => {
        const val = settings?.dailyNominal?.toString() || "";
        setNominal(val);
        if (val) setIsEditing(false);
        else setIsEditing(true);
      });
    }
  }, [selectedClass]);

  const handleSave = async () => {
    if (!selectedClass) return alert("Pilih kelas terlebih dahulu");
    await updateSettings(selectedClass, parseFloat(nominal as string));
    alert("Pengaturan dana kelas berhasil disimpan!");
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Pengaturan Dana Kelas</h1>
        <p className="mt-2 text-gray-500">Atur nominal setoran dan kelola data transaksi kelas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: PENGATURAN UMUM */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 relative overflow-hidden">
            
            <div className="space-y-6">
              {classes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Kelas</label>
                  <div className="relative">
                    <select 
                      value={selectedClass} 
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none bg-gray-50"
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
              )}

              {selectedClass && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nominal Setoran Harian (Rp)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={nominal}
                      onChange={(e) => setNominal(Number(e.target.value))}
                      disabled={!isEditing}
                      className={`w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all ${!isEditing ? 'bg-gray-50 text-gray-500 font-bold' : 'bg-white font-bold text-gray-900'}`}
                      placeholder="2000"
                      required
                    />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-gray-500">
                    Nominal ini akan digunakan sebagai patokan saat Bendahara menceklis pembayaran lunas harian.
                  </p>
                </div>
              )}

              {selectedClass && (
                <div className="pt-2">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow transition-all"
                      >
                        Simpan Pengaturan
                      </button>
                      {nominal && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="rounded-xl bg-white border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded-xl bg-blue-50 text-blue-600 px-6 py-3 text-sm font-bold hover:bg-blue-100 transition-all"
                    >
                      Ubah Pengaturan
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: DANGER ZONE */}
        {selectedClass && session?.user?.role === "ADMIN" && (
          <div className="col-span-1">
            <div className="rounded-2xl bg-red-50/50 p-7 border border-red-100 relative overflow-hidden h-full flex flex-col">
              <div className="flex items-center space-x-3 mb-4">
                <h2 className="text-lg font-bold text-red-700">Zona Bahaya (Danger Zone)</h2>
              </div>
              <p className="text-sm text-red-800/80 mb-6 leading-relaxed flex-1">
                Tindakan di bawah ini akan menghapus <strong>seluruh riwayat transaksi (Buku Rekening)</strong> beserta <strong>semua ceklis pembayaran kas harian</strong> untuk kelas ini. <br/><br/> Fitur ini sangat berguna jika Anda sedang melakukan uji coba dan ingin mereset/mengosongkan kelas dari awal lagi.
              </p>
              
              <button
                type="button"
                onClick={async () => {
                  if (confirm("🚨 PERINGATAN KERAS! 🚨\n\nApakah Anda benar-benar yakin ingin MENGHAPUS SEMUA DATA TRANSAKSI untuk kelas ini?\nTindakan ini TIDAK BISA DIBATALKAN! Seluruh saldo akan kembali menjadi Rp 0.")) {
                    if (confirm("Apakah Anda super yakin? Semua ceklis lunas siswa akan terhapus total.")) {
                      const { resetClassTransactions } = await import("@/app/actions/settingsActions");
                      await resetClassTransactions(selectedClass);
                      alert("Seluruh data transaksi dan setoran kelas telah berhasil dikosongkan.");
                      window.location.reload();
                    }
                  }
                }}
                className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 hover:shadow transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>Kosongkan Seluruh Data Transaksi Kelas Ini</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
