"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
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
];

const MOCK_PATIENTS: PatientProfile[] = [
  { patientId: "P-DEMO001", name: "Rashed Karim", age: 34, status: "Active" },
  { patientId: "P-DEMO002", name: "Sumaiya Islam", age: 28, status: "Active" },
];

const MOCK_DOCTORS: DoctorProfile[] = [
  { doctorId: "D-001", name: "Dr. Anika Rahman", specialty: "General Medicine", status: "Active" },
  { doctorId: "D-002", name: "Dr. Karim Hossain", specialty: "Internal Medicine", status: "Active" },
];

export default function AdminPage() {
  const [records, setRecords, clearRecords] = useLocalStorage<MedicalRecord[]>(
    "prescripto_records",
    []
  );
  const [auditLogs, , clearAuditLogs] = useLocalStorage<AuditLog[]>(
    "prescripto_audit",
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [pendingAction, setPendingAction] = useState<
    "clear_all" | "inject_mock" | null
  >(null);

  function confirmAction(action: "clear_all" | "inject_mock") {
    setPendingAction(action);
    onOpen();
  }

  function executeAction() {
    if (pendingAction === "clear_all") {
      clearRecords();
      clearAuditLogs();
      toast.success("All localStorage data cleared.");
    } else if (pendingAction === "inject_mock") {
      setRecords((prev) => [...MOCK_RECORDS, ...prev]);
      toast.success("Mock patient dataset injected.");
    }
    onClose();
    setPendingAction(null);
  }

  const successCount = auditLogs.filter((l) => l.status === "Success").length;
  const failCount = auditLogs.filter((l) => l.status === "Failed").length;

  return (
    <div
      className="min-h-screen py-10"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Admin Portal
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            System audit logs, data management, and mock configuration tools.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FaDatabase}
            label="Total Records"
            value={records.length}
            color="var(--color-brand)"
          />
          <StatCard
            icon={FaClockRotateLeft}
            label="Audit Events"
            value={auditLogs.length}
            color="var(--color-text-secondary)"
          />
          <StatCard
            icon={FaCircleCheck}
            label="Successful Parses"
            value={successCount}
            color="var(--color-success)"
          />
          <StatCard
            icon={FaCircleXmark}
            label="Failed Parses"
            value={failCount}
            color="var(--color-danger)"
          />
        </div>

        {/* Controls */}
        <Card
          className="border mb-8"
          style={{
            backgroundColor: "var(--color-surface-secondary)",
            borderColor: "var(--color-border)",
          }}
        >
          <CardHeader className="flex items-center gap-2">
            <FaShieldHalved
              className="w-4 h-4"
              style={{ color: "var(--color-brand)" }}
            />
            <h2
              className="font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              System Controls
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              <Button
                startContent={<FaFloppyDisk className="w-4 h-4" />}
                onPress={() => confirmAction("inject_mock")}
                style={{
                  backgroundColor: "var(--color-brand)",
                  color: "#ffffff",
                }}
                className="font-semibold"
              >
                Inject Mock Dataset
              </Button>
              <Button
                startContent={<FaTrash className="w-4 h-4" />}
                onPress={() => confirmAction("clear_all")}
                color="danger"
                variant="flat"
                className="font-semibold"
              >
                Clear All Data
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Mock profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Patient directory */}
          <Card
            className="border"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <CardHeader className="flex items-center gap-2">
              <FaUserInjured
                className="w-4 h-4"
                style={{ color: "var(--color-brand)" }}
              />
              <h2
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Patient Directory
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {MOCK_PATIENTS.map((p) => (
                <div
                  key={p.patientId}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {p.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {p.patientId} · Age {p.age}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    color={p.status === "Active" ? "success" : "danger"}
                    variant="flat"
                  >
                    {p.status}
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Doctor directory */}
          <Card
            className="border"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <CardHeader className="flex items-center gap-2">
              <FaUserDoctor
                className="w-4 h-4"
                style={{ color: "var(--color-brand)" }}
              />
              <h2
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Doctor Directory
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {MOCK_DOCTORS.map((d) => (
                <div
                  key={d.doctorId}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {d.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {d.specialty}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    color={d.status === "Active" ? "success" : "danger"}
                    variant="flat"
                  >
                    {d.status}
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Audit log table */}
        <Card
          className="border"
          style={{
            backgroundColor: "var(--color-surface-secondary)",
            borderColor: "var(--color-border)",
          }}
        >
          <CardHeader className="flex items-center gap-2">
            <FaClockRotateLeft
              className="w-4 h-4"
              style={{ color: "var(--color-brand)" }}
            />
            <h2
              className="font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              System Audit Log
            </h2>
          </CardHeader>
          <CardBody>
            {auditLogs.length === 0 ? (
              <div
                className="text-center py-10"
                style={{ color: "var(--color-text-muted)" }}
              >
                <FaClockRotateLeft className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No audit events recorded yet.</p>
              </div>
            ) : (
              <Table
                aria-label="Audit log table"
                removeWrapper
                classNames={{ th: "text-xs font-medium" }}
              >
                <TableHeader>
                  <TableColumn>TIMESTAMP</TableColumn>
                  <TableColumn>FILE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {log.fileName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={log.status === "Success" ? "success" : "danger"}
                          variant="flat"
                          startContent={
                            log.status === "Success" ? (
                              <FaCircleCheck className="w-3 h-3" />
                            ) : (
                              <FaCircleXmark className="w-3 h-3" />
                            )
                          }
                        >
                          {log.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Confirm modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader>
            <p style={{ color: "var(--color-text-primary)" }}>Confirm Action</p>
          </ModalHeader>
          <ModalBody>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {pendingAction === "clear_all"
                ? "This will permanently delete all records and audit logs from localStorage. This cannot be undone."
                : "This will inject sample patient data into localStorage for testing purposes."}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color={pendingAction === "clear_all" ? "danger" : "primary"}
              onPress={executeAction}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card
      className="border"
      style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      <CardBody className="p-4">
        <Icon className="w-5 h-5 mb-3" style={{ color }} />
        <p
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {value}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {label}
        </p>
      </CardBody>
    </Card>
  );
}

