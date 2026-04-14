"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateMotherDoc } from "@/app/actions/updateMotherDoc";

interface MotherDocEditorProps {
  motherDoc: {
    toneOfVoice: string;
    contentPillars: string;
    baselineAccounts: string;
    adminNotes: string | null;
  };
}

export function MotherDocEditor({ motherDoc }: MotherDocEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    await updateMotherDoc(formData);
    setSaving(false);
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <span className="font-semibold text-gray-500 block mb-1">AI Tone of Voice:</span>
          <p className="bg-gray-100 p-2 rounded text-sm text-gray-800">{motherDoc.toneOfVoice}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-500 block mb-1">Your Specific Content Pillars:</span>
          <p className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-sm text-gray-800">{motherDoc.contentPillars}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-500 block mb-1">Baseline Emulation Accounts:</span>
          <p className="bg-gray-100 p-2 rounded text-sm text-gray-800">{motherDoc.baselineAccounts}</p>
        </div>
        {motherDoc.adminNotes && (
          <div>
            <span className="font-semibold text-indigo-600 block mb-1">Notes & Extra Context:</span>
            <p className="whitespace-pre-wrap bg-indigo-50 border border-indigo-200 p-2 rounded text-sm text-gray-800">{motherDoc.adminNotes}</p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 font-semibold border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          onClick={() => setIsEditing(true)}
        >
          Edit Mother Doc
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="font-semibold text-gray-500 block mb-1 text-sm">Tone of Voice</label>
        <textarea
          name="toneOfVoice"
          defaultValue={motherDoc.toneOfVoice}
          rows={3}
          className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
        />
      </div>
      <div>
        <label className="font-semibold text-gray-500 block mb-1 text-sm">Content Pillars</label>
        <textarea
          name="contentPillars"
          defaultValue={motherDoc.contentPillars}
          rows={5}
          className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
        />
      </div>
      <div>
        <label className="font-semibold text-gray-500 block mb-1 text-sm">Baseline Emulation Accounts</label>
        <textarea
          name="baselineAccounts"
          defaultValue={motherDoc.baselineAccounts}
          rows={2}
          className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
        />
      </div>
      <div>
        <label className="font-semibold text-indigo-600 block mb-1 text-sm">
          Notes & Extra Questions
          <span className="text-gray-400 font-normal ml-2">(Only visible to agency. Add follow-up Q&A, context, or extra instructions here.)</span>
        </label>
        <textarea
          name="adminNotes"
          defaultValue={motherDoc.adminNotes ?? ""}
          rows={4}
          placeholder="e.g. Client mentioned they want to avoid topics around X. Upcoming campaign: Y. Follow-up: ask about their biggest pain point..."
          className="w-full text-sm p-2 border border-indigo-300 bg-indigo-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(false)}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
