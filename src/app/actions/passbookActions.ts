"use server";

import { prisma } from "@/lib/prisma";

export async function getPassbookTransactions(classId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { classId },
    orderBy: { date: "asc" }
  });
  
  let balance = 0;
  return transactions.map(t => {
    if (t.type === "INCOME") {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
    return { ...t, balance };
  });
}
