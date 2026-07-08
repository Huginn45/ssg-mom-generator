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

1. Title Block (Uppercase, centered):
   MINUTES OF THE [NUMBER] REGULAR/SPECIAL MEETING OF THE [ORGANIZATION/BOARD] ON [DAY OF WEEK], [DATE]
   (Infer this title from metadata, e.g. "MINUTES OF THE 1st REGULAR MEETING OF THE SUPREME STUDENT GOVERNMENT (SSG) ON SUNDAY, JULY 6, 2025")

2. Section I. CALL TO ORDER:
   Detail the presiding officer, time, and venue, e.g.:
   "The meeting was called to order by [Chairperson Name], presiding officer at exactly [Time] at [Venue]."

3. Section II. INVOCATION:
   State the person who led the opening prayer (e.g. "led by [Name], [Role]") if mentioned. If no prayer or invocation is mentioned in the raw notes, write "None conducted." or "No invocation was held." Do NOT omit this section or skip the Roman numeral II.

4. Section III. ROLL CALL AND DECLARATION OF A QUORUM:
   State the roll summary (e.g. "The roll was called; [Number] were present and [Number] were absent.")
   Output the list of attendees in two distinct sections under bold headings:
   PRESENT:
   [Role] - [Name] (format names as "Lastname, Firstname MiddleInitial." if details permit, otherwise "Role - Name")
   ABSENT:
   [Role] - [Name]
   Use clear dashes and spacing (e.g., "President - Baclayon, Kathlyn L.") to format the attendees, making it clean. Do NOT skip this Roman numeral III.

5. Section IV. AGENDA:
   List the agenda topics using uppercase alphabetical lists:
   A. Topic 1
   B. Topic 2

   Followed immediately by the DISCUSSION AND PROCEEDINGS:
   For each agenda item, write its title as a bold heading (e.g. "**Concept for Days of Welcome**").
   Under each heading, divide the content into:
   - **Discussion**: Detail the suggestions, remarks, and tally of votes (if any) in detail.
   - **Decision**: State what was decided, merged, or resolved.
   - At the end of each discussion, state who moved to proceed or approve, and who seconded:
     "After the discussion, [Name] moved to proceed to the next agenda item. The motion was seconded by [Name]."
     Or:
     "A motion to approve the proposed [action] was formally raised by [Name], and was duly seconded by [Name]. With no objections, the motion was carried."

6. Section V. ADJOURNMENT:
   Describe who moved and seconded the adjournment and at what time, e.g.:
   "The meeting was adjourned by [Name], [Role], seconded by [Name], [Role] at [Time]." Do NOT skip this Roman numeral V.

7. Sign-off / Certification Block:
   Write the formal certification text:
   "I hereby certify to the correctness of the foregoing minutes of the [Meeting Title] of [Organization Name]."
   Add the following signature lines:
   [Secretary Name]
   Executive Secretary, [Organization Name]
   
   Attested By:
   [Chairperson Name]
   President, [Organization Name]

Keep the tone formal, objective, and highly corporate/institutional. Integrate all user-provided metadata (Title, Date, Chair, Secretary) into this layout. All Roman numeral headers must be written in bold markdown (e.g., "**I. CALL TO ORDER**", "**II. INVOCATION**", "**III. ROLL CALL AND DECLARATION OF A QUORUM**", "**IV. AGENDA**", "**V. ADJOURNMENT**").`,
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
