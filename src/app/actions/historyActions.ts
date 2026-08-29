"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTransactionHistory(classId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  return prisma.transaction.findMany({
    where: { classId },
    orderBy: { createdAt: "desc" }, // Order by system creation time
    include: {
      recordedBy: {
        select: { name: true }
      }
    }
  });
}

export async function updateTransaction(
  id: string, 
  data: { description: string, amount: number, date: Date, proofLink?: string }
) {
  await prisma.transaction.update({
    where: { id },
    data: { 
      description: data.description, 
      amount: data.amount, 
      date: new Date(data.date),
      proofLink: data.proofLink 
    }
  });
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard");
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({
    where: { id }
  });
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard");
}