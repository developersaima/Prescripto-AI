"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card } from "@heroui/react";
import { toast } from "react-hot-toast";
import {
  FaCloudArrowUp,
  FaFileMedical,
  FaTrash,
  FaPills,
  FaVial,
  FaCircleCheck,
} from "react-icons/fa6";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parsePrescriptionText, parsePrescriptionImage } from "@/services/gemini";
import type { MedicalRecord, AuditLog } from "@/types";
import { Toaster } from "react-hot-toast";

const uploadSchema = z.object({
  patientId: z.string().min(3, "Patient ID must be at least 3 characters"),
  textContent: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const categoryColors: Record<string, string> = {
  Antibiotic: "bg-yellow-100 text-yellow-800",
  Vitamin: "bg-purple-100 text-purple-800",
  Calcium: "bg-blue-100 text-blue-800",
  Gastric: "bg-green-100 text-green-800",
  Others: "bg-gray-100 text-gray-800",
};

export default function PatientPage() {
  const [records, setRecords] = useLocalStorage<MedicalRecord[]>("prescripto_records", []);
const [_auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>("prescripto_audit", []);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestRecord, setLatestRecord] = useState<MedicalRecord | null>(null);
const [_generatedPatientId, setGeneratedPatientId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  // Generate patient ID on component mount
  useEffect(() => {
    const generatePatientId = () => {
      // Get existing patient IDs from records
      const existingIds = records.map(r => r.patientId);
      const numericIds = existingIds
        .filter(id => id.startsWith('P-'))
        .map(id => parseInt(id.substring(2)))
        .filter(num => !isNaN(num));

      let nextNumber = 1;
      if (numericIds.length > 0) {
        const maxId = Math.max(...numericIds);
        // Find the next available number
        for (let i = 1; i <= maxId + 1; i++) {
          if (!numericIds.includes(i)) {
            nextNumber = i;
            break;
          }
        }
      }

      const newId = `P-${String(nextNumber).padStart(8, '0')}`;
      setGeneratedPatientId(newId);
      setValue('patientId', newId);
    };

    generatePatientId();
  }, [records, setValue]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  }, []);

  function validateAndSetFile(file: File) {
    const allowed = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPEG, or PDF files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }
    setSelectedFile(file);
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile && !data.textContent?.trim()) {
      toast.error("Please upload a file or paste prescription text.");
      return;
    }

    setIsProcessing(true);
    setLatestRecord(null);

    try {
      let result: { record: MedicalRecord; log: AuditLog };

      if (selectedFile && selectedFile.type !== "application/pdf") {
        const base64 = await fileToBase64(selectedFile);
        result = await parsePrescriptionImage(
          base64,
          selectedFile.type as "image/png" | "image/jpeg",
          selectedFile.name,
          data.patientId
        );
      } else if (data.textContent?.trim()) {
        result = await parsePrescriptionText(data.textContent, data.patientId);
      } else {
        toast.error("PDF parsing requires text extraction. Please paste the text content.");
        return;
      }

      setRecords((prev) => [result.record, ...prev]);
      setAuditLogs((prev) => [result.log, ...prev]);
      setLatestRecord(result.record);
      toast.success("Prescription parsed successfully.");
      
      // Reset form and generate new patient ID
      reset();
      setSelectedFile(null);
      
      // Generate new patient ID for next upload
      const existingIds = records.map(r => r.patientId);
      const numericIds = existingIds
        .filter(id => id.startsWith('P-'))
        .map(id => parseInt(id.substring(2)))
        .filter(num => !isNaN(num));

      let nextNumber = 1;
      if (numericIds.length > 0) {
        const maxId = Math.max(...numericIds);
        for (let i = 1; i <= maxId + 1; i++) {
          if (!numericIds.includes(i)) {
            nextNumber = i;
            break;
          }
        }
      }

      const newId = `P-${String(nextNumber).padStart(8, '0')}`;
      setGeneratedPatientId(newId);
      setValue('patientId', newId);
    } catch (err: unknown) {
      const error = err as Error & { log?: AuditLog };
      toast.error(error.message ?? "AI processing failed.");
      if (error.log) setAuditLogs((prev) => [error.log!, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Patient Portal
          </h1>
          <p className="text-sm text-gray-600">
            Upload a prescription image or paste text to extract structured health data.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient ID */}
          <Card className="border border-gray-200 p-5 bg-white shadow-sm">
            <h2 className="font-semibold text-base text-gray-900 mb-4">
              Patient Information
            </h2>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Patient ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Auto-generated Patient ID"
                {...register("patientId")}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                  Auto-generated
                </span>
              </div>
            </div>
            {errors.patientId && (
              <p className="text-xs mt-1 text-red-500">
                {errors.patientId.message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              ID will auto-increment based on existing records
            </p>
          </Card>

          {/* Upload */}
          <Card className="border border-gray-200 p-5 bg-white shadow-sm">
            <h2 className="font-semibold text-base text-gray-900 mb-4">
              Upload Document
            </h2>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-colors ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
            >
              <FaCloudArrowUp
                className={`w-10 h-10 ${
                  isDragging ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <div className="text-center">
                <p className="font-medium text-sm text-gray-900">
                  Drag and drop a file here
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  PNG, JPEG up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) validateAndSetFile(file);
                }}
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500 bg-blue-50 mt-3">
                <FaFileMedical className="w-5 h-5 shrink-0 text-blue-500" />
                <span className="text-sm font-medium flex-1 truncate text-blue-700">
                  {selectedFile.name}
                </span>
                <button 
                  type="button" 
                  onClick={() => setSelectedFile(null)} 
                  aria-label="Remove file"
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Or paste prescription text directly
              </p>
              <textarea
                placeholder="Paste prescription text here..."
                {...register("textContent")}
                rows={5}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            isPending={isProcessing}
            isDisabled={isProcessing}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-4 rounded-lg transition-colors"
          >
            {({ isPending }: { isPending: boolean }) => (
              <span className="flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <FaCloudArrowUp className="w-4 h-4 shrink-0" />
                    Parse Prescription
                  </>
                )}
              </span>
            )}
          </Button>
        </form>

        {/* Results */}
        {latestRecord && (
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-2">
              <FaCircleCheck className="w-5 h-5 text-green-500" />
              <h2 className="font-bold text-lg text-gray-900">
                Extraction Complete
              </h2>
            </div>

            <Card className="border border-gray-200 p-5 bg-white shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <InfoField label="Doctor" value={latestRecord.doctorName || "N/A"} />
                <InfoField label="Date" value={latestRecord.date || "N/A"} />
                <InfoField label="Patient ID" value={latestRecord.patientId} />
                <InfoField label="Respiratory Rate" value={latestRecord.respiratoryRate || "N/A"} />
              </div>
              {latestRecord.patientCase && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Case Summary
                  </p>
                  <p className="text-sm leading-relaxed text-gray-900">
                    {latestRecord.patientCase}
                  </p>
                </div>
              )}
            </Card>

            {latestRecord.medicines.length > 0 && (
              <Card className="border border-gray-200 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaPills className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    Medicines ({latestRecord.medicines.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {latestRecord.medicines.map((med, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-sm flex-1 text-gray-900">
                        {med.name}
                      </span>
                      {med.dosage && (
                        <span className="text-xs text-gray-600">
                          {med.dosage}
                        </span>
                      )}
                      {med.duration && (
                        <span className="text-xs text-gray-600">
                          {med.duration}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          categoryColors[med.category] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {med.category}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {latestRecord.testResults.length > 0 && (
              <Card className="border border-gray-200 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaVial className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm text-gray-900">
                    Test Results ({latestRecord.testResults.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {latestRecord.testResults.map((test, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-600">
                        {test.testName}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {test.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {records.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-400">
            {records.length} record{records.length !== 1 ? "s" : ""} stored locally
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}
