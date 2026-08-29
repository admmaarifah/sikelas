"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExpenses(classId: string) {
  return await prisma.transaction.findMany({
    where: { classId, type: "EXPENSE" },
    orderBy: { date: "desc" },
    include: { recordedBy: true }
  });
}

export async function addExpense(data: { classId: string; amount: number; description: string; proofLink: string; date: Date; userId: string }) {
  await prisma.transaction.create({
    data: {
      classId: data.classId,
      type: "EXPENSE",
      amount: data.amount,
      description: data.description,
      proofLink: data.proofLink,
      date: data.date,
      recordedById: data.userId
    }
  });
  revalidatePath("/dashboard/expense");
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/passbook");
}
