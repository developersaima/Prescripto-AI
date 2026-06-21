export type MedicineCategory =
  | "Antibiotic"
  | "Vitamin"
  | "Calcium"
  | "Gastric"
  | "Others";

export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  category: MedicineCategory;
}

export interface TestResult {
  testName: string;
  value: string;
}

export interface MedicalRecord {
  recordId: string;
  patientId: string;
  date: string;
  doctorName: string;
  patientCase: string;
  respiratoryRate: string;
  medicines: Medicine[];
  testResults: TestResult[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  status: "Success" | "Failed";
  fileName: string;
}

export interface PatientProfile {
  patientId: string;
  name: string;
  age: number;
  status: "Active" | "Suspended";
}

export interface DoctorProfile {
  doctorId: string;
  name: string;
  specialty: string;
  status: "Active" | "Suspended";
}
