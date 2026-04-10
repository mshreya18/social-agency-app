import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { questionnaire: true }
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
            <CardTitle>Your Mother Doc Profile</CardTitle>
            <CardDescription>Generated from your onboarding insights</CardDescription>
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
            <CardTitle>Monthly Calendar</CardTitle>
            <CardDescription>Your AI-generated social posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-100/50">
              <div className="text-center">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-500 font-medium">Calendar AI integration coming soon in Phase 4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
