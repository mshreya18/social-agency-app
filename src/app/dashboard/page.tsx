import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { FileUploadWidget } from "@/components/FileUploadWidget";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateMotherDoc } from "@/app/actions/motherDoc";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { questionnaire: true, motherDoc: true }
  });

  if (!user || !user.questionnaire) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Social Agency Dashboard</h1>
        <UserButton />
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

      <div className="mt-8">
        <FileUploadWidget />
      </div>
    </div>
  );
}
