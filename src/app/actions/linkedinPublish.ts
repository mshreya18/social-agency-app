"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function publishToLinkedIn(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized Access Detected");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { generatedPosts: { where: { id: postId } } }
  });

  if (!user || !user.linkedinAccessToken || !user.linkedinAccountId) {
    throw new Error("LinkedIn not connected. Please attach your account via the Dashboard first.");
  }

  const post = user.generatedPosts[0];
  if (!post) throw new Error("Generated post not explicitly found in SQLite.");

  // Securely format the strictly typed UGC Post JSON package for LinkedIn's publishing API
  const requestBody = {
    author: user.linkedinAccountId, 
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: post.content
        },
        shareMediaCategory: "NONE" // Text-only post format
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  const publishRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${user.linkedinAccessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseData = await publishRes.json().catch(() => null);

  if (!publishRes.ok) {
    console.error("LinkedIn Native Publish Execution Error:", responseData);
    throw new Error(responseData?.message || "Remote LinkedIn API rejected the publish operation.");
  }

  // Successfully published! Flip internal status to lock the record
  await prisma.generatedPost.update({
    where: { id: postId },
    data: { status: "PUBLISHED" }
  });

  revalidatePath("/dashboard");
}
