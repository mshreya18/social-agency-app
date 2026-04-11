# Social Agency AI Platform

An automated AI-powered social media agency application. This platform ingests custom user context, generates a persistent "Mother Doc" intelligence profile using Groq's high-speed inference layer, and acts as the brain for dynamically generating personalized platform content.

## Tech Stack
- **Frontend Framework:** Next.js (App Router)
- **Styling:** TailwindCSS, Shadcn UI
- **Database / ORM:** SQLite via Prisma ORM
- **Authentication:** Clerk
- **File Storage:** Supabase Storage
- **LLM / AI Models:** Groq (`llama-3.1-8b-instant` and Whisper)

---

## Local Development Initialization

When cloning this project on a new machine, you must follow these instructions exactly to recreate the local database and link the external authentication and AI services!

### 1. Clone & Install
\`\`\`bash
git clone <your-repository-url>
cd social-agency-app
npm install
\`\`\`

### 2. Configure Environment Variables
You must set up API credentials for the platform to function. Copy the provided example to create your local `.env.local` configuration file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

You will need to manually populate these keys:
- **Clerk:** Set up a free application at [Clerk](https://clerk.com) for the Publishable and Secret keys.
- **Supabase:** Create a new project at [Supabase](https://supabase.com). Take the `URL` and `anon public` key. **Important:** Create a public storage bucket entirely named `knowledge-base` and add an RLS policy enabling public `INSERT` operations.
- **Groq:** Grab a free ultra-fast LPU API key at [Groq Console](https://console.groq.com/keys).

### 3. Build the Database
We use a local `.db` SQLite file for rapid prototyping. Generate the Prisma Client and securely push the schema into the SQLite database file:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

### 4. Boot the Server
Start the frontend Next.js development server:
\`\`\`bash
npm run dev
\`\`\`
The application will be accessible at [http://localhost:3000](http://localhost:3000). You will immediately be intercepted by the Clerk authentication middleware.
