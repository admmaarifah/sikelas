"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings(classId: string) {
  return await prisma.classFundSettings.findUnique({
    where: { classId }
  });
}

export async function updateSettings(classId: string, dailyNominal: number) {
  await prisma.classFundSettings.upsert({
    where: { classId },
    update: { dailyNominal },
    create: { classId, dailyNominal }
  });
  revalidatePath("/dashboard/settings");
}

export async function resetClassTransactions(classId: string) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can reset class transactions.");
  }

  // First, delete all daily payments belonging to students in this class
  await prisma.dailyPayment.deleteMany({
    where: { student: { classId } }
  });

  // Then, delete all transactions for this class
  await prisma.transaction.deleteMany({
    where: { classId }
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard");
}
