import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: "Missing filePath" }, { status: 400 });
    }

    // 1. Download file directly from the Supabase Storage bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("knowledge-base")
      .download(filePath);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Failed to download assigned file from Supabase layer" }, { status: 500 });
    }

    // 2. Convert Blob to File natively for the OpenAI library
    const fileExt = filePath.split(".").pop() || "mp3";
    const fileForOpenAI = new File([fileData], `audio.${fileExt}`, { type: fileData.type });

    // 3. Pipe it through the Groq LPU Whisper Transcriber model
    const transcription = await openai.audio.transcriptions.create({
      file: fileForOpenAI,
      model: "whisper-large-v3", // Groq's optimized Whisper model
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("Transcription execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
