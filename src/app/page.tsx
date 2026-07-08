'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Calendar,
  User,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  // State variables for form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [chair, setChair] = useState('');
  const [secretary, setSecretary] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  
  // State for generated minutes and UI states
  const [minutes, setMinutes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample files metadata
  const sampleFiles = [
    {
      displayName: "Board Meeting Notes",
      fileName: "To be edited (1).docx",
      description: "Short, bulleted board meeting minutes ready to be polished."
    },
    {
      displayName: "SSG July 6 Meeting",
      fileName: "SSG-Meeting-Minutes-July6.docx",
      description: "Comprehensive Student Council notes requiring structure."
    },
    {
      displayName: "1st Regular Meeting",
      fileName: "MINUTES OF THE 1st EARLY REGULAR MEETING ON THURSDAY, JANUARY 08, 2026..docx",
      description: "Large organization notes with detailed items and discussion."
    },
    {
      displayName: "SSG Altered Minutes",
      fileName: "SSG-Meeting-Minutes-Altered_forOrgPresidents (1).docx",
      description: "SSG meeting notes altered for organization presidents."
    },
    {
      displayName: "SSG August 19 Meeting",
      fileName: "SSG-Meeting-Minutes-August19.docx",
      description: "SSG regular meeting notes for August 19."
    },
    {
      displayName: "SSG August 22 Meeting",
      fileName: "SSG-Meeting-Minutes-August22 (1).docx",
      description: "SSG regular meeting notes for August 22."
    },
    {
      displayName: "SSG July 6 Copy",
      fileName: "SSG-Meeting-Minutes-July6 (1).docx",
      description: "Additional copy of July 6 SSG minutes for testing."
    }
  ];

  // Helper to load sample files
  const handleLoadSample = async (fileName: string) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch(`/api/load-sample?file=${encodeURIComponent(fileName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load sample file');
      }

      setRawNotes(data.text);
      if (data.title) {
        setTitle(data.title);
      }
      // Populate other fields if empty
      if (!date) setDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      if (!chair) setChair('Board President');
      if (!secretary) setSecretary('Executive Assistant');

      setUploadedFile({ name: fileName, size: 0 }); // Mark as loaded
      setSuccess(`Successfully loaded and parsed sample: "${fileName}"`);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  // Upload & parse file using /api/parse-docx
  const processFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      setError('Unsupported file type. Please upload a Microsoft Word (.docx) file.');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-docx', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setRawNotes(data.text);
      setUploadedFile({ name: data.fileName, size: data.size });
      setSuccess(`Successfully uploaded and parsed "${data.fileName}" (${Math.round(data.size / 1024)} KB)`);
      
      // Auto-set title from file name if title is empty
      if (!title) {
        const cleanName = data.fileName.replace('.docx', '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err: any) {
      setError(err.message || 'Error parsing document.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setRawNotes('');
    setSuccess('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate MoM using /api/generate
  const handleGenerateMinutes = async () => {
    if (!rawNotes.trim()) {
      setError('Please provide raw meeting notes or upload a .docx file first.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);
    setMinutes('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          date,
          chair,
          secretary,
          rawNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate Minutes of the Meeting');
      }

      setMinutes(data.minutes);
      setActiveTab('preview');
      setSuccess('Successfully generated Minutes of the Meeting!');
    } catch (err: any) {
      setError(err.message || 'Error occurred while contacting the Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Markdown to Clipboard
  const copyToClipboard = () => {
    if (!minutes) return;
    navigator.clipboard.writeText(minutes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown file
  const downloadMarkdown = () => {
    if (!minutes) return;
    const blob = new Blob([minutes], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const fileTitle = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'meeting';
    link.href = url;
    link.setAttribute('download', `${fileTitle}_minutes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct the formatted minutes to Google Docs via clipboard Rich Text and docs.new
  const directToGoogleDocs = async () => {
    if (!minutes) return;
    setError('');
    setSuccess('');
    
    try {
      // Split markdown by lines to build structured HTML styling
      const lines = minutes.split('\n');
      let html = '<div style="font-family: Arial, sans-serif; font-size: 10.5pt; color: #333333; line-height: 1.4; max-width: 6.5in; margin: 0.75in;">';
      
      let inRollCall = false;
      let inDiscussion = false;
      let rollCallSectionName = '';
      let rollCallMembers: { role: string; name: string }[] = [];

      const flushRollCall = () => {
        if (rollCallMembers.length > 0) {
          html += `<p style="font-family: Arial; font-size: 9.5pt; font-weight: bold; margin-top: 12px; margin-bottom: 4px; text-transform: uppercase;">${rollCallSectionName}</p>`;
          html += '<table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 12px;">';
          for (const m of rollCallMembers) {
            html += `<tr style="border: none;">`;
            html += `<td style="width: 40%; border: none; padding: 2px 0; font-family: Arial; font-size: 9.5pt;">${m.role}</td>`;
            html += `<td style="width: 10%; border: none; padding: 2px 0; font-family: Arial; font-size: 9.5pt; text-align: center;">-</td>`;
            html += `<td style="width: 50%; border: none; padding: 2px 0; font-family: Arial; font-size: 9.5pt;">${m.name}</td>`;
            html += `</tr>`;
          }
          html += '</table>';
          rollCallMembers = [];
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        let lineText = rawLine.trim();

        if (lineText === '') {
          html += '<p style="margin: 0; height: 10px;"></p>';
          continue;
        }

        const isOriginalBold = (lineText.startsWith('**') && lineText.endsWith('**')) ||
                               (lineText.startsWith('__') && lineText.endsWith('__'));
        
        let cleanLine = lineText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();

        // Safe ASCII conversions
        cleanLine = cleanLine
          .replace(/[\u201c\u201d]/g, '"')
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u2013\u2014]/g, '-')
          .replace(/[\u2022]/g, '-')
          .replace(/[\u2026]/g, '...');

        // Section tracking based on Roman numerals
        const lowerClean = cleanLine.toLowerCase();
        if (lowerClean.includes('i. call to order')) {
          flushRollCall();
          inRollCall = false;
          inDiscussion = false;
        } else if (lowerClean.includes('iii. roll call') || lowerClean.includes('attendance')) {
          inRollCall = true;
          inDiscussion = false;
        } else if (lowerClean.includes('v. discussion')) {
          flushRollCall();
          inDiscussion = true;
          inRollCall = false;
        } else if (lowerClean.includes('vi. adjournment') || lowerClean.includes('sign-off') || lowerClean.includes('certify')) {
          flushRollCall();
          inDiscussion = false;
          inRollCall = false;
        }

        // Heading 1 (# ) -> Left aligned uppercase bold 11pt
        if (lineText.startsWith('# ') || (i === 0 && !lineText.startsWith('#') && cleanLine.toUpperCase() === cleanLine)) {
          const titleText = lineText.startsWith('# ') ? lineText.replace('# ', '').trim() : cleanLine;
          html += `<h1 style="font-family: Arial; font-size: 11pt; font-weight: bold; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase;">${titleText}</h1>`;
          continue;
        }

        // Heading 2 (## Roman numerals) -> Uppercase bold 10.5pt
        const isHeading2 = lineText.startsWith('## ') || 
                           /^(I|II|III|IV|V|VI)\.\s+[A-Z\s]+/.test(cleanLine);
        if (isHeading2) {
          flushRollCall();
          let headingText = cleanLine;
          if (lineText.startsWith('## ')) {
            headingText = cleanLine.replace(/^##\s+/, '').trim();
          }
          html += `<h2 style="font-family: Arial; font-size: 10.5pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase;">${headingText}</h2>`;
          continue;
        }

        // Subheading (### or bold numbered topics) -> Bold 10pt
        const isSubHeading = lineText.startsWith('### ') || 
                             (/^\d+\.\s+/.test(cleanLine) && isOriginalBold) ||
                             (/^\d+\.\s+/.test(cleanLine) && inDiscussion);
        if (isSubHeading) {
          let headingText = cleanLine;
          if (lineText.startsWith('### ')) {
            headingText = cleanLine.replace(/^###\s+/, '').trim();
          }
          html += `<h3 style="font-family: Arial; font-size: 10pt; font-weight: bold; margin-top: 12px; margin-bottom: 6px;">${headingText}</h3>`;
          continue;
        }

        // Roll Call section headers
        if (inRollCall && (cleanLine === 'PRESENT:' || cleanLine === 'EXCUSED:' || cleanLine === 'ABSENT:')) {
          flushRollCall();
          rollCallSectionName = cleanLine;
          continue;
        }

        // Roll Call attendees split Designation - Name
        if (inRollCall && (cleanLine.includes(' - ') || cleanLine.includes(' – '))) {
          const divider = cleanLine.includes(' - ') ? ' - ' : ' – ';
          const parts = cleanLine.split(divider);
          if (parts.length >= 2) {
            rollCallMembers.push({
              role: parts[0].trim(),
              name: parts[1].trim(),
            });
            continue;
          }
        }

        // Sign-off / Certification
        if (cleanLine.toLowerCase().includes('i hereby certify')) {
          flushRollCall();
          html += `<p style="font-family: Arial; font-size: 9.5pt; font-style: italic; margin-top: 24px; margin-bottom: 48px; line-height: 1.4;">${cleanLine}</p>`;
          
          const secName = secretary || 'JANQUEL B. GEAGONIA';
          const chairName = chair || 'KATHLYN BACLAYON';
          
          // Signatures side-by-side table
          html += `<table style="width: 100%; border-collapse: collapse; border: none; margin-top: 20px;">`;
          html += `<tr style="border: none;">`;
          
          // Prepared by
          html += `<td style="width: 45%; border: none; border-top: 1px solid #7A7A7A; padding-top: 8px; font-family: Arial; vertical-align: top;">`;
          html += `<p style="font-size: 9pt; font-weight: bold; margin: 0; text-transform: uppercase;">${secName}</p>`;
          html += `<p style="font-size: 8pt; color: #6E6E6E; margin: 2px 0 0 0;">Prepared by: Executive Secretary</p>`;
          html += `</td>`;
          
          // Spacer
          html += `<td style="width: 10%; border: none;"></td>`;
          
          // Attested by
          html += `<td style="width: 45%; border: none; border-top: 1px solid #7A7A7A; padding-top: 8px; font-family: Arial; vertical-align: top;">`;
          html += `<p style="font-size: 9pt; font-weight: bold; margin: 0; text-transform: uppercase;">${chairName}</p>`;
          html += `<p style="font-size: 8pt; color: #6E6E6E; margin: 2px 0 0 0;">Attested By: President / Chairperson</p>`;
          html += `</td>`;
          
          html += `</tr>`;
          html += `</table>`;
          break; // Cert ends the document loop
        }

        // Standard lists and bullets
        const rawLeading = rawLine.match(/^\s*/)?.[0] || '';
        const isIndented = rawLeading.length > 0 || rawLine.startsWith('\t');
        
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
          flushRollCall();
          let bulletChar = '•';
          let indentPixels = 20;

          if (isIndented) {
            indentPixels = 40;
            if (inDiscussion) {
              bulletChar = 'o';
            } else {
              bulletChar = '-';
            }
          } else {
            const rawTrim = lines[i].trim();
            if (!rawTrim.startsWith('- ') && !rawTrim.startsWith('* ') && !rawTrim.startsWith('• ')) {
              const matchNumber = rawTrim.match(/^(\d+\.)/);
              if (matchNumber) {
                bulletChar = matchNumber[0];
                indentPixels = 25;
              }
            }
          }

          html += `<p style="font-family: Arial; font-size: 9.5pt; margin: 3px 0 3px ${indentPixels}px; padding: 0; line-height: 1.4;">`;
          html += `<span style="font-weight: bold; margin-right: 8px;">${bulletChar}</span>`;
          html += `<span>${cleanedItemText}</span>`;
          html += `</p>`;
        } else {
          // Standard text paragraph
          flushRollCall();
          const weightStyle = isOriginalBold ? 'font-weight: bold;' : '';
          html += `<p style="font-family: Arial; font-size: 9.5pt; ${weightStyle} margin-top: 6px; margin-bottom: 6px; line-height: 1.4;">${cleanLine}</p>`;
        }
      }

      flushRollCall();
      html += '</div>';

      // Write HTML format directly to the clipboard
      const blob = new Blob([html], { type: 'text/html' });
      const richText = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([richText]);

      setSuccess('Formatted minutes copied to clipboard as Rich Text! Redirecting to Google Docs...');
      
      // Open blank Google doc in a new tab
      setTimeout(() => {
        window.open('https://docs.new', '_blank');
      }, 1200);
      
    } catch (err: any) {
      setError(err.message || 'Failed to direct to Google Docs');
    }
  };

  // Download PDF using our high-fidelity text-wrapping renderer matching 1st Early Regular Meeting standard
  const downloadPDF = () => {
    if (!minutes) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const marginX = 54;
    const marginY = 54;
    const pageHeight = 792; // Letter height in pt
    const pageWidth = 612;  // Letter width in pt
    const contentWidth = pageWidth - (marginX * 2);

    let y = marginY;
    const lineHeight = 15;
    const headingHeight = 20;

    // Helper to sanitize Unicode punctuation to safe ASCII before rendering in PDF
    const cleanUnicodeToASCII = (text: string) => {
      return text
        .replace(/[\u201c\u201d]/g, '"') // Curly double quotes
        .replace(/[\u2018\u2019]/g, "'") // Curly single quotes
        .replace(/[\u2013\u2014]/g, '-') // en-dash/em-dash
        .replace(/[\u2022]/g, '-')       // Unicode bullet character
        .replace(/[\u2026]/g, '...')     // Ellipsis
        .replace(/[^\x00-\x7F]/g, '');   // Remove any other non-ASCII characters
    };

    // Set initial font
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 30, 30); // Soft professional black/dark gray

    // Split markdown by lines
    const lines = minutes.split('\n');
    let inRollCall = false;
    let inDiscussion = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLineText = lines[i];
      let lineText = rawLineText.trim();
      
      // Skip empty lines, just add vertical spacing
      if (lineText === '') {
        y += 8;
        if (y > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        continue;
      }

      // Check if original line had bolding in markdown
      const isOriginalBold = (lineText.startsWith('**') && lineText.endsWith('**')) ||
                             (lineText.startsWith('__') && lineText.endsWith('__'));

      // Completely remove all raw asterisks from the text
      let cleanLine = lineText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();

      // Manage section states based on Roman numerals
      const lowerClean = cleanLine.toLowerCase();
      if (lowerClean.includes('i. call to order')) {
        inRollCall = false;
        inDiscussion = false;
      } else if (lowerClean.includes('iii. roll call') || lowerClean.includes('attendance')) {
        inRollCall = true;
        inDiscussion = false;
      } else if (lowerClean.includes('v. discussion')) {
        inDiscussion = true;
        inRollCall = false;
      } else if (lowerClean.includes('vi. adjournment') || lowerClean.includes('sign-off') || lowerClean.includes('certify')) {
        inDiscussion = false;
        inRollCall = false;
      }

      // Check title block (first # heading) -> Left aligned, uppercase, bold, size 11
      if (lineText.startsWith('# ') || (i === 0 && !lineText.startsWith('#') && cleanLine.toUpperCase() === cleanLine)) {
        const titleContent = lineText.startsWith('# ') ? lineText.replace('# ', '').trim() : cleanLine;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        
        const splitLines = doc.splitTextToSize(cleanUnicodeToASCII(titleContent.toUpperCase()), contentWidth);
        for (const line of splitLines) {
          if (y + 16 > pageHeight - marginY) {
            doc.addPage();
            y = marginY;
          }
          doc.text(line, marginX, y);
          y += 16;
        }
        doc.setFont('Helvetica', 'normal');
        y += 12; // spacing after title block
        continue;
      }

      // Check section headings (e.g. ## I. CALL TO ORDER, etc.)
      const isHeading2 = lineText.startsWith('## ') || 
                         /^(I|II|III|IV|V|VI)\.\s+[A-Z\s]+/.test(cleanLine);
      
      if (isHeading2) {
        let headingText = cleanLine;
        if (lineText.startsWith('## ')) {
          headingText = cleanLine.replace(/^##\s+/, '').trim();
        }
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        
        if (y + 22 > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        
        y += 12; // spacing before heading
        doc.text(cleanUnicodeToASCII(headingText.toUpperCase()), marginX, y);
        y += headingHeight;
        doc.setFont('Helvetica', 'normal');
        continue;
      }

      // Check subheadings (e.g. ### or bold numbered topics like "1. Schedule and Venue")
      const isSubHeading = lineText.startsWith('### ') || 
                           (/^\d+\.\s+/.test(cleanLine) && isOriginalBold) ||
                           (/^\d+\.\s+/.test(cleanLine) && inDiscussion);
      
      if (isSubHeading) {
        let headingText = cleanLine;
        if (lineText.startsWith('### ')) {
          headingText = cleanLine.replace(/^###\s+/, '').trim();
        }
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        
        if (y + 18 > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        
        doc.text(cleanUnicodeToASCII(headingText), marginX, y);
        y += 18;
        doc.setFont('Helvetica', 'normal');
        continue;
      }

      // Roll Call headings (PRESENT:, EXCUSED:, ABSENT:)
      const isRollCallHeading = cleanLine === 'PRESENT:' || cleanLine === 'EXCUSED:' || cleanLine === 'ABSENT:';
      if (inRollCall && isRollCallHeading) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        if (y + lineHeight > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        doc.text(cleanLine, marginX, y);
        y += lineHeight + 4; // Add extra gap
        doc.setFont('Helvetica', 'normal');
        continue;
      }

      // Roll Call attendee columns alignment: Designation - Name
      if (inRollCall && (cleanLine.includes(' - ') || cleanLine.includes(' – '))) {
        const divider = cleanLine.includes(' - ') ? ' - ' : ' – ';
        const parts = cleanLine.split(divider);
        if (parts.length >= 2) {
          const designation = parts[0].trim();
          const name = parts[1].trim();
          
          if (y + lineHeight > pageHeight - marginY) {
            doc.addPage();
            y = marginY;
          }
          
          // Role / Designation on the left
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.text(cleanUnicodeToASCII(designation), marginX, y);
          
          // Aligned dash in center (170pt)
          doc.text('-', marginX + 170, y);
          
          // Aligned Name on the right (195pt)
          doc.text(cleanUnicodeToASCII(name), marginX + 195, y);
          
          y += lineHeight;
          continue;
        }
      }

      // Sign-off certification block
      if (cleanLine.toLowerCase().includes('i hereby certify')) {
        if (y + 130 > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(9.5);
        const splitCert = doc.splitTextToSize(cleanUnicodeToASCII(cleanLine), contentWidth);
        for (const line of splitCert) {
          doc.text(line, marginX, y);
          y += lineHeight;
        }
        
        y += 48; // Spacing for signature lines
        
        if (y + 50 > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        
        const leftLineX1 = marginX;
        const leftLineX2 = marginX + 180;
        const rightLineX1 = pageWidth - marginX - 180;
        const rightLineX2 = pageWidth - marginX;
        
        doc.setLineWidth(0.75);
        doc.setDrawColor(120, 120, 120);
        
        // Draw side-by-side signature lines
        doc.line(leftLineX1, y, leftLineX2, y);
        doc.line(rightLineX1, y, rightLineX2, y);
        
        y += 12;
        
        // Print names under signature lines
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        const secName = secretary || 'JANQUEL B. GEAGONIA';
        doc.text(cleanUnicodeToASCII(secName.toUpperCase()), leftLineX1, y);
        
        const chairName = chair || 'KATHLYN BACLAYON';
        doc.text(cleanUnicodeToASCII(chairName.toUpperCase()), rightLineX1, y);
        
        y += 11;
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text('Prepared by: Executive Secretary', leftLineX1, y);
        doc.text('Attested By: President / Chairperson', rightLineX1, y);
        doc.setTextColor(30, 30, 30);
        
        break; // End of document
      }

      // Check standard list items (bullets and nested bullets)
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

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);

      if (isListItem) {
        let bulletChar = '•';
        let bulletIndent = 15;
        
        if (isIndented) {
          bulletIndent = 30;
          if (inDiscussion) {
            bulletChar = 'o'; // Open circular bullet
          } else {
            bulletChar = '-'; // Dash bullet
          }
        } else {
          const rawTrim = lines[i].trim();
          if (rawTrim.startsWith('- ') || rawTrim.startsWith('* ')) {
            bulletChar = '•';
          } else {
            const matchNumber = rawTrim.match(/^(\d+\.)/);
            if (matchNumber) {
              bulletChar = matchNumber[0];
              bulletIndent = 20;
            }
          }
        }
        
        if (y + lineHeight > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        
        // Draw bullet - use vector shapes for circle bullets to avoid encoding corruption!
        if (bulletChar === '•') {
          doc.setFillColor(80, 80, 80);
          doc.circle(marginX + bulletIndent - 8, y - 3, 2, 'F');
        } else if (bulletChar === 'o') {
          doc.setLineWidth(0.5);
          doc.setDrawColor(80, 80, 80);
          doc.circle(marginX + bulletIndent - 8, y - 3, 2, 'D');
        } else {
          doc.setFont('Helvetica', 'bold');
          doc.text(cleanUnicodeToASCII(bulletChar), marginX + (bulletIndent - 12), y);
          doc.setFont('Helvetica', 'normal');
        }
        
        // Draw wrapped list item text
        const textWidthLimit = contentWidth - bulletIndent;
        const splitLines = doc.splitTextToSize(cleanUnicodeToASCII(cleanedItemText), textWidthLimit);
        for (let j = 0; j < splitLines.length; j++) {
          if (y + lineHeight > pageHeight - marginY) {
            doc.addPage();
            y = marginY;
          }
          doc.text(splitLines[j], marginX + bulletIndent, y);
          y += lineHeight;
        }
      } else {
        // Normal paragraph text
        if (isOriginalBold) {
          doc.setFont('Helvetica', 'bold');
        } else {
          doc.setFont('Helvetica', 'normal');
        }
        
        const splitLines = doc.splitTextToSize(cleanUnicodeToASCII(cleanLine), contentWidth);
        for (const line of splitLines) {
          if (y + lineHeight > pageHeight - marginY) {
            doc.addPage();
            y = marginY;
          }
          doc.text(line, marginX, y);
          y += lineHeight;
        }
        doc.setFont('Helvetica', 'normal');
      }
    }

    // Loop through generated pages to add top header and bottom footer (page numbering)
    const totalPages = doc.getNumberOfPages();
    for (let j = 1; j <= totalPages; j++) {
      doc.setPage(j);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      
      // Top header on page 2 and up
      if (j > 1) {
        const headerTitle = title ? title.toUpperCase() : 'MEETING MINUTES';
        doc.text(`MINUTES OF THE MEETING - ${cleanUnicodeToASCII(headerTitle)}`, marginX, 35);
        doc.setLineWidth(0.5);
        doc.setDrawColor(220, 220, 220);
        doc.line(marginX, 38, pageWidth - marginX, 38);
      }
      
      // Bottom footer on all pages
      doc.text(`Page ${j} of ${totalPages}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
    }

    const fileTitle = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'meeting';
    doc.save(`${fileTitle}_minutes.pdf`);
  };

  // Custom components for Markdown Renderer to make it look premium
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 border-b border-zinc-800 pb-3 mb-6 font-sans">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg md:text-xl font-bold text-indigo-400 mt-8 mb-4 tracking-wide uppercase border-b border-zinc-800/40 pb-1 font-sans">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base md:text-lg font-semibold text-emerald-400 mt-6 mb-3 font-sans">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-zinc-300 leading-relaxed mb-4 text-sm md:text-base font-sans">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-5 space-y-2 text-zinc-300 text-sm md:text-base font-sans">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-5 space-y-2 text-zinc-300 text-sm md:text-base font-sans">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-zinc-300 leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-zinc-400 my-5 bg-zinc-900/40 py-2 rounded-r-md">
        {children}
      </blockquote>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-zinc-100">
        {children}
      </strong>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-6 border border-zinc-800 rounded-lg">
        <table className="min-w-full divide-y divide-zinc-800 text-sm text-left">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-zinc-900/50 text-zinc-300 font-medium">{children}</thead>,
    tbody: ({ children }: any) => <tbody className="divide-y divide-zinc-800 text-zinc-400">{children}</tbody>,
    tr: ({ children }: any) => <tr className="hover:bg-zinc-900/20 transition-colors">{children}</tr>,
    th: ({ children }: any) => <th className="px-4 py-3 font-medium">{children}</th>,
    td: ({ children }: any) => <td className="px-4 py-3 font-mono text-xs">{children}</td>,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Smart MoM Generator
              <span className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full text-indigo-400 font-medium">v1.0</span>
            </h1>
            <p className="text-xs text-zinc-500">AI-Powered Minutes of the Meeting Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs text-zinc-400 font-medium">Gemini Pro Connected</span>
        </div>
      </header>

      {/* Main Container: Full-Height Flex Split Screen */}
      <main className="flex-1 flex flex-col md:flex-row md:h-[calc(100vh-73px)] md:overflow-hidden">
        
        {/* Left Panel: Inputs (Scrollable) */}
        <section className="w-full md:w-1/2 h-auto md:h-full md:overflow-y-auto p-6 md:p-8 space-y-8 border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950">
          
          {/* Metadata Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">1. Meeting Metadata</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-title">
                  <FileText className="h-3 w-3" /> Meeting Title
                </label>
                <input
                  id="meeting-title"
                  type="text"
                  placeholder="e.g., Q3 Planning & Budget Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-date">
                  <Calendar className="h-3 w-3" /> Date & Time
                </label>
                <input
                  id="meeting-date"
                  type="text"
                  placeholder="e.g., July 8, 2026 at 2:00 PM"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-chair">
                  <User className="h-3 w-3" /> Chairperson
                </label>
                <input
                  id="meeting-chair"
                  type="text"
                  placeholder="e.g., Clara Oswald (CEO)"
                  value={chair}
                  onChange={(e) => setChair(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-secretary">
                  <Users className="h-3 w-3" /> Secretary / Note Taker
                </label>
                <input
                  id="meeting-secretary"
                  type="text"
                  placeholder="e.g., John Smith"
                  value={secretary}
                  onChange={(e) => setSecretary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Quick Test Samples */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">2. Quick Test Samples</h2>
              </div>
              <span className="text-xxs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">Workspace Files</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleFiles.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(sample.fileName)}
                  className="flex flex-col text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-800 active:scale-98 transition text-xs group"
                >
                  <span className="font-semibold text-zinc-300 group-hover:text-indigo-400 transition mb-1 flex items-center justify-between w-full">
                    {sample.displayName}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                  </span>
                  <span className="text-xxs text-zinc-500 leading-normal">{sample.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Raw Notes Upload & Text Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">3. Document Upload / Notes Input</h2>
              </div>
              <div className="text-xs text-zinc-500 font-medium">
                {rawNotes ? `${rawNotes.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[120px] ${
                isDragActive 
                  ? 'border-indigo-500 bg-indigo-950/20' 
                  : uploadedFile 
                    ? 'border-emerald-800/80 bg-emerald-950/5' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                  <span className="text-sm font-semibold">Reading document content...</span>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20 text-emerald-400 mb-1">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">{uploadedFile.name}</span>
                  {uploadedFile.size > 0 && (
                    <span className="text-xs text-zinc-500">Size: {Math.round(uploadedFile.size / 1024)} KB</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="mt-3 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-400 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-zinc-500" /> Clear File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-zinc-900 p-2.5 rounded-full border border-zinc-800 text-zinc-400 mb-1">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">Drag & drop your .docx file here</span>
                  <span className="text-xs text-zinc-500">or click to browse from local drive</span>
                </div>
              )}
            </div>

            {/* Raw Notes Area */}
            <div className="space-y-1">
              <label htmlFor="raw-notes-input" className="text-xs font-semibold text-zinc-400">Raw Unstructured Notes</label>
              <textarea
                id="raw-notes-input"
                placeholder="Paste or type unorganized notes, transcripts, agenda topics, and raw details here..."
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                className="w-full h-64 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 font-sans focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-y placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 rounded-lg text-xs flex items-start gap-2.5 animate-fade-in">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateMinutes}
            disabled={isLoading || !rawNotes.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-800 disabled:cursor-not-allowed transition duration-200 active:scale-99 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>AI Secretary is writing minutes...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                <span>Generate structured MoM</span>
              </>
            )}
          </button>
        </section>

        {/* Right Panel: Live Preview & Export */}
        <section className="w-full md:w-1/2 h-auto md:h-full flex flex-col bg-zinc-900/40 relative">
          
          {/* Header toolbar */}
          <div className="border-b border-zinc-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/30">
            {/* View Switcher Tabs */}
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-900">
              <button
                onClick={() => setActiveTab('preview')}
                disabled={!minutes}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'preview' 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Formatted Minutes
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                disabled={!minutes}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'edit' 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Markdown
              </button>
            </div>

            {/* Export options */}
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!minutes}
                title="Copy markdown to clipboard"
                className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>Copy</span>
              </button>
              <button
                onClick={directToGoogleDocs}
                disabled={!minutes}
                title="Export directly to Google Docs (copies formatted text and opens docs.new)"
                className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-semibold text-indigo-400 border-indigo-950 hover:bg-indigo-950/20"
              >
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Docs</span>
              </button>
              <button
                onClick={downloadMarkdown}
                disabled={!minutes}
                title="Download as Markdown (.md)"
                className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <Download className="h-4 w-4" />
                <span>MD</span>
              </button>
              <button
                onClick={downloadPDF}
                disabled={!minutes}
                title="Download formatted PDF"
                className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Preview/Edit Content Area */}
          <div className="flex-1 md:overflow-y-auto p-6 md:p-8 min-h-[400px] md:min-h-0">
            {isLoading ? (
              // Pulse Skeleton Screen
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-zinc-800 rounded-md w-3/4"></div>
                <div className="h-4 bg-zinc-850 rounded-md w-1/3 mt-2"></div>
                <hr className="border-zinc-800 my-6" />
                <div className="space-y-4">
                  <div className="h-4 bg-zinc-800 rounded-md w-1/4"></div>
                  <div className="space-y-2 pl-4">
                    <div className="h-3.5 bg-zinc-850 rounded-md w-5/6"></div>
                    <div className="h-3.5 bg-zinc-850 rounded-md w-4/6"></div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-4 bg-zinc-800 rounded-md w-1/3"></div>
                  <div className="space-y-2 pl-4">
                    <div className="h-3.5 bg-zinc-850 rounded-md w-full"></div>
                    <div className="h-3.5 bg-zinc-850 rounded-md w-11/12"></div>
                    <div className="h-3.5 bg-zinc-850 rounded-md w-4/5"></div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-4 bg-zinc-800 rounded-md w-1/4"></div>
                  <div className="space-y-2 pl-4">
                    <div className="h-3.5 bg-zinc-850 rounded-md w-2/3"></div>
                  </div>
                </div>
              </div>
            ) : minutes ? (
              activeTab === 'preview' ? (
                // Styled Markdown Viewer
                <div className="prose prose-invert max-w-none prose-zinc pb-12 selection:bg-indigo-500/30">
                  <ReactMarkdown components={markdownComponents}>
                    {minutes}
                  </ReactMarkdown>
                </div>
              ) : (
                // Raw Markdown Editor
                <div className="h-full flex flex-col">
                  <textarea
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full flex-1 min-h-[400px] p-6 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                  />
                  <p className="text-xxs text-zinc-500 mt-2 font-mono">
                    Note: Editing here updates the active preview state. Downloading or copying will export these current changes.
                  </p>
                </div>
              )
            ) : (
              // Empty State Placeholder
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl mb-4 relative shadow-lg group hover:border-zinc-800 transition">
                  <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl opacity-10 blur group-hover:opacity-20 transition duration-300"></div>
                  <FileText className="h-10 w-10 text-zinc-500 group-hover:text-indigo-400 transition" />
                </div>
                <h3 className="text-base font-semibold text-zinc-300">No Minutes Generated Yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
                  Provide meeting notes on the left panel or click one of the quick test sample buttons to generate your structured meeting minutes.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-3 max-w-xs text-left w-full">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="h-5 w-5 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center text-xxs font-semibold text-zinc-500">1</span>
                    <span>Fill meeting metadata</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="h-5 w-5 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center text-xxs font-semibold text-zinc-500">2</span>
                    <span>Upload .docx file or write raw notes</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="h-5 w-5 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center text-xxs font-semibold text-zinc-500">3</span>
                    <span>Click "Generate structured MoM"</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
