"use server";

import { prisma } from "@/lib/prisma";

export async function getStudentPassbook(classId: string, nisn: string) {
  const student = await prisma.student.findFirst({
    where: { classId, nis: nisn }
  });

  if (!student) return null;

  const payments = await prisma.dailyPayment.findMany({
    where: { studentId: student.id },
    orderBy: { date: "asc" }
  });

  let balance = 0;
  const passbookData = payments.map(p => {
    balance += p.amount;
    return {
      date: p.date,
      amount: p.amount,
      balance
    };
  });

  return {
    student,
    passbookData
  };
}

export async function getClassSummary(classId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { classId },
    orderBy: { date: "asc" }
  });

  // Group incomes by day (normalized to YYYY-MM-DD), keep expenses as is
  const summaryMap = new Map<string, any>();
  const expensesList: any[] = [];

  transactions.forEach(t => {
    if (t.type === "INCOME") {
      const dateStr = t.date.toISOString().split("T")[0];
      if (!summaryMap.has(dateStr)) {
        summaryMap.set(dateStr, {
          date: new Date(dateStr),
          description: "Total Setoran Pemasukan Harian",
          income: 0,
          expense: 0,
          isIncomeGroup: true
        });
      }
      summaryMap.get(dateStr).income += t.amount;
    } else {
      expensesList.push({
        date: t.date,
        description: t.description,
        income: 0,
        expense: t.amount,
        isIncomeGroup: false
      });
    }
  });

  const combined = [...Array.from(summaryMap.values()), ...expensesList];
  
  // Sort chronologically
  combined.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate running balance
  let balance = 0;
  const ledger = combined.map(item => {
    balance += item.income;
    balance -= item.expense;
    return { ...item, balance };
  });

  return { ledger };
}

export async function getAllClassesPublic() {
  return await prisma.class.findMany({
    orderBy: { name: "asc" }
  });
}
