"use client";

import { useState } from "react";
import { BlackBorderCertificate } from "@/components/certificate/BlackBorderCertificate";
import type { CertificateData } from "@/types/certificate";

type FormField =
  | "recipientName"
  | "courseTitle"
  | "organizationName"
  | "date"
  | "instructorName";

const EMPTY_DATA: CertificateData = {
  recipientName: "",
  courseTitle: "",
  organizationName: "",
  date: "",
  instructorName: "",
};

const PLACEHOLDERS: Record<FormField, string> = {
  recipientName: "Recipient Name",
  courseTitle: "Course Title",
  organizationName: "Organization Name",
  date: "Date",
  instructorName: "Instructor Name",
};

const FIELDS: { field: FormField; label: string }[] = [
  { field: "recipientName", label: "Recipient name" },
  { field: "courseTitle", label: "Course or achievement" },
  { field: "organizationName", label: "Organization" },
  { field: "date", label: "Date" },
  { field: "instructorName", label: "Instructor" },
];

export function CertificateBuilder() {
  const [data, setData] = useState<CertificateData>(EMPTY_DATA);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  function updateField(field: FormField, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const previewData: CertificateData = {
    recipientName: data.recipientName || PLACEHOLDERS.recipientName,
    courseTitle: data.courseTitle || PLACEHOLDERS.courseTitle,
    organizationName: data.organizationName || PLACEHOLDERS.organizationName,
    date: data.date || PLACEHOLDERS.date,
    instructorName: data.instructorName || PLACEHOLDERS.instructorName,
  };

  async function downloadPng() {
    setIsExporting(true);
    setExportError(null);
    try {
      const response = await fetch("/api/certificate/png", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificate.png";
      // Some browsers only honor `download` and resolve the filename
      // correctly when the anchor is actually in the DOM at click time.
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Couldn't generate the PNG. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[380px_1fr] md:items-start">
      <form className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        {FIELDS.map(({ field, label }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label htmlFor={field} className="text-sm text-muted">
              {label}
            </label>
            <input
              id={field}
              type="text"
              autoComplete="off"
              value={data[field]}
              onChange={(e) => updateField(field, e.target.value)}
              placeholder={PLACEHOLDERS[field]}
              className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        ))}
      </form>

      <div className="md:sticky md:top-6 flex flex-col gap-4">
        <BlackBorderCertificate data={previewData} />

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={downloadPng}
            disabled={isExporting}
            className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? "Generating PNG..." : "Download PNG"}
          </button>
          {exportError && (
            <p className="text-sm text-red-400" role="alert">
              {exportError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
