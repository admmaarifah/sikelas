"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getClasses() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  const includeRelations = { teacher: { select: { name: true } }, treasurer: { select: { name: true } } };

  if (role === "ADMIN") {
    return await prisma.class.findMany({ 
      orderBy: { name: "asc" },
      include: includeRelations
    });
  } else if (role === "TEACHER") {
    return await prisma.class.findMany({
      where: { teacherId: userId },
      orderBy: { name: "asc" },
      include: includeRelations
    });
  } else if (role === "TREASURER") {
    return await prisma.class.findMany({
      where: { treasurerId: userId },
      orderBy: { name: "asc" },
      include: includeRelations
    });
  }
  return [];
}

export async function createClass(name: string) {
  await prisma.class.create({ data: { name } });
  revalidatePath("/dashboard/classes");
}

export async function updateClass(id: string, name: string) {
  await prisma.class.update({
    where: { id },
    data: { name }
  });
  revalidatePath("/dashboard/classes");
}

export async function deleteClass(id: string) {
  await prisma.class.delete({
    where: { id }
  });
  revalidatePath("/dashboard/classes");
}
