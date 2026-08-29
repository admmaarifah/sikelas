"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getClasses } from "@/app/actions/classActions";
import { getStudents, addStudent, updateStudent, importStudentsBulk, deleteStudent } from "@/app/actions/studentActions";

export default function StudentsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState("");
  const [nis, setNis] = useState("");
  const [name, setName] = useState("");

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
      getStudents(selectedClass).then(setStudents);
      resetForm();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentStudentId("");
    setNis("");
    setName("");
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return alert("Pilih kelas terlebih dahulu!");
    
    if (isEditing) {
      await updateStudent(currentStudentId, { nis, name });
    } else {
      await addStudent({ nis, name, classId: selectedClass });
    }
    
    resetForm();
    getStudents(selectedClass).then(setStudents);
  };

  const handleEdit = (student: any) => {
    setIsEditing(true);
    setCurrentStudentId(student.id);
    setNis(student.nis);
    setName(student.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClass) {
      alert("Pilih kelas terlebih dahulu sebelum import!");
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Expected format: { NIS: "123", Nama: "Budi" }
      const formattedData = json.map(row => ({
        nis: String(row.NIS || row.nis || row.Nis || ""),
        name: String(row.Nama || row.name || row.Name || ""),
        classId: selectedClass
      })).filter(row => row.nis && row.name);

      if (formattedData.length > 0) {
        await importStudentsBulk(formattedData);
        alert(`Berhasil import ${formattedData.length} siswa!`);
        getStudents(selectedClass).then(setStudents);
      } else {
        alert("Format Excel salah atau kosong. Pastikan ada kolom 'NIS' dan 'Nama'.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Yakin ingin menghapus siswa ini? Data pembayaran yang terkait juga mungkin akan terhapus jika diatur cascade.")) {
      await deleteStudent(id);
      getStudents(selectedClass).then(setStudents);
    }
  }
  
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.toLowerCase().includes(search.toLowerCase())
  );

  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || "";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Manajemen Data Siswa</h1>
        <p className="mt-2 text-gray-500">Kelola data siswa per kelas dengan mudah.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: FORM */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* FILTER KELAS */}
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center space-x-4 mb-4">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               <label className="text-sm font-bold text-gray-900">Pilih Kelas</label>
            </div>
            
            <div className="relative">
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* TAMBAH MANUAL */}
          {selectedClass && (
            <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center space-x-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Siswa" : "Tambah Manual"}</h2>
              </div>

              <form onSubmit={handleSaveManual} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">NIS / NISN</label>
                  <input 
                    type="text" 
                    value={nis} 
                    onChange={e=>setNis(e.target.value)} 
                    required 
                    placeholder="Masukkan NIS / NISN"
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Siswa</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    required 
                    placeholder="Masukkan nama siswa"
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>
                
                <div className="pt-2 flex gap-3 flex-col">
                  <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow transition-all flex items-center justify-center">
                    {isEditing ? "Simpan Perubahan" : "Simpan Siswa"}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForm} className="w-full rounded-xl bg-white border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* IMPORT EXCEL */}
          {selectedClass && !isEditing && (
            <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center space-x-4 mb-4">
                 <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Import via Excel</h2>
              </div>
              <p className="mb-4 text-xs text-gray-500 leading-relaxed">
                Gunakan format file Excel dengan header kolom <b>NIS</b>, <b>Nama</b>, dan <b>Kelas</b>.
              </p>
              <div className="mb-5">
                <button 
                  onClick={() => {
                    const ws = XLSX.utils.json_to_sheet([{ NIS: "", Nama: "", Kelas: selectedClassName }]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
                    XLSX.writeFile(wb, `Template_Data_Siswa_${selectedClassName.replace(/\s+/g, '_')}.xlsx`);
                  }}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Unduh Template Excel
                </button>
              </div>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer border border-gray-200 rounded-xl"
                />
              </div>
            </div>
          )}

        </div>

        {/* KOLOM KANAN: DAFTAR SISWA */}
        <div className="col-span-1 lg:col-span-8">
          {selectedClass ? (
            <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                   </div>
                   <h2 className="text-lg font-bold text-gray-900">Daftar Siswa - {selectedClassName}</h2>
                </div>
                
                <div className="relative sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari nama atau NIS..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-5 py-4 rounded-tl-xl w-16">NO</th>
                      <th className="px-5 py-4">NIS / NISN</th>
                      <th className="px-5 py-4">NAMA SISWA</th>
                      <th className="px-5 py-4 text-center rounded-tr-xl">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-10 text-gray-400">Belum ada siswa di kelas ini.</td></tr>
                    ) : (
                      filteredStudents.map((student, idx) => (
                        <tr key={student.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 font-medium text-gray-900">{idx + 1}</td>
                          <td className="px-5 py-4 text-gray-600 font-medium">{student.nis}</td>
                          <td className="px-5 py-4 font-bold text-gray-900">{student.name}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleEdit(student)} 
                                className="w-8 h-8 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(student.id)} 
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
              <div className="mt-6 border-t border-gray-100 pt-6 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Siswa</p>
                    <p className="font-bold text-gray-900 text-base">{filteredStudents.length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button className="w-8 h-8 rounded bg-blue-600 text-white font-medium flex items-center justify-center shadow-sm">
                    1
                  </button>
                  <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full min-h-[400px] text-center">
               <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300 mb-4">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">Pilih Kelas Terlebih Dahulu</h3>
               <p className="text-sm text-gray-500 max-w-sm">Silakan pilih kelas pada menu di sebelah kiri untuk melihat dan mengelola daftar siswa.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
