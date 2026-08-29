"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau password salah.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#f2f6ff] overflow-hidden font-sans">
      
      {/* Background Abstract Shapes */}
      <svg className="absolute top-0 left-0 w-full h-full object-cover opacity-60 pointer-events-none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <path fill="#e0eaff" d="M0,0 C300,100 500,400 800,200 C1100,0 1300,300 1440,100 L1440,900 L0,900 Z" opacity="0.3"></path>
        <path fill="#dbeafe" d="M0,900 C400,600 600,800 900,500 C1200,200 1300,500 1440,400 L1440,900 L0,900 Z" opacity="0.4"></path>
        <circle cx="900" cy="150" r="10" fill="#bfdbfe" opacity="0.5"/>
        <circle cx="950" cy="130" r="6" fill="#bfdbfe" opacity="0.5"/>
        <circle cx="880" cy="180" r="4" fill="#bfdbfe" opacity="0.5"/>
        <circle cx="1050" cy="650" r="12" fill="#bfdbfe" opacity="0.5"/>
        <circle cx="1100" cy="680" r="8" fill="#bfdbfe" opacity="0.5"/>
        
        {/* Dot pattern */}
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle fill="#93c5fd" cx="2" cy="2" r="2" opacity="0.3"></circle>
        </pattern>
        <rect x="400" y="100" width="100" height="100" fill="url(#dots)"></rect>
      </svg>

      <div className="container mx-auto max-w-7xl px-4 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 py-12">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-6/12 flex flex-col justify-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-extrabold text-xs ml-1 mt-1">Rp</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-blue-700 leading-none tracking-tight flex items-center gap-1">
                SIKELAS <span className="text-yellow-400 text-xl">✦</span>
              </h1>
              <p className="text-[11px] text-gray-500 font-bold tracking-wide mt-1">Sistem Informasi Keuangan Kelas</p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1e293b] leading-tight mb-5">
            Kelola Keuangan Kelas dengan <span className="text-blue-600">Mudah,</span> <br className="hidden lg:block"/>
            <span className="text-blue-600">Transparan,</span> dan <span className="text-blue-600">Akuntabel</span>
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-lg leading-relaxed font-medium">
            SIKELAS membantu bendahara, wali kelas, dan pengurus mengelola keuangan kelas secara efisien dan terpercaya.
          </p>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Aman</h4>
              <p className="text-[10px] text-gray-500 font-medium leading-tight mt-1">Data terlindungi dengan baik</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Transparan</h4>
              <p className="text-[10px] text-gray-500 font-medium leading-tight mt-1">Informasi jelas dan terbuka</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Akuntabel</h4>
              <p className="text-[10px] text-gray-500 font-medium leading-tight mt-1">Setiap transaksi dapat dipertanggungjawabkan</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Mudah Digunakan</h4>
              <p className="text-[10px] text-gray-500 font-medium leading-tight mt-1">Antarmuka sederhana dan intuitif</p>
            </div>
          </div>

          {/* Custom HTML/CSS Illustration */}
          <div className="relative w-full h-48 mb-12 flex items-center justify-start ml-2 lg:ml-10 hidden sm:flex">
             
             {/* Clipboard */}
             <div className="w-36 h-48 bg-white rounded-xl shadow-lg border-2 border-blue-100 absolute left-24 -rotate-6 z-10 flex flex-col items-center pt-8 px-4">
               <div className="w-14 h-4 bg-gray-200 rounded-full absolute -top-2 border-2 border-gray-300"></div>
               {/* Pie chart */}
               <div className="w-14 h-14 rounded-full bg-blue-500 border-[3px] border-white shadow-sm relative mb-4">
                 <div className="absolute w-7 h-7 bg-blue-300 rounded-tr-full top-0 right-0"></div>
               </div>
               {/* Lines */}
               <div className="w-full h-2 bg-blue-100 rounded-full mb-2"></div>
               <div className="w-2/3 h-2 bg-blue-100 rounded-full mb-4 self-start"></div>
               
               {/* Bar chart */}
               <div className="flex items-end gap-1.5 mt-auto w-full">
                 <div className="w-full bg-blue-300 rounded-t-sm" style={{height: '15px'}}></div>
                 <div className="w-full bg-blue-400 rounded-t-sm" style={{height: '25px'}}></div>
                 <div className="w-full bg-blue-500 rounded-t-sm" style={{height: '18px'}}></div>
                 <div className="w-full bg-blue-600 rounded-t-sm" style={{height: '35px'}}></div>
               </div>
             </div>

             {/* Calculator */}
             <div className="w-24 h-36 bg-blue-600 rounded-2xl shadow-xl absolute left-0 bottom-0 rotate-12 z-20 p-2.5 flex flex-col border-b-4 border-blue-800 border-r-2">
               <div className="w-full h-8 bg-blue-800 rounded-lg mb-2 flex items-center justify-end px-2">
                 <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
               </div>
               <div className="grid grid-cols-3 gap-1.5 flex-1">
                 {[...Array(9)].map((_, i) => (
                   <div key={i} className="bg-blue-400/80 rounded-md"></div>
                 ))}
                 <div className="col-span-2 bg-blue-400/80 rounded-md"></div>
                 <div className="bg-blue-400/80 rounded-md"></div>
               </div>
             </div>

             {/* Coins */}
             <div className="absolute left-56 bottom-4 z-30 flex">
               <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-[0_5px_15px_rgba(234,179,8,0.4)] relative left-6 top-2 z-10">
                 <span className="text-yellow-700 font-extrabold text-xl">Rp</span>
               </div>
               <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-[0_5px_15px_rgba(234,179,8,0.4)] relative">
                 <span className="text-yellow-700 font-extrabold text-xl">Rp</span>
               </div>
               <div className="w-12 h-12 bg-yellow-400 rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-[0_5px_15px_rgba(234,179,8,0.4)] absolute -top-4 -right-2 -z-10">
                 <span className="text-yellow-700 font-extrabold text-sm">Rp</span>
               </div>
             </div>
             
             {/* Green Leaves */}
             <div className="absolute left-48 bottom-6 z-0 flex">
               <svg className="w-12 h-20 text-green-500 drop-shadow-md origin-bottom rotate-[30deg]" viewBox="0 0 100 100" fill="currentColor">
                 <path d="M50 100 C 50 100, 0 80, 0 40 C 0 0, 50 0, 50 0 C 50 0, 100 0, 100 40 C 100 80, 50 100, 50 100 Z"/>
               </svg>
               <svg className="w-10 h-16 text-green-400 drop-shadow-md origin-bottom rotate-[60deg] -ml-6 mt-4" viewBox="0 0 100 100" fill="currentColor">
                 <path d="M50 100 C 50 100, 0 80, 0 40 C 0 0, 50 0, 50 0 C 50 0, 100 0, 100 40 C 100 80, 50 100, 50 100 Z"/>
               </svg>
             </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#eef4ff] backdrop-blur-sm rounded-2xl p-5 border border-blue-100 flex gap-4 items-start max-w-xl">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-1.5">Apa itu SIKELAS?</h4>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                SIKELAS adalah Sistem Informasi Keuangan Kelas yang dirancang untuk memudahkan pencatatan pemasukan, pengeluaran, dan pelaporan dana kelas secara digital, akurat, dan real-time.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-5/12 max-w-md mx-auto lg:mr-0 flex flex-col items-center pt-8 lg:pt-0">
          
          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-gray-100 p-8 lg:p-10 w-full relative">
             
             {/* Padlock Icon */}
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-[6px] border-[#f2f6ff]">
               <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
             </div>

             <div className="mt-8 text-center mb-8">
               <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Selamat Datang di SIKELAS</h2>
               <p className="text-sm text-gray-500 font-medium">Silakan masuk untuk melanjutkan</p>
             </div>
             
             {error && (
               <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 font-medium text-center border border-red-100">
                 {error}
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                   </div>
                   <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda" 
                    className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition-all placeholder:text-gray-400 font-medium" 
                    required 
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   </div>
                   <input 
                    type={showPassword ? "text" : "password"} 
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda" 
                    className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-11 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition-all placeholder:text-gray-400 font-medium" 
                    required 
                   />
                   <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                   >
                     {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-2.583c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.282 2.686" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                   </button>
                 </div>
               </div>

               <div className="flex items-center justify-between pt-1 pb-3">
                 <label className="flex items-center space-x-2 cursor-pointer group">
                   <div className="w-5 h-5 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center text-white">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <span className="text-sm text-gray-800 font-bold">Ingat saya</span>
                 </label>
                 <a href="#" className="text-sm text-blue-600 font-bold hover:underline">Lupa password?</a>
               </div>

               <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all hover:shadow-lg flex justify-center items-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                 Masuk
               </button>

               <div className="relative flex items-center py-4">
                 <div className="flex-grow border-t border-gray-200"></div>
                 <span className="flex-shrink-0 mx-4 text-xs text-gray-400 font-medium">atau</span>
                 <div className="flex-grow border-t border-gray-200"></div>
               </div>

               <button 
                type="button" 
                onClick={() => router.push('/publik')} 
                className="w-full bg-white hover:bg-blue-50 text-blue-600 font-bold py-3.5 rounded-xl border-2 border-blue-100 transition-all flex justify-center items-center gap-2 shadow-sm"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 DASHBOARD PENGUNJUNG <span className="font-normal">(Tanpa login)</span>
               </button>
             </form>
          </div>

          <div className="mt-8 flex flex-col items-center space-y-3">
            <div className="flex items-center gap-2 text-blue-700/70">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span className="text-xs font-bold">Akses aman untuk melindungi data keuangan kelas Anda</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">© 2026 SIKELAS. Semua hak dilindungi.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
