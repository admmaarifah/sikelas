"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session) return { totalSaldo: 0, totalExpense: 0, lunasToday: 0, totalStudents: 0, isGlobal: true };

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let classIds: string[] | undefined = undefined; // undefined means fetch all (ADMIN)
  let isGlobal = true;

  if (role === "TEACHER") {
    const classes = await prisma.class.findMany({ where: { teacherId: userId }});
    classIds = classes.map(c => c.id);
    isGlobal = false;
  } else if (role === "TREASURER") {
    const classes = await prisma.class.findMany({ where: { treasurerId: userId }});
    classIds = classes.map(c => c.id);
    isGlobal = false;
  }

  const transactionWhere = classIds ? { classId: { in: classIds } } : {};
  const studentWhere = classIds ? { classId: { in: classIds } } : {};
  const paymentWhere = classIds ? { student: { classId: { in: classIds } } } : {};

  const transactions = await prisma.transaction.findMany({ where: transactionWhere });
  
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (t.type === "INCOME") totalIncome += t.amount;
    if (t.type === "EXPENSE") totalExpense += t.amount;
  });

  const totalSaldo = totalIncome - totalExpense;

  // Lunas hari ini
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const totalStudents = await prisma.student.count({ where: studentWhere });
  
  // Unique students paid today
  const paymentsToday = await prisma.dailyPayment.groupBy({
    by: ['studentId'],
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      ...paymentWhere
    }
  });

  // Get monthly stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let trxCountThisMonth = 0;
  let incomeThisMonth = 0;
  let expenseThisMonth = 0;
  let lastUpdate: Date | null = null;

  transactions.forEach(t => {
    if (!lastUpdate || t.createdAt > lastUpdate) {
      lastUpdate = t.createdAt;
    }
    
    if (t.date >= startOfMonth) {
      trxCountThisMonth++;
      if (t.type === "INCOME") incomeThisMonth += t.amount;
      if (t.type === "EXPENSE") expenseThisMonth += t.amount;
    }
  });

  return {
    totalSaldo,
    totalExpense,
    lunasToday: paymentsToday.length,
    totalStudents,
    isGlobal,
    lastUpdate,
    trxCountThisMonth,
    incomeThisMonth,
    expenseThisMonth
  };
}
