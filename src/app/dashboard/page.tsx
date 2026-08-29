"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/dashboardActions";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (status === "loading" || !stats || !session) {
    return <div className="flex h-screen items-center justify-center">Memuat dashboard...</div>;
  }

  const role = session.user.role;
  const labelSuffix = stats.isGlobal ? "(Semua Kelas)" : "(Kelas Anda)";
  const percentageLunas = stats.totalStudents > 0 ? Math.round((stats.lunasToday / stats.totalStudents) * 100) : 0;

  const menus = [
    { name: "Cek Buku Rekening Siswa", path: "/dashboard/students", roles: ["ADMIN", "TEACHER", "TREASURER"], icon: "📖", color: "bg-blue-100 text-blue-600" },
    { name: "Rekap Keuangan Kelas (Umum)", path: "/dashboard/reports", roles: ["ADMIN", "TEACHER", "TREASURER"], icon: "📈", color: "bg-green-100 text-green-600" },
    { name: "Setoran Pemasukan", path: "/dashboard/income", roles: ["ADMIN", "TREASURER"], icon: "💰", color: "bg-yellow-100 text-yellow-600" },
    { name: "Catat Pengeluaran", path: "/dashboard/expense", roles: ["ADMIN", "TREASURER"], icon: "💳", color: "bg-red-100 text-red-600" },
    { name: "Riwayat Transaksi", path: "/dashboard/history", roles: ["ADMIN", "TREASURER", "TEACHER"], icon: "🕒", color: "bg-cyan-100 text-cyan-600" },
    { name: "Cetak Buku Rekening", path: "/dashboard/passbook", roles: ["ADMIN", "TREASURER", "TEACHER"], icon: "🖨️", color: "bg-purple-100 text-purple-600" },
  ];

  const allowedMenus = menus.filter(menu => menu.roles.includes(role));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
        <div className="md:w-3/5 z-10">
          <p className="text-gray-500 font-medium mb-1">Selamat Datang di</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-2">SIKELAS</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sistem Informasi Keuangan Kelas</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-md">
            Kelola keuangan kelas dengan mudah, transparan, dan akuntabel untuk mendukung kegiatan belajar yang lebih baik.
          </p>
          <button onClick={() => router.push('/dashboard/panduan')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center transition-colors shadow-sm">
            <span className="mr-2">📖</span> Lihat Panduan Penggunaan
          </button>
        </div>
        
        {/* Placeholder for the illustration (using a CSS pattern/gradient instead of an actual image since I don't have the asset) */}
        <div className="hidden md:flex md:w-2/5 justify-end z-10 opacity-90">
          <div className="w-64 h-48 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner relative">
             <div className="text-6xl absolute">💼</div>
             <div className="text-4xl absolute -right-4 top-4">📈</div>
             <div className="text-4xl absolute -left-4 bottom-4">💰</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Saldo */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Saldo {labelSuffix}</p>
              <h3 className="text-2xl font-bold text-gray-900">Rp {stats.totalSaldo.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
               💰
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">↗ Naik</span>
            <span className="text-gray-400 ml-2">Dibanding bulan lalu</span>
          </div>
        </div>

        {/* Lunas */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Siswa Lunas Hari Ini</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.lunasToday} <span className="text-gray-400 text-lg font-medium">/ {stats.totalStudents}</span></h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
               👥
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-blue-600 font-medium">{percentageLunas}%</span>
            <span className="text-gray-400 ml-1">dari total siswa</span>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Pengeluaran</p>
              <h3 className="text-2xl font-bold text-red-600">Rp {stats.totalExpense.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
               💳
            </div>
          </div>
          <div className="flex items-center text-xs">
            {stats.totalExpense === 0 ? (
              <span className="text-red-500">Belum ada pengeluaran</span>
            ) : (
              <span className="text-gray-400">Total seluruh waktu</span>
            )}
          </div>
        </div>

        {/* Terakhir Diperbarui */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Terakhir Diperbarui</p>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                {stats.lastUpdate ? format(new Date(stats.lastUpdate), "dd MMM yyyy", { locale: id }) : "Belum ada"}
              </h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
               📅
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            {stats.lastUpdate ? format(new Date(stats.lastUpdate), "HH:mm 'WIB'", { locale: id }) : "-"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Fitur Utama */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">🎛️</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Fitur Utama</h2>
              <p className="text-xs text-gray-500">Kelola keuangan kelas dengan lebih mudah</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allowedMenus.map(menu => (
              <Link 
                href={menu.path} 
                key={menu.name}
                className="group flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className={`p-3 rounded-lg mr-4 ${menu.color} group-hover:scale-110 transition-transform`}>
                  {menu.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">{menu.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{menu.name.includes("Rekap") ? "Lihat ringkasan pemasukan, pengeluaran, dan saldo" : `Akses menu ${menu.name.toLowerCase()}`}</p>
                </div>
                <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                  ❯
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center pt-2">
            <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">Lihat semua fitur →</span>
          </div>
        </div>

        {/* Right Column: Informasi Cepat */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">🔔</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Informasi Cepat</h2>
              <p className="text-xs text-gray-500">Ringkasan singkat keuangan kelas</p>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start space-x-3">
            <div className="text-blue-500 mt-0.5">ℹ️</div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Tips Pengelolaan Keuangan</h4>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">Selalu catat setiap pemasukan dan pengeluaran secara rutin untuk menjaga transparansi keuangan kelas.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-0 border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-50">
              <div className="flex items-center text-sm text-gray-600 font-medium">
                <span className="mr-2 text-blue-400">🔄</span> Transaksi Bulan Ini
              </div>
              <div className="text-sm font-bold text-gray-900">{stats.trxCountThisMonth} transaksi</div>
            </div>
            <div className="flex justify-between items-center p-4 border-b border-gray-50">
              <div className="flex items-center text-sm text-gray-600 font-medium">
                <span className="mr-2 text-green-500">📥</span> Pemasukan Bulan Ini
              </div>
              <div className="text-sm font-bold text-green-600">Rp {stats.incomeThisMonth.toLocaleString()}</div>
            </div>
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center text-sm text-gray-600 font-medium">
                <span className="mr-2 text-red-500">📤</span> Pengeluaran Bulan Ini
              </div>
              <div className="text-sm font-bold text-red-600">Rp {stats.expenseThisMonth.toLocaleString()}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
