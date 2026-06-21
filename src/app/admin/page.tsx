"use client";

import { useState, useMemo } from "react";
import { Button, Card } from "@heroui/react";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {
  FaShieldHalved,
  FaTrash,
  FaFloppyDisk,
  FaCircleCheck,
  FaCircleXmark,
  FaClockRotateLeft,
  FaDatabase,
  FaUserInjured,
  FaUserDoctor,
} from "react-icons/fa6";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AuditLog, MedicalRecord, PatientProfile, DoctorProfile } from "@/types";
import { v4 as uuidv4 } from "uuid";

const MOCK_RECORDS: MedicalRecord[] = [
  {
    recordId: uuidv4(),
    patientId: "P-DEMO001",
    date: "2024-03-15",
    doctorName: "Dr. Anika Rahman",
    patientCase: "Upper respiratory tract infection with mild fever and cough.",
    respiratoryRate: "18 breaths/min",
    medicines: [
      { name: "Amoxicillin", dosage: "500mg", duration: "7 days", category: "Antibiotic" },
      { name: "Paracetamol", dosage: "500mg", duration: "5 days", category: "Others" },
      { name: "Vitamin C", dosage: "1000mg", duration: "14 days", category: "Vitamin" },
    ],
    testResults: [
      { testName: "CBC - WBC", value: "11.2 x10^3/uL" },
      { testName: "CRP", value: "24 mg/L" },
    ],
  },
  {
    recordId: uuidv4(),
    patientId: "P-DEMO001",
    date: "2024-06-22",
    doctorName: "Dr. Karim Hossain",
    patientCase: "Routine checkup. Mild vitamin D deficiency noted.",
    respiratoryRate: "16 breaths/min",
    medicines: [
      { name: "Vitamin D3", dosage: "5000 IU", duration: "30 days", category: "Vitamin" },
      { name: "Calcium Carbonate", dosage: "500mg", duration: "30 days", category: "Calcium" },
      { name: "Omeprazole", dosage: "20mg", duration: "14 days", category: "Gastric" },
    ],
    testResults: [
      { testName: "Vitamin D (25-OH)", value: "18 ng/mL" },
      { testName: "Calcium", value: "8.9 mg/dL" },
    ],
  },
  {
    recordId: uuidv4(),
    patientId: "P-DEMO002",
    date: "2024-05-10",
    doctorName: "Dr. Anika Rahman",
    patientCase: "Seasonal allergy symptoms with sneezing and runny nose.",
    respiratoryRate: "16 breaths/min",
    medicines: [
      { name: "Cetirizine", dosage: "10mg", duration: "7 days", category: "Others" },
      { name: "Fluticasone", dosage: "50mcg", duration: "14 days", category: "Others" },
    ],
    testResults: [
      { testName: "IgE", value: "245 IU/mL" },
    ],
  },
  {
    recordId: uuidv4(),
    patientId: "P-DEMO003",
    date: "2024-07-01",
    doctorName: "Dr. Karim Hossain",
    patientCase: "Hypertension follow-up. Blood pressure elevated.",
    respiratoryRate: "18 breaths/min",
    medicines: [
      { name: "Amlodipine", dosage: "5mg", duration: "30 days", category: "Others" },
      { name: "Lisinopril", dosage: "10mg", duration: "30 days", category: "Others" },
    ],
    testResults: [
      { testName: "Blood Pressure", value: "145/92 mmHg" },
    ],
  },
  {
    recordId: uuidv4(),
    patientId: "P-DEMO004",
    date: "2024-07-15",
    doctorName: "Dr. Anika Rahman",
    patientCase: "Type 2 diabetes management. Blood sugar levels high.",
    respiratoryRate: "16 breaths/min",
    medicines: [
      { name: "Metformin", dosage: "500mg", duration: "30 days", category: "Others" },
      { name: "Glimepiride", dosage: "2mg", duration: "30 days", category: "Others" },
    ],
    testResults: [
      { testName: "Fasting Blood Sugar", value: "168 mg/dL" },
      { testName: "HbA1c", value: "7.8%" },
    ],
  },
];

