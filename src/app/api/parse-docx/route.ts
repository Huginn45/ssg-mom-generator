import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the docx file using mammoth
    const result = await mammoth.extractRawText({ buffer });

    return NextResponse.json({
      text: result.value,
      fileName: file.name,
      size: file.size,
      messages: result.messages
    });
  } catch (error: any) {
    console.error('Error parsing docx upload:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse docx file' },
      { status: 500 }
    );
  }
}
