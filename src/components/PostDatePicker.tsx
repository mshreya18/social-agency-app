"use client";

import { updatePostDate } from "@/app/actions/postFeedback";
import { useState } from "react";

export function PostDatePicker({ postId, defaultDate }: { postId: string, defaultDate: string }) {
  const [date, setDate] = useState(new Date(defaultDate).toISOString().split('T')[0]);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value;
    if (!newDate) return;
    
    setDate(newDate);
    setIsUpdating(true);
    await updatePostDate(postId, newDate);
    setIsUpdating(false);
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
      <label htmlFor={`date-${postId}`} className="text-gray-600 cursor-pointer text-sm">📅 Target:</label>
      <input 
        id={`date-${postId}`}
        type="date" 
        value={date}
        onChange={handleDateChange}
        disabled={isUpdating}
        className="text-sm font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
      />
      {isUpdating && <span className="text-xs text-indigo-500 animate-pulse">saving...</span>}
    </div>
  );
}
