import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { FileUploadWidget } from "@/components/FileUploadWidget";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateMotherDoc } from "@/app/actions/motherDoc";
import { generateContentPost } from "@/app/actions/contentGenerator";
import { PostFeedbackActions } from "@/components/PostFeedbackActions";
import { PostDatePicker } from "@/components/PostDatePicker";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      questionnaire: true,
      motherDoc: true,
      generatedPosts: {
        orderBy: { scheduledDate: 'asc' }
      }
    }
  });

  if (!user || !user.questionnaire) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Social Agency Dashboard</h1>
        <div className="flex items-center gap-6">
          {user.linkedinAccessToken ? (
            <span className="text-sm font-bold text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded-md shadow-sm">
              ✓ LinkedIn Attached
            </span>
          ) : (
            <a href="/api/auth/linkedin" className="text-sm font-bold text-white bg-[#0077b5] hover:bg-[#005582] px-5 py-2 rounded-md shadow-sm transition-transform hover:scale-105">
              Connect LinkedIn Account
            </a>
          )}
          <UserButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Client Intelligence Context</CardTitle>
            <CardDescription>Raw data gathered during onboarding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold text-gray-500 block mb-1">Niche:</span>
              <p className="bg-gray-100 p-2 rounded">{user.questionnaire.niche}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500 block mb-1">Audience:</span>
              <p className="bg-gray-100 p-2 rounded">{user.questionnaire.targetAudience}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500 block mb-1">Content Pillars:</span>
              <p className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{user.questionnaire.interests}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500 block mb-1">Goals:</span>
              <p className="bg-gray-100 p-2 rounded">{user.questionnaire.goals}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>AI Voice Mother Doc</CardTitle>
            <CardDescription>Your Groq-synthesized custom profile</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            {user.motherDoc ? (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-500 block mb-1">AI Tone of Voice:</span>
                  <p className="bg-gray-100 p-2 rounded text-sm text-gray-800">{user.motherDoc.toneOfVoice}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block mb-1">Your Specific Content Pillars:</span>
                  <p className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-sm text-gray-800">{user.motherDoc.contentPillars}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block mb-1">Baseline Emulation Accounts:</span>
                  <p className="bg-gray-100 p-2 rounded text-sm text-gray-800">{user.motherDoc.baselineAccounts}</p>
                </div>
              </div>
            ) : (
              <form action={generateMotherDoc} className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md bg-gray-50 h-full">
                <div className="text-5xl mb-4">🧠</div>
                <p className="mb-6 text-gray-600 text-lg font-medium">The AI hasn't initialized your profile yet.</p>
                <Button type="submit" size="lg" className="w-full max-w-xs font-bold text-md shadow-lg hover:scale-[1.02] transition-transform bg-indigo-600 hover:bg-indigo-700">
                  Synthesize Voice with Groq
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 flex items-center">
          <span className="mr-3">🗓️</span> Content Generation Engine
        </h2>

        {user.motherDoc ? (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="w-full mb-2">
                <h3 className="font-semibold text-gray-700">Generate New Drafts using Groq AI</h3>
                <p className="text-sm text-gray-500">The AI will use your Mother Doc tone and pillars to automatically construct high-converting posts scheduled to your calendar.</p>
              </div>
              <form action={generateContentPost.bind(null, "LinkedIn")}>
                <Button type="submit" className="bg-[#0077b5] hover:bg-[#005582] text-white font-bold shadow-md transition-transform hover:scale-105">
                  Generate LinkedIn Sequence
                </Button>
              </form>
              <form action={generateContentPost.bind(null, "Substack")}>
                <Button type="submit" className="bg-[#ff6719] hover:bg-[#cc5113] text-white font-bold shadow-md transition-transform hover:scale-105">
                  Generate Substack Newsletter
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.generatedPosts.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 italic text-lg">Your content calendar is currently empty.</p>
                  <p className="text-gray-400 text-sm mt-2">Click one of the platform buttons above to synthesize your very first post!</p>
                </div>
              ) : (
                user.generatedPosts.map((post) => (
                  <Card key={post.id} className={`shadow-md hover:shadow-lg transition-shadow border-t-4 ${post.platform === "LinkedIn" ? "border-t-[#0077b5]" : "border-t-[#ff6719]"}`}>
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-extrabold text-sm ${post.platform === "LinkedIn" ? "text-[#0077b5]" : "text-[#ff6719]"}`}>{post.platform} Post</span>
                        <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm">{post.status}</span>
                      </div>
                      <CardDescription className="flex items-center mt-2">
                        <PostDatePicker postId={post.id} defaultDate={post.scheduledDate.toISOString()} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col justify-between h-[250px]">
                      <div className="overflow-y-auto pr-2">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t flex flex-col gap-3 shrink-0 w-full">
                        {post.status === "APPROVED" && post.platform === "LinkedIn" && (
                          <form className="w-full" action={async () => {
                            "use server";
                            const { publishToLinkedIn } = await import("@/app/actions/linkedinPublish");
                            await publishToLinkedIn(post.id);
                          }}>
                            <Button type="submit" className="w-full bg-[#0077b5] text-white font-extrabold animate-pulse hover:bg-[#005582] shadow-md border-0 py-5 text-lg">
                              Publish to LinkedIn Target Now 🚀
                            </Button>
                          </form>
                        )}
                        {(post.status !== "PUBLISHED" && post.status !== "APPROVED") && (
                          <PostFeedbackActions postId={post.id} status={post.status} />
                        )}
                        {post.status === "PUBLISHED" && (
                          <div className="w-full text-center py-2 bg-green-50 border border-green-200 rounded-md">
                            <span className="font-extrabold text-green-700">✓ Live on LinkedIn</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-600 font-medium text-lg">⚠️ The AI cannot generate content yet.</p>
            <p className="text-gray-500 mt-2">Please synthesize your custom Mother Doc Voice Profile above before utilizing the content generation engine.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <FileUploadWidget />
      </div>
    </div>
  );
}
