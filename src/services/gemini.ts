import { GoogleGenerativeAI } from "@google/generative-ai";
import { medicalRecordSchema } from "@/schemas/medicalRecord";
import type { MedicalRecord, AuditLog } from "@/types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");

const SYSTEM_PROMPT = `You are a medical document parser. 
Analyze the provided prescription or medical report text/image and extract structured data.
Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text.
The JSON must match this exact schema:
{
  "recordId": "auto-generated uuid string",
  "patientId": "extracted or inferred patient id, default to P-UNKNOWN",
  "date": "YYYY-MM-DD format consultation date",
  "doctorName": "full doctor name with title",
  "patientCase": "brief summary of symptoms and diagnosis",
  "respiratoryRate": "RR value if present, otherwise empty string",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dosage string e.g. 500mg twice daily",
      "duration": "duration string e.g. 7 days",
      "category": "one of: Antibiotic, Vitamin, Calcium, Gastric, Others"
    }
  ],
  "testResults": [
    {
      "testName": "test name",
      "value": "result value with unit"
    }
  ]
}
If a field cannot be found, use empty string for strings and empty array for arrays.`;

export async function parsePrescriptionText(
  text: string,
  patientId: string
): Promise<{ record: MedicalRecord; log: AuditLog }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${SYSTEM_PROMPT}\n\nDocument content:\n${text}\n\nUse patientId: "${patientId}"`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  return parseAIResponse(rawText, "text-input.txt");
}

export async function parsePrescriptionImage(
  base64Data: string,
  mimeType: "image/png" | "image/jpeg",
  fileName: string,
  patientId: string
): Promise<{ record: MedicalRecord; log: AuditLog }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${SYSTEM_PROMPT}\n\nUse patientId: "${patientId}"`;

  const result = await model.generateContent([
    { inlineData: { data: base64Data, mimeType } },
    prompt,
  ]);

  const rawText = result.response.text();
  return parseAIResponse(rawText, fileName);
}

function parseAIResponse(
  rawText: string,
  fileName: string
): { record: MedicalRecord; log: AuditLog } {
  const logId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const failLog: AuditLog = {
      id: logId,
      timestamp,
      status: "Failed",
      fileName,
    };
    throw Object.assign(new Error("Invalid JSON from AI"), { log: failLog });
  }

  let validated: MedicalRecord;
  try {
    validated = medicalRecordSchema.parse(parsed);
  } catch (schemaErr: unknown) {
    const failLog: AuditLog = {
      id: logId,
      timestamp,
      status: "Failed",
      fileName,
    };
    const errorMsg = schemaErr instanceof Error ? schemaErr.message : "Schema validation failed";
    throw Object.assign(new Error(`Schema validation failed: ${errorMsg}`), {
      log: failLog,
    });
  }

  const successLog: AuditLog = {
    id: logId,
    timestamp,
    status: "Success",
    fileName,
  };
  return { record: validated, log: successLog };
}
