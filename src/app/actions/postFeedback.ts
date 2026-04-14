"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function approvePost(postId: string) {
  await prisma.generatedPost.update({
    where: { id: postId },
    data: { status: "APPROVED" }
  });
  revalidatePath("/dashboard");
}

export async function updatePostDate(postId: string, newDateString: string) {
  await prisma.generatedPost.update({
    where: { id: postId },
    data: { scheduledDate: new Date(newDateString) }
  });
  revalidatePath("/dashboard");
}

export async function rewritePostWithFeedback(postId: string, feedback: string) {
  const post = await prisma.generatedPost.findUnique({
    where: { id: postId },
    include: { user: { include: { motherDoc: true } } }
  });

  if (!post || !post.user.motherDoc) throw new Error("Required context not found");

  const systemPrompt = `
    You are an elite Social Media Copywriter AI.
    You previously generated this ${post.platform} post for the client:
    "${post.content}"
    
    The client rejected it with this specific feedback: 
    "${feedback}"
    
    Please completely REWRITE the post explicitly incorporating their feedback. 
    Maintain their exact intended tone of voice (${post.user.motherDoc.toneOfVoice}).
    
    CRITICAL CONSTRAINT: DO NOT output any conversational filler. Output ONLY the raw finalized copy for the post.
  `;

  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: systemPrompt }],
    temperature: 0.7,
  });

  const generatedText = completion.choices[0]?.message?.content?.trim();
  if (!generatedText) throw new Error("AI pipeline failed to rewrite post");

  await prisma.generatedPost.update({
    where: { id: postId },
    data: { 
      content: generatedText,
      status: "REVISED",
      feedbackNotes: feedback
    }
  });

  revalidatePath("/dashboard");
}
