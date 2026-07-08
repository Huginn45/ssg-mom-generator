import { NextResponse } from 'next/server';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  WidthType, 
  BorderStyle 
} from 'docx';

export async function POST(request: Request) {
  try {
    const { minutes, title, date, chair, secretary } = await request.json();

    if (!minutes) {
      return NextResponse.json(
        { error: 'Minutes content is required' },
        { status: 400 }
      );
    }

    const lines = minutes.split('\n');
    const docChildren: any[] = [];
    let inRollCall = false;
    let inDiscussion = false;
    
    // Accumulator for Roll Call tables to render them contiguously
    let rollCallSectionName = ''; // PRESENT, EXCUSED, ABSENT
    let rollCallRows: TableRow[] = [];

    // Helper to flush roll call table to children
    const flushRollCallTable = () => {
      if (rollCallRows.length > 0) {
        // Add Section Header (PRESENT:, EXCUSED:, ABSENT:)
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: rollCallSectionName,
                bold: true,
                font: 'Arial',
                size: 19, // ~9.5pt
              }),
            ],
          })
        );

        // Add Invisible Grid Table
        docChildren.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            },
            rows: rollCallRows,
          })
        );

        rollCallRows = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLineText = lines[i];
      let lineText = rawLineText.trim();

      if (lineText === '') {
        // Skip consecutive blanks or add a blank spacing
        continue;
      }

      // Check bold state in source markdown
      const isOriginalBold = (lineText.startsWith('**') && lineText.endsWith('**')) ||
                             (lineText.startsWith('__') && lineText.endsWith('__'));

      // Remove raw markdown asterisks and underscores
      let cleanLine = lineText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();

      // Clean non-ASCII unicode punctuation to keep Word compatible
      cleanLine = cleanLine
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\u2022]/g, '-')
        .replace(/[\u2026]/g, '...');

      // Manage section states
      const lowerClean = cleanLine.toLowerCase();
      if (lowerClean.includes('i. call to order')) {
        flushRollCallTable();
        inRollCall = false;
        inDiscussion = false;
      } else if (lowerClean.includes('iii. roll call') || lowerClean.includes('attendance')) {
        inRollCall = true;
        inDiscussion = false;
      } else if (lowerClean.includes('v. discussion')) {
        flushRollCallTable();
        inDiscussion = true;
        inRollCall = false;
      } else if (lowerClean.includes('vi. adjournment') || lowerClean.includes('sign-off') || lowerClean.includes('certify')) {
        flushRollCallTable();
        inDiscussion = false;
        inRollCall = false;
      }

      // 1. Heading 1 (# ) -> Left aligned, uppercase, bold, 11pt (size 22)
      if (lineText.startsWith('# ') || (i === 0 && !lineText.startsWith('#') && cleanLine.toUpperCase() === cleanLine)) {
        const titleContent = lineText.startsWith('# ') ? lineText.replace('# ', '').trim() : cleanLine;
        docChildren.push(
          new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: titleContent.toUpperCase(),
                bold: true,
                font: 'Arial',
                size: 22, // 11pt
              }),
            ],
          })
        );
        continue;
      }

      // 2. Heading 2 (## I. CALL TO ORDER, etc.)
      const isHeading2 = lineText.startsWith('## ') || 
                         /^(I|II|III|IV|V|VI)\.\s+[A-Z\s]+/.test(cleanLine);
      
      if (isHeading2) {
        flushRollCallTable();
        let headingText = cleanLine;
        if (lineText.startsWith('## ')) {
          headingText = cleanLine.replace(/^##\s+/, '').trim();
        }
        docChildren.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: headingText.toUpperCase(),
                bold: true,
                font: 'Arial',
                size: 21, // 10.5pt
              }),
            ],
          })
        );
        continue;
      }

      // 3. Subheading (### or bold numbered topics like "1. Schedule")
      const isSubHeading = lineText.startsWith('### ') || 
                           (/^\d+\.\s+/.test(cleanLine) && isOriginalBold) ||
                           (/^\d+\.\s+/.test(cleanLine) && inDiscussion);
      
      if (isSubHeading) {
        let headingText = cleanLine;
        if (lineText.startsWith('### ')) {
          headingText = cleanLine.replace(/^###\s+/, '').trim();
        }
        docChildren.push(
          new Paragraph({
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: headingText,
                bold: true,
                font: 'Arial',
                size: 20, // 10pt
              }),
            ],
          })
        );
        continue;
      }

      // 4. Roll Call Section Headers (PRESENT:, EXCUSED:, ABSENT:)
      if (inRollCall && (cleanLine === 'PRESENT:' || cleanLine === 'EXCUSED:' || cleanLine === 'ABSENT:')) {
        flushRollCallTable(); // flush previous table
        rollCallSectionName = cleanLine;
        continue;
      }

      // 5. Roll Call Attendees (Designation - Name) formatted in columns using tables
      if (inRollCall && (cleanLine.includes(' - ') || cleanLine.includes(' – '))) {
        const divider = cleanLine.includes(' - ') ? ' - ' : ' – ';
        const parts = cleanLine.split(divider);
        if (parts.length >= 2) {
          const designation = parts[0].trim();
          const name = parts[1].trim();

          rollCallRows.push(
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 3500, type: WidthType.DXA },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 20, after: 20 },
                      children: [
                        new TextRun({
                          text: designation,
                          font: 'Arial',
                          size: 19,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 400, type: WidthType.DXA },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 20, after: 20 },
                      children: [
                        new TextRun({
                          text: '-',
                          font: 'Arial',
                          size: 19,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 6180, type: WidthType.DXA },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  },
                  children: [
                    new Paragraph({
                      spacing: { before: 20, after: 20 },
                      children: [
                        new TextRun({
                          text: name,
                          font: 'Arial',
                          size: 19,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          );
          continue;
        }
      }

      // 6. Sign-off certification block
      if (cleanLine.toLowerCase().includes('i hereby certify')) {
        flushRollCallTable();

        // Certification paragraph
        docChildren.push(
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: cleanLine,
                italics: true,
                font: 'Arial',
                size: 19,
              }),
            ],
          })
        );

        // Signatures Side-by-Side Table
        const secName = secretary || 'JANQUEL B. GEAGONIA';
        const chairName = chair || 'KATHLYN BACLAYON';

        docChildren.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 4500, type: WidthType.DXA },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: '7A7A7A' }, // Sig line
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 100 },
                        children: [
                          new TextRun({
                            text: secName.toUpperCase(),
                            bold: true,
                            font: 'Arial',
                            size: 18, // 9pt
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Prepared by: Executive Secretary',
                            font: 'Arial',
                            size: 16, // 8pt
                            color: '6E6E6E',
                          }),
                        ],
                      }),
                    ],
                  }),
                  // Invisible Spacer cell
                  new TableCell({
                    width: { size: 1080, type: WidthType.DXA },
                    children: [new Paragraph({})],
                  }),
                  new TableCell({
                    width: { size: 4500, type: WidthType.DXA },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: '7A7A7A' }, // Sig line
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 100 },
                        children: [
                          new TextRun({
                            text: chairName.toUpperCase(),
                            bold: true,
                            font: 'Arial',
                            size: 18, // 9pt
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Attested By: President / Chairperson',
                            font: 'Arial',
                            size: 16, // 8pt
                            color: '6E6E6E',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );

        break; // End of file parsed
      }

      // 7. Standard list items (bullets and nested bullets)
      const rawLeading = rawLineText.match(/^\s*/)?.[0] || '';
      const isIndented = rawLeading.length > 0 || rawLineText.startsWith('\t');
      
      let isListItem = false;
      let cleanedItemText = cleanLine;

      if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ') || cleanLine.startsWith('• ')) {
        cleanedItemText = cleanLine.replace(/^([\-\*•]\s+)/, '').trim();
        isListItem = true;
      } else if (cleanLine.startsWith('o ')) {
        cleanedItemText = cleanLine.replace(/^(o\s+)/, '').trim();
        isListItem = true;
      } else if (/^\d+\.\s+/.test(cleanLine)) {
        const match = cleanLine.match(/^(\d+\.\s+)/);
        if (match) {
          cleanedItemText = cleanLine.substring(match[0].length).trim();
          isListItem = true;
        }
      }

      if (isListItem) {
        flushRollCallTable();
        
        let bulletText = '•  ';
        let indentTwips = 240; // Indent of 0.16 inches
        
        if (isIndented) {
          indentTwips = 480; // Indent of 0.33 inches
          if (inDiscussion) {
            bulletText = 'o  '; // Open circle
          } else {
            bulletText = '-  '; // Dash
          }
        } else {
          const rawTrim = lines[i].trim();
          if (!rawTrim.startsWith('- ') && !rawTrim.startsWith('* ') && !rawTrim.startsWith('• ')) {
            const matchNumber = rawTrim.match(/^(\d+\.)/);
            if (matchNumber) {
              bulletText = `${matchNumber[0]}  `;
              indentTwips = 300;
            }
          }
        }

        docChildren.push(
          new Paragraph({
            indent: { left: indentTwips },
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: bulletText,
                bold: true,
                font: 'Arial',
                size: 19,
              }),
              new TextRun({
                text: cleanedItemText,
                font: 'Arial',
                size: 19,
              }),
            ],
          })
        );
      } else {
        // Standard paragraph
        flushRollCallTable();
        docChildren.push(
          new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({
                text: cleanLine,
                bold: isOriginalBold,
                font: 'Arial',
                size: 19, // ~9.5pt
              }),
            ],
          })
        );
      }
    }

    // Safeguard flush
    flushRollCallTable();

    // Create the final Document with 0.75 inch margins
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1080,    // 0.75 inch = 1080 twips
                bottom: 1080,
                left: 1080,
                right: 1080,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Return the .docx file as an attachment response
    const fileTitle = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'meeting';
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${fileTitle}_minutes.docx`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting DOCX:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during docx export' },
      { status: 500 }
    );
  }
}
