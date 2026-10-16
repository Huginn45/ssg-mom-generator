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
        systemInstruction: `You are an expert Executive Secretary. Transform unorganized meeting notes into formal MINUTES OF THE MEETING matching the following strict structural layout and style guidelines:

1. Title Block (Uppercase):
    MINUTES OF THE [NUMBER] LEGISLATIVE MEETING OF THE SUPREME STUDENT GOVERNMENT (SSG) ON [DAY OF WEEK], [DATE]
    (Infer this title from metadata, e.g. "MINUTES OF THE 1st LEGISLATIVE MEETING OF THE SUPREME STUDENT GOVERNMENT (SSG) ON SATURDAY, AUGUST 22, 2026")

2. Section I. CALL TO ORDER:
    Detail the presiding officer, time, and venue, e.g.:
    "The meeting was called to order by Hon. [Chairperson Name], presiding officer at exactly [Time] at [Venue]."

3. Section II. INVOCATION:
    State: "The opening prayer was led by Hon. [Name], [Role]." If no prayer or invocation is mentioned in the raw notes, write "None conducted." or "No invocation was held." Do NOT omit this section or skip the Roman numeral II.

4. Section III. ROLL CALL AND DECLARATION OF A QUORUM:
    State the roll summary exactly as: "The roll was called; [Number] were present, [Number] were excused, and [Number] were absent. A quorum was declared."
    Output the list of attendees divided into sections under bold headings (PRESENT:, LATE:, EXCUSED:, ABSENT:):
    PRESENT:
    [Role] - [Name] (format names as "Lastname, Firstname MiddleInitial." if details permit, otherwise "Role - Name")
    LATE:
    [Role] - [Name]
    EXCUSED:
    [Role] - [Name]
    ABSENT:
    [Role] - [Name]
    Use clear dashes and spacing (e.g., "President - Baclayon, Kathlyn L.") to format the attendees. Do NOT skip this Roman numeral III.

5. Section IV. AGENDA:
    List the agenda topics using uppercase alphabetical lists:
    A. Topic 1
    B. Topic 2
       - Sub-topic 1 (use indented hyphens for nested items under a main topic if details exist)
    Do NOT skip this Roman numeral IV.

6. Section V. DISCUSSION:
    - The very first paragraph under Section V must state: "A motion to approve the agenda was raised by Hon. [Name] and seconded by Hon. [Name]. The body approved the motion."
    - Organize topics using subheadings matching the agenda: "### A. [Topic Title]" (e.g., "### A. Legislative Update - Resolutions"). Note the "###" header style.
    - Write the detailed discussion, deliberations, reports, and suggestions as standard, narrative text paragraphs (not bullet points) to form a natural, professional flow.
    - Use bullet points (e.g. circular bullets "•" and nested bullet items "o") ONLY when presenting lists of items (such as lists of materials, financial figures, or action steps), specific items, or nested items.
    - Format approval motions as separate paragraphs at the end of each topic: "A motion to approve [Resolution/Action] was raised by Hon. [Name] and seconded by Hon. [Name]. The body approved the motion."
    - Do NOT skip this Roman numeral V.

7. Section VI. CLOSING PRAYER:
    State: "The closing prayer was led by Hon. [Name], [Role]." Do NOT skip this Roman numeral VI.

8. Section VII. ADJOURNMENT:
    Describe who moved and seconded the adjournment and at what time, e.g.:
    "The meeting was adjourned by Hon. [Name], [Role], seconded by Hon. [Name], [Role] at [Time]." Do NOT skip this Roman numeral VII.

9. Sign-off / Certification Block:
    Write the formal certification text:
    "I hereby certify to the correctness of the foregoing minutes of the [Meeting Title] of [Organization Name]."
    Add the following signature lines:
    Prepared by:
    [Secretary Name]
    Executive Secretary, [Organization Name]
    
    Attested By:
    [Chairperson Name]
    President, [Organization Name]

Keep the tone formal, objective, and highly corporate/institutional. Integrate all user-provided metadata (Title, Date, Chair, Secretary) into this layout. All Roman numeral headers must be written in bold markdown (e.g., "**I. CALL TO ORDER**", "**II. INVOCATION**", "**III. ROLL CALL AND DECLARATION OF A QUORUM**", "**IV. AGENDA**", "**V. DISCUSSION**", "**VI. CLOSING PRAYER**", "**VII. ADJOURNMENT**").

Crucially, you must preserve 100% of the facts, discussions, decisions, suggestions, and details from the raw meeting notes. Do NOT summarize them away, omit, or destroy any of the topics or thoughts discussed. Only enhance the professionalism of the language, formatting, and grammar while keeping every topic fully intact.`,
        temperature: 0.15,
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
