"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FileUploadWidget() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [transcription, setTranscription] = useState("");

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      setMessage("");
      
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `knowledge/${fileName}`; // Save in a 'knowledge' folder

      const { error: uploadError } = await supabase.storage
        .from('knowledge-base') // Supabase Bucket Name (needs to be created in Dashboard)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      setMessage("File uploaded! Sending to Whisper AI for transcription...");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath })
      });

      const transcribeData = await transcribeRes.json();

      if (!transcribeRes.ok) {
        throw new Error(transcribeData.error || "Transcription pipeline failed");
      }

      setMessage("Success: File uploaded and accurately transcribed!");
      setTranscription(transcribeData.text);
    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
      <h3 className="font-bold text-xl">Upload Knowledge Base</h3>
      <p className="text-sm text-gray-600">
        Upload call recordings, documents, or articles to expand your custom AI profile context.
      </p>
      
      <div className="space-y-2 max-w-sm">
        <Label htmlFor="file-upload" className="font-semibold text-gray-700">Select File</Label>
        <Input 
          id="file-upload" 
          type="file" 
          onChange={handleFileUpload} 
          disabled={uploading}
          className="bg-white cursor-pointer"
        />
      </div>
      
      {uploading && <p className="text-sm font-medium text-amber-600 animate-pulse">Uploading file to Supabase...</p>}
      {message && (
        <p className={`text-sm font-bold ${message.includes("failed") ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}

      {transcription && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <h4 className="font-bold text-sm mb-2 text-gray-800 flex items-center">
            <span className="mr-2">⚡</span> Groq Whisper Transcription:
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{transcription}</p>
        </div>
      )}
    </div>
  );
}
