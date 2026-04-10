"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function submitQuestionnaire(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const niche = formData.get("niche") as string;
  const targetAudience = formData.get("targetAudience") as string;
  const interests = formData.get("interests") as string;
  const goals = formData.get("goals") as string;

  // Upsert the user using Clerk ID
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email: `${userId}@placeholder.com`, // We will get real email later
    }
  });

  await prisma.questionnaire.upsert({
    where: { userId: user.id },
    update: {
      niche,
      targetAudience,
      interests,
      goals
    },
    create: {
      userId: user.id,
      niche,
      targetAudience,
      interests,
      goals
    }
  });

  // Redirect to the main dashboard after saving
  redirect("/dashboard");
}
