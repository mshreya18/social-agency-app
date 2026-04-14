"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateMotherDoc(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const toneOfVoice      = formData.get("toneOfVoice") as string;
  const contentPillars   = formData.get("contentPillars") as string;
  const baselineAccounts = formData.get("baselineAccounts") as string;
  const adminNotes       = formData.get("adminNotes") as string;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found");

  await prisma.motherDoc.update({
    where: { userId: user.id },
    data: { toneOfVoice, contentPillars, baselineAccounts, adminNotes }
  });

  revalidatePath("/dashboard");
}
