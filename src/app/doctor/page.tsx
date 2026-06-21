"use client";

import { useState, useMemo } from "react";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
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
import {
  FaMagnifyingGlass,
  FaUserDoctor,
  FaPills,
  FaBacteria,
  FaDroplet,
  FaVial,
  FaFire,
  FaEye,
  FaChartBar,
} from "react-icons/fa6";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { MedicalRecord } from "@/types";

export default function DoctorPage() {
  const [records] = useLocalStorage<MedicalRecord[]>("prescripto_records", []);
  const [searchId, setSearchId] = useState("");
  const [queriedId, setQueriedId] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const patientRecords = useMemo(() => {
    if (!queriedId) return [];
    return records
      .filter((r) => r.patientId.toLowerCase() === queriedId.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, queriedId]);

  const analytics = useMemo(() => {
    const allMeds = patientRecords.flatMap((r) => r.medicines);
    const antibiotics = allMeds.filter((m) => m.category === "Antibiotic");
    const vitamins = allMeds.filter((m) => m.category === "Vitamin");
    const calcium = allMeds.filter((m) => m.category === "Calcium");
    const gastric = allMeds.filter((m) => m.category === "Gastric");
    const allTests = patientRecords.flatMap((r) =>
      r.testResults.map((t) => ({ ...t, date: r.date }))
    );

    return { antibiotics, vitamins, calcium, gastric, allTests };
  }, [patientRecords]);

  function handleSearch() {
    if (!searchId.trim()) return;
    setQueriedId(searchId.trim());
  }

  function openRecord(record: MedicalRecord) {
    setSelectedRecord(record);
    onOpen();
  }

  return (
    <div
      className="min-h-screen py-10"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Doctor Portal
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Search a patient by ID to view their complete health analytics.
          </p>
        </div>

        <Card
          className="border mb-8"
          style={{
            backgroundColor: "var(--color-surface-secondary)",
            borderColor: "var(--color-border)",
          }}
        >
          <CardBody>
            <div className="flex gap-3">
              <Input
                placeholder="Enter Patient ID (e.g. P-20240001)"
                value={searchId}
                onValueChange={setSearchId}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                variant="bordered"
                size="lg"
                startContent={
                  <FaMagnifyingGlass
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-muted)" }}
                  />
                }
                classNames={{ base: "flex-1" }}
              />
              <Button
                size="lg"
                onPress={handleSearch}
                style={{
                  backgroundColor: "var(--color-brand)",
                  color: "#ffffff",
                }}
                className="font-semibold px-8"
              >
                Search
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* No results */}
        {queriedId && patientRecords.length === 0 && (
          <div
            className="text-center py-20 rounded-2xl border"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-secondary)",
            }}
          >
            <FaUserDoctor
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--color-text-muted)" }}
            />
            <p
              className="font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              No records found for &quot;{queriedId}&quot;
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Ask the patient to upload their prescriptions first.
            </p>
          </div>
        )}

        {patientRecords.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={FaBacteria}
                label="Antibiotics"
                value={analytics.antibiotics.length}
                color="#f97316"
              />
              <StatCard
                icon={FaDroplet}
                label="Vitamins"
                value={analytics.vitamins.length}
                color="#8b5cf6"
              />
              <StatCard
                icon={FaFire}
                label="Calcium"
                value={analytics.calcium.length}
                color="#06b6d4"
              />
              <StatCard
                icon={FaPills}
                label="Gastric"
                value={analytics.gastric.length}
                color="#10b981"
              />
            </div>

            {analytics.antibiotics.length > 0 && (
              <Card
                className="border"
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  borderColor: "var(--color-border)",
                }}
              >
                <CardHeader>
                  
                    <div className="flex items-center gap-2">
                      <FaBacteria className="w-4 h-4" style={{ color: "#f97316" }} />
                      <h2
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Antibiotic Lifetime Tracker
                      </h2>
                      <Chip size="sm" color="warning" variant="flat">
                        {analytics.antibiotics.length} total
                      </Chip>
                    </div>
                  
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    {analytics.antibiotics.map((med, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 py-2 border-b last:border-0"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <span
                          className="font-medium text-sm flex-1"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {med.name}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {med.dosage}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {med.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Test results timeline */}
            {analytics.allTests.length > 0 && (
              <Card
                className="border"
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  borderColor: "var(--color-border)",
                }}
              >
                <CardHeader>
                  
                    <div className="flex items-center gap-2">
                      <FaVial
                        className="w-4 h-4"
                        style={{ color: "var(--color-brand)" }}
                      />
                      <h2
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Diagnostic History
                      </h2>
                    </div>
                  
                </CardHeader>
                <CardBody>
                  <Table
                    aria-label="Diagnostic test history"
                    removeWrapper
                    classNames={{
                      th: "text-xs font-medium",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>TEST</TableColumn>
                      <TableColumn>VALUE</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {analytics.allTests.map((test, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <span
                              className="text-xs"
                              style={{ color: "var(--color-text-secondary)" }}
                            >
                              {test.date}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-sm"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {test.testName}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--color-brand)" }}
                            >
                              {test.value}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            )}
            <Card
              className="border"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <CardHeader>
                
                  <div className="flex items-center gap-2">
                    <FaChartBar
                      className="w-4 h-4"
                      style={{ color: "var(--color-brand)" }}
                    />
                    <h2
                      className="font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Consultation Timeline
                    </h2>
                  </div>
                
              </CardHeader>
              <CardBody className="space-y-3">
                {patientRecords.map((record) => (
                  <div
                    key={record.recordId}
                    className="flex items-start gap-4 p-4 rounded-xl border"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {record.date}
                        </span>
                        <Chip size="sm" variant="flat" color="default">
                          {record.medicines.length} meds
                        </Chip>
                      </div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {record.doctorName}
                      </p>
                      <p
                        className="text-xs mt-0.5 line-clamp-1"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {record.patientCase}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => openRecord(record)}
                      startContent={<FaEye className="w-3 h-3" />}
                      style={{ color: "var(--color-brand)" }}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div>
              <p
                className="font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {selectedRecord?.doctorName}
              </p>
              <p
                className="text-xs font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                {selectedRecord?.date}
              </p>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-4 pb-2">
            {selectedRecord && (
              <>
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Case Summary
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {selectedRecord.patientCase}
                  </p>
                </div>
                {selectedRecord.respiratoryRate && (
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Respiratory Rate
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {selectedRecord.respiratoryRate}
                    </p>
                  </div>
                )}
                {selectedRecord.medicines.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-medium mb-2"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Medicines
                    </p>
                    <div className="space-y-2">
                      {selectedRecord.medicines.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span
                            className="flex-1"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {m.name}
                          </span>
                          <span
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {m.dosage}
                          </span>
                          <Chip size="sm" variant="flat" color="default">
                            {m.category}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRecord.testResults.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-medium mb-2"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Test Results
                    </p>
                    <div className="space-y-1.5">
                      {selectedRecord.testResults.map((t, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm"
                        >
                          <span
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {t.testName}
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {t.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
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
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
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

