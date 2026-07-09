import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { scriptUrl, title, html } = await request.json();

    if (!scriptUrl) {
      return NextResponse.json(
        { error: 'scriptUrl parameter is required' },
        { status: 400 }
      );
    }

    console.log("Proxying request to Google Apps Script:", scriptUrl);

    // Call Google Apps Script from server-side to bypass browser CORS block
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Prevents Apps Script CORS issues
      },
      body: JSON.stringify({
        title: title || 'Minutes of the Meeting',
        html: html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Google Apps Script returned status ${response.status}: ${errText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GDocs proxy:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during server proxy request' },
      { status: 500 }
    );
  }
}
