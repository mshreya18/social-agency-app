"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approvePost, rewritePostWithFeedback } from "@/app/actions/postFeedback";

export function PostFeedbackActions({ postId, status }: { postId: string, status: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [processing, setProcessing] = useState(false);

  // If already approved, lock the state
  if (status === "APPROVED") {
    return <p className="text-green-700 font-bold text-sm">✅ Officially Approved for Publishing</p>;
  }

  async function handleApprove() {
    setProcessing(true);
    await approvePost(postId);
    setProcessing(false);
  }

  async function handleRewrite() {
    if (!feedback.trim()) {
      setIsEditing(false);
      return;
    }

    setProcessing(true);
    await rewritePostWithFeedback(postId, feedback);
    setProcessing(false);
    setIsEditing(false);
    setFeedback("");
  }

  return (
    <div className="flex flex-col w-full gap-2">
      {isEditing ? (
        <div className="flex gap-2 w-full items-center">
          <Input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell the AI what to change..."
            className="h-8 text-sm flex-grow"
            disabled={processing}
          />
          <Button size="sm" onClick={handleRewrite} disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 shrink-0 font-bold">
            {processing ? "Rewriting..." : "✨ AI Rewrite"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={processing}>Cancel</Button>
        </div>
      ) : (
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" size="sm" className="font-semibold border-gray-300" onClick={() => setIsEditing(true)}>
            Request Edit
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold shadow-sm" onClick={handleApprove} disabled={processing}>
            {processing ? "..." : " Approve Target"}
          </Button>
        </div>
      )}
    </div>
  );
}
