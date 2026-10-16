import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { audioData, mimeType } = await request.json();

    if (!audioData) {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server' },
        { status: 500 }
      );
    }

    // Initialize Google Gen AI client
    const ai = new GoogleGenAI({ apiKey });

    // Call Gemini API to transcribe audio
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: "Please transcribe this audio recording completely and accurately. Output only the transcript without any extra commentary." },
        { inlineData: { mimeType: mimeType || 'audio/mp3', data: audioData } }
      ],
      config: {
        temperature: 0.1,
      },
    });

    const transcript = response.text;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during transcription' },
      { status: 500 }
    );
  }
}
