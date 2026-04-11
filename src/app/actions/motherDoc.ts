"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateMotherDoc() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { questionnaire: true }
  });

  if (!user || !user.questionnaire) {
    throw new Error("Client questionnaire data is missing");
  }

  const { niche, targetAudience, interests, goals } = user.questionnaire;

  const systemPrompt = `
    You are an elite, world-class Social Media Ghostwriter AI. 
    Based on the client context below, generate their "Mother Document". 
    This document defines exactly how they speak and their core content pillars.
    
    CLIENT CONTEXT:
    - Niche: ${niche}
    - Target Audience: ${targetAudience}
    - Top Interests: ${interests}
    - Goals: ${goals}

    Respond ONLY with a raw JSON object adhering strictly to this JSON format (no markdown code blocks, just raw JSON) providing deep, highly valuable insights:
    {
      "toneOfVoice": "string describing their exact tone in 2-3 sentences",
      "contentPillars": "string breaking down their interests into exactly 10 highly specific sub-pillars",
      "baselineAccounts": "string listing 5 real or hypothetical successful creators in this niche to emulate"
    }
  `;

  // Utilize Groq's insanely fast inference with Llama 3.1 8B
  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant", 
    messages: [{ role: "user", content: systemPrompt }],
    response_format: { type: "json_object" }, 
    temperature: 0.7,
  });

  const aiContent = completion.choices[0]?.message?.content;
  if (!aiContent) throw new Error("AI failed to generate response");

  const parsed = JSON.parse(aiContent);

  // Store the synthetic generated profile back into Prisma SQLite database
  await prisma.motherDoc.upsert({
    where: { userId: user.id },
    update: {
      toneOfVoice: parsed.toneOfVoice,
      contentPillars: parsed.contentPillars,
      baselineAccounts: parsed.baselineAccounts,
    },
    create: {
      userId: user.id,
      toneOfVoice: parsed.toneOfVoice,
      contentPillars: parsed.contentPillars,
      baselineAccounts: parsed.baselineAccounts,
    }
  });

  // Hot reload the Next.js cache so the button disappears and data instantly appears
  revalidatePath("/dashboard");
}
