import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Prevent directory traversal attacks
    const sanitizedFileName = path.basename(fileName);
    if (!sanitizedFileName.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only .docx files are supported' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'sample_docs', sanitizedFileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Sample file not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Parse docx file using mammoth
    const result = await mammoth.extractRawText({ buffer: fileBuffer });

    // Infer some metadata if possible from the filename
    let inferredTitle = '';
    if (sanitizedFileName.includes('1st EARLY REGULAR MEETING')) {
      inferredTitle = '1st Early Regular Meeting';
    } else if (sanitizedFileName.includes('SSG-Meeting-Minutes')) {
      inferredTitle = 'SSG Meeting';
    } else {
      inferredTitle = sanitizedFileName.replace('.docx', '');
    }

    return NextResponse.json({
      text: result.value,
      title: inferredTitle,
      messages: result.messages
    });
  } catch (error: any) {
    console.error('Error loading sample doc:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse sample file' },
      { status: 500 }
    );
  }
}
