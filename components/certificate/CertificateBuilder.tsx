"use client";

import { useState } from "react";
import { BlackBorderCertificate } from "@/components/certificate/BlackBorderCertificate";
import type { CertificateData } from "@/types/certificate";

type FormField = "recipientName" | "courseTitle" | "date" | "instructorName";

const EMPTY_DATA: CertificateData = {
  recipientName: "",
  courseTitle: "",
  date: "",
  instructorName: "",
};

const PLACEHOLDERS: Record<FormField, string> = {
  recipientName: "Recipient Name",
  courseTitle: "Course Title",
  date: "Date",
  instructorName: "Instructor Name",
};

const FIELDS: { field: FormField; label: string }[] = [
  { field: "recipientName", label: "Recipient name" },
  { field: "courseTitle", label: "Course or achievement" },
  { field: "date", label: "Date" },
  { field: "instructorName", label: "Instructor" },
];

export function CertificateBuilder() {
  const [data, setData] = useState<CertificateData>(EMPTY_DATA);

  function updateField(field: FormField, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const previewData: CertificateData = {
    recipientName: data.recipientName || PLACEHOLDERS.recipientName,
    courseTitle: data.courseTitle || PLACEHOLDERS.courseTitle,
    date: data.date || PLACEHOLDERS.date,
    instructorName: data.instructorName || PLACEHOLDERS.instructorName,
  };

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

      <div className="md:sticky md:top-6">
        <BlackBorderCertificate data={previewData} />
      </div>
    </div>
  );
}
