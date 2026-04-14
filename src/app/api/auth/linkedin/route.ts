import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri || clientId.includes("your_linkedin")) {
    return NextResponse.json({ error: "Missing authentic LinkedIn credentials in .env.local" }, { status: 500 });
  }

  // Requesting OpenID identity and the explicit w_member_social permission required to publish!
  const scope = "openid profile email w_member_social";
  const state = Math.random().toString(36).substring(7);

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(linkedInAuthUrl);
}
