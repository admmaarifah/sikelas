"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStudents(classId: string) {
  return await prisma.student.findMany({
    where: { classId },
    orderBy: { name: "asc" }
  });
}

export async function addStudent(data: { nis: string; name: string; classId: string }) {
  await prisma.student.create({
    data
  });
  revalidatePath("/dashboard/students");
}

export async function updateStudent(id: string, data: { nis: string; name: string }) {
  await prisma.student.update({
    where: { id },
    data
  });
  revalidatePath("/dashboard/students");
}

export async function importStudentsBulk(students: { nis: string; name: string; classId: string }[]) {
  // Ensure unique NIS, so we use createMany with skipDuplicates (supported on Postgres)
  await prisma.student.createMany({
    data: students,
    skipDuplicates: true,
  });
  revalidatePath("/dashboard/students");
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({ where: { id } });
  revalidatePath("/dashboard/students");
}
