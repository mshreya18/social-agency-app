"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateContentPost(platform: "LinkedIn" | "Substack") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { motherDoc: true, generatedPosts: true }
  });

  if (!user || !user.motherDoc) {
    throw new Error("Cannot generate content without a Mother Doc profile. Please synthesize it first.");
  }

  const { toneOfVoice, contentPillars, baselineAccounts } = user.motherDoc;

  const systemPrompt = `
    You are an elite, high-converting Social Media Copywriter AI.
    Your sole mission is to write exactly ONE highly engaging post specifically tailored for ${platform}.
    
    CLIENT VOICE & CORE RULES:
    - Target Tone of Voice: ${toneOfVoice}
    - Content Pillars to pull from: ${contentPillars}
    - Emulate the style of these accounts: ${baselineAccounts}
    
    PLATFORM SPECIFIC INSTRUCTIONS:
    If LinkedIn: Write a powerful hook, an engaging story/insight broken into short scannable sentences (use whitespace), and an actionable takeaway. Maximum 200 words.
    If Substack: Write a thought-provoking, deep-dive newsletter section introducing a controversial or highly valuable industry take. Maximum 400 words.
    
    CRITICAL CONSTRAINT: DO NOT output ANY conversational filler, markdown backticks, or intro text (like "Here is the post"). 
    OUTPUT ONLY THE EXACT FINAL RAW COPY FOR THE POST.
  `;

  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: systemPrompt }],
    temperature: 0.85,
  });

  const generatedText = completion.choices[0]?.message?.content?.trim();
  if (!generatedText) throw new Error("AI pipeline failed to synthesize post content");

  // Determine a scheduled date (incrementally scheduling them every 2 days for the calendar view)
  const existingPostCount = user.generatedPosts.length;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (existingPostCount * 2) + 1); 

  await prisma.generatedPost.create({
    data: {
      userId: user.id,
      platform,
      content: generatedText,
      scheduledDate: targetDate,
      status: "DRAFT"
    }
  });

  // Hot reload the Next.js cache so the dashboard immediately renders the new generated content card
  revalidatePath("/dashboard");
}
