# Prescripto-AI

AI-powered prescription and health analytics management system. Upload medical documents, extract structured health data with Gemini AI, and analyze patient history across three dedicated portals.

---

## Features

- **Patient Portal** — Drag-and-drop upload for prescription images or text. Gemini AI extracts medicines, diagnoses, and test results into structured JSON.
- **Doctor Portal** — Search patients by ID. View lifetime antibiotic tracker, medication categories, and diagnostic test history.
- **Admin Portal** — Monitor system audit logs, inject mock datasets, and flush localStorage.
- **Dark / Light mode** — Smooth theme switching via `next-themes`.
- **Offline persistence** — All data stored in browser `localStorage`. No external database required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | HeroUI v3 |
| AI Engine | Google Gemini 2.5 Flash |
| Validation | Zod |
| Forms | React Hook Form |
| Notifications | React Hot Toast |
| Icons | react-icons/fa6 |
| Theme | next-themes |

---

## Folder Structure

```
src/
├── app/
│   ├── admin/page.tsx       # Admin portal
│   ├── doctor/page.tsx      # Doctor analytics dashboard
│   ├── patient/page.tsx     # Patient upload portal
│   ├── globals.css          # Tailwind v4 tokens + dark mode
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Landing page
├── components/
│   └── Navbar.tsx           # Responsive navigation
├── hooks/
│   └── useLocalStorage.ts   # Type-safe storage hook
├── providers/
│   └── ThemeProvider.tsx    # next-themes wrapper
├── schemas/
│   └── medicalRecord.ts     # Zod runtime validation schemas
├── services/
│   └── gemini.ts            # Gemini AI integration
└── types/
    └── index.ts             # Shared TypeScript interfaces
```

---

## Installation

```bash
git clone https://github.com/your-username/prescripto-ai.git
cd prescripto-ai
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your Gemini API key from: https://aistudio.google.com/app/apikey

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for Production

```bash
npm run build
npm run start
```

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Connect the repository to [Vercel](https://vercel.com).
3. Add environment variables in the Vercel dashboard under **Settings > Environment Variables**:
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)
4. Deploy.

---

## API Setup

### Gemini API

The service uses `@google/generative-ai` with the `gemini-2.5-flash` model.

- **Text input**: Paste prescription text directly into the form.
- **Image input**: Upload PNG or JPEG prescription images.
- **Response**: AI returns a strict JSON object validated by Zod at runtime.

The AI prompt instructs the model to return only valid JSON matching the `MedicalRecord` interface. If the AI returns invalid JSON or fails schema validation, the error is logged to the audit system.

---

## Data Schema

```typescript
interface MedicalRecord {
  recordId: string;
  patientId: string;
  date: string;
  doctorName: string;
  patientCase: string;
  respiratoryRate: string;
  medicines: Array<{
    name: string;
    dosage: string;
    duration: string;
    category: "Antibiotic" | "Vitamin" | "Calcium" | "Gastric" | "Others";
  }>;
  testResults: Array<{
    testName: string;
    value: string;
  }>;
}
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| AI returns empty result | Check `NEXT_PUBLIC_GEMINI_API_KEY` is set correctly |
| Dark mode flashes on load | `suppressHydrationWarning` is set on `<html>` — ensure ThemeProvider wraps the app |
| localStorage not persisting | Check browser privacy settings; some browsers block storage in private mode |
| Image upload fails | Only PNG and JPEG are supported for direct AI image parsing |

---

## Future Improvements

- PDF text extraction using a server-side parser (e.g., `pdf-parse`)
- Patient authentication with NextAuth.js
- Cloud database sync (Supabase or Firebase)
- Export health records as PDF
- Medication reminder notifications
- Multi-language support (Bengali and English)
