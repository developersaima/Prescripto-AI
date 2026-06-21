import { z } from "zod";

const medicineCategorySchema = z
  .enum(["Antibiotic", "Vitamin", "Calcium", "Gastric", "Others"])
  .catch("Others");

const medicineSchema = z.object({
  name: z.string().default(""),
  dosage: z.string().default(""),
  duration: z.string().default(""),
  category: medicineCategorySchema,
});

const testResultSchema = z.object({
  testName: z.string().default(""),
  value: z.string().default(""),
});

export const medicalRecordSchema = z.object({
  recordId: z.string().default(() => crypto.randomUUID()),
  patientId: z.string().default("P-UNKNOWN"),
  date: z.string().default(""),
  doctorName: z.string().default(""),
  patientCase: z.string().default(""),
  respiratoryRate: z.string().default(""),
  medicines: z.array(medicineSchema).default([]),
  testResults: z.array(testResultSchema).default([]),
});

export const auditLogSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().min(1),
  status: z.enum(["Success", "Failed"]),
  fileName: z.string().min(1),
});

export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;