"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userInitials = userName.charAt(0).toUpperCase();
  const role = session?.user?.role || "";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Desktop & Mobile Topbar */}
        <header className="bg-white border-b border-gray-100 shrink-0 h-24 flex items-center justify-between px-4 md:px-8">
          
          <div className="flex items-center">
            {/* Hamburger button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white">3</span>
            </button>

            {/* Divider */}
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold group-hover:ring-4 ring-blue-50 transition-all">
                {userInitials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-800">{userName}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
              <div className="hidden md:block text-slate-400 group-hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
