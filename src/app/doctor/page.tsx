"use client";

import { useState, useMemo } from "react";
import {
  Button,
  Card,
  Chip,
  Table,
  Modal,
  Input,
  Badge,
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
  FaCalendar,
  FaXmark,
  FaStethoscope,
  FaLungs,
  FaFlask,
} from "react-icons/fa6";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { MedicalRecord } from "@/types";

export default function DoctorPage() {
  const [records] = useLocalStorage<MedicalRecord[]>("prescripto_records", []);
  const [searchId, setSearchId] = useState("");
  const [queriedId, setQueriedId] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleClearSearch() {
    setSearchId("");
    setQueriedId("");
  }

  function openRecord(record: MedicalRecord) {
    setSelectedRecord(record);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedRecord(null);
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Portal
          </h1>
          <p className="text-sm text-gray-600">
            Search a patient by ID to view their complete health analytics.
          </p>
        </div>

        {/* Search */}
        <Card className="border border-gray-200 p-6 mb-8 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 w-full relative">
              <div className="relative">
                <Input
                  placeholder="Enter Patient ID (e.g. P-20240001)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full h-12 pl-12 pr-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaMagnifyingGlass className="w-5 h-5 text-gray-400" />
                </div>
                {searchId && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <Button
              onPress={handleSearch}
              className="w-full sm:w-auto min-w-[140px] h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FaMagnifyingGlass className="w-4 h-4" />
              Search
            </Button>
          </div>
        </Card>

        {/* No results */}
        {queriedId && patientRecords.length === 0 && (
          <div className="text-center py-20 rounded-2xl border border-gray-200 bg-white">
            <FaUserDoctor className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium text-gray-900">
              No records found for "{queriedId}"
            </p>
            <p className="text-sm mt-1 text-gray-600">
              Ask the patient to upload their prescriptions first.
            </p>
          </div>
        )}

        {patientRecords.length > 0 && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard 
                icon={FaBacteria} 
                label="Antibiotics" 
                value={analytics.antibiotics.length} 
                color="#f97316" 
                bgColor="#fff7ed"
              />
              <StatCard 
                icon={FaDroplet} 
                label="Vitamins" 
                value={analytics.vitamins.length} 
                color="#8b5cf6"
                bgColor="#f5f3ff"
              />
              <StatCard 
                icon={FaFire} 
                label="Calcium" 
                value={analytics.calcium.length} 
                color="#06b6d4"
                bgColor="#ecfeff"
              />
              <StatCard 
                icon={FaPills} 
                label="Gastric" 
                value={analytics.gastric.length} 
                color="#10b981"
                bgColor="#ecfdf5"
              />
            </div>

            {/* Antibiotic Tracker */}
            {analytics.antibiotics.length > 0 && (
              <Card className="border border-gray-200 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaBacteria className="w-4 h-4 text-orange-500" />
                  <h2 className="font-semibold text-gray-900">
                    Antibiotic Lifetime Tracker
                  </h2>
                  <Chip className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                    {analytics.antibiotics.length} total
                  </Chip>
                </div>
                <div className="space-y-2">
                  {analytics.antibiotics.map((med, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-sm flex-1 text-gray-900">
                        {med.name}
                      </span>
                      <span className="text-xs text-gray-600">
                        {med.dosage}
                      </span>
                      <span className="text-xs text-gray-600">
                        {med.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Diagnostic History Table */}
            {analytics.allTests.length > 0 && (
              <Card className="border border-gray-200 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaVial className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">
                    Diagnostic History
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                          DATE
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                          TEST
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                          VALUE
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.allTests.map((test, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {test.date}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                            {test.testName}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-blue-600">
                            {test.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Consultation Timeline */}
            <Card className="border border-gray-200 p-5 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FaChartBar className="w-4 h-4 text-blue-600" />
                <h2 className="font-semibold text-gray-900">
                  Consultation Timeline
                </h2>
              </div>
              <div className="space-y-3">
                {patientRecords.map((record) => (
                  <div
                    key={record.recordId}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FaCalendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">
                          {record.date}
                        </span>
                        <Chip className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                          {record.medicines.length} meds
                        </Chip>
                      </div>
                      <p className="font-medium text-sm text-gray-900">
                        {record.doctorName}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-1 text-gray-600">
                        {record.patientCase}
                      </p>
                    </div>
                    <Button
                      onPress={() => openRecord(record)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <FaEye className="w-3 h-3" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <FaXmark className="w-6 h-6" />
              </button>

              {/* Modal Content */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedRecord.doctorName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRecord.date}
                  </p>
                </div>

                {/* Case Summary */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Case Summary
                  </h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedRecord.patientCase}
                  </p>
                </div>

                {/* Respiratory Rate */}
                {selectedRecord.respiratoryRate && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Respiratory Rate
                    </h3>
                    <div className="flex items-center gap-2">
                      <FaLungs className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedRecord.respiratoryRate}
                      </p>
                    </div>
                  </div>
                )}

                {/* Medicines */}
                {selectedRecord.medicines.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Medicines
                    </h3>
                    <div className="space-y-2">
                      {selectedRecord.medicines.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">
                            {m.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              {m.dosage}
                            </span>
                            <Badge className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                              {m.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test Results */}
                {selectedRecord.testResults.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Test Results
                    </h3>
                    <div className="space-y-2">
                      {selectedRecord.testResults.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">
                            {t.testName}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {t.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    onPress={closeModal}
                    className="w-full py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </Button>
                </div>
              </div>
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