const MOCK_PATIENTS: PatientProfile[] = [
  { patientId: "P-DEMO001", name: "Rashed Karim", age: 34, status: "Active" },
  { patientId: "P-DEMO002", name: "Sumaiya Islam", age: 28, status: "Active" },
  { patientId: "P-DEMO003", name: "Abdul Malik", age: 45, status: "Active" },
  { patientId: "P-DEMO004", name: "Fatima Begum", age: 52, status: "Active" },
];

const MOCK_DOCTORS: DoctorProfile[] = [
  { doctorId: "D-001", name: "Dr. Anika Rahman", specialty: "General Medicine", status: "Active" },
  { doctorId: "D-002", name: "Dr. Karim Hossain", specialty: "Internal Medicine", status: "Active" },
];

export default function AdminPage() {
  const [records, setRecords, clearRecords] = useLocalStorage<MedicalRecord[]>("prescripto_records", []);
  const [auditLogs, setAuditLogs, clearAuditLogs] = useLocalStorage<AuditLog[]>("prescripto_audit", []);
  const [patients, setPatients] = useLocalStorage<PatientProfile[]>("prescripto_patients", []);
  const [doctors, setDoctors] = useLocalStorage<DoctorProfile[]>("prescripto_doctors", []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"clear_all" | "inject_mock" | null>(null);

  const successCount = auditLogs.filter((l) => l.status === "Success").length;
  const failCount = auditLogs.filter((l) => l.status === "Failed").length;

  // Extract unique patients from records (only from localStorage)
  const extractedPatients = useMemo(() => {
    const patientMap = new Map<string, PatientProfile>();
    
    records.forEach(record => {
      if (!patientMap.has(record.patientId)) {
        // Check if patient exists in stored patients
        const existingPatient = patients.find(p => p.patientId === record.patientId);
        if (existingPatient) {
          patientMap.set(record.patientId, existingPatient);
        } else {
          // Create a new patient entry from record
          const nameMatch = record.patientCase.match(/patient\s+([A-Za-z\s]+)/i);
          const name = nameMatch ? nameMatch[1].trim() : `Patient ${record.patientId}`;
          patientMap.set(record.patientId, {
            patientId: record.patientId,
            name: name,
            age: 0,
            status: "Active"
          });
        }
      }
    });
    
    return Array.from(patientMap.values());
  }, [records, patients]);

  // Extract unique doctors from records (only from localStorage)
  const extractedDoctors = useMemo(() => {
    const doctorMap = new Map<string, DoctorProfile>();
    
    records.forEach(record => {
      const doctorId = record.doctorName.replace(/[^a-zA-Z0-9]/g, '');
      if (!doctorMap.has(doctorId)) {
        // Check if doctor exists in stored doctors
        const existingDoctor = doctors.find(d => d.name === record.doctorName);
        if (existingDoctor) {
          doctorMap.set(doctorId, existingDoctor);
        } else {
          doctorMap.set(doctorId, {
            doctorId: `D-${doctorId}`,
            name: record.doctorName,
            specialty: "General Medicine",
            status: "Active"
          });
        }
      }
    });
    
    return Array.from(doctorMap.values());
  }, [records, doctors]);

  // Use extracted data from localStorage, show empty if no data
  const patientList = useMemo(() => {
    // If there are records, show extracted patients
    if (records.length > 0) {
      return extractedPatients;
    }
    // If no records but patients exist in localStorage, show them
    if (patients.length > 0) {
      return patients;
    }
    // Otherwise show empty array
    return [];
  }, [records, patients, extractedPatients]);

  const doctorList = useMemo(() => {
    // If there are records, show extracted doctors
    if (records.length > 0) {
      return extractedDoctors;
    }
    // If no records but doctors exist in localStorage, show them
    if (doctors.length > 0) {
      return doctors;
    }
    // Otherwise show empty array
    return [];
  }, [records, doctors, extractedDoctors]);

  function confirmAction(action: "clear_all" | "inject_mock") {
    setPendingAction(action);
    setIsModalOpen(true);
  }

  function executeAction() {
    if (pendingAction === "clear_all") {
      // Clear all data from localStorage
      clearRecords();
      clearAuditLogs();
      setPatients([]);
      setDoctors([]);
      toast.success("All localStorage data cleared.");
    } else if (pendingAction === "inject_mock") {
      // Inject mock records
      setRecords((prev) => {
        const existingIds = new Set(prev.map(r => r.recordId));
        const newRecords = MOCK_RECORDS.filter(r => !existingIds.has(r.recordId));
        return [...newRecords, ...prev];
      });

      // Inject mock patients (merge with existing)
      setPatients((prev) => {
        const existingIds = new Set(prev.map(p => p.patientId));
        const newPatients = MOCK_PATIENTS.filter(p => !existingIds.has(p.patientId));
        return [...newPatients, ...prev];
      });

      // Inject mock doctors (merge with existing)
      setDoctors((prev) => {
        const existingIds = new Set(prev.map(d => d.doctorId));
        const newDoctors = MOCK_DOCTORS.filter(d => !existingIds.has(d.doctorId));
        return [...newDoctors, ...prev];
      });

      toast.success("Mock dataset injected successfully.");
    }
    setIsModalOpen(false);
    setPendingAction(null);
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-sm text-gray-600">
            System audit logs, data management, and mock configuration tools.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FaDatabase} label="Total Records" value={records.length} color="#3b82f6" bgColor="#eff6ff" />
          <StatCard icon={FaClockRotateLeft} label="Audit Events" value={auditLogs.length} color="#6b7280" bgColor="#f3f4f6" />
          <StatCard icon={FaCircleCheck} label="Successful Parses" value={successCount} color="#10b981" bgColor="#ecfdf5" />
          <StatCard icon={FaCircleXmark} label="Failed Parses" value={failCount} color="#ef4444" bgColor="#fef2f2" />
        </div>

        <Card className="border border-gray-200 p-5 mb-8 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaShieldHalved className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              System Controls
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onPress={() => confirmAction("inject_mock")}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <FaFloppyDisk className="w-4 h-4" />
              Inject Mock Dataset
            </Button>
            <Button
              onPress={() => confirmAction("clear_all")}
              className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <FaTrash className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-gray-200 p-5 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FaUserInjured className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-900">
                Patient Directory
              </h2>
              <span className="text-xs text-gray-500 ml-auto">
                {patientList.length} patients
              </span>
            </div>
            <div className="space-y-3">
              {patientList.length > 0 ? (
                patientList.map((p) => (
                  <div
                    key={p.patientId}
                    className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.patientId} {p.age > 0 ? `· Age ${p.age}` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaUserInjured className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No patients found</p>
                  <p className="text-xs mt-1">Inject mock data or upload records</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="border border-gray-200 p-5 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FaUserDoctor className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-900">
                Doctor Directory
              </h2>
              <span className="text-xs text-gray-500 ml-auto">
                {doctorList.length} doctors
              </span>
            </div>
            <div className="space-y-3">
              {doctorList.length > 0 ? (
                doctorList.map((d) => (
                  <div
                    key={d.doctorId}
                    className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {d.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {d.specialty}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        d.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaUserDoctor className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No doctors found</p>
                  <p className="text-xs mt-1">Inject mock data or upload records</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="border border-gray-200 p-5 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaClockRotateLeft className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              System Audit Log
            </h2>
            <span className="text-xs text-gray-500 ml-auto">
              {auditLogs.length} events
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FaClockRotateLeft className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No audit events recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      TIMESTAMP
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      FILE
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditLogs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {log.fileName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                            log.status === "Success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.status === "Success" ? (
                            <FaCircleCheck className="w-3 h-3" />
                          ) : (
                            <FaCircleXmark className="w-3 h-3" />
                          )}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-6 shadow-xl bg-white">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Confirm Action
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {pendingAction === "clear_all"
                ? "This will permanently delete all records, patients, doctors and audit logs from localStorage. This cannot be undone."
                : "This will inject sample patient data, doctor data and medical records into localStorage for testing purposes."}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onPress={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onPress={executeAction}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                  pendingAction === "clear_all" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="border border-gray-200 p-4 bg-white shadow-sm">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: bgColor }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
      </p>
      <p className="text-xs mt-0.5 text-gray-600">
        {label}
      </p>
    </Card>
  );
}