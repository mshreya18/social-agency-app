import { submitQuestionnaire } from "@/app/actions/questionnaire";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-black">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Social AI</CardTitle>
          <CardDescription className="text-base">
            Let's get to know you better. We'll use this information to build your custom "Mother Doc" and generate highly personalized content in your exact tone of voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitQuestionnaire} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="niche" className="font-semibold text-gray-700">What is your niche or industry?</Label>
              <Input id="niche" name="niche" placeholder="e.g., B2B SaaS, Tech Leadership, Real Estate..." className="bg-white" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="font-semibold text-gray-700">Who is your target audience?</Label>
              <Input id="targetAudience" name="targetAudience" placeholder="e.g., Founders, Engineers, Marketing Managers..." className="bg-white" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests" className="font-semibold text-gray-700">What are your 10 content pillars or interests?</Label>
              <Textarea 
                id="interests" 
                name="interests" 
                placeholder="List your specific interests (e.g., History, Startups, Bangalore, Literature, Animals)" 
                className="bg-white"
                rows={4}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals" className="font-semibold text-gray-700">Where do you want to be positioned?</Label>
              <Textarea 
                id="goals" 
                name="goals" 
                placeholder="e.g., I want to be known as the top technical marketing voice for seed-stage startups." 
                className="bg-white"
                rows={3}
                required 
              />
            </div>

            <Button type="submit" className="w-full text-lg py-6 font-bold shadow-md hover:scale-[1.01] transition-transform">
              Save & Generate My Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
