# Social Agency AI Platform

An automated AI-powered social media agency platform. This platform ingests custom user context, generates a persistent "Mother Doc" intelligence profile using Groq's high-speed inference layer, and acts as the brain for dynamically generating and publishing personalized platform content.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** TailwindCSS, Shadcn UI
- **Database / ORM:** SQLite via Prisma ORM v5
- **Authentication:** Clerk
- **File Storage:** Supabase Storage
- **AI Models:** Groq (`llama-3.1-8b-instant` + `whisper-large-v3`)
- **Publishing:** LinkedIn OAuth 2.0 (native UGC API)

---

## Features

- **Onboarding Questionnaire** — Captures client niche, audience, goals, and content interests.
- **File & Audio Uploads** — Upload knowledge-base assets to Supabase Storage.
- **AI Transcription** — Audio files are automatically transcribed via Groq Whisper.
- **Mother Doc Synthesis** — Groq LLM synthesizes raw context into a structured voice profile (Tone, Pillars, Emulation Accounts).
- **Admin Mother Doc Editor** — Agency can directly edit any field or add private notes/follow-up questions.
- **Content Generation Engine** — One-click AI generation of LinkedIn posts and Substack newsletters using the Mother Doc as context.
- **Content Calendar** — Generated drafts are displayed on a scheduling grid with editable target dates.
- **Human-in-the-Loop Feedback** — Request AI rewrites with specific feedback or approve drafts for publishing.
- **LinkedIn Native Publishing** — Connects via OAuth 2.0 and publishes approved posts directly to LinkedIn.

---

## Local Development Setup

> Follow these instructions **exactly** when cloning on a new machine.

### 1. Clone & Install
```bash
git clone <your-repository-url>
cd social-agency-app
npm install
```

### 2. Configure Environment Variables
Copy the provided template and fill in your credentials:
```bash
cp .env.example .env.local
```

Open `.env.local` and populate each key:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | [Clerk Dashboard](https://clerk.com) — create a new app |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [Supabase](https://supabase.com) — create a project |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) — free tier |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | [LinkedIn Developer Portal](https://developer.linkedin.com) — create an app |
| `LINKEDIN_REDIRECT_URI` | Set to `http://localhost:3000/api/auth/linkedin/callback` |

> **Supabase Setup:** Create a public storage bucket named exactly `knowledge-base`. Add an RLS policy enabling public `INSERT` operations on that bucket.

> **LinkedIn Setup:** In your LinkedIn app's Auth tab, add `http://localhost:3000/api/auth/linkedin/callback` as an Authorized Redirect URL. Request access to the **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect** products.

### 3. Initialize the Database
```bash
npx prisma db push
npx prisma generate
```

This creates the local SQLite database file (`dev.db`) and generates the type-safe Prisma client.

### 4. Start the Dev Server
```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). You will be intercepted by Clerk authentication on first load.

---

## Usage Flow

1. **Sign up / Sign in** via Clerk.
2. Complete the **Onboarding Questionnaire**.
3. On the **Dashboard**, click **"Synthesize Voice with Groq"** to generate your Mother Doc.
4. Optionally use the **Edit Mother Doc** button to refine any field or add admin notes.
5. Upload audio/assets via the **File Upload** widget — they are auto-transcribed.
6. In the **Content Generation Engine**, click to generate LinkedIn or Substack drafts.
7. Review drafts, request AI rewrites with feedback, or approve them.
8. Connect your LinkedIn account via the **"Connect LinkedIn Account"** button in the header.
9. Once approved, click **"Publish to LinkedIn Now"** to go live.

---

## Troubleshooting

**`EPERM` on `npx prisma generate`** — Your dev server is locking the Prisma DLL. Stop all Node processes first:
```bash
Stop-Process -Name "node" -Force  # Windows PowerShell
npx prisma generate
npm run dev
```

**Column does not exist error** — Your database is out of sync. Run:
```bash
npx prisma db push
```

**`redirect_uri does not match`** — Ensure the redirect URL in your LinkedIn Developer Portal Auth tab exactly matches the value in your `.env.local` (no trailing slash).
