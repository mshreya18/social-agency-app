import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard?error=linkedin_auth_rejected", req.url));
  }

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized Access");

    // 1. Execute the explicit exchange of the temporary code for a persistent Publisher Access Token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || "Token security exchange failed");

    const accessToken = tokenData.access_token;

    // 2. We must fetch the User's strictly formatted URN ID (required to attribute the post officially)
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userRes.json();
    if (!userRes.ok) throw new Error("Failed to fetch internal LinkedIn user matrix");

    // The 'sub' field dynamically serves as the core part of the highly specific urn:li:person tag
    const subId = userData.sub; 
    const urn = `urn:li:person:${subId}`;

    // 3. Vault it into our database safely
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        linkedinAccessToken: accessToken,
        linkedinAccountId: urn,
      },
    });

    return NextResponse.redirect(new URL("/dashboard?success=linkedin_connected", req.url));
  } catch (err: any) {
    console.error("LinkedIn Callback Network Error:", err);
    return NextResponse.redirect(new URL("/dashboard?error=linkedin_internal_crash", req.url));
  }
}
