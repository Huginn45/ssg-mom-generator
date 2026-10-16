'use client';


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
  ArrowRight,
  Settings,
  X,
  HelpCircle,
  Mic,
  MicOff,
  FileAudio,
  Plus,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';

export default function Home() {
  // GDocs Integration settings
  const [scriptUrl, setScriptUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  // Temporary edit states inside Settings form
  const [tempScriptUrl, setTempScriptUrl] = useState('');
  const [tempClientId, setTempClientId] = useState('');

  // Load settings on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScriptUrl = localStorage.getItem('mom_gdocs_script_url') || '';
      const savedClientId = localStorage.getItem('mom_gdocs_client_id') || '';
      setScriptUrl(savedScriptUrl);
      setClientId(savedClientId);
      setTempScriptUrl(savedScriptUrl);
      setTempClientId(savedClientId);
    }
  }, []);

  // Load Google Identity Services library script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGsiLoaded(true);
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const saveSettings = () => {
    setScriptUrl(tempScriptUrl);
    setClientId(tempClientId);
    localStorage.setItem('mom_gdocs_script_url', tempScriptUrl);
    localStorage.setItem('mom_gdocs_client_id', tempClientId);
    setSuccess('Settings saved successfully!');
    setIsSettingsOpen(false);
  };

  const handleGoogleSignIn = () => {
    if (!clientId) {
      setError('Please configure a Google Client ID in settings first.');
      return;
    }
    try {
      // @ts-ignore
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            setAccessToken(tokenResponse.access_token);
            setSuccess('Signed in with Google successfully!');
          }
        },
      });
      client.requestAccessToken();
    } catch (err: any) {
      setError('Google Sign-In failed: ' + err.message);
    }
  };

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
  const [activeSidebarTab, setActiveSidebarTab] = useState<'workspace' | 'metadata' | 'audio'>('workspace');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);

  // New feature states: custom signatories, attendance tally, audio transcription
  const [signatories, setSignatories] = useState<{ label: string; name: string; role: string }[]>([
    { label: 'Prepared by:', name: '', role: 'Executive Secretary' },
    { label: 'Attested By:', name: '', role: 'President / Chairperson' }
  ]);
  const [attendanceTally, setAttendanceTally] = useState<{
    total: number;
    present: number;
    late: number;
    excused: number;
    absent: number;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Theme states - Default to clean, minimal white
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);

  // Granola-inspired Shorthand Recipes / Templates
  type MeetingRecipe = 'legislative' | 'executive' | 'special';
  const [activeRecipe, setActiveRecipe] = useState<MeetingRecipe>('legislative');

  const recipeTemplates: Record<MeetingRecipe, { name: string; template: string; description: string }> = {
    legislative: {
      name: 'Legislative Session',
      description: 'Standard SSG Parliamentary Session with Formal Motions & Agendas',
      template: `MEETING: 2nd Legislative Meeting of the Supreme Student Government
DATE: October 16, 2026 at 2:00 PM
PRESIDING OFFICER: Hon. Juan Dela Cruz, SSG President
SECRETARY: Hon. Maria Santos, Executive Secretary
INVOCATION: The opening prayer was led by Hon. Alex Rivera, Councilor.
ROLL CALL: 14 were present, 2 were excused, and 0 were absent. A quorum was declared.

AGENDA:
A. Approval of General Fund Budget for College Intramurals
B. Busog Estudyante Food Pantry Expansion Project
C. Student Grievance Mechanism and Council Action

DELIBERATIONS & DISCUSSIONS:
Approval of Agenda: A motion to approve the agenda was raised by Hon. Marco Reyes and seconded by Hon. Patricia Lee. The body approved the motion.

A. Approval of General Fund Budget for College Intramurals:
- The Committee on Finance presented the requested PHP 45,000 for sports equipment, first aid, and certificates.
- Hon. Marco Reyes moved to approve the budget allocation.
- Hon. Patricia Lee seconded the motion.
- The body approved the allocation unanimously without objections.

B. Busog Estudyante Food Pantry Expansion Project:
- Reported over 350 student beneficiaries served in the previous week.
- Identified need for staple supplies and additional volunteer rotations.
- Hon. Gabriel Ramos moved to allocate PHP 10,000 contingency funding for supply restocks.
- Hon. Angela Perez seconded the motion. The motion was carried.

C. Student Grievance Mechanism and Council Action:
- Committee on Student Rights presented reports on shuttle scheduling concerns.
- Executive board agreed to submit formal representation to the University Administration by Monday.

CLOSING PRAYER & ADJOURNMENT:
- The closing prayer was led by Hon. Teresa Diaz, Councilor.
- A motion to adjourn was raised by Hon. Gabriel Ramos and seconded by Hon. Angela Perez. The meeting adjourned at 4:15 PM.`
    },
    executive: {
      name: 'Executive Committee',
      description: 'Executive Board Officer Reports, Project Deadlines & Operations',
      template: `MEETING: Executive Board Coordination Meeting
DATE: October 16, 2026 at 4:30 PM
PRESIDING OFFICER: Hon. Juan Dela Cruz, SSG President
SECRETARY: Hon. Maria Santos, Executive Secretary
INVOCATION: The opening prayer was led by Hon. Patricia Lee.
ROLL CALL: 8 executive officers present, 0 absent. Quorum declared.

AGENDA:
A. Internal Committee Progress Reports
B. Upcoming Campus Leadership Summit Planning
C. Logistics and Operational Timeline

DELIBERATIONS & DISCUSSIONS:
Approval of Agenda: A motion to approve the agenda was raised by Hon. Patricia Lee and seconded by Hon. Marco Reyes. The body approved the motion.

A. Internal Committee Progress Reports:
- Secretariat reported all previous minutes completed and filed with Student Affairs.
- Finance presented monthly balance sheet showing surplus contingency.

B. Upcoming Campus Leadership Summit Planning:
- Proposed date: November 12, 2026. Target attendees: 120 student leaders.
- Keynote speaker invitations to be finalized by Friday.

C. Logistics and Operational Timeline:
- Production team to finalize venue booking and sound system reservation.`
    },
    special: {
      name: 'Emergency Meeting',
      description: 'Urgent Council Assembly, Emergency Relief or Immediate Motions',
      template: `MEETING: Special Emergency Legislative Meeting
DATE: October 16, 2026 at 6:00 PM
PRESIDING OFFICER: Hon. Juan Dela Cruz, SSG President
SECRETARY: Hon. Maria Santos, Executive Secretary
INVOCATION: The opening prayer was led by Hon. Angela Perez.
ROLL CALL: 13 members present, 3 excused. Quorum declared.

AGENDA:
A. Emergency Student Relief Fund Allocation
B. Campus Operations and Advisory Resolution

DELIBERATIONS & DISCUSSIONS:
Approval of Agenda: A motion to approve the agenda was raised by Hon. Marco Reyes and seconded by Hon. Gabriel Ramos. The body approved the motion.

A. Emergency Student Relief Fund Allocation:
- Emergency assistance request for students affected by inclement weather.
- Hon. Marco Reyes moved to immediately disburse PHP 25,000 for relief food kits.
- Hon. Gabriel Ramos seconded. Approved unanimously.

B. Campus Operations and Advisory Resolution:
- SSG resolution recommending asynchronous classes submitted to the Dean.`
    }
  };

  const handleApplyRecipe = (recipe: MeetingRecipe) => {
    setActiveRecipe(recipe);
    setRawNotes(recipeTemplates[recipe].template);
    setSuccess('Loaded ' + recipeTemplates[recipe].name + ' shorthand notes!');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Refs for checking manual edits on signatories name
  const prevSecRef = useRef('');
  const prevChairRef = useRef('');

  // Sync secretary changes to first signatory name if not customized
  useEffect(() => {
    setSignatories(prev => {
      const next = [...prev];
      if (next[0] && (next[0].name === prevSecRef.current || !next[0].name)) {
        next[0] = { ...next[0], name: secretary };
      }
      prevSecRef.current = secretary;
      return next;
    });
  }, [secretary]);

  // Sync chair changes to second signatory name if not customized
  useEffect(() => {
    setSignatories(prev => {
      const next = [...prev];
      if (next[1] && (next[1].name === prevChairRef.current || !next[1].name)) {
        next[1] = { ...next[1], name: chair };
      }
      prevChairRef.current = chair;
      return next;
    });
  }, [chair]);

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

  // React hooks and helper functions for new features
  useEffect(() => {
    calculateAttendanceTally(minutes);
  }, [minutes]);

  // Attendance tally calculation
  const calculateAttendanceTally = (minutesText: string) => {
    let total = 0, present = 0, late = 0, excused = 0, absent = 0;
    if (!minutesText) {
      setAttendanceTally(null);
      return;
    }
    const lines = minutesText.split('\n');
    let inRollCall = false;
    let currentCategory = '';
    
    for (let line of lines) {
      const cleanLine = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();
      const lowerLine = cleanLine.toLowerCase();
      
      // Section boundaries
      if (lowerLine.includes('i. call to order')) {
        inRollCall = false;
      } else if (lowerLine.includes('iii. roll call') || lowerLine.includes('attendance')) {
        inRollCall = true;
        continue;
      } else if (/^(i|ii|iv|v|vi|vii|viii|ix|x)\.\s+/i.test(cleanLine)) {
        inRollCall = false;
      }
      
      if (inRollCall) {
        // Check category header
        if (/^(PRESENT|LATE|EXCUSED|ABSENT|ON LEAVE)\:$/i.test(cleanLine)) {
          currentCategory = cleanLine.toUpperCase().replace(':', '');
          continue;
        }
        
        // Check list item
        if (currentCategory && /[-\–\—]/.test(cleanLine)) {
          const parts = cleanLine.split(/\s*[-\–\—]\s*/);
          if (parts.length >= 2) {
            if (currentCategory === 'PRESENT') present++;
            else if (currentCategory === 'LATE') late++;
            else if (currentCategory === 'EXCUSED') excused++;
            else if (currentCategory === 'ABSENT') absent++;
            total++;
          }
        }
      }
    }
    
    if (total > 0) {
      setAttendanceTally({ total, present, late, excused, absent });
    } else {
      setAttendanceTally(null);
    }
  };

  // Signatory helper functions
  const getSignatoriesMarkdown = (sigList: typeof signatories) => {
    let md = '';
    sigList.forEach(item => {
      if (item.name) {
        md += `\n\n${item.label || 'Prepared by:'}\n**${item.name}**\n${item.role}`;
      }
    });
    return md;
  };

  const updateSignaturesInMarkdown = (sigList: typeof signatories) => {
    if (!minutes) return;
    
    const lines = minutes.split('\n');
    let certIndex = -1;
    for (let k = 0; k < lines.length; k++) {
      if (lines[k].toLowerCase().includes('i hereby certify')) {
        certIndex = k;
        break;
      }
    }
    
    if (certIndex !== -1) {
      const topPart = lines.slice(0, certIndex + 1).join('\n');
      const sigMd = getSignatoriesMarkdown(sigList);
      setMinutes(topPart + sigMd);
    }
  };

  const handleAddSignatory = () => {
    setSignatories(prev => {
      const next = [...prev, { label: '', name: '', role: '' }];
      return next;
    });
  };

  const handleRemoveSignatory = (index: number) => {
    setSignatories(prev => {
      const next = prev.filter((_, i) => i !== index);
      updateSignaturesInMarkdown(next);
      return next;
    });
  };

  const handleSignatoryChange = (index: number, field: 'label' | 'name' | 'role', value: string) => {
    setSignatories(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: value };
      }
      updateSignaturesInMarkdown(next);
      return next;
    });
  };

  // Web Speech recognition for live mic recording
  const toggleMicrophone = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (!isRecording) {
      if (!recognitionRef.current) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setRawNotes(prev => prev + finalTranscript);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
        };

        recognitionRef.current = rec;
      }

      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  const handleAudioFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      transcribeAudioFile(file);
    }
  };

  const transcribeAudioFile = (file: File) => {
    setUploading(true);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type || 'audio/mp3';

        const response = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioData: base64Data,
            mimeType: mimeType
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to transcribe audio recording');
        }

        if (data.transcript) {
          setRawNotes(data.transcript);
          setSuccess('Audio transcribed successfully!');
        } else {
          setError('No text could be extracted from the audio file.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during transcription');
      } finally {
        setUploading(false);
        if (audioInputRef.current) audioInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
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

        // Section tracking based on Roman numerals or key terms
        const lowerClean = cleanLine.toLowerCase();
        const romanMatch = cleanLine.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+(.+)$/i);
        let isValidRomanHeader = false;
        let romanNum = '';
        if (romanMatch) {
          const restOfLine = romanMatch[2].trim().toLowerCase();
          if (
            restOfLine.includes('call to order') ||
            restOfLine.includes('invocation') ||
            restOfLine.includes('roll call') ||
            restOfLine.includes('agenda') ||
            restOfLine.includes('discussion') ||
            restOfLine.includes('closing prayer') ||
            restOfLine.includes('adjournment')
          ) {
            isValidRomanHeader = true;
            romanNum = romanMatch[1].toUpperCase();
          }
        }
        if (isValidRomanHeader) {
          flushRollCall();
          if (romanNum === 'III') {
            inRollCall = true;
            inDiscussion = false;
          } else if (romanNum === 'V') {
            inRollCall = false;
            inDiscussion = true;
          } else {
            inRollCall = false;
            inDiscussion = false;
          }
        } else if (lowerClean.includes('i. call to order')) {
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
        } else if (lowerClean.includes('adjournment') || lowerClean.includes('sign-off') || lowerClean.includes('certify')) {
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
        let isHeading2 = lineText.startsWith('## ');
        const romanMatchTest = cleanLine.match(/^(I|II|III|IV|V|VI|VII|VIII)\.\s+(.+)$/i);
        if (romanMatchTest) {
          const restOfLine = romanMatchTest[2].trim().toLowerCase();
          if (
            restOfLine.includes('call to order') ||
            restOfLine.includes('invocation') ||
            restOfLine.includes('roll call') ||
            restOfLine.includes('agenda') ||
            restOfLine.includes('discussion') ||
            restOfLine.includes('closing prayer') ||
            restOfLine.includes('adjournment')
          ) {
            isHeading2 = true;
          }
        }
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
        if (inRollCall && /^(PRESENT|LATE|EXCUSED|ABSENT|ON LEAVE)\:$/i.test(cleanLine)) {
          flushRollCall();
          rollCallSectionName = cleanLine;
          continue;
        }

        // Roll Call attendees split Designation - Name (any hyphen/dash with or without spaces)
        if (inRollCall && /[-\–\—]/.test(cleanLine)) {
          const parts = cleanLine.split(/\s*[-\–\—]\s*/);
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
          
          // Dynamic parsing of names and roles from lines below
          const signatureBlocks: { label: string; name: string; role: string }[] = [];
          let currentBlock: { label: string; name: string; role: string } | null = null;

          for (let k = i + 1; k < lines.length; k++) {
            const trimmed = lines[k].trim();
            if (trimmed === '') continue;
            const cleanItem = trimmed.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();
            
            // Check if line is a label
            if (/^(Prepared by|Attested by|Approved by|Noted by|Certified by|Signed by|Reviewed by|Verified by)\:?$/i.test(cleanItem)) {
              if (currentBlock) {
                signatureBlocks.push(currentBlock);
              }
              currentBlock = { label: cleanItem, name: '', role: '' };
            } else {
              if (!currentBlock) {
                currentBlock = { label: 'Prepared by:', name: '', role: '' };
              }
              if (!currentBlock.name) {
                currentBlock.name = cleanItem;
              } else if (!currentBlock.role) {
                currentBlock.role = cleanItem;
              }
            }
          }
          if (currentBlock) {
            signatureBlocks.push(currentBlock);
          }

          // Fallback to default if no signature blocks parsed
          if (signatureBlocks.length === 0) {
            const secName = secretary || 'JANQUEL B. GEAGONIA';
            const chairName = chair || 'KATHLYN BACLAYON';
            signatureBlocks.push({ label: 'Prepared by:', name: secName, role: 'Executive Secretary' });
            signatureBlocks.push({ label: 'Attested By:', name: chairName, role: 'President / Chairperson' });
          }
          
          // Signatures side-by-side table
          html += `<table style="width: 100%; border-collapse: collapse; border: none; margin-top: 20px;">`;
          for (let b = 0; b < signatureBlocks.length; b += 2) {
            html += `<tr style="border: none;">`;
            
            // Left column
            const leftBlock = signatureBlocks[b];
            html += `<td style="width: 45%; border: none; border-top: 1px solid #7A7A7A; padding-top: 8px; font-family: Arial; vertical-align: top;">`;
            html += `<p style="font-size: 8pt; color: #6E6E6E; margin: 0 0 2px 0;">${leftBlock.label}</p>`;
            html += `<p style="font-size: 9.5pt; font-weight: bold; margin: 0; text-transform: uppercase;">${leftBlock.name}</p>`;
            html += `<p style="font-size: 8pt; color: #6E6E6E; margin: 2px 0 0 0; line-height: 1.3;">${leftBlock.role}</p>`;
            html += `</td>`;
            
            // Spacer
            html += `<td style="width: 10%; border: none;"></td>`;
            
            // Right column
            const rightBlock = signatureBlocks[b + 1];
            if (rightBlock) {
              html += `<td style="width: 45%; border: none; border-top: 1px solid #7A7A7A; padding-top: 8px; font-family: Arial; vertical-align: top;">`;
              html += `<p style="font-size: 8pt; color: #6E6E6E; margin: 0 0 2px 0;">${rightBlock.label}</p>`;
              html += `<p style="font-size: 9.5pt; font-weight: bold; margin: 0; text-transform: uppercase;">${rightBlock.name}</p>`;
              html += `<p style="font-size: 8pt; color: #6E6E6E; margin: 2px 0 0 0; line-height: 1.3;">${rightBlock.role}</p>`;
              html += `</td>`;
            } else {
              html += `<td style="width: 45%; border: none;"></td>`;
            }
            
            html += `</tr>`;
            
            // Add spacer row if there are more signatures
            if (b + 2 < signatureBlocks.length) {
              html += `<tr style="border: none; height: 30px;"><td colspan="3" style="border: none;"></td></tr>`;
            }
          }
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

      // 1. Check if Apps Script Web App Integration is configured
      if (scriptUrl) {
        setSuccess('Redirecting to Google Docs via Apps Script...');
        
        // Use direct form post to open in new tab. This passes browser cookies/auth natively,
        // avoiding CORS blocks and Google login page 401 redirects.
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = scriptUrl;
        form.target = '_blank';
        
        const titleInput = document.createElement('input');
        titleInput.type = 'hidden';
        titleInput.name = 'title';
        titleInput.value = title || 'Minutes of the Meeting';
        form.appendChild(titleInput);
        
        const htmlInput = document.createElement('input');
        htmlInput.type = 'hidden';
        htmlInput.name = 'html';
        htmlInput.value = html;
        form.appendChild(htmlInput);
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        setSuccess('Google Doc created successfully in a new tab!');
      } 
      // 2. Check if Google OAuth Client Integration is signed in
      else if (accessToken) {
        setSuccess('Creating Google Doc via Google Drive REST API...');
        const docTitle = title || 'Minutes of the Meeting';
        const metadata = {
          name: docTitle,
          mimeType: 'application/vnd.google-apps.document',
        };
        
        const boundary = 'xxxxxxxxxx';
        const requestBody = 
          `--${boundary}\r\n` +
          `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
          `${JSON.stringify(metadata)}\r\n` +
          `--${boundary}\r\n` +
          `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
          `${html}\r\n` +
          `--${boundary}--`;

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: requestBody,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error('Google Drive API error: ' + errText);
        }

        const file = await response.json();
        if (file.id) {
          window.open(`https://docs.google.com/document/d/${file.id}/edit`, '_blank');
          setSuccess('Google Doc created successfully!');
        } else {
          throw new Error('Failed to retrieve file ID from Google Drive API');
        }
      } 
      // 3. Fallback: Copy to clipboard and open settings dialog
      else {
        setIsSettingsOpen(true);
        // Write HTML format directly to the clipboard
        const blob = new Blob([html], { type: 'text/html' });
        const richText = new ClipboardItem({ 'text/html': blob });
        await navigator.clipboard.write([richText]);
        setSuccess('Minutes copied to clipboard! Please configure GDocs settings below to enable automatic creation.');
      }
      
    } catch (err: any) {
      console.error(err);
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
    let lastWasListItem = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLineText = lines[i];
      let lineText = rawLineText.trim();
      
      // Skip empty lines, just add vertical spacing (highly optimized spacing for page layout)
      if (lineText === '') {
        if (!inRollCall) {
          y += lastWasListItem ? 2 : 6;
        }
        if (y > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        lastWasListItem = false;
        continue;
      }

      // Check if original line had bolding in markdown
      const isOriginalBold = (lineText.startsWith('**') && lineText.endsWith('**')) ||
                             (lineText.startsWith('__') && lineText.endsWith('__'));

      // Completely remove all raw asterisks from the text
      let cleanLine = lineText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();

      // Manage section states based on Roman numerals or key terms
      const lowerClean = cleanLine.toLowerCase();
      const romanMatch = cleanLine.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+(.+)$/i);
      let isValidRomanHeader = false;
      let romanNum = '';
      if (romanMatch) {
        const restOfLine = romanMatch[2].trim().toLowerCase();
        if (
          restOfLine.includes('call to order') ||
          restOfLine.includes('invocation') ||
          restOfLine.includes('roll call') ||
          restOfLine.includes('agenda') ||
          restOfLine.includes('discussion') ||
          restOfLine.includes('closing prayer') ||
          restOfLine.includes('adjournment')
        ) {
          isValidRomanHeader = true;
          romanNum = romanMatch[1].toUpperCase();
        }
      }
      if (isValidRomanHeader) {
        if (romanNum === 'III') {
          inRollCall = true;
          inDiscussion = false;
        } else if (romanNum === 'V') {
          inRollCall = false;
          inDiscussion = true;
        } else {
          inRollCall = false;
          inDiscussion = false;
        }
      } else if (lowerClean.includes('i. call to order')) {
        inRollCall = false;
        inDiscussion = false;
      } else if (lowerClean.includes('iii. roll call') || lowerClean.includes('attendance')) {
        inRollCall = true;
        inDiscussion = false;
      } else if (lowerClean.includes('v. discussion')) {
        inDiscussion = true;
        inRollCall = false;
      } else if (lowerClean.includes('adjournment') || lowerClean.includes('sign-off') || lowerClean.includes('certify')) {
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
      let isHeading2 = lineText.startsWith('## ');
      const romanMatchTest = cleanLine.match(/^(I|II|III|IV|V|VI|VII|VIII)\.\s+(.+)$/i);
      if (romanMatchTest) {
        const restOfLine = romanMatchTest[2].trim().toLowerCase();
        if (
          restOfLine.includes('call to order') ||
          restOfLine.includes('invocation') ||
          restOfLine.includes('roll call') ||
          restOfLine.includes('agenda') ||
          restOfLine.includes('discussion') ||
          restOfLine.includes('closing prayer') ||
          restOfLine.includes('adjournment')
        ) {
          isHeading2 = true;
        }
      }
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

      // Roll Call headings (PRESENT:, EXCUSED:, ABSENT:, LATE:)
      const isRollCallHeading = /^(PRESENT|LATE|EXCUSED|ABSENT|ON LEAVE)\:$/i.test(cleanLine);
      if (inRollCall && isRollCallHeading) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        if (y + lineHeight > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
        doc.text(cleanLine.toUpperCase(), marginX, y);
        y += lineHeight + 4; // Add extra gap
        doc.setFont('Helvetica', 'normal');
        continue;
      }

      // Roll Call attendee columns alignment: Designation - Name (any hyphen/dash with or without spaces)
      if (inRollCall && /[-\–\—]/.test(cleanLine)) {
        const parts = cleanLine.split(/\s*[-\–\—]\s*/);
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
        
        // Dynamic parsing of names and roles from lines below
        const signatureBlocks: { label: string; name: string; role: string }[] = [];
        let currentBlock: { label: string; name: string; role: string } | null = null;

        for (let k = i + 1; k < lines.length; k++) {
          const trimmed = lines[k].trim();
          if (trimmed === '') continue;
          const cleanItem = trimmed.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();
          
          // Check if line is a label
          if (/^(Prepared by|Attested by|Approved by|Noted by|Certified by|Signed by|Reviewed by|Verified by)\:?$/i.test(cleanItem)) {
            if (currentBlock) {
              signatureBlocks.push(currentBlock);
            }
            currentBlock = { label: cleanItem, name: '', role: '' };
          } else {
            if (!currentBlock) {
              currentBlock = { label: 'Prepared by:', name: '', role: '' };
            }
            if (!currentBlock.name) {
              currentBlock.name = cleanItem;
            } else if (!currentBlock.role) {
              currentBlock.role = cleanItem;
            }
          }
        }
        if (currentBlock) {
          signatureBlocks.push(currentBlock);
        }

        // Fallback to default if no signature blocks parsed
        if (signatureBlocks.length === 0) {
          const secName = secretary || 'JANQUEL B. GEAGONIA';
          const chairName = chair || 'KATHLYN BACLAYON';
          signatureBlocks.push({ label: 'Prepared by:', name: secName, role: 'Executive Secretary' });
          signatureBlocks.push({ label: 'Attested By:', name: chairName, role: 'President / Chairperson' });
        }

        for (let b = 0; b < signatureBlocks.length; b += 2) {
          if (y + 50 > pageHeight - marginY) {
            doc.addPage();
            y = marginY;
          }
          
          const leftBlock = signatureBlocks[b];
          const rightBlock = signatureBlocks[b + 1];
          
          const leftLineX1 = marginX;
          const leftLineX2 = marginX + 180;
          const rightLineX1 = pageWidth - marginX - 180;
          const rightLineX2 = pageWidth - marginX;
          
          doc.setLineWidth(0.75);
          doc.setDrawColor(120, 120, 120);
          
          doc.line(leftLineX1, y, leftLineX2, y);
          if (rightBlock) {
            doc.line(rightLineX1, y, rightLineX2, y);
          }
          
          y += 12;
          
          // Left Block
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(110, 110, 110);
          doc.text(cleanUnicodeToASCII(leftBlock.label), leftLineX1, y - 18);
          
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 30, 30);
          doc.text(cleanUnicodeToASCII(leftBlock.name.toUpperCase()), leftLineX1, y);
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(110, 110, 110);
          const leftRoleLines = doc.splitTextToSize(cleanUnicodeToASCII(leftBlock.role), 180);
          let leftY = y + 10;
          for (const line of leftRoleLines) {
            doc.text(line, leftLineX1, leftY);
            leftY += 10;
          }
          
          // Right Block
          if (rightBlock) {
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(110, 110, 110);
            doc.text(cleanUnicodeToASCII(rightBlock.label), rightLineX1, y - 18);
            
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(30, 30, 30);
            doc.text(cleanUnicodeToASCII(rightBlock.name.toUpperCase()), rightLineX1, y);
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(110, 110, 110);
            const rightRoleLines = doc.splitTextToSize(cleanUnicodeToASCII(rightBlock.role), 180);
            let rightY = y + 10;
            for (const line of rightRoleLines) {
              doc.text(line, rightLineX1, rightY);
              rightY += 10;
            }
          }
          
          y += 45; // Row spacer
        }
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
        // Add small padding before the list if the previous line wasn't a list item
        if (!lastWasListItem) {
          y += 4;
        }
        lastWasListItem = true;
        
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
        lastWasListItem = false;
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

  // Custom components for Markdown Renderer - Clean minimal white with red heading font accents
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6 font-sans">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg md:text-xl font-bold text-red-800 dark:text-red-400 mt-8 mb-4 tracking-wide uppercase border-b border-red-100 dark:border-red-950/40 pb-1 font-sans">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3 font-sans">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed mb-4 text-sm md:text-base font-sans">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-5 space-y-2 text-zinc-800 dark:text-zinc-200 text-sm md:text-base font-sans">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-5 space-y-2 text-zinc-800 dark:text-zinc-200 text-sm md:text-base font-sans">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-red-700 dark:border-red-500 pl-4 italic text-zinc-650 dark:text-zinc-400 my-5 bg-zinc-50 dark:bg-zinc-900/40 py-2 rounded-r-md">
        {children}
      </blockquote>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-zinc-900 dark:text-zinc-50">
        {children}
      </strong>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-left">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">{children}</thead>,
    tbody: ({ children }: any) => <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">{children}</tbody>,
    tr: ({ children }: any) => <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">{children}</tr>,
    th: ({ children }: any) => <th className="px-4 py-3 font-semibold">{children}</th>,
    td: ({ children }: any) => <td className="px-4 py-3 font-mono text-xs">{children}</td>,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col font-sans transition-colors duration-200">
      
      {/* Settings Modal Dialog for GDocs */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl space-y-6 text-zinc-800 dark:text-zinc-200">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                <Settings className="h-4 w-4 text-red-700 dark:text-red-400" />
                Google Docs Integration Settings
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                To automate document creation (opening Docs with the minutes content pre-populated), configure either Method A or Method B below.
              </p>
            </div>

            <div className="space-y-6 divide-y divide-zinc-200 dark:divide-zinc-800">
              {/* Method A */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Method A: Google Apps Script (Recommended - No Cloud Setup)</h3>
                  <span className="text-xxs px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 font-mono">Zero Config</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Creates documents directly in your Google Drive using a simple Apps Script. No Google Cloud APIs or console setup required.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Google Apps Script Web App URL</label>
                  <input
                    type="text"
                    value={tempScriptUrl}
                    onChange={(e) => setTempScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/..."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition shadow-2xs"
                  />
                </div>

                {/* Steps Accordion */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Quick 3-Minute Setup Instructions:</span>
                  <ol className="list-decimal pl-4 space-y-2 text-zinc-600 dark:text-zinc-400">
                    <li>Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-red-700 dark:text-red-400 font-medium hover:underline">script.google.com</a> and click <strong>New Project</strong>.</li>
                    <li>
                      Replace the entire script with this code:
                      <div className="relative mt-1.5">
                        <textarea
                          readOnly
                          rows={6}
                          value={`function doPost(e) {
  try {
    // Force Apps Script to request Google Drive permissions:
    DriveApp.getRootFolder();

    // Read form POST parameters passed from browser
    var title = e.parameter.title || "Minutes";
    var html = e.parameter.html;
    var metadata = { name: title, mimeType: "application/vnd.google-apps.document" };
    var boundary = "xxxxxxxxxx";
    var requestBody = "--" + boundary + "\\r\\n" +
      "Content-Type: application/json; charset=UTF-8\\r\\n\\r\\n" +
      JSON.stringify(metadata) + "\\r\\n" +
      "--" + boundary + "\\r\\n" +
      "Content-Type: text/html; charset=UTF-8\\r\\n\\r\\n" +
      html + "\\r\\n" +
      "--" + boundary + "--";
    var options = {
      method: "post",
      contentType: "multipart/related; boundary=" + boundary,
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      payload: requestBody,
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", options);
    var resData = JSON.parse(response.getContentText());
    if (resData.id) {
      var docUrl = "https://docs.google.com/document/d/" + resData.id + "/edit";
      var redirectHtml = "<html><head><script>window.location.href='" + docUrl + "';</script></head><body style='font-family:Arial,sans-serif;background:#ffffff;color:#18181b;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;'><div>Redirecting to Google Doc...</div></body></html>";
      return HtmlService.createHtmlOutput(redirectHtml);
    }
    return HtmlService.createHtmlOutput("Error: " + JSON.stringify(resData));
  } catch(err) {
    return HtmlService.createHtmlOutput("Error: " + err.toString());
  }
}`}
                          className="w-full p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-[10px] text-zinc-800 dark:text-zinc-300 focus:outline-none"
                        />
                      </div>
                    </li>
                    <li>Click <strong>Deploy &gt; New deployment</strong>. Select <strong>Web app</strong> as type. Set <em>Execute as:</em> <strong>Me</strong> and <em>Who has access:</em> <strong>Anyone</strong>.</li>
                    <li>Click Deploy, authorize permissions, copy the <strong>Web App URL</strong> and paste it above!</li>
                  </ol>
                </div>
              </div>

              {/* Method B */}
              <div className="space-y-3 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Method B: Google Drive API (OAuth Consent Screen)</h3>
                  <span className="text-xxs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono">Standard OAuth</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Authorizes credentials natively in the browser. Requires creating a Google Cloud OAuth Client ID with Authorized JavaScript Origins set to your origin.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Google Client ID</label>
                    <input
                      type="text"
                      value={tempClientId}
                      onChange={(e) => setTempClientId(e.target.value)}
                      placeholder="e.g. 12345-abcde.apps.googleusercontent.com"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    {accessToken ? (
                      <div className="px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between font-bold">
                        <span>Signed in to Google</span>
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={!tempClientId}
                        className="w-full py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-red-700 dark:text-red-400" />
                        <span>Sign in with Google</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95"
              >
                Save Integration Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Container: Full-Height Flex Dashboard Layout */}
      <main className="flex-1 flex flex-col md:flex-row md:h-screen md:overflow-hidden">
        {/* Far-Left Navigation Sidebar (Clean Minimal White with subtle Red font accents) */}
        <aside className="w-full md:w-16 hover:md:w-56 bg-white dark:bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex md:flex-col items-center justify-around md:justify-start py-3 md:py-6 gap-3 md:gap-5 shrink-0 z-30 md:h-full group transition-all duration-300 ease-in-out overflow-hidden px-3 shadow-xs">
          
          {/* Top Logo */}
          <div className="hidden md:flex items-center w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs mb-2 whitespace-nowrap">
            <Sparkles className="h-5 w-5 shrink-0 text-red-700 dark:text-red-400" />
            <span className="ml-3 text-xs font-bold font-sans tracking-wider text-zinc-900 dark:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
              SECRETARY <span className="text-red-700 dark:text-red-400 font-extrabold">AI</span>
            </span>
          </div>

          {/* Middle Navigation Buttons */}
          <div className="flex md:flex-col gap-2 md:gap-3 w-full">
            <button 
              type="button"
              onClick={() => setActiveSidebarTab('workspace')} 
              title="Workspace & Shorthand Notes" 
              className={`flex items-center w-full p-2.5 rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap text-xs ${
                activeSidebarTab === 'workspace' 
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-xs font-semibold' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Layers className="h-4.5 w-4.5 shrink-0" />
              <span className="ml-3 font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
                Workspace
              </span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveSidebarTab('metadata')} 
              title="Meeting Metadata & Signatories" 
              className={`flex items-center w-full p-2.5 rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap text-xs ${
                activeSidebarTab === 'metadata' 
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-xs font-semibold' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Users className="h-4.5 w-4.5 shrink-0" />
              <span className="ml-3 font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
                Meeting Info
              </span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveSidebarTab('audio')} 
              title="Audio Transcription & Dictation" 
              className={`flex items-center w-full p-2.5 rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap text-xs ${
                activeSidebarTab === 'audio' 
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-xs font-semibold' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Mic className="h-4.5 w-4.5 shrink-0" />
              <span className="ml-3 font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
                Audio & Voice
              </span>
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex md:flex-col items-center gap-2 md:gap-3 mt-auto w-full">
            {/* Collapse/Expand Drawer Toggle (Desktop Only) */}
            <button 
              type="button"
              onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)} 
              title={isDrawerCollapsed ? "Expand Input Panel" : "Collapse Input Panel"} 
              className="hidden md:flex items-center w-full p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95 border border-transparent transition-all whitespace-nowrap text-xs"
            >
              {isDrawerCollapsed ? <ChevronRight className="h-4.5 w-4.5 shrink-0" /> : <ChevronLeft className="h-4.5 w-4.5 shrink-0" />}
              <span className="ml-3 font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
                {isDrawerCollapsed ? 'Expand Panel' : 'Collapse Panel'}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button 
              type="button"
              onClick={toggleTheme} 
              title="Toggle Light/Dark Theme" 
              className="flex items-center w-full p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95 border border-transparent transition-all whitespace-nowrap text-xs"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 shrink-0" /> : <Moon className="h-4.5 w-4.5 shrink-0" />}
              <span className="ml-3 font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
                {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              </span>
            </button>

            {/* Settings button with connection status indicator */}
            <button 
              type="button"
              onClick={() => setIsSettingsOpen(true)} 
              title="Integration Settings & Gemini status" 
              className="flex items-center w-full p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95 border border-transparent transition-all relative whitespace-nowrap text-xs"
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              <span className="ml-3 font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-0 group-hover:w-auto overflow-hidden">
                Settings
              </span>
              <span className="absolute top-2 left-6 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
          </div>
        </aside>

        {/* Mobile Segmented Toggle */}
        <div className="flex md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 p-2 gap-2 sticky top-0 z-20 shadow-xs shrink-0">
          <button 
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              mobileTab === 'editor' 
                ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Configure
          </button>
          <button 
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              mobileTab === 'preview' 
                ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            MoM Preview
          </button>
        </div>

        {/* Center Column: Active Feature Panel */}
        <section className={`w-full md:w-[440px] h-auto md:h-full p-6 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-[#0c0d10] shrink-0 flex-col justify-between ${
          isDrawerCollapsed ? 'hidden' : (mobileTab === 'editor' ? 'flex' : 'hidden md:flex')
        }`}>
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-6">
            
            {activeSidebarTab === 'workspace' && (
              <div className="space-y-5 flex-1 flex flex-col min-h-0">
                {/* Granola-inspired Meeting Recipes / Presets */}
                <div className="space-y-2.5 bg-white dark:bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-red-700 dark:text-red-400" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">Meeting Recipes</h2>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">1-Click Presets</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['legislative', 'executive', 'special'] as MeetingRecipe[]).map((recipeKey) => (
                      <button
                        key={recipeKey}
                        type="button"
                        onClick={() => handleApplyRecipe(recipeKey)}
                        className={`py-1.5 px-2 rounded-lg text-center transition active:scale-95 text-xs font-semibold border ${
                          activeRecipe === recipeKey
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/60 shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="block truncate text-[11px]">
                          {recipeKey === 'legislative' && '🏛️ Legislative'}
                          {recipeKey === 'executive' && '📋 Executive'}
                          {recipeKey === 'special' && '🚨 Emergency'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                    {recipeTemplates[activeRecipe].description}
                  </p>
                </div>

                {/* Quick Test Samples */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-red-700 dark:text-red-400" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">Quick Test Samples</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sampleFiles.slice(0, 4).map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLoadSample(sample.fileName)}
                        className="flex flex-col text-left p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-zinc-350 dark:hover:border-zinc-700 hover:shadow-xs active:scale-98 transition text-[10px] group"
                      >
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-red-700 dark:group-hover:text-red-400 transition mb-0.5 flex items-center justify-between w-full uppercase">
                          {sample.displayName.replace(' Meeting', '')}
                          <ArrowRight className="h-3 w-3 text-red-700 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all animate-fade-in" />
                        </span>
                        <span className="text-[9px] text-zinc-500 leading-normal truncate w-full">{sample.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag & Drop File Zone */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    <Upload className="h-3.5 w-3.5 text-red-700 dark:text-red-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">Document Upload</h2>
                  </div>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[85px] ${
                      isDragActive 
                        ? 'border-red-600 bg-red-50/50 dark:border-red-500 dark:bg-red-950/20' 
                        : uploadedFile 
                          ? 'border-emerald-600/50 bg-emerald-50/40 dark:bg-emerald-950/20' 
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40 shadow-2xs'
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
                      <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                        <RefreshCw className="h-5 w-5 text-red-700 dark:text-red-400 animate-spin" />
                        <span className="text-xs font-semibold">Reading document...</span>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{uploadedFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFile();
                          }}
                          className="mt-1 px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1 transition"
                        >
                          <Trash2 className="h-3 w-3" /> Clear
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-4.5 w-4.5 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Upload existing .docx minutes or notes</span>
                        <span className="text-[10px] text-zinc-400">Click or drag & drop</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw Notes box */}
                <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <label htmlFor="raw-notes-input" className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">
                      Meeting Notes / Fast Shorthand
                    </label>
                    <div className="text-[10px] text-zinc-400 font-medium font-mono">
                      {rawNotes ? `${rawNotes.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
                    </div>
                  </div>
                  <textarea
                    id="raw-notes-input"
                    placeholder="Type or paste your raw notes, assembly shorthand, transcript, or agenda items here..."
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
                    className="w-full flex-1 min-h-[190px] p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-sans focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 dark:focus:border-red-500 dark:focus:ring-red-500 transition resize-none placeholder-zinc-400 dark:placeholder-zinc-600 shadow-2xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeSidebarTab === 'metadata' && (
              <div className="space-y-5">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    <Layers className="h-3.5 w-3.5 text-red-700 dark:text-red-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">Meeting Details</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-title">
                        <FileText className="h-3 w-3" /> Meeting Title
                      </label>
                      <input
                        id="meeting-title"
                        type="text"
                        placeholder="e.g., 2nd Legislative Meeting"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-date">
                        <Calendar className="h-3 w-3" /> Date & Time
                      </label>
                      <input
                        id="meeting-date"
                        type="text"
                        placeholder="e.g., October 16, 2026 at 2:00 PM"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-chair">
                        <User className="h-3 w-3" /> Presiding Officer / Chair
                      </label>
                      <input
                        id="meeting-chair"
                        type="text"
                        placeholder="e.g., Hon. Juan Dela Cruz"
                        value={chair}
                        onChange={(e) => setChair(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5" htmlFor="meeting-secretary">
                        <Users className="h-3 w-3" /> Secretary / Note Taker
                      </label>
                      <input
                        id="meeting-secretary"
                        type="text"
                        placeholder="e.g., Hon. Maria Santos"
                        value={secretary}
                        onChange={(e) => setSecretary(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Signatories Configuration Section */}
                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-red-700 dark:text-red-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">Custom Signatories</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSignatory}
                      className="text-xxs px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50 font-bold transition flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {signatories.map((sig, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 relative group shadow-2xs">
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <input
                            type="text"
                            placeholder="Label"
                            className="px-2 py-1 text-[10px] rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500"
                            value={sig.label}
                            onChange={(e) => handleSignatoryChange(idx, 'label', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Full Name"
                            className="px-2 py-1 text-[10px] rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500"
                            value={sig.name}
                            onChange={(e) => handleSignatoryChange(idx, 'name', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Title/Role"
                            className="px-2 py-1 text-[10px] rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500"
                            value={sig.role}
                            onChange={(e) => handleSignatoryChange(idx, 'role', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSignatory(idx)}
                          className="p-1 text-zinc-400 hover:text-red-600 rounded transition active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSidebarTab === 'audio' && (
              <div className="space-y-5">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    <Mic className="h-3.5 w-3.5 text-red-700 dark:text-red-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400">Voice & Audio Transcription</h2>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Convert speech and recordings directly to raw meeting notes text. Record live meetings via dictation or upload audio files for AI transcription.
                  </p>

                  {/* Live Recording Card */}
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2.5 w-full shadow-2xs">
                    <div className="bg-red-50 dark:bg-red-950/40 p-2.5 rounded-full text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/40">
                      <Mic className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Live Meeting Dictation</span>
                    <span className="text-[10px] text-zinc-500 text-center max-w-[250px]">Dictate directly in the browser to append transcripts in real-time.</span>
                    <button 
                      type="button"
                      onClick={toggleMicrophone} 
                      className={`w-full py-2 px-4 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5 ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                          : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                  </div>

                  {/* Audio File Upload Card */}
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2.5 w-full shadow-2xs">
                    <div className="bg-red-50 dark:bg-red-950/40 p-2.5 rounded-full text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/40">
                      <FileAudio className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AI File Transcription</span>
                    <span className="text-[10px] text-zinc-500 text-center max-w-[250px]">Upload meeting audio (MP3/WAV/M4A) to transcribe with Gemini AI.</span>
                    <button 
                      type="button"
                      onClick={() => audioInputRef.current?.click()} 
                      className="w-full py-2 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-850 transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Upload className="h-3.5 w-3.5 text-zinc-500" /> Select Audio File
                    </button>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Dashboard Footer Actions (Always Visible) */}
          <div className="space-y-3 pt-3.5 border-t border-zinc-200 dark:border-zinc-800/80 mt-auto shrink-0 bg-transparent">
            {/* Feedback Messages */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-xs flex items-start gap-2.5 animate-fade-in shadow-2xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs flex items-start gap-2.5 animate-fade-in shadow-2xs">
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Generate Button - Minimal Sleek High-Contrast with red sparkle */}
            <button
              onClick={handleGenerateMinutes}
              disabled={isLoading || !rawNotes.trim()}
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold disabled:bg-zinc-100 dark:disabled:bg-zinc-900 disabled:text-zinc-400 dark:disabled:text-zinc-650 disabled:cursor-not-allowed transition duration-200 active:scale-99 shadow-xs flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-red-500 dark:text-red-600" />
                  <span>AI Secretary is writing minutes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-red-500 dark:text-red-600" />
                  <span>Generate structured MoM</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Panel: Live Preview & Export (Minimal White Canvas) */}
        <section className={`flex-1 h-auto md:h-full flex flex-col bg-zinc-100/50 dark:bg-[#0a0a0c] relative ${mobileTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Header toolbar */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 shadow-2xs">
            {/* View Switcher Tabs */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setActiveTab('preview')}
                disabled={!minutes}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'preview' 
                    ? 'bg-white dark:bg-zinc-900 text-red-800 dark:text-red-400 shadow-2xs border border-zinc-200/80 dark:border-zinc-700 font-bold' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Formatted Minutes
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                disabled={!minutes}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'edit' 
                    ? 'bg-white dark:bg-zinc-900 text-red-800 dark:text-red-400 shadow-2xs border border-zinc-200/80 dark:border-zinc-700 font-bold' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Markdown
              </button>
            </div>

            {/* Export options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Configure Google Docs integration"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-350 active:scale-95 transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>GDocs Settings</span>
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!minutes}
                title="Copy markdown to clipboard"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-350 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={directToGoogleDocs}
                disabled={!minutes}
                title="Export directly to Google Docs"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-bold shadow-2xs"
              >
                <FileText className="h-3.5 w-3.5 text-red-700 dark:text-red-400" />
                <span>Docs</span>
              </button>
              <button
                onClick={downloadMarkdown}
                disabled={!minutes}
                title="Download as Markdown (.md)"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>MD</span>
              </button>
              <button
                onClick={downloadPDF}
                disabled={!minutes}
                title="Download formatted PDF"
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Preview/Edit Content Area - Granola Paper View */}
          <div className="flex-1 md:overflow-y-auto p-4 md:p-8 min-h-[400px] md:min-h-0">
            {isLoading ? (
              // Pulse Skeleton Screen
              <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 md:p-12 shadow-xs space-y-6 animate-pulse">
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4"></div>
                <div className="h-4 bg-zinc-150 dark:bg-zinc-850 rounded-md w-1/3 mt-2"></div>
                <hr className="border-zinc-200 dark:border-zinc-800 my-6" />
                <div className="space-y-4">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/4"></div>
                  <div className="space-y-2 pl-4">
                    <div className="h-3.5 bg-zinc-150 dark:bg-zinc-850 rounded-md w-5/6"></div>
                    <div className="h-3.5 bg-zinc-150 dark:bg-zinc-850 rounded-md w-4/6"></div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3"></div>
                  <div className="space-y-2 pl-4">
                    <div className="h-3.5 bg-zinc-150 dark:bg-zinc-850 rounded-md w-full"></div>
                    <div className="h-3.5 bg-zinc-150 dark:bg-zinc-850 rounded-md w-11/12"></div>
                    <div className="h-3.5 bg-zinc-150 dark:bg-zinc-850 rounded-md w-4/5"></div>
                  </div>
                </div>
              </div>
            ) : minutes ? (
              activeTab === 'preview' ? (
                // Styled Markdown Viewer in Clean Paper Sheet
                <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-12 shadow-sm space-y-6">
                  {attendanceTally && (
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
                       <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="h-4 w-4" /> Attendance Tally & Quorum Verification
                        </h4>
                        {(() => {
                          const activeCount = attendanceTally.present + attendanceTally.late;
                          const required = Math.floor(attendanceTally.total / 2) + 1;
                          const hasQuorum = activeCount >= required;
                          return (
                            <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                              hasQuorum 
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                            }`}>
                              {hasQuorum ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {hasQuorum ? 'Quorum Declared' : 'No Quorum'} ({activeCount}/{attendanceTally.total})
                            </span>
                          );
                        })()}
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800/60 shadow-2xs">
                          <div className="text-[10px] font-semibold text-zinc-500 uppercase">Total</div>
                          <div className="text-base font-bold text-zinc-800 dark:text-zinc-200">{attendanceTally.total}</div>
                        </div>
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Present</div>
                          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{attendanceTally.present}</div>
                        </div>
                        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Late</div>
                          <div className="text-base font-bold text-amber-600 dark:text-amber-400">{attendanceTally.late}</div>
                        </div>
                        <div className="bg-blue-50/60 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                          <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase">Excused</div>
                          <div className="text-base font-bold text-blue-600 dark:text-blue-400">{attendanceTally.excused}</div>
                        </div>
                        <div className="bg-rose-50/60 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200/50 dark:border-rose-800/30">
                          <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Absent</div>
                          <div className="text-base font-bold text-rose-600 dark:text-rose-400">{attendanceTally.absent}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`prose ${theme === 'dark' ? 'prose-invert prose-zinc' : 'prose-slate'} max-w-none pb-8 selection:bg-red-500/20`}>
                    <ReactMarkdown components={markdownComponents}>
                      {minutes}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                // Raw Markdown Editor
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                  <textarea
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full flex-1 min-h-[450px] p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition resize-none leading-relaxed shadow-sm"
                  />
                  <p className="text-xxs text-zinc-400 dark:text-zinc-500 mt-2 font-mono">
                    Note: Editing here updates the active preview state. Downloading or copying will export these current changes.
                  </p>
                </div>
              )
            ) : (
              // Empty State Placeholder
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl mb-4 relative shadow-xs group hover:border-zinc-350 dark:hover:border-zinc-700 transition">
                  <FileText className="h-10 w-10 text-zinc-400 group-hover:text-red-700 dark:group-hover:text-red-400 transition" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Minutes Generated Yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
                  Select a <strong className="text-red-800 dark:text-red-400 font-semibold">Meeting Recipe</strong> or paste rough shorthand notes on the left panel to generate your structured meeting minutes.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-2.5 max-w-xs text-left w-full">
                  <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <span className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xxs font-bold text-red-700 dark:text-red-400">1</span>
                    <span>Choose a recipe or upload .docx</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <span className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xxs font-bold text-red-700 dark:text-red-400">2</span>
                    <span>Type fast shorthand or dictation notes</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <span className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xxs font-bold text-red-700 dark:text-red-400">3</span>
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
