"use client";

import { useState, useEffect } from "react";
import { getClasses } from "@/app/actions/classActions";
import { getMonthlyPaymentsMatrix, getAvailableYears } from "@/app/actions/paymentActions";
import { getSettings } from "@/app/actions/settingsActions";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format, getDaysInMonth, isWeekend } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function ReportsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [nominal, setNominal] = useState(0);

  useEffect(() => {
    getClasses().then(cls => {
      setClasses(cls);
      if (cls.length > 0 && !selectedClass) {
        setSelectedClass(cls[0].id);
      }
    });
    getAvailableYears().then(years => {
      if (years.length > 0) setAvailableYears(years);
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getSettings(selectedClass).then(settings => {
        setNominal(settings?.dailyNominal || 0);
      });
      getMonthlyPaymentsMatrix(selectedClass, month, year).then(data => {
        setStudents(data.students);
        setMatrix(data.matrix);
      });
    } else {
      setStudents([]);
      setMatrix({});
    }
  }, [selectedClass, month, year]);

  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const workDays: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    if (!isWeekend(d)) {
      workDays.push(i);
    }
  }

  // Calculate summaries
  const totalStudents = students.length;
  let totalPaidDaysAcrossAll = 0;
  let totalCollected = 0;

  const studentStats = students.map(student => {
    let paidDays = 0;
    workDays.forEach(day => {
      const dateStr = format(new Date(year, month - 1, day), "yyyy-MM-dd");
      if (matrix[student.id]?.[dateStr]) {
        paidDays++;
      }
    });
    
    totalPaidDaysAcrossAll += paidDays;
    const totalSetoran = paidDays * nominal;
    totalCollected += totalSetoran;
    const percentage = workDays.length > 0 ? (paidDays / workDays.length) * 100 : 0;
    
    return {
      ...student,
      paidDays,
      totalSetoran,
      percentage
    };
  });

  const avgPaymentPercentage = (totalStudents > 0 && workDays.length > 0) 
    ? (totalPaidDaysAcrossAll / (totalStudents * workDays.length)) * 100 
    : 0;

  const avgPaymentDays = totalStudents > 0 
    ? Math.round(totalPaidDaysAcrossAll / totalStudents)
    : 0;

  const exportExcel = async () => {
    if (students.length === 0) return alert("Tidak ada data");
    
    const className = classes.find(c => c.id === selectedClass)?.name || selectedClass;
    const monthName = monthsList[month-1];
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Pembayaran', {
      pageSetup: { paperSize: 9, orientation: 'landscape', margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } }
    });

    // --- KOP SURAT ---
    const lastColIndex = 4 + workDays.length;
    const lastColLetter = worksheet.getColumn(lastColIndex).letter;

    worksheet.mergeCells(`A1:${lastColLetter}1`);
    const title1 = worksheet.getCell('A1');
    title1.value = "SIKELAS - BUKUKAS KELAS";
    title1.font = { name: 'Arial', size: 16, bold: true };
    title1.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const title2 = worksheet.getCell('A2');
    title2.value = "REKAP LAPORAN PEMBAYARAN KAS SISWA";
    title2.font = { name: 'Arial', size: 14, bold: true };
    title2.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells(`A3:${lastColLetter}3`);
    const subtitle = worksheet.getCell('A3');
    subtitle.value = `Kelas: ${className}  |  Bulan: ${monthName} ${year}`;
    subtitle.font = { name: 'Arial', size: 11, italic: true };
    subtitle.alignment = { vertical: 'middle', horizontal: 'center' };

    // Empty row
    worksheet.addRow([]);

    // --- TABLE HEADERS ---
    const headerRow = worksheet.addRow(["NO", "NAMA SISWA", "TOTAL SETORAN", "PERSENTASE", ...workDays.map(d => d.toString())]);
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Set Column Widths
    worksheet.getColumn(1).width = 5; // NO
    worksheet.getColumn(2).width = 30; // NAMA
    worksheet.getColumn(3).width = 18; // TOTAL SETORAN
    worksheet.getColumn(4).width = 15; // PERSENTASE
    for (let i = 0; i < workDays.length; i++) {
      worksheet.getColumn(5 + i).width = 5; // Dates
    }

    // --- TABLE DATA ---
    studentStats.forEach((student, idx) => {
      const rowData = [
        idx + 1,
        student.name,
        `Rp ${student.totalSetoran.toLocaleString('id-ID')}`,
        `${student.percentage.toFixed(1)}%`
      ];

      workDays.forEach(day => {
        const dateStr = format(new Date(year, month - 1, day), "yyyy-MM-dd");
        const isPaid = matrix[student.id]?.[dateStr];
        rowData.push(isPaid ? "✓" : "-");
      });

      const row = worksheet.addRow(rowData);
      row.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: colNumber > 2 ? 'center' : 'left' };
        if (colNumber === 1) cell.alignment.horizontal = 'center';
        
        if (colNumber > 4) {
           if (cell.value === "✓") {
             cell.font = { color: { argb: 'FF16A34A' }, bold: true }; // Green
           } else {
             cell.font = { color: { argb: 'FF9CA3AF' } }; // Gray
           }
        }
      });
    });

    // --- FOOTER ---
    worksheet.addRow([]);
    const footerRow = worksheet.addRow([`Dicetak pada: ${format(new Date(), "dd MMMM yyyy HH:mm:ss", { locale: localeId })}`]);
    footerRow.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
    
    // --- DOWNLOAD ---
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Rekap_Pembayaran_${className}_${monthName}_${year}.xlsx`);
  };

  const monthsList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Rekap Laporan Pembayaran Siswa</h1>
        <p className="mt-2 text-gray-500">Pantau dan rekap pembayaran siswa secara harian dalam bentuk matriks.</p>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-7 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
        {classes.length > 0 && (
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kelas</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none bg-white font-medium"
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
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Bulan</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <select 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none bg-white font-medium"
            >
              {monthsList.map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Tahun</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <select 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all appearance-none bg-white font-medium"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {selectedClass ? (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          
          <div className="p-7 border-b border-gray-100 flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-white">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               </div>
               <h2 className="text-lg font-bold text-gray-900">Matriks Pembayaran - {monthsList[month-1]} {year}</h2>
            </div>
            <button 
              onClick={exportExcel} 
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Excel
            </button>
          </div>

          <div className="p-7">
            {/* Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-0.5">Total Siswa</p>
                  <p className="text-xl font-extrabold text-gray-900">{totalStudents} <span className="text-sm font-medium text-gray-500">siswa</span></p>
                </div>
              </div>

              <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-0.5">Rata-rata Pembayaran</p>
                  <p className="text-xl font-extrabold text-green-700">{avgPaymentPercentage.toFixed(1)}% <span className="text-sm font-medium text-green-600/80">({avgPaymentDays} hari)</span></p>
                </div>
              </div>

              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-0.5">Nominal Setoran / Hari</p>
                  <p className="text-xl font-extrabold text-orange-700">Rp {nominal.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-0.5">Total Terkumpul</p>
                  <p className="text-xl font-extrabold text-indigo-700">Rp {totalCollected.toLocaleString()}</p>
                </div>
              </div>

            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-4 border-r border-gray-200 bg-gray-50 z-20 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-16">NO</th>
                    <th className="px-5 py-4 border-r border-gray-200 bg-gray-50 z-20 sticky left-[64px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[180px]">NAMA SISWA</th>
                    <th className="px-5 py-4 border-r border-gray-200 text-center min-w-[120px]">TOTAL SETORAN</th>
                    <th className="px-5 py-4 border-r border-gray-200 text-center min-w-[120px]">PERSENTASE</th>
                    {workDays.map(day => {
                      const d = new Date(year, month - 1, day);
                      const dayNameShort = format(d, "EEE", { locale: localeId }).toUpperCase();
                      return (
                        <th key={day} className="px-2 py-3 text-center border-r border-gray-200 min-w-[50px]">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400">{dayNameShort}</span>
                            <span className="text-sm text-gray-700">{day}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentStats.length === 0 ? (
                    <tr>
                      <td colSpan={workDays.length + 4} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          Tidak ada data siswa untuk kelas ini.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    studentStats.map((student, idx) => (
                      <tr key={student.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 border-r border-gray-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] font-medium text-gray-900">{idx + 1}</td>
                        <td className="px-5 py-3 border-r border-gray-100 sticky left-[64px] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] font-bold text-gray-900 truncate">
                          {student.name}
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100 font-bold text-green-600 text-center">
                          Rp {student.totalSetoran.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 border-r border-gray-100 font-bold text-blue-600 text-center">
                          <span className="bg-blue-50 text-blue-700 py-1 px-2.5 rounded-lg text-xs">
                            {student.percentage.toFixed(1)}%
                          </span>
                        </td>
                        {workDays.map(day => {
                          const dateStr = format(new Date(year, month - 1, day), "yyyy-MM-dd");
                          const isPaid = matrix[student.id]?.[dateStr];
                          // If it's a future date in current month, we might want to show empty/dash differently, 
                          // but for simplicity we assume unpaid means red X if past, but let's just do check/x based on mock
                          const isFuture = new Date(dateStr) > new Date();
                          
                          return (
                            <td key={day} className="px-1 py-3 text-center border-r border-gray-100">
                              <div className="flex justify-center">
                                {isPaid ? (
                                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                  </div>
                                ) : isFuture ? (
                                  <div className="w-5 h-5 flex items-center justify-center text-gray-300 font-bold">-</div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
                  <div className="w-4 h-4 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Sudah Bayar</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
                  <div className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <span>Belum Bayar</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
                  <div className="text-gray-300 font-bold">-</div>
                  <span>Tidak Ada Setoran</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-xs text-gray-500 font-medium">Menampilkan 1 - 3 dari 32 siswa</div>
                <div className="flex items-center space-x-1">
                  <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button className="w-8 h-8 rounded bg-blue-600 text-white font-medium flex items-center justify-center shadow-sm">
                    1
                  </button>
                  <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    2
                  </button>
                  <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    3
                  </button>
                  <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    4
                  </button>
                  <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] text-center">
           <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-300 mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
           </div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">Pilih Kelas Terlebih Dahulu</h3>
           <p className="text-sm text-gray-500 max-w-sm">Silakan pilih kelas pada menu di atas untuk melihat rekap laporan matriks.</p>
        </div>
      )}

      {/* Footer Text */}
      <div className="mt-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
        &copy; 2026 Bukukas Kelas. Semua hak dilindungi.
      </div>

    </div>
  );
}
