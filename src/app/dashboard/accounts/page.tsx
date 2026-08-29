"use client";

import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/app/actions/userActions";
import { getClasses } from "@/app/actions/classActions";
import { useSession } from "next-auth/react";

export default function AccountsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [classId, setClassId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = () => {
    getUsers().then(setUsers);
  };

  useEffect(() => {
    fetchUsers();
    getClasses().then(setClasses);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      await updateUser(currentId, { name, email, password, role, classId: role !== "ADMIN" ? classId : undefined });
      alert("Akun berhasil diperbarui!");
    } else {
      await createUser({ name, email, password, role, classId: role !== "ADMIN" ? classId : undefined });
      alert("Akun berhasil ditambahkan!");
    }
    resetForm();
    fetchUsers();
  };

  const handleEdit = (user: any) => {
    setIsEditing(true);
    setCurrentId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword(""); 
    
    let assignedClassId = "";
    if (user.role === "TEACHER" && user.classesAsTeacher.length > 0) assignedClassId = user.classesAsTeacher[0].id;
    if (user.role === "TREASURER" && user.classesAsTreasurer.length > 0) assignedClassId = user.classesAsTreasurer[0].id;
    setClassId(assignedClassId);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
      await deleteUser(id);
      fetchUsers();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("TEACHER");
    setClassId("");
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Manajemen Akun Terpadu</h1>
        <p className="mt-2 text-gray-500">Kelola akun pengguna sistem dengan mudah dan aman.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM TAMBAH / EDIT */}
        <div className="col-span-1 lg:col-span-4">
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center space-x-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
               </div>
               <h2 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Akun Pengguna" : "Tambah Akun Baru"}</h2>
            </div>

            <form onSubmit={handleSave} autoComplete="off" className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e=>setName(e.target.value)} 
                  required 
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Login</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                    placeholder="Masukkan email"
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    required={!isEditing} 
                    placeholder={isEditing ? "Kosongkan jika tak ingin diganti" : "Masukkan password"}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-2.583c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.282 2.686" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Peran (Role)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <select 
                    value={role} 
                    onChange={e=>{setRole(e.target.value); setClassId("");}} 
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Wali Kelas</option>
                    <option value="TREASURER">Bendahara</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {role !== "ADMIN" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tugaskan ke Kelas</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <select 
                      value={classId} 
                      onChange={e=>setClassId(e.target.value)} 
                      required 
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex gap-3 flex-col">
                <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow transition-all flex items-center justify-center">
                  <span className="mr-2">{isEditing ? '✓' : '+'}</span> {isEditing ? "Simpan Perubahan" : "Tambah Akun"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="w-full rounded-xl bg-white border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    Batal
                  </button>
                )}
              </div>

              {!isEditing && (
                <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start space-x-3">
                  <div className="text-blue-500 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Keamanan Akun</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">Password minimal 6 karakter dengan kombinasi huruf dan angka.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* DAFTAR AKUN */}
        <div className="col-span-1 lg:col-span-8">
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
               </div>
               <h2 className="text-lg font-bold text-gray-900">Daftar Pengguna</h2>
            </div>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Cari nama atau email pengguna..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="relative sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                </div>
                <select 
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                >
                  <option value="ALL">Semua Peran</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Wali Kelas</option>
                  <option value="TREASURER">Bendahara</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-4 rounded-tl-xl">NAMA</th>
                    <th className="px-5 py-4">EMAIL</th>
                    <th className="px-5 py-4">PERAN</th>
                    <th className="px-5 py-4">DITUGASKAN KE</th>
                    <th className="px-5 py-4 text-center rounded-tr-xl">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">Tidak ada akun ditemukan.</td></tr>
                  ) : (
                    filteredUsers.map((u) => {
                      let assignedClass = "Semua Kelas (Admin)";
                      if (u.role === "TEACHER" && u.classesAsTeacher?.length > 0) assignedClass = u.classesAsTeacher[0].name;
                      if (u.role === "TREASURER" && u.classesAsTreasurer?.length > 0) assignedClass = u.classesAsTreasurer[0].name;
                      if (u.role !== "ADMIN" && assignedClass === "Semua Kelas (Admin)") assignedClass = "Belum ditugaskan";

                      const initials = u.name.substring(0, 2).toUpperCase();
                      const avatarColor = u.role === "ADMIN" ? "bg-purple-100 text-purple-600" : (u.role === "TEACHER" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600");
                      const roleBadgeColor = u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : (u.role === "TEACHER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700");

                      return (
                        <tr key={u.id} className="bg-white hover:bg-slate-50 transition-colors group">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                                {initials}
                              </div>
                              <span className="font-bold text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleBadgeColor}`}>
                              {u.role === "TEACHER" ? "WALI KELAS" : u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-600">{assignedClass}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleEdit(u)} 
                                className="w-8 h-8 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              {session?.user?.email !== u.email && (
                                <button 
                                  onClick={() => handleDelete(u.id)} 
                                  className="w-8 h-8 rounded-lg border border-red-100 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                                  title="Hapus"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer / Pagination */}
            <div className="mt-6 border-t border-gray-100 pt-6 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Pengguna</p>
                  <p className="font-bold text-gray-900 text-base">{filteredUsers.length}</p>
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
        </div>

      </div>
    </div>
  );
}
