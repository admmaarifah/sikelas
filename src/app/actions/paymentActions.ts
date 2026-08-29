"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export async function getDailyPayments(classId: string, date: Date) {
  // Normalize date to start of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.dailyPayment.findMany({
    where: {
      student: { classId },
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: { student: true }
  });
}

export async function getMonthlyPaymentsMatrix(classId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { name: 'asc' }
  });

  const payments = await prisma.dailyPayment.findMany({
    where: {
      student: { classId },
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const matrix: Record<string, Record<string, boolean>> = {};
  students.forEach(s => {
    matrix[s.id] = {};
  });

  // Adjust for timezone when converting date to string to prevent off-by-one errors
  payments.forEach(p => {
    const localDate = new Date(p.date.getTime() - (p.date.getTimezoneOffset() * 60000));
    const dateStr = localDate.toISOString().split('T')[0];
    if (matrix[p.studentId]) {
      matrix[p.studentId][dateStr] = true;
    }
  });

  return { students, matrix };
}

export async function getAvailableYears() {
  const earliestPayment = await prisma.dailyPayment.findFirst({
    orderBy: { date: 'asc' },
    select: { date: true }
  });
  
  const currentYear = new Date().getFullYear();
  const startYear = earliestPayment ? earliestPayment.date.getFullYear() : currentYear;
  
  const years = [];
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y);
  }
  return Array.from(new Set(years)).sort();
}

export async function getPaidDates(classId: string) {
  const payments = await prisma.dailyPayment.findMany({
    where: { student: { classId } },
    select: { date: true },
    distinct: ['date']
  });
  return payments.map(p => p.date);
}

export async function toggleDailyPayment(studentId: string, date: Date, amount: number, userId: string, isPaid: boolean) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  if (isPaid) {
    // Add payment
    await prisma.dailyPayment.upsert({
      where: {
        studentId_date: { studentId, date: normalizedDate }
      },
      update: { amount },
      create: {
        studentId,
        date: normalizedDate,
        amount,
        recordedById: userId
      }
    });
    
    // Also record it in Transactions for the class
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student) {
        const tx = await prisma.transaction.create({
            data: {
                classId: student.classId,
                type: "INCOME",
                amount,
                date: normalizedDate,
                description: `Setoran harian - ${student.name}`,
                recordedById: userId
            }
        });
        
        await prisma.dailyPayment.update({
            where: { studentId_date: { studentId, date: normalizedDate } },
            data: { transactionId: tx.id }
        });
    }

  } else {
    // Remove payment logic
    const existing = await prisma.dailyPayment.findUnique({
      where: { studentId_date: { studentId, date: normalizedDate } }
    });

    if (existing && existing.transactionId) {
      const count = await prisma.dailyPayment.count({
        where: { transactionId: existing.transactionId }
      });

      if (count === 1) {
        // If this is the ONLY day linked to this transaction, just delete the transaction entirely.
        // Due to Prisma's CASCADE delete, the DailyPayment row will also be automatically deleted!
        await prisma.transaction.delete({
          where: { id: existing.transactionId }
        });
      } else {
        // If this is a BULK payment, we cannot delete the whole transaction.
        // Delete just this specific day's payment...
        await prisma.dailyPayment.delete({
          where: { id: existing.id }
        });
        
        // ...and deduct the amount from the original transaction so the balance remains accurate!
        await prisma.transaction.update({
          where: { id: existing.transactionId },
          data: {
            amount: { decrement: amount }
          }
        });
      }
    } else {
      // Fallback for older data that doesn't have a transactionId
      await prisma.dailyPayment.deleteMany({
        where: { studentId, date: normalizedDate }
      });
      
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (student) {
        await prisma.transaction.create({
          data: {
            classId: student.classId,
            type: "INCOME",
            amount: -amount,
            date: new Date(),
            description: `Koreksi batal setoran - ${student.name} (${format(normalizedDate, "dd/MM")})`,
            recordedById: userId
          }
        });
      }
    }
  }
  
  revalidatePath("/dashboard/income");
}

export async function bulkPayDaily(
  classId: string,
  studentId: string,
  amountReceived: number,
  startDate: Date,
  dailyNominal: number,
  userId: string
) {
  if (amountReceived % dailyNominal !== 0) {
    throw new Error(`Nominal setoran harus kelipatan dari kas harian (Rp ${dailyNominal.toLocaleString()}). Sisa uang tidak dapat dipecah untuk hitungan hari.`);
  }

  const daysToPay = Math.floor(amountReceived / dailyNominal);
  if (daysToPay < 1) throw new Error("Nominal terlalu kecil untuk 1 hari");

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  
  // 1. Create a single transaction for the passbook
  const tx = await prisma.transaction.create({
    data: {
      classId,
      type: "INCOME",
      amount: amountReceived,
      date: new Date(), // recorded today
      description: `Setoran borongan (${daysToPay} hari) - ${student?.name}`,
      recordedById: userId
    }
  });

  // 2. Cari tanggal paling awal ada pembayaran di kelas ini (untuk patokan awal mula kelas berjalan)
  const earliestPayment = await prisma.dailyPayment.findFirst({
    where: { student: { classId } },
    orderBy: { date: 'asc' }
  });

  // Mulai dari pembayaran terawal kelas, ATAU dari startDate jika belum ada sama sekali
  let currentDate = earliestPayment ? new Date(earliestPayment.date) : new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  // Jika user secara manual memilih startDate yang lebih lampau dari earliestPayment, gunakan itu
  if (startDate.getTime() < currentDate.getTime()) {
    currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
  }

  let daysFound = 0;
  const paymentsToInsert = [];
  
  while (daysFound < daysToPay) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sunday(0) and Saturday(6)
      // Check if this date is already paid
      const existing = await prisma.dailyPayment.findUnique({
         where: { studentId_date: { studentId, date: new Date(currentDate) } }
      });
      
      if (!existing) {
        paymentsToInsert.push({
          studentId,
          date: new Date(currentDate),
          amount: dailyNominal,
          recordedById: userId,
          transactionId: tx.id
        });
        daysFound++;
      }
    }
    // Add 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 3. Upsert into daily payments
  for (const p of paymentsToInsert) {
    await prisma.dailyPayment.create({
      data: p
    });
  }

  revalidatePath("/dashboard/income");
  return { success: true, daysPaid: daysToPay };
}
