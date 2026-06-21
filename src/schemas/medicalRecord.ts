import { z } from "zod";

const medicineCategorySchema = z.enum([
  "Antibiotic",
  "Vitamin",
  "Calcium",
  "Gastric",
  "Others",
]);

const medicineSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  duration: z.string().min(1),
  category: medicineCategorySchema,
});

const testResultSchema = z.object({
  testName: z.string().min(1),
  value: z.string().min(1),
});

export const medicalRecordSchema = z.object({
  recordId: z.string().min(1),
  patientId: z.string().min(1),
  date: z.string().min(1),
  doctorName: z.string().min(1),
  patientCase: z.string().min(1),
  respiratoryRate: z.string(),
  medicines: z.array(medicineSchema),
  testResults: z.array(testResultSchema),
});

export const auditLogSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().min(1),
  status: z.enum(["Success", "Failed"]),
  fileName: z.string().min(1),
});

export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;
