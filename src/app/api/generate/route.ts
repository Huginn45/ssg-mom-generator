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
   MINUTES OF THE [NUMBER] REGULAR/SPECIAL MEETING OF THE [ORGANIZATION/BOARD] ON [DAY OF WEEK], [DATE]
   (Infer this title from metadata, e.g. "MINUTES OF THE 1st EARLY-REGULAR AND ON-BOARDING MEETING OF THE SUPREME STUDENT GOVERNMENT (SSG) ON THURSDAY, JANUARY 08, 2026")

2. Section I. CALL TO ORDER:
   Detail the presiding officer, time, and venue, e.g.:
   "The meeting was called to order by [Chairperson Name], presiding officer at exactly [Time] at [Venue]."

3. Section II. INVOCATION:
   State the person who led the opening prayer (e.g. "led by [Name], [Role]") if mentioned. If no prayer or invocation is mentioned in the raw notes, write "None conducted." or "No invocation was held." Do NOT omit this section or skip the Roman numeral II.

4. Section III. ROLL CALL AND DECLARATION OF A QUORUM:
   State the roll summary (e.g. "The roll was called; [Number] were present, [Number] were excused, and [Number] were absent.")
   Output the list of attendees divided into three sections under bold headings:
   PRESENT:
   [Role] - [Name] (format names as "Lastname, Firstname MiddleInitial." if details permit, otherwise "Role - Name")
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
   For the detailed discussion of agenda topics, organize them using numbered items matching the agenda:
   **1. [Agenda Item Title]** (e.g., "**1. Schedule and Venue Considerations**")
   Under each topic, provide the discussion paragraphs detailing suggestions, voting tallies, or reports.
   - For primary bullet items, use solid circular bullets: "• [Item text]"
   - For sub-bullet items, use open circle bullets: "o [Nested item text]" (indented under the primary bullet).
   Include motion and approval statements where applicable:
   "A motion to approve [action] was raised by [Name] and seconded by [Name]. The body approved the motion..."
   Do NOT skip this Roman numeral V.

7. Section VI. ADJOURNMENT:
   Describe who moved and seconded the adjournment and at what time, e.g.:
   "The meeting was adjourned by [Name], [Role], seconded by [Name], [Role] at [Time]." Do NOT skip this Roman numeral VI.

8. Sign-off / Certification Block:
   Write the formal certification text:
   "I hereby certify to the correctness of the foregoing minutes of the [Meeting Title] of [Organization Name]."
   Add the following signature lines:
   [Secretary Name]
   Executive Secretary, [Organization Name]
   
   Attested By:
   [Chairperson Name]
   President, [Organization Name]

Keep the tone formal, objective, and highly corporate/institutional. Integrate all user-provided metadata (Title, Date, Chair, Secretary) into this layout. All Roman numeral headers must be written in bold markdown (e.g., "**I. CALL TO ORDER**", "**II. INVOCATION**", "**III. ROLL CALL AND DECLARATION OF A QUORUM**", "**IV. AGENDA**", "**V. DISCUSSION**", "**VI. ADJOURNMENT**").`,
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
