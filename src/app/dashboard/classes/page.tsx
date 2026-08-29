"use client";

import { useState, useEffect } from "react";
import { getClasses, createClass, updateClass, deleteClass } from "@/app/actions/classActions";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [className, setClassName] = useState("");

  const fetchClasses = () => {
    getClasses().then(setClasses);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) return;

    if (isEditing) {
      await updateClass(currentId, className);
      alert("Kelas berhasil diperbarui!");
    } else {
      await createClass(className);
      alert("Kelas berhasil ditambahkan!");
    }
    resetForm();
    fetchClasses();
  };

  const handleEdit = (c: any) => {
    setIsEditing(true);
    setCurrentId(c.id);
    setClassName(c.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini beserta seluruh datanya?")) {
      await deleteClass(id);
      fetchClasses();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId("");
    setClassName("");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Manajemen Kelas</h1>
        <p className="mt-2 text-gray-500">Kelola data kelas dengan mudah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* TAMBAH / EDIT KELAS */}
        <div className="col-span-1 md:col-span-4">
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center space-x-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
               </div>
               <h2 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Kelas" : "Tambah Kelas Baru"}</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kelas (Cth: XII MIPA 1)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={className} 
                    onChange={e=>setClassName(e.target.value)} 
                    required 
                    placeholder="Masukkan nama kelas"
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>
              </div>
              
              <div className="pt-2 flex gap-3 flex-col">
                <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow transition-all flex items-center justify-center">
                   <span className="mr-2">{isEditing ? '✓' : '💾'}</span> {isEditing ? "Simpan Perubahan" : "Simpan Kelas"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="w-full rounded-xl bg-white border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* DAFTAR KELAS */}
        <div className="col-span-1 md:col-span-8">
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
               </div>
               <h2 className="text-lg font-bold text-gray-900">Daftar Kelas</h2>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-4 rounded-tl-xl w-16">NO</th>
                    <th className="px-5 py-4">NAMA KELAS</th>
                    <th className="px-5 py-4">WALI KELAS</th>
                    <th className="px-5 py-4">BENDAHARA</th>
                    <th className="px-5 py-4 text-center rounded-tr-xl">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {classes.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">Belum ada kelas yang terdaftar.</td></tr>
                  ) : (
                    classes.map((c, idx) => (
                      <tr key={c.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-900">{idx + 1}</td>
                        <td className="px-5 py-4 font-bold text-gray-900">{c.name}</td>
                        <td className="px-5 py-4">
                           {c.teacher?.name 
                              ? <span className="text-gray-700">{c.teacher.name}</span>
                              : <span className="italic text-gray-400">Belum diatur</span>}
                        </td>
                        <td className="px-5 py-4">
                           {c.treasurer?.name 
                              ? <span className="text-gray-700">{c.treasurer.name}</span>
                              : <span className="italic text-gray-400">Belum diatur</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => handleEdit(c)} 
                              className="w-8 h-8 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id)} 
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

            {/* Footer */}
            <div className="mt-6 border-t border-gray-100 pt-6 flex items-center">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Kelas</p>
                  <p className="font-bold text-gray-900 text-base">{classes.length}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
