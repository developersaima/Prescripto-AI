import { GoogleGenerativeAI } from "@google/generative-ai";
import { medicalRecordSchema } from "@/schemas/medicalRecord";
import type { MedicalRecord, AuditLog } from "@/types";
import { v4 as uuidv4 } from "uuid";

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
  "recordId": "${uuidv4()}",
  "patientId": "use the patientId provided in the prompt exactly as given",
  "date": "YYYY-MM-DD format consultation date, or empty string if not found",
  "doctorName": "full doctor name with title, or empty string if not found",
  "patientCase": "brief summary of symptoms and diagnosis, or empty string if not found",
  "respiratoryRate": "RR value if present, otherwise empty string",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dosage string e.g. 500mg twice daily, or empty string if not found",
      "duration": "duration string e.g. 7 days, or empty string if not found",
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
Rules:
- NEVER leave out any field. Use empty string "" for missing string fields, empty array [] for missing arrays.
- For medicines, always include all 4 fields even if some are empty strings.
- The patientId in the output MUST be exactly the one provided in the prompt.
- Do NOT invent or guess values. Use empty string if unsure.
- Return ONLY the JSON object, nothing else.`;

export async function parsePrescriptionText(
  text: string,
  patientId: string
): Promise<{ record: MedicalRecord; log: AuditLog }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${SYSTEM_PROMPT}\n\nPatient ID to use: "${patientId}"\n\nDocument content:\n${text}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  return parseAIResponse(rawText, "text-input.txt", patientId);
}

export async function parsePrescriptionImage(
  base64Data: string,
  mimeType: "image/png" | "image/jpeg",
  fileName: string,
  patientId: string
): Promise<{ record: MedicalRecord; log: AuditLog }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${SYSTEM_PROMPT}\n\nPatient ID to use: "${patientId}"`;

  const result = await model.generateContent([
    { inlineData: { data: base64Data, mimeType } },
    prompt,
  ]);

  const rawText = result.response.text();
  return parseAIResponse(rawText, fileName, patientId);
}

function parseAIResponse(
  rawText: string,
  fileName: string,
  patientId: string
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

  // Force correct patientId and a fresh recordId regardless of what AI returned
  if (typeof parsed === "object" && parsed !== null) {
    (parsed as Record<string, unknown>).patientId = patientId;
    (parsed as Record<string, unknown>).recordId = uuidv4();
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
    const errorMsg =
      schemaErr instanceof Error
        ? schemaErr.message
        : "Schema validation failed";
    throw Object.assign(
      new Error(`Schema validation failed: ${errorMsg}`),
      { log: failLog }
    );
  }

  const successLog: AuditLog = {
    id: logId,
    timestamp,
    status: "Success",
    fileName,
  };

  return { record: validated, log: successLog };
}