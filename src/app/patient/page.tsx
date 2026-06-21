"use client";

import { useState, useRef, useCallback } from "react";
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
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>("prescripto_audit", []);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestRecord, setLatestRecord] = useState<MedicalRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

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
      reset();
      setSelectedFile(null);
    } catch (err: unknown) {
      const error = err as Error & { log?: AuditLog };
      toast.error(error.message ?? "AI processing failed.");
      if (error.log) setAuditLogs((prev) => [error.log!, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "var(--color-surface)" }}>
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Patient Portal
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Upload a prescription image or paste text to extract structured health data.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient ID */}
          <Card
            className="border p-5"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <h2 className="font-semibold text-base mb-4" style={{ color: "var(--color-text-primary)" }}>
              Patient Information
            </h2>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Patient ID
            </label>
            <input
              type="text"
              placeholder="e.g. P-20240001"
              {...register("patientId")}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:ring-2"
              style={{
                borderColor: errors.patientId ? "var(--color-danger)" : "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            />
            {errors.patientId && (
              <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
                {errors.patientId.message}
              </p>
            )}
          </Card>

          {/* Upload */}
          <Card
            className="border p-5"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <h2 className="font-semibold text-base mb-4" style={{ color: "var(--color-text-primary)" }}>
              Upload Document
            </h2>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-colors"
              style={{
                borderColor: isDragging ? "var(--color-brand)" : "var(--color-border)",
                backgroundColor: isDragging ? "var(--color-brand-subtle)" : "transparent",
              }}
            >
              <FaCloudArrowUp
                className="w-10 h-10"
                style={{ color: isDragging ? "var(--color-brand)" : "var(--color-text-muted)" }}
              />
              <div className="text-center">
                <p className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
                  Drag and drop a file here
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
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
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border mt-3"
                style={{
                  borderColor: "var(--color-brand)",
                  backgroundColor: "var(--color-brand-subtle)",
                }}
              >
                <FaFileMedical className="w-5 h-5 shrink-0" style={{ color: "var(--color-brand)" }} />
                <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--color-brand)" }}>
                  {selectedFile.name}
                </span>
                <button type="button" onClick={() => setSelectedFile(null)} aria-label="Remove file">
                  <FaTrash className="w-4 h-4" style={{ color: "var(--color-danger)" }} />
                </button>
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Or paste prescription text directly
              </p>
              <textarea
                placeholder="Paste prescription text here..."
                {...register("textContent")}
                rows={5}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            isPending={isProcessing}
            isDisabled={isProcessing}
            className="w-full font-semibold p-4 rounded-md"
            style={{ backgroundColor: "var(--color-brand)", color: "#ffffff" }}
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
                    <FaCloudArrowUp className="w-4 h-4  shrink-0" />
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
              <FaCircleCheck className="w-5 h-5" style={{ color: "var(--color-success)" }} />
              <h2 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>
                Extraction Complete
              </h2>
            </div>

            <Card
              className="border p-5"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <InfoField label="Doctor" value={latestRecord.doctorName || "N/A"} />
                <InfoField label="Date" value={latestRecord.date || "N/A"} />
                <InfoField label="Patient ID" value={latestRecord.patientId} />
                <InfoField label="Respiratory Rate" value={latestRecord.respiratoryRate || "N/A"} />
              </div>
              {latestRecord.patientCase && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                    Case Summary
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
                    {latestRecord.patientCase}
                  </p>
                </div>
              )}
            </Card>

            {latestRecord.medicines.length > 0 && (
              <Card
                className="border p-5"
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FaPills className="w-4 h-4" style={{ color: "var(--color-brand)" }} />
                  <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                    Medicines ({latestRecord.medicines.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {latestRecord.medicines.map((med, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2.5 border-b last:border-0"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span className="font-medium text-sm flex-1" style={{ color: "var(--color-text-primary)" }}>
                        {med.name}
                      </span>
                      {med.dosage && (
                        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {med.dosage}
                        </span>
                      )}
                      {med.duration && (
                        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
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
              <Card
                className="border p-5"
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FaVial className="w-4 h-4" style={{ color: "var(--color-brand)" }} />
                  <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                    Test Results ({latestRecord.testResults.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {latestRecord.testResults.map((test, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 border-b last:border-0"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {test.testName}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
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
          <div className="mt-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
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
      <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
    </div>
  );
}