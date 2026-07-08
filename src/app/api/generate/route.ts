import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { title, date, chair, secretary, rawNotes } = await request.json();

    if (!rawNotes) {
      return NextResponse.json(
        { error: 'Raw notes are required' },
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

    // Construct the prompt combining metadata and raw notes
    const prompt = `
Please generate formal Minutes of the Meeting (MoM) using the following metadata and raw notes.

METADATA:
- Meeting Title: ${title || 'Not Specified'}
- Date & Time: ${date || 'Not Specified'}
- Chairperson: ${chair || 'Not Specified'}
- Secretary/Notes Taker: ${secretary || 'Not Specified'}

RAW MEETING NOTES:
${rawNotes}
`.trim();

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert Executive Secretary. Transform unorganized notes into a formal MINUTES OF THE MEETING. Use these sections: I. CALL TO ORDER, II. ROLL CALL, III. AGENDA, IV. DISCUSSION AND PROCEEDINGS, V. OMNIBUS MOTIONS, VI. ADJOURNMENT, and a Sign-off block. Maintain a highly professional, formal, and objective corporate/institutional tone. If any metadata field is provided, make sure it is integrated into the appropriate sections or header. Ensure all the sections are clearly delineated by their roman numeral headers.`,
        temperature: 0.2,
      },
    });

    const generatedText = response.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: 'Failed to generate meeting minutes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ minutes: generatedText });
  } catch (error: any) {
    console.error('Error generating Minutes of Meeting:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during generation' },
      { status: 500 }
    );
  }
}
