# Smart MoM Generator 🏛️

An AI-powered Minutes of the Meeting (MoM) generator built with **Next.js**, **Tailwind CSS**, and the **Google Gemini API**, tailored for Supreme Student Governments (SSG), student councils, and legislative bodies.

---

## ✨ Features

- 🤖 **AI Deliberation & Synthesis**: Powered by Google Gemini to transform raw notes, transcripts, or uploaded files into comprehensive, narrative meeting minutes.
- 🏛️ **Legislative Standard Formatting**:
  - Formal Title Block and Invocation.
  - Roll Call and Quorum declaration.
  - Alphabetical Agenda item hierarchy (`A.`, `B.`, `C.`...) matching discussion sections.
  - Narrative discussion summaries with explicit motion records (*"A motion to approve..."*).
  - Proper Attestation and Signature blocks (Secretary & Presiding Officer).
- 📑 **Google Docs & PDF Export**:
  - One-click export to Google Docs (direct clipboard rich-text or Google Apps Script integration).
  - Client-side printable PDF generation with precise typography and spacing.
- 🎙️ **Audio Transcription & Word Doc Parser**:
  - Supports transcribing meeting audio recordings using Gemini Flash.
  - Supports uploading existing `.docx` minutes to inspect, edit, or regenerate.
- 🌐 **Standalone Portable Runner**: Includes `generator.html` for single-file, client-side usage.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Huginn45/ssg-mom-generator.git
   cd mom-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key in `.env.local`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHuginn45%2Fssg-mom-generator&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20Key%20from%20Google%20AI%20Studio)

### Method 1: 1-Click / Dashboard Import (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select **`Huginn45/ssg-mom-generator`**.
3. Under **Environment Variables**, add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
4. Click **Deploy**. Vercel will build and host the application on a free `.vercel.app` domain. Any future pushes to `main` will automatically trigger a new deployment.

### Method 2: Vercel CLI
If you prefer deploying directly from your terminal:
```bash
# Log in to Vercel
npx vercel login

# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Models**: Google Gemini (`@google/genai`)
- **Document Processing**: `mammoth.js` (Word `.docx` parsing), `jspdf` (PDF generation), `marked` (Markdown parsing)
- **Icons**: Lucide React
