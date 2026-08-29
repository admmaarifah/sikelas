"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      classesAsTeacher: true,
      classesAsTreasurer: true
    }
  });
}

export async function createUser(data: { name: string; email: string; password?: string; role: string; classId?: string }) {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : await bcrypt.hash("123456", 10);
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as Role
    }
  });

  if (data.classId && data.role === "TEACHER") {
    await prisma.class.update({ where: { id: data.classId }, data: { teacherId: user.id } });
  } else if (data.classId && data.role === "TREASURER") {
    await prisma.class.update({ where: { id: data.classId }, data: { treasurerId: user.id } });
  }

  revalidatePath("/dashboard/accounts");
}

export async function updateUser(id: string, data: { name: string; email: string; password?: string; role: string; classId?: string }) {
  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role as Role
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  });

  // Reset previous assignments
  if (data.role === "TEACHER") {
    await prisma.class.updateMany({ where: { teacherId: id }, data: { teacherId: null } });
    if (data.classId) {
      await prisma.class.update({ where: { id: data.classId }, data: { teacherId: id } });
    }
  } else if (data.role === "TREASURER") {
    await prisma.class.updateMany({ where: { treasurerId: id }, data: { treasurerId: null } });
    if (data.classId) {
      await prisma.class.update({ where: { id: data.classId }, data: { treasurerId: id } });
    }
  }

  revalidatePath("/dashboard/accounts");
}

export async function deleteUser(id: string) {
  // Reassign records to an admin to prevent foreign key constraint errors
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  
  if (admin && admin.id !== id) {
    await prisma.dailyPayment.updateMany({ where: { recordedById: id }, data: { recordedById: admin.id } });
    await prisma.transaction.updateMany({ where: { recordedById: id }, data: { recordedById: admin.id } });
  }

  await prisma.class.updateMany({ where: { teacherId: id }, data: { teacherId: null } });
  await prisma.class.updateMany({ where: { treasurerId: id }, data: { treasurerId: null } });
  
  await prisma.user.delete({
    where: { id }
  });
  revalidatePath("/dashboard/accounts");
}